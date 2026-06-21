import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pixelmatch from "pixelmatch";
import { chromium } from "playwright";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const args = new Set(process.argv.slice(2));
const defaultScenarios = [
  "home",
  "account",
  "account-organization",
  "account-billing",
  "account-contribute",
];

const name = valueFor("--name") ?? "home";
const scenario = valueFor("--scenario") ?? name;
const url = valueFor("--url") ?? process.env.VISUAL_URL ?? "http://localhost:5173/";
const outDir = path.resolve(root, "visual-regression");
const viewport = {
  width: Number(valueFor("--width") ?? 1440),
  height: Number(valueFor("--height") ?? 900),
};

function valueFor(flag) {
  const raw = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  return raw?.slice(flag.length + 1);
}

function assertSameSize(a, b) {
  if (a.width === b.width && a.height === b.height) return;
  throw new Error(
    `Screenshot dimensions differ: baseline ${a.width}x${a.height}, current ${b.width}x${b.height}`,
  );
}

async function capture(targetName, targetScenario) {
  fs.mkdirSync(outDir, { recursive: true });
  const targetBaselinePath = path.join(outDir, `${targetName}.baseline.png`);
  const targetCurrentPath = path.join(outDir, `${targetName}.current.png`);
  const targetDiffPath = path.join(outDir, `${targetName}.diff.png`);

  const browser = await chromium.launch();
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

  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts?.ready);
  await page.getByLabel("Edit video name").waitFor({ state: "visible" });
  if (targetScenario.startsWith("account")) {
    await page.getByLabel("Open account settings").click();
    await page.getByLabel("Account settings sections").waitFor({ state: "visible" });
    const tab = {
      "account-profile": "Profile",
      "account-organization": "Organization",
      "account-billing": "Billing",
      "account-contribute": "Contribute",
    }[targetScenario];
    if (tab) {
      await page.getByRole("button", { name: tab }).click();
    }
  }
  await page.screenshot({
    path: targetCurrentPath,
    fullPage: false,
    animations: "disabled",
    caret: "hide",
  });
  await browser.close();

  if (args.has("--baseline") || !fs.existsSync(targetBaselinePath)) {
    fs.copyFileSync(targetCurrentPath, targetBaselinePath);
    console.log(`Wrote baseline: ${path.relative(root, targetBaselinePath)}`);
    return 0;
  }

  const baseline = PNG.sync.read(fs.readFileSync(targetBaselinePath));
  const current = PNG.sync.read(fs.readFileSync(targetCurrentPath));
  assertSameSize(baseline, current);

  const diff = new PNG({ width: baseline.width, height: baseline.height });
  const pixels = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    baseline.width,
    baseline.height,
    { threshold: 0.1 },
  );
  fs.writeFileSync(targetDiffPath, PNG.sync.write(diff));

  const total = baseline.width * baseline.height;
  const ratio = pixels / total;
  console.log(`${targetName}:`);
  console.log(`Diff pixels: ${pixels}/${total} (${(ratio * 100).toFixed(4)}%)`);
  console.log(`Current: ${path.relative(root, targetCurrentPath)}`);
  console.log(`Diff: ${path.relative(root, targetDiffPath)}`);

  return pixels;
}

async function main() {
  if (args.has("--all")) {
    let totalDiff = 0;
    for (const target of defaultScenarios) {
      totalDiff += await capture(target, target);
    }
    if (totalDiff > 0) process.exitCode = 1;
    return;
  }

  const pixels = await capture(name, scenario);
  if (pixels > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
