import { chromium } from "@playwright/test";

const outDir = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3000/producto/conjunto-essential-negro", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

// Elegir talla (radiogroup de talla, no color)
await page.locator('[role="radiogroup"][aria-labelledby="size-label"] label').first().click();
await page.waitForTimeout(200);
await page.locator("button", { hasText: "Agregar al carrito" }).click();
await page.waitForTimeout(600);

// Abrir el carrito (ícono bolsa en el header)
await page.locator("header").locator("button, a").last().click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/d-05b-carrito-con-item.png` });

await browser.close();
