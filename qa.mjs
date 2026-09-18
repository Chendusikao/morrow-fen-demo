import fs from "node:fs/promises";
import { chromium } from "playwright";

const outDir = "qa-output";
await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

const results = [];
for (const viewport of [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 1000 },
]) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  const response = await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  if (viewport.width === 360) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    const expanded = await page.getByRole("button", { name: "Close navigation" }).getAttribute("aria-expanded");
    if (expanded !== "true") errors.push("mobile navigation did not open");
    await page.getByRole("button", { name: "Close navigation" }).click();
  }

  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)));
  });
  const layout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    h1: document.querySelector("h1")?.textContent?.trim(),
    brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
    missingAlt: [...document.images].filter((image) => !image.hasAttribute("alt")).length,
    buttons: [...document.querySelectorAll("button")].map((button) => button.textContent.trim()),
    landmarks: {
      main: document.querySelectorAll("main").length,
      nav: document.querySelectorAll("nav").length,
      footer: document.querySelectorAll("footer").length,
    },
  }));

  await page.locator("#menu").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Puddings" }).click();
  const visibleItems = await page.locator(".menu-item:not([hidden])").count();
  const hiddenItems = await page.locator(".menu-item[hidden]").count();
  if (visibleItems !== 3 || hiddenItems !== 6) errors.push(`menu filter mismatch: ${visibleItems} visible, ${hiddenItems} hidden`);
  await page.getByRole("button", { name: "All" }).click();
  await page.screenshot({ path: `${outDir}/${viewport.name}.png`, fullPage: true });

  results.push({
    viewport: viewport.name,
    status: response?.status(),
    horizontalOverflow: layout.documentWidth > layout.viewportWidth,
    h1: layout.h1,
    brokenImages: layout.brokenImages,
    missingAlt: layout.missingAlt,
    landmarks: layout.landmarks,
    menuFilter: { visibleItems, hiddenItems },
    errors,
  });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.status !== 200 || result.horizontalOverflow || result.brokenImages.length || result.missingAlt || result.errors.length)) process.exit(1);
