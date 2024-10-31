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
			ADetailer: {
				args: [
					false,
					false,
					{
						ad_cfg_scale: 7,
						ad_checkpoint: "Use same checkpoint",
						ad_clip_skip: 1,
						ad_confidence: 0.3,
						ad_controlnet_guidance_end: 1,
						ad_controlnet_guidance_start: 0,
						ad_controlnet_model: "None",
						ad_controlnet_module: "None",
						ad_controlnet_weight: 1,
						ad_denoising_strength: 0.4,
						ad_dilate_erode: 4,
						ad_inpaint_height: 512,
						ad_inpaint_only_masked: true,
						ad_inpaint_only_masked_padding: 32,
						ad_inpaint_width: 512,
						ad_mask_blur: 4,
						ad_mask_k_largest: 0,
						ad_mask_max_ratio: 1,
						ad_mask_merge_invert: "None",
						ad_mask_min_ratio: 0,
						ad_model: "person_yolov8s-seg.pt",
						ad_model_classes: "",
						ad_negative_prompt: "",
						ad_noise_multiplier: 1,
						ad_prompt: "",
						ad_restore_face: false,
						ad_sampler: "DPM++ 2M",
						ad_scheduler: "Use same scheduler",
						ad_steps: 28,
						ad_tab_enable: true,
						ad_use_cfg_scale: false,
						ad_use_checkpoint: false,
						ad_use_clip_skip: false,
						ad_use_inpaint_width_height: false,
						ad_use_noise_multiplier: false,
						ad_use_sampler: false,
						ad_use_steps: false,
						ad_use_vae: false,
						ad_vae: "Use same VAE",
						ad_x_offset: 0,
						ad_y_offset: 0,
						is_api: [],
					},
					{
						ad_cfg_scale: 7,
						ad_checkpoint: "Use same checkpoint",
						ad_clip_skip: 1,
						ad_confidence: 0.3,
						ad_controlnet_guidance_end: 1,
						ad_controlnet_guidance_start: 0,
						ad_controlnet_model: "None",
						ad_controlnet_module: "None",
						ad_controlnet_weight: 1,
						ad_denoising_strength: 0.4,
						ad_dilate_erode: 4,
						ad_inpaint_height: 512,
						ad_inpaint_only_masked: true,
						ad_inpaint_only_masked_padding: 32,
						ad_inpaint_width: 512,
						ad_mask_blur: 4,
						ad_mask_k_largest: 0,
						ad_mask_max_ratio: 1,
						ad_mask_merge_invert: "None",
						ad_mask_min_ratio: 0,
						ad_model: "None",
						ad_model_classes: "",
						ad_negative_prompt: "",
						ad_noise_multiplier: 1,
						ad_prompt: "",
						ad_restore_face: false,
						ad_sampler: "DPM++ 2M",
						ad_scheduler: "Use same scheduler",
						ad_steps: 28,
						ad_tab_enable: true,
						ad_use_cfg_scale: false,
						ad_use_checkpoint: false,
						ad_use_clip_skip: false,
						ad_use_inpaint_width_height: false,
						ad_use_noise_multiplier: false,
						ad_use_sampler: false,
						ad_use_steps: false,
						ad_use_vae: false,
						ad_vae: "Use same VAE",
						ad_x_offset: 0,
						ad_y_offset: 0,
						is_api: [],
					},
					{
						ad_cfg_scale: 7,
						ad_checkpoint: "Use same checkpoint",
						ad_clip_skip: 1,
						ad_confidence: 0.3,
						ad_controlnet_guidance_end: 1,
						ad_controlnet_guidance_start: 0,
						ad_controlnet_model: "None",
						ad_controlnet_module: "None",
						ad_controlnet_weight: 1,
						ad_denoising_strength: 0.4,
						ad_dilate_erode: 4,
						ad_inpaint_height: 512,
						ad_inpaint_only_masked: true,
						ad_inpaint_only_masked_padding: 32,
						ad_inpaint_width: 512,
						ad_mask_blur: 4,
						ad_mask_k_largest: 0,
						ad_mask_max_ratio: 1,
						ad_mask_merge_invert: "None",
						ad_mask_min_ratio: 0,
						ad_model: "None",
						ad_model_classes: "",
						ad_negative_prompt: "",
						ad_noise_multiplier: 1,
						ad_prompt: "",
						ad_restore_face: false,
						ad_sampler: "DPM++ 2M",
						ad_scheduler: "Use same scheduler",
						ad_steps: 28,
						ad_tab_enable: true,
						ad_use_cfg_scale: false,
						ad_use_checkpoint: false,
						ad_use_clip_skip: false,
						ad_use_inpaint_width_height: false,
						ad_use_noise_multiplier: false,
						ad_use_sampler: false,
						ad_use_steps: false,
						ad_use_vae: false,
						ad_vae: "Use same VAE",
						ad_x_offset: 0,
						ad_y_offset: 0,
						is_api: [],
					},
					{
						ad_cfg_scale: 7,
						ad_checkpoint: "Use same checkpoint",
						ad_clip_skip: 1,
						ad_confidence: 0.3,
						ad_controlnet_guidance_end: 1,
						ad_controlnet_guidance_start: 0,
						ad_controlnet_model: "None",
						ad_controlnet_module: "None",
						ad_controlnet_weight: 1,
						ad_denoising_strength: 0.4,
						ad_dilate_erode: 4,
						ad_inpaint_height: 512,
						ad_inpaint_only_masked: true,
						ad_inpaint_only_masked_padding: 32,
						ad_inpaint_width: 512,
						ad_mask_blur: 4,
						ad_mask_k_largest: 0,
						ad_mask_max_ratio: 1,
						ad_mask_merge_invert: "None",
						ad_mask_min_ratio: 0,
						ad_model: "None",
						ad_model_classes: "",
						ad_negative_prompt: "",
						ad_noise_multiplier: 1,
						ad_prompt: "",
						ad_restore_face: false,
						ad_sampler: "DPM++ 2M",
						ad_scheduler: "Use same scheduler",
						ad_steps: 28,
						ad_tab_enable: true,
						ad_use_cfg_scale: false,
						ad_use_checkpoint: false,
						ad_use_clip_skip: false,
						ad_use_inpaint_width_height: false,
						ad_use_noise_multiplier: false,
						ad_use_sampler: false,
						ad_use_steps: false,
						ad_use_vae: false,
						ad_vae: "Use same VAE",
						ad_x_offset: 0,
						ad_y_offset: 0,
						is_api: [],
					},
				],
			},
			"API payload": { args: [] },
			Comments: { args: [] },
			ControlNet: {
				args: [
					{
						batch_image_dir: "",
						batch_input_gallery: null,
						batch_mask_dir: "",
						batch_mask_gallery: null,
						control_mode: "Balanced",
						enabled: false,
						generated_image: null,
						guidance_end: 1.0,
						guidance_start: 0.0,
						hr_option: "Both",
						image: null,
						image_fg: null,
						input_mode: "simple",
						mask_image: null,
						mask_image_fg: null,
						model: "None",
						module: "None",
						pixel_perfect: false,
						processor_res: -1,
						resize_mode: "Crop and Resize",
						save_detected_map: true,
						threshold_a: -1,
						threshold_b: -1,
						use_preview_as_input: false,
						weight: 1,
					},
					{
						batch_image_dir: "",
						batch_input_gallery: null,
						batch_mask_dir: "",
						batch_mask_gallery: null,
						control_mode: "Balanced",
						enabled: false,
						generated_image: null,
						guidance_end: 1.0,
						guidance_start: 0.0,
						hr_option: "Both",
						image: null,
						image_fg: null,
						input_mode: "simple",
						mask_image: null,
						mask_image_fg: null,
						model: "None",
						module: "None",
						pixel_perfect: false,
						processor_res: -1,
						resize_mode: "Crop and Resize",
						save_detected_map: true,
						threshold_a: -1,
						threshold_b: -1,
						use_preview_as_input: false,
						weight: 1,
					},
					{
						batch_image_dir: "",
						batch_input_gallery: null,
						batch_mask_dir: "",
						batch_mask_gallery: null,
						control_mode: "Balanced",
						enabled: false,
						generated_image: null,
						guidance_end: 1.0,
						guidance_start: 0.0,
						hr_option: "Both",
						image: null,
						image_fg: null,
						input_mode: "simple",
						mask_image: null,
						mask_image_fg: null,
						model: "None",
						module: "None",
						pixel_perfect: false,
						processor_res: -1,
						resize_mode: "Crop and Resize",
						save_detected_map: true,
						threshold_a: -1,
						threshold_b: -1,
						use_preview_as_input: false,
						weight: 1,
					},
				],
			},
			"DynamicThresholding (CFG-Fix) Integrated": {
				args: [false, 7, 1, "Constant", 0, "Constant", 0, 1, "enable", "MEAN", "AD", 1],
			},
			"Extra options": { args: [] },
			"FreeU Integrated (SD 1.x, SD 2.x, SDXL)": { args: [false, 1.01, 1.02, 0.99, 0.95, 0, 1] },
			"Kohya HRFix Integrated": { args: [false, 3, 2, 0, 0.35, true, "bicubic", "bicubic"] },
			"LatentModifier Integrated": {
				args: [
					false,
					0,
					"anisotropic",
					0,
					"reinhard",
					100,
					0,
					"subtract",
					0,
					0,
					"gaussian",
					"add",
					0,
					100,
					127,
					0,
					"hard_clamp",
					5,
					0,
					"None",
					"None",
				],
			},
			"MultiDiffusion Integrated": { args: [false, "MultiDiffusion", 768, 768, 64, 4] },
			"Never OOM Integrated": { args: [false, false] },
			OpenOutpaint: { args: [] },
			"PerturbedAttentionGuidance Integrated": { args: [false, 3] },
			Refiner: { args: [false] },
			Sampler: { args: [20, "Euler a", "Automatic"] },
			Seed: { args: [-1, false, -1, 0, 0, 0] },
			"SelfAttentionGuidance Integrated (SD 1.x, SD 2.x, SDXL)": { args: [false, 0.5, 2, 1] },
			"Soft Inpainting": { args: [false, 1, 0.5, 4, 0, 0.5, 2] },
			"StyleAlign Integrated": { args: [false, 1] },
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
		prompt: "nude",
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
