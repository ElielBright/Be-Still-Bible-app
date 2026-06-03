import sharp from "sharp"
import { readFileSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, "..", "public")

async function svgToPng(svgPath, pngPath, width, height) {
  const svgBuffer = readFileSync(svgPath)
  await sharp(svgBuffer).resize(width, height).png().toFile(pngPath)
  console.log(`Created ${pngPath} (${width}x${height})`)
}

async function main() {
  await svgToPng(join(publicDir, "icon.svg"), join(publicDir, "icon-192.png"), 192, 192)
  await svgToPng(join(publicDir, "icon.svg"), join(publicDir, "icon-512.png"), 512, 512)
  await svgToPng(join(publicDir, "og-image.svg"), join(publicDir, "og-image.png"), 1200, 630)
  await svgToPng(join(publicDir, "splash.svg"), join(publicDir, "splash.png"), 400, 800)
  console.log("All icons generated!")
}

main().catch(console.error)
