import {
	type Image2Image,
	type ImageGenerator,
	type Text2Image,
	type Text2ImageResponse,
} from "./types/index";
import ky from "ky";
import { saveImage } from "./utils";
import type { Image2ImageSD, Text2ImageSD } from "./types";
import sharp from "sharp";

interface Config {
	authData: string;
	baseUrl: string;
}

interface SDResponse {
	images: string[];
	parameters: Record<string, unknown>;
	info: string;
}

interface RemBG {
	input_image: string;
	model: string;
}

export default class StableDiffusionIG implements ImageGenerator {
	private api;

	private defaultTxt2ImgOptions: Text2ImageSD = {
		prompt: "",
		negative_prompt: "",
		styles: ["Kamph_Anime"],
		seed: -1,
		subseed: -1,
		subseed_strength: 0,
		seed_resize_from_h: -1,
		seed_resize_from_w: -1,
		sampler_name: "DPM++ SDE",
		scheduler: "Karras",
		batch_size: 1,
		n_iter: 1,
		steps: 8,
		cfg_scale: 2,
		distilled_cfg_scale: 3.5,
		width: 896,
		height: 1152,
		restore_faces: false,
		tiling: true,
		do_not_save_samples: false,
		do_not_save_grid: false,
		eta: 0,
		denoising_strength: 0,
		s_min_uncond: 0,
		s_churn: 0,
		s_tmax: 0,
		s_tmin: 0,
		s_noise: 0,
		override_settings: {
			sd_model_checkpoint: process.env.SD_MODEL,
		},
		override_settings_restore_afterwards: true,
		refiner_checkpoint: "",
		refiner_switch_at: 0,
		disable_extra_networks: false,
		firstpass_image: "",
		comments: {},
		enable_hr: false,
		firstphase_width: 0,
		firstphase_height: 0,
		hr_scale: 2,
		hr_upscaler: "string",
		hr_second_pass_steps: 0,
		hr_resize_x: 0,
		hr_resize_y: 0,
		hr_checkpoint_name: "",
		hr_sampler_name: "",
		hr_scheduler: "",
		hr_prompt: "",
		hr_negative_prompt: "",
		hr_cfg: 1,
		hr_distilled_cfg: 3.5,
		force_task_id: "",
		sampler_index: "Euler",
		script_name: "",
		script_args: [],
		send_images: true,
		save_images: false,
		alwayson_scripts: {
			"A Person Mask Generator": {
				args: [true, ["clothes"], true, 4, 0, 1, 0, 128],
			},
		},
		infotext: "",
	};

	private defaultImg2ImgOptions: Image2ImageSD = {
		alwayson_scripts: {
			"A Person Mask Generator": { args: [true, ["clothes"], true, 4, 0, 0, 0, 128, 0] },
		},
		batch_size: 1,
		cfg_scale: 7,
		comments: {},
		denoising_strength: 0.75,
		disable_extra_networks: false,
		distilled_cfg_scale: 3.5,
		do_not_save_grid: false,
		do_not_save_samples: false,
		height: 768,
		hr_distilled_cfg: 3.5,
		image_cfg_scale: 1.5,
		init_images: ["base64image placeholder"],
		initial_noise_multiplier: 1.0,
		inpaint_full_res: 0,
		inpaint_full_res_padding: 128,
		inpainting_fill: 0,
		inpainting_mask_invert: 0,
		mask_blur: 4,
		mask_blur_x: 4,
		mask_blur_y: 4,
		mask_round: true,
		n_iter: 1,
		negative_prompt: "",
		override_settings: {},
		override_settings_restore_afterwards: true,
		resize_mode: 0,
		restore_faces: false,
		s_churn: 0.0,
		s_min_uncond: 0.0,
		s_noise: 1.0,
		s_tmax: null,
		s_tmin: 0.0,
		sampler_name: "Euler a",
		scheduler: "Automatic",
		script_args: [],
		script_name: null,
		seed: -1,
		seed_enable_extras: true,
		seed_resize_from_h: -1,
		seed_resize_from_w: -1,
		steps: 20,
		styles: ["basic realism"],
		subseed: -1,
		subseed_strength: 0,
		tiling: false,
		width: 560,
	};

