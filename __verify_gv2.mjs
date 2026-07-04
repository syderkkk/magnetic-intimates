import { chromium } from "@playwright/test";

const outDir = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3000/producto/conjunto-essential-negro", { waitUntil: "networkidle" });
await page.waitForTimeout(2700);

const galleryBlock = page.locator("div.hidden.gap-3.lg\\:flex").first();
await galleryBlock.screenshot({ path: `${outDir}/gallery-v2-initial.png` });

// Hover sobre la flecha derecha para ver su estado hover
await page.hover('button[aria-label="Ver fotos siguientes"]');
await page.waitForTimeout(200);
await galleryBlock.screenshot({ path: `${outDir}/gallery-v2-arrow-hover.png` });

await page.screenshot({ path: `${outDir}/gallery-v2-full.png` });

await browser.close();
