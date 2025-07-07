// Kompres & ubah ke Base64
import sharp from "sharp";

export async function bufferToBase64(fileBuffer, options = {}) {
  const {
    width = 300, // target lebar px
    quality = 70, // kompresi JPEG 0‑100
  } = options;

  const compressed = await sharp(fileBuffer).resize({ width }).jpeg({ quality }).toBuffer();

  return `data:image/jpeg;base64,${compressed.toString("base64")}`;
}
