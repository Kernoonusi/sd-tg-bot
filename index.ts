import { Telegraf } from "telegraf";
import StableDiffusionIG from "./stable-diffusion";
import axios from "axios";
import LocalSession from "telegraf-session-local";
import { file, write } from "bun";

declare module "bun" {
	interface Env {
		SD_HOST: string;
		SD_USERNAME: string;
		SD_PASSWORD: string;
	}
}

export const imageGenerator = new StableDiffusionIG({
	baseUrl: process.env.SD_HOST,
	authData: `${process.env.SD_USERNAME}:${process.env.SD_PASSWORD}`,
});

const bot = new Telegraf(process.env.BOT_TOKEN as string);
bot.use(new LocalSession({ database: "session_db.json" }).middleware());

bot.start((ctx) =>
	ctx.reply(`
Привет! 👋

Я — бот, который поможет тебе "примерить" новый образ на фото!

📸 Как это работает:

Отправь мне своё изображение.
Напиши на английском, какой стиль или одежду ты хочешь увидеть на этом фото(подпись в тг).
✨ Я постараюсь воплотить твои идеи в реальность! 🧥👗🕶️
Я ничего не сохраняю все данные удаляются после отправки`)
);

bot.on("photo", async (ctx) => {
	const photo = ctx.message.photo[ctx.message.photo.length - 1];
	const caption = ctx.message.caption;

	const image = await bot.telegram.getFileLink(photo.file_id);

	// Download the image
	const response = await axios.get(image.href, {
		responseType: "arraybuffer",
	});

	const imagePath = "images/";
	await write(imagePath + `photo-${ctx.message.message_id}.jpg`, response.data);

	const imageFile = await Bun.file(imagePath + `photo-${ctx.message.message_id}.jpg`);
	const arrayBuffer = await imageFile.arrayBuffer();
	const base64Image = Buffer.from(arrayBuffer).toString("base64");

	const result = await imageGenerator.generateClothes({
		positivePrompt: caption ?? "",
		initImages: [`data:image/jpg;base64,${base64Image}`],
	});

	for (let i = 0; i < result.length; i++) {
		const img = result[i];
		if (img) {
			try {
				const fileBuffer = await Bun.file(img).arrayBuffer();

				// Send photo to user with proper Buffer conversion
				await ctx.replyWithPhoto({
					source: Buffer.from(fileBuffer),
				});

				// Optionally clean up the file after sending
				// await Bun.write(img, "");
				// Or use your preferred cleanup method
			} catch (error) {
				console.error(`Error processing image ${i}:`, error);
				await ctx.reply(`Sorry, there was an error processing image ${i}`);
			}
		} else {
			console.log(`Image ${i} is undefined`);
		}
	}

	// ctx.session.waitingForPhoto = false;
});

setUpModel().then(() => {
	console.log("Model loaded");
	bot.launch();
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

async function setUpModel() {
	try {
		const encoded = Buffer.from(`${process.env.SD_USERNAME}:${process.env.SD_PASSWORD}`).toString(
			"base64"
		);
		const options = {
			sd_model_checkpoint: process.env.SD_MODEL,
		};
		return await axios.post(`${process.env.SD_HOST}/sdapi/v1/options`, options, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Basic ${encoded}`,
			},
		});
	} catch (error) {
		console.log(error);
	}
}
// async function main() {
// 	console.log(
// 		await imageGenerator.generateClothes({
// 			positivePrompt: "1girl, student, blonde hair, blue eyes, school uniform",
// 		})
// 	);
// }

// main().catch(console.error);
