import sharp from "sharp";

await sharp("../source-assets/morrow-fen/dining-spread-original.png")
  .resize({ width: 1536, withoutEnlargement: true })
  .webp({ quality: 82, effort: 6 })
  .toFile("dist/assets/dining-spread.webp");

await sharp("../source-assets/morrow-fen/og-original.png")
  .resize({ width: 1200, height: 630, fit: "cover", position: "centre" })
  .jpeg({ quality: 86, progressive: true, mozjpeg: true })
  .toFile("dist/og.jpg");
