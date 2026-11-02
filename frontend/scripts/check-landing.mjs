import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.env.LANDING_URL || "http://127.0.0.1:5186";
const browser = await chromium.launch({
  channel: process.platform === "win32" ? "chrome" : undefined,
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});
const directory = "qa-screenshots";
await mkdir(directory, { recursive: true });
const errors = [];
const requests = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("request", (request) => requests.push(request.url()));
const pause = () => page.waitForTimeout(800);
async function noOverflow() {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    "Horizontal overflow",
  );
}
async function heroFits() {
  const fit = await page.evaluate(() => {
    const cta = document
      .querySelector(".hero-bottom .button")
      .getBoundingClientRect();
    const strip = document
      .querySelector(".capability-strip")
      .getBoundingClientRect();
    return {
      cta: cta.bottom,
      strip: strip.top,
      height: innerHeight,
    };
  });
  assert(
    fit.cta <= fit.height - 12,
    `Hero action below viewport: ${JSON.stringify(fit)}`,
  );
  assert(
    fit.strip < fit.height,
    "Hero does not leave a hint of the next section",
  );
}
async function checkScrollCore() {
  assert.equal(
    await page
      .getByRole("button", { name: /Open the black box|Reassemble core/ })
      .count(),
    0,
    "Click-to-open control is still present",
  );
  const initial = await page.locator(".hero").boundingBox();
  const closed = await page.locator("canvas").screenshot();
  await page.evaluate(() => scrollTo({ top: 240, behavior: "instant" }));
  await pause();
  const held = await page.locator(".hero").boundingBox();
  assert(
    Math.abs(held.y - initial.y) <= 1,
    `Hero moved before the cube opened: ${JSON.stringify({ initial, held, layout: await page.locator(".hero-pin").evaluate((element) => ({ position: getComputedStyle(element).position, top: getComputedStyle(element).top, parent: element.parentElement.getBoundingClientRect().toJSON(), padding: getComputedStyle(element.parentElement).paddingBottom })) })}`,
  );
  const opening = await page.locator("canvas").screenshot();
  assert(!closed.equals(opening), "Cube did not change while scrolling");
  await page.evaluate(() => scrollTo({ top: 400, behavior: "instant" }));
  await pause();
  assert(
    Math.abs((await page.locator(".hero").boundingBox()).y - initial.y) <= 1,
    "Hero released before the open hold ended",
  );
  await page.screenshot({ path: `${directory}/landing-open-core.png` });
  await page.evaluate(() => scrollTo({ top: 620, behavior: "instant" }));
  await pause();
  assert(
    (await page.locator(".hero").boundingBox()).y < initial.y - 100,
    "Hero did not release after opening",
  );
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await pause();
}
async function checkContrast() {
  const contrast = await page.locator(".button-acid").evaluate((element) => {
    const css = getComputedStyle(element);
    function luminance(color) {
      const rgb = color
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number)
        .map((value) => {
          value /= 255;
          return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
        });
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    }
    const foreground = luminance(css.color),
      background = luminance(css.backgroundColor);
    return (
      (Math.max(foreground, background) + 0.05) /
      (Math.min(foreground, background) + 0.05)
    );
  });
  assert(contrast >= 7, `Neon CTA contrast too low: ${contrast}`);
}
try {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("canvas").waitFor({ timeout: 30000 });
  await pause();
  await noOverflow();
  await heroFits();
  await checkContrast();
  await page.screenshot({ path: `${directory}/landing-desktop.png` });
  const canvasPng = await page.locator("canvas").screenshot();
  const pixels = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, 96, 96);
    const data = ctx.getImageData(0, 0, 96, 96).data;
    let visible = 0;
    for (let i = 0; i < data.length; i += 4)
      if (
        data[i] > 65 &&
        data[i + 1] > 65 &&
        data[i + 2] > 65 &&
        data[i + 3] > 0
      )
        visible++;
    return visible;
  }, canvasPng.toString("base64"));
  assert(pixels > 100, `Blank 3D canvas: ${pixels} visible pixels`);
  await checkScrollCore();
  await page.locator("#process").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /02.*RECOGNIZE/ }).click();
  await pause();
  assert(
    await page
      .locator(".pipeline-terminal")
      .innerText()
      .then((value) => value.includes("AES substitution pattern")),
  );
  await page.screenshot({ path: `${directory}/landing-process.png` });
  await page.evaluate(() => {
    const section = document.querySelector(".signal-passage");
    scrollTo({
      top:
        section.getBoundingClientRect().top +
        scrollY +
        (section.offsetHeight - innerHeight) * 0.52,
      behavior: "instant",
    });
  });
  await page.waitForTimeout(1300);
  assert.equal(
    await page.locator(".signal-code").innerText(),
    "SBOX / ROUND / ROTATE / XOR",
  );
  await page.screenshot({ path: `${directory}/landing-signal.png` });
  await page.evaluate(() => {
    const section = document.querySelector(".signal-passage");
    scrollTo({
      top:
        section.getBoundingClientRect().top +
        scrollY +
        (section.offsetHeight - innerHeight) * 0.94,
      behavior: "instant",
    });
  });
  await page.waitForTimeout(800);
  assert.equal(
    await page.locator(".signal-code").innerText(),
    "OFFSET / PRIMITIVE / CONFIDENCE",
  );
  await page.getByRole("button", { name: /Network gateway/ }).click();
  await page.getByRole("tab", { name: "Primitives" }).click();
  await pause();
  assert(
    await page
      .getByRole("tabpanel")
      .innerText()
      .then((text) => text.includes("DES") && text.includes("MD5")),
  );
  await page.getByRole("tab", { name: "Findings" }).click();
  await pause();
  assert(
    await page
      .getByRole("tabpanel")
      .innerText()
      .then((text) => text.includes("Deprecated cryptography detected")),
  );
  await page.getByRole("tab", { name: "Overview" }).click();
  await page.getByRole("button", { name: "Replay scan" }).click();
  await page
    .getByRole("button", { name: "Replay scan" })
    .waitFor({ timeout: 5000 });
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const download = await downloaded;
  const report = JSON.parse(await readFile(await download.path(), "utf8"));
  assert(report.demo && report.sample.name === "gateway_update.bin");
  await page.locator(".lab-workbench").scrollIntoViewIfNeeded();
  await pause();
  await page.screenshot({ path: `${directory}/landing-lab.png` });
  await page
    .getByRole("button", { name: "Can I analyze my own firmware?" })
    .click();
  assert.equal(await page.locator("#answer-2").isVisible(), true);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await pause();
  await noOverflow();
  await heroFits();
  await page.screenshot({ path: `${directory}/landing-wide.png` });
  for (const viewport of [
    { width: 1920, height: 935 },
    { width: 1440, height: 900 },
    { width: 1366, height: 768 },
  ]) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await pause();
    await heroFits();
    await noOverflow();
    await page.screenshot({
      path: `${directory}/landing-${viewport.width}x${viewport.height}.png`,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await pause();
  await noOverflow();
  await heroFits();
  await page.screenshot({ path: `${directory}/landing-mobile.png` });
  await checkScrollCore();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: /The lab/ })
    .click();
  assert.equal(
    await page
      .getByRole("button", { name: "Open navigation" })
      .getAttribute("aria-expanded"),
    "false",
  );
  await page.getByRole("button", { name: /IoT bootloader/ }).click();
  await page.getByRole("tab", { name: "Findings" }).click();
  await pause();
  assert(
    await page
      .getByRole("tabpanel")
      .innerText()
      .then((text) => text.includes("Review key storage")),
  );
  await noOverflow();
  await page.screenshot({ path: `${directory}/landing-mobile-lab.png` });
  await page.evaluate(() => {
    const section = document.querySelector(".signal-passage");
    scrollTo({
      top:
        section.getBoundingClientRect().top +
        scrollY +
        (section.offsetHeight - innerHeight) * 0.52,
      behavior: "instant",
    });
  });
  await page.waitForTimeout(1200);
  await noOverflow();
  await page.screenshot({ path: `${directory}/landing-mobile-signal.png` });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await pause();
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
    "auto",
  );
  assert.equal(
    await page
      .locator(".hero-pin")
      .evaluate((element) => getComputedStyle(element).position),
    "relative",
    "Reduced motion still pins the hero",
  );
  assert.equal(
    await page
      .locator(".hero-sequence")
      .evaluate((element) => getComputedStyle(element).paddingBottom),
    "0px",
    "Reduced motion adds an empty scroll hold",
  );
  await page.screenshot({ path: `${directory}/landing-reduced-motion.png` });
  assert.equal(
    requests.some((url) =>
      /localhost:5000|127\.0\.0\.1:5000|\/api\/(health|standard|proprietary)/.test(
        url,
      ),
    ),
    false,
    "Landing called the backend",
  );
  assert.deepEqual(errors, [], "Browser errors");
  console.log(
    JSON.stringify(
      {
        result: "PASS",
        viewports: [
          "1440x1024",
          "1920x1080",
          "1920x935",
          "1440x900",
          "1366x768",
          "390x844",
        ],
        canvasPixels: pixels,
        checks: [
          "WebGL",
          "scroll-only core opening",
          "hero pins during opening and releases afterward",
          "pipeline",
          "sample switching",
          "tabs",
          "scan replay",
          "JSON export",
          "FAQ",
          "mobile menu",
          "overflow",
          "reduced motion",
          "no backend requests",
          "no browser errors",
          "hero fits viewport",
          "CTA contrast >= 7:1",
          "scroll morph progression",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