	constructor(config: Config) {
		this.api = ky.extend({
			prefixUrl: config.baseUrl,
			timeout: 100000,
			hooks: {
				beforeRequest: [
					(request) => {
						const encoded = Buffer.from(config.authData).toString("base64");
						request.headers.set("Authorization", `Basic ${encoded}`);
					},
				],
			},
		});
	}

	public async generateClothes({ ...rest }: Image2Image): Promise<Text2ImageResponse> {
		try {
			if (!rest.initImages) {
				throw new Error("Image not found");
			}
			const base64Prefix = /^data:image\/\w+;base64,/;

			// Декодируем base64 изображение в буфер
			const imageBuffer = Buffer.from(rest.initImages[0].replace(base64Prefix, ""), "base64");

			// Получаем исходные размеры изображения
			const { width: originalWidth, height: originalHeight } = await sharp(imageBuffer).metadata();

			if (!originalWidth || !originalHeight) {
				console.error("Error: unable to retrieve image dimensions.");
				return [];
			}

			// Рассчитываем соотношение сторон и ограничиваем размеры до 768
			const aspectRatio = originalWidth / originalHeight;
			let newWidth = Math.min(originalWidth, 768);
			let newHeight = Math.round(newWidth / aspectRatio);

			// Если высота больше 768, пересчитываем размеры
			if (newHeight > 768) {
				newHeight = 768;
				newWidth = Math.round(newHeight * aspectRatio);
			}

			// Округляем до ближайших значений, кратных 8
			newWidth = Math.floor(newWidth / 8) * 8;
			newHeight = Math.floor(newHeight / 8) * 8;

			// Отправляем изображение на обработку с новыми размерами
			const response = await this.img2img({
				...rest,
				width: newWidth,
				height: newHeight,
			});

			if (!response?.images) {
				console.error("Error generating image:", response);
				return [];
			}

			const images = response.images;

			const imageURLs = await Promise.all(
				images.map((image) => saveImage("stable-diffusion", Buffer.from(image, "base64")))
			);

			return imageURLs;
		} catch (error) {
			console.error("Error generating image:", error);
			return [];
		}
	}

	public async img2img(settings: Image2Image): Promise<SDResponse | null> {
		try {
			const response = await this.api
				.post<SDResponse>("sdapi/v1/img2img", {
					json: {
						...this.defaultImg2ImgOptions,
						...{
							prompt: settings.positivePrompt,
							negative_prompt: settings.negativePrompt ?? "",
							width: settings.width ?? this.defaultImg2ImgOptions.width,
							height: settings.height ?? this.defaultImg2ImgOptions.height,
							n_iter: settings.numberResults ?? 1,
							init_images: settings.initImages ?? this.defaultImg2ImgOptions.init_images,
						},
					},
				})
				.json();

			return response;
		} catch (error) {
			console.error("Error generating image:", error);
			return null;
		}
	}

	public async text2img(settings: Text2Image): Promise<SDResponse | null> {
		try {
			const response = await this.api
				.post<SDResponse>("sdapi/v1/txt2img", {
					json: {
						...this.defaultTxt2ImgOptions,
						...{
							prompt: settings.positivePrompt,
							negative_prompt:
								settings.negativePrompt ?? this.defaultTxt2ImgOptions.negative_prompt,
							width: settings.width ?? this.defaultTxt2ImgOptions.width,
							height: settings.height ?? this.defaultTxt2ImgOptions.height,
							n_iser: settings.numberResults ?? 1,
							steps: settings.steps ?? this.defaultTxt2ImgOptions.steps,
							cfg_scale: settings.CFGScale ?? this.defaultTxt2ImgOptions.cfg_scale,
							scheduler: settings.scheduler ?? this.defaultTxt2ImgOptions.scheduler,
							override_settings: {
								...this.defaultTxt2ImgOptions.override_settings,
								sd_model_checkpoint:
									settings.model ??
									this.defaultTxt2ImgOptions.override_settings?.sd_model_checkpoint,
							},
						},
					},
				})
				.json();

			return response;
		} catch (error) {
			console.error("Error generating image:", error);
			return null;
		}
	}

	public async removeBackground(options: RemBG): Promise<{ image: string }> {
		const response = await this.api
			.post<{ image: string }>("rembg", {
				json: options,
			})
			.json();
		return response;
	}
}
