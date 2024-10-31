export async function saveImage(subDir: string, imageBuffer: Buffer): Promise<string> {
	const imageUUID = crypto.randomUUID();
	const imageName = `${imageUUID}.png`;
	const filePath = `${process.cwd()}/${subDir}/${imageName}`;
	const blob = new Blob([imageBuffer]);
	await Bun.write(filePath, blob);
	return `./${subDir}/${imageName}`;
}
