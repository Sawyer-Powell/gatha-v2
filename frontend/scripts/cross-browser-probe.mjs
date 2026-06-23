import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pixelmatch from "pixelmatch";
import { chromium, webkit } from "playwright";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const url = valueFor("--url") ?? process.env.VISUAL_URL ?? "https://127.0.0.1:5173/";
const outDir = path.resolve(root, valueFor("--out-dir") ?? "cross-browser-screenshots");
const requestedBrowsers = (valueFor("--browsers") ?? "chrome,safari")
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);
const viewport = {
  width: Number(valueFor("--width") ?? 1440),
  height: Number(valueFor("--height") ?? 900),
};

const browserConfigs = {
  chrome: {
    label: "chrome",
    launcher: chromium,
    options: { channel: "chrome" },
    fallbackOptions: {},
  },
  chromium: {
    label: "chromium",
    launcher: chromium,
    options: {},
  },
  safari: {
    label: "safari",
    launcher: webkit,
    options: {},
    note: "Playwright WebKit, used as the closest automated Safari proxy.",
  },
  webkit: {
    label: "webkit",
    launcher: webkit,
    options: {},
  },
};

const scenarios = [
  {
    name: "home-ready",
    run: async (page) => {
      await ready(page);
    },
    videoFrame: true,
  },
  {
    name: "video-playback",
    run: async (page) => {
      await ready(page);
      await page.getByLabel("Play video").click();
      await page.waitForTimeout(1500);
    },
    media: "playing",
    videoFrame: true,
  },
  {
    name: "video-scrubbed",
    run: async (page) => {
      await ready(page);
      await page.getByLabel("Scrub video timeline").evaluate((input) => {
        input.value = "2";
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await page.waitForTimeout(350);
    },
    media: "scrubbed",
    videoFrame: true,
  },
  {
    name: "sidebar-search",
    run: async (page) => {
      await ready(page);
      await page.getByLabel("Open video search").click();
      await page.getByLabel("Search videos").fill("running");
      await page.waitForTimeout(250);
    },
  },
  {
    name: "uploader-filter",
    run: async (page) => {
      await ready(page);
      await page.getByLabel("Filter videos by uploader").click();
      await page.getByLabel("Search uploaders").fill("jiayin");
      await page.waitForTimeout(250);
    },
  },
  {
    name: "account-profile",
    run: async (page) => {
      await openAccount(page);
    },
  },
  {
    name: "account-organization",
    run: async (page) => {
      await openAccount(page);
      await page.getByRole("button", { name: "Organization" }).click();
      await page.waitForTimeout(250);
    },
  },
  {
    name: "account-billing",
    run: async (page) => {
      await openAccount(page);
      await page.getByRole("button", { name: "Billing" }).click();
      await page.waitForTimeout(250);
    },
  },
];

function valueFor(flag) {
  const raw = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  return raw?.slice(flag.length + 1);
}

async function ready(page) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts?.ready);
  await page.getByLabel("Edit video name").waitFor({ state: "visible" });
}

async function openAccount(page) {
  await ready(page);
  await page.getByLabel("Open account settings").click();
  await page.getByLabel("Account settings sections").waitFor({ state: "visible" });
  await page.waitForTimeout(250);
}

async function createBrowser(name) {
  const config = browserConfigs[name];
  if (!config) throw new Error(`Unknown browser "${name}". Try chrome, chromium, safari, or webkit.`);
  try {
    return {
      label: config.label,
      note: config.note,
      browser: await config.launcher.launch(config.options),
    };
  } catch (error) {
    if (!config.fallbackOptions) throw error;
    console.warn(`${config.label}: ${error.message}`);
    console.warn(`${config.label}: falling back to bundled Chromium.`);
    return {
      label: "chromium",
      note: "Chrome channel was unavailable; used bundled Chromium fallback.",
      browser: await config.launcher.launch(config.fallbackOptions),
    };
  }
}

async function newPage(browser) {
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: "light",
    ignoreHTTPSErrors: true,
  });
  await page.route("**/ev", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ WhoAmI: { email: "sawyerhpowell@gmail.com" } }]),
    });
  });
  page.on("console", (message) => {
    if (message.type() === "error") console.log(`[console:${message.type()}] ${message.text()}`);
  });
  return page;
}

async function mediaState(page) {
  return page.locator("video").first().evaluate((video) => ({
    currentTime: video.currentTime,
    duration: Number.isFinite(video.duration) ? video.duration : null,
    paused: video.paused,
    ended: video.ended,
    readyState: video.readyState,
    networkState: video.networkState,
    videoWidth: video.videoWidth,
    videoHeight: video.videoHeight,
    error: video.error
      ? {
        code: video.error.code,
        message: video.error.message,
      }
      : null,
  })).catch((error) => ({ error: { message: error.message } }));
}

async function videoBox(page) {
  const box = await page.locator("video").first().boundingBox().catch(() => null);
  if (!box) return null;
  return {
    x: Math.round(box.x),
    y: Math.round(box.y),
    width: Math.round(box.width),
    height: Math.round(box.height),
  };
}

function readPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function diffImages(aPath, bPath, outPath) {
  const a = readPng(aPath);
  const b = readPng(bPath);
  if (a.width !== b.width || a.height !== b.height) {
    return {
      skipped: true,
      reason: `Screenshot dimensions differ: ${a.width}x${a.height} vs ${b.width}x${b.height}`,
    };
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const pixels = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  fs.writeFileSync(outPath, PNG.sync.write(diff));
  return {
    pixels,
    total: a.width * a.height,
    ratio: pixels / (a.width * a.height),
  };
}

function videoFrameStats(screenshotPath, box) {
  if (!box || box.width <= 0 || box.height <= 0) return null;
  const png = readPng(screenshotPath);
  const inset = Math.max(4, Math.round(Math.min(box.width, box.height) * 0.03));
  const left = Math.max(0, box.x + inset);
  const top = Math.max(0, box.y + inset);
  const right = Math.min(png.width, box.x + box.width - inset);
  const bottom = Math.min(png.height, box.y + box.height - inset);
  let samples = 0;
  let dark = 0;
  let luminanceSum = 0;
  let colorDeltaSum = 0;
  for (let y = top; y < bottom; y += 4) {
    for (let x = left; x < right; x += 4) {
      const i = (png.width * y + x) << 2;
      const r = png.data[i];
      const g = png.data[i + 1];
      const b = png.data[i + 2];
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      samples += 1;
      luminanceSum += luminance;
      colorDeltaSum += Math.max(r, g, b) - Math.min(r, g, b);
      if (luminance < 55) dark += 1;
    }
  }
  const averageLuminance = samples ? luminanceSum / samples : 0;
  const averageColorDelta = samples ? colorDeltaSum / samples : 0;
  const darkRatio = samples ? dark / samples : 0;
  return {
    box,
    samples,
    averageLuminance,
    averageColorDelta,
    darkRatio,
    finding: (darkRatio > 0.9 && averageLuminance < 65) || (averageLuminance < 70 && averageColorDelta < 12)
      ? `video screenshot frame appears blank/dark; darkRatio=${darkRatio.toFixed(3)}, avgLuma=${averageLuminance.toFixed(1)}`
      : null,
  };
}

function playbackFinding(state, expectation) {
  if (!state) return null;
  if (state.error) return `video error: ${state.error.message ?? `code ${state.error.code}`}`;
  if (state.videoWidth === 0 || state.videoHeight === 0) return "video metadata loaded without visible dimensions";
  if (state.readyState < 2) return `video not ready enough to play; readyState=${state.readyState}`;
  if (expectation === "scrubbed") {
    if (Math.abs(state.currentTime - 2) > 0.15) return `scrub did not land near 2s; currentTime=${state.currentTime.toFixed(2)}`;
    return null;
  }
  if (state.paused || state.currentTime < 0.25) return `video did not advance; paused=${state.paused}, currentTime=${state.currentTime.toFixed(2)}`;
  return null;
}

async function capture(browserName, browser, scenario) {
  const page = await newPage(browser);
  const screenshotPath = path.join(outDir, `${browserName}-${scenario.name}.png`);
  let state = null;
  let frameBox = null;
  let frameStats = null;
  let error = null;
  try {
    await scenario.run(page);
    if (scenario.media) state = await mediaState(page);
    if (scenario.videoFrame) frameBox = await videoBox(page);
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
      animations: "disabled",
      caret: "hide",
    });
    if (scenario.videoFrame) frameStats = videoFrameStats(screenshotPath, frameBox);
  } catch (caught) {
    error = caught.message;
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
      animations: "disabled",
      caret: "hide",
    }).catch(() => undefined);
  } finally {
    await page.close();
  }
  return {
    screenshot: path.relative(root, screenshotPath),
    media: state,
    visualVideoFrame: frameStats,
    error,
    finding: (scenario.media ? playbackFinding(state, scenario.media) : null) ?? frameStats?.finding ?? null,
  };
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const report = {
    url,
    viewport,
    generatedAt: new Date().toISOString(),
    browsers: {},
    unavailableBrowsers: {},
    scenarios: {},
    diffs: {},
  };

  const browsers = [];
  for (const requested of requestedBrowsers) {
    try {
      const created = await createBrowser(requested);
      browsers.push(created);
      report.browsers[created.label] = { note: created.note ?? null };
    } catch (error) {
      report.unavailableBrowsers[requested] = {
        message: error.message,
        hint: requested === "safari" || requested === "webkit"
          ? "Run `npx playwright install webkit` to enable the automated Safari/WebKit probe."
          : "Run `npx playwright install` or use --browsers=chromium.",
      };
      console.warn(`${requested}: unavailable: ${error.message}`);
    }
  }

  if (browsers.length === 0) {
    throw new Error("No requested browsers were available.");
  }

  try {
    for (const scenario of scenarios) {
      report.scenarios[scenario.name] = {};
      for (const { label, browser } of browsers) {
        const result = await capture(label, browser, scenario);
        report.scenarios[scenario.name][label] = result;
        console.log(`${label}/${scenario.name}: ${result.error ?? result.finding ?? result.screenshot}`);
      }
    }
  } finally {
    await Promise.allSettled(browsers.map(({ browser }) => browser.close()));
  }

  const [base, ...comparisons] = [...new Set(browsers.map(({ label }) => label))];
  for (const scenario of scenarios) {
    for (const browserName of comparisons) {
      const baseShot = report.scenarios[scenario.name]?.[base]?.screenshot;
      const compareShot = report.scenarios[scenario.name]?.[browserName]?.screenshot;
      if (!baseShot || !compareShot) continue;
      const diffPath = path.join(outDir, `${base}-vs-${browserName}-${scenario.name}.diff.png`);
      const diff = diffImages(
        path.join(root, baseShot),
        path.join(root, compareShot),
        diffPath,
      );
      report.diffs[`${base}-vs-${browserName}/${scenario.name}`] = {
        ...diff,
        screenshot: path.relative(root, diffPath),
      };
      if (!diff.skipped) {
        console.log(`${base} vs ${browserName}/${scenario.name}: ${diff.pixels}/${diff.total} (${(diff.ratio * 100).toFixed(3)}%)`);
      }
    }
  }

  const reportPath = path.join(outDir, "report.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Report: ${path.relative(root, reportPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
