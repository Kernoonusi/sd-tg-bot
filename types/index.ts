export interface Text2ImageSD {
	prompt: string;
	negative_prompt?: string;
	styles?: string[];
	seed?: number;
	subseed?: number;
	subseed_strength?: number;
	seed_resize_from_h?: number;
	seed_resize_from_w?: number;
	sampler_name?: string;
	scheduler?: string;
	batch_size?: number;
	n_iter?: number;
	steps?: number;
	cfg_scale?: number;
	distilled_cfg_scale?: number;
	width?: number;
	height?: number;
	restore_faces?: boolean;
	tiling?: boolean;
	do_not_save_samples?: boolean;
	do_not_save_grid?: boolean;
	eta?: number;
	denoising_strength?: number;
	s_min_uncond?: number;
	s_churn?: number;
	s_tmax?: number;
	s_tmin?: number;
	s_noise?: number;
	override_settings?: Record<string, unknown>;
	override_settings_restore_afterwards?: boolean;
	refiner_checkpoint?: string;
	refiner_switch_at?: number;
	disable_extra_networks?: boolean;
	firstpass_image?: string;
	comments?: Record<string, string>;
	enable_hr?: boolean;
	firstphase_width?: number;
	firstphase_height?: number;
	hr_scale?: number;
	hr_upscaler?: string;
	hr_second_pass_steps?: number;
	hr_resize_x?: number;
	hr_resize_y?: number;
	hr_checkpoint_name?: string;
	hr_sampler_name?: string;
	hr_scheduler?: string;
	hr_prompt?: string;
	hr_negative_prompt?: string;
	hr_cfg?: number;
	hr_distilled_cfg?: number;
	force_task_id?: string;
	sampler_index?: string;
	script_name?: string;
	script_args?: string[];
	send_images?: boolean;
	save_images?: boolean;
	alwayson_scripts?: {
		"A Person Mask Generator"?: {
			args: (number | boolean | string[])[];
		};
	};
	infotext?: string;
}

export interface Image2ImageSD {
	prompt?: string | null;
	negative_prompt?: string | null;
	styles?: string[] | null;
	seed?: number | null;
	subseed?: number | null;
	subseed_strength?: number | null;
	seed_resize_from_h?: number | null;
	seed_resize_from_w?: number | null;
	sampler_name?: string | null;
	scheduler?: string | null;
	batch_size?: number | null;
	n_iter?: number | null;
	steps?: number | null;
	cfg_scale?: number | null;
	distilled_cfg_scale?: number | null;
	width?: number | null;
	height?: number | null;
	restore_faces?: boolean | null;
	tiling?: boolean | null;
	do_not_save_samples?: boolean | null;
	do_not_save_grid?: boolean | null;
	eta?: number | null;
	denoising_strength?: number | null;
	s_min_uncond?: number | null;
	s_churn?: number | null;
	s_tmax?: number | null;
	s_tmin?: number | null;
	s_noise?: number | null;
	override_settings?: Record<string, any> | null;
	override_settings_restore_afterwards?: boolean | null;
	refiner_checkpoint?: string | null;
	refiner_switch_at?: number | null;
	disable_extra_networks?: boolean | null;
	firstpass_image?: string | null;
	comments?: Record<string, any> | null;
	init_images?: any[] | null;
	resize_mode?: number | null;
	image_cfg_scale?: number | null;
	mask?: string | null;
	mask_blur_x?: number | null;
	mask_blur_y?: number | null;
	mask_blur?: number | null;
	mask_round?: boolean | null;
	inpainting_fill?: number | null;
	inpaint_full_res?: number | boolean | null;
	seed_enable_extras: boolean | null;
	inpaint_full_res_padding?: number | null;
	inpainting_mask_invert?: number | null;
	initial_noise_multiplier?: number | null;
	latent_mask?: string | null;
	force_task_id?: string | null;
	hr_distilled_cfg?: number | null;
	sampler_index?: string | null;
	include_init_images?: boolean | null;
	script_name?: string | null;
	script_args?: any[];
	send_images?: boolean | null;
	save_images?: boolean | null;
	alwayson_scripts?: Record<string, any>;
	infotext?: string | null;
}

export interface Text2Image {
	positivePrompt: string;
	negativePrompt?: string;
	width?: number;
	height?: number;
	numberResults?: number;
	steps?: number;
	scheduler?: string;
	CFGScale?: number;
	model?: string;
}
export interface Image2Image {
	positivePrompt: string;
	negativePrompt?: string;
	width?: number;
	height?: number;
	numberResults?: number;
	steps?: number;
	scheduler?: string;
	CFGScale?: number;
	model?: string;
	initImages?: string[];
}

export type Text2ImageResponse = string[];

export interface ImageGenerator {
	generateClothes(settings: Text2Image): Promise<Text2ImageResponse>;
}
