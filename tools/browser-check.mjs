// Local QA helper. Override PLAYWRIGHT_PATH / CHROME_PATH on another workstation.
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const playwrightPath =
  process.env.PLAYWRIGHT_PATH ||
  resolve("tools/vendor/node_modules/playwright/index.mjs");
const { chromium } = await import(pathToFileURL(playwrightPath));
const base = process.env.BASE_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    (process.platform === "win32"
      ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
      : undefined),
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const logs = [];
const record = (name, detail) => {
  logs.push({ name, detail });
  console.log(name + ": " + JSON.stringify(detail));
};
try {
  await page.goto(base, { waitUntil: "networkidle" });
  assert.match(await page.title(), /Matchlab/);
  record("home loaded", await page.locator("h1").allTextContents());
  await page.goto(base + "#math");
  await page.locator('[data-answer="b"]').click();
  await page.locator("#check-answer").click();
  await page
    .locator("#proof-input")
    .fill(
      "Er zijn zes mogelijke matches over; de kansen tellen op tot één. Binnen drie checks: 3/8.",
    );
  await page.locator("#lesson-to-code").click();
  await page.waitForSelector("#code-editor");
  const code =
    'from matchlab import MLAgent\nclass MijnAgent(MLAgent):\n    def evaluate(self, observation, candidate):\n        return candidate["q"]\n';
  await page.locator("#code-editor").fill(code);
  await page.locator("#run-code").click();
  await page.waitForFunction(
    () =>
      document
        .querySelector("#console")
        ?.textContent.includes("Je agent werkt."),
    {},
    { timeout: 100000 },
  );
  record("real Python executed", await page.locator("#console").textContent());
  await page.locator("#training-options > summary").click();
  await page.locator("#episodes").selectOption("1000");
  await page.locator("#train-button").click();
  await page.waitForFunction(
    () =>
      document
        .querySelector("#training-status")
        ?.textContent.includes("Training afgerond"),
    {},
    { timeout: 45000 },
  );
  assert.equal(
    (await page.locator("#episodes-stat").textContent()).replace(/\D/g, ""),
    "1000",
  );
  record("training", await page.locator("#console").textContent());
  await page.locator("#validate-button").click();
  await page.waitForSelector("#validation-result .callout", { timeout: 20000 });
  record("validation", await page.locator("#validation-result").textContent());
  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("matchlab-v1")),
  );
  assert.equal(before.model.episodes, 1000);
  assert.ok(before.proofs["01"].includes("zes"));
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(
    (await page.locator("#episodes-stat").textContent()).replace(/\D/g, ""),
    "1000",
  );
  record("persistent storage restored", true);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("[data-export]").first().click(),
  ]);
  await mkdir("artifacts/qa", { recursive: true });
  await download.saveAs("artifacts/qa/exported-agent.json");
  record("exported file", download.suggestedFilename());
  await page.locator("#code-editor").fill("broken code");
  await page
    .locator("#agent-file")
    .setInputFiles("artifacts/qa/exported-agent.json");
  await page.waitForFunction(() =>
    document.querySelector("#code-editor")?.value.includes('candidate["q"]'),
  );
  assert.equal(
    (await page.locator("#episodes-stat").textContent()).replace(/\D/g, ""),
    "1000",
  );
  record("import restores code and model", true);
  await page.goto(base + "#arena");
  await page.locator("#start-game").click();
  await page.waitForFunction(
    () =>
      document.querySelector("#arena-state")?.textContent === "ZOEK DE MATCH",
    {},
    { timeout: 100000 },
  );
  const match = await page.evaluate(() => {
    const own = [...document.querySelectorAll("#human-card [data-symbol]")];
    const other = [...document.querySelectorAll("#agent-card svg title")].map(
      (x) => x.textContent,
    );
    return own.find((x) =>
      other.includes(x.querySelector("svg title")?.textContent),
    )?.dataset.symbol;
  });
  assert.ok(match, "find shared symbol by visible SVG titles");
  await page.locator(`[data-symbol="${match}"]`).click();
  assert.equal(await page.locator("#human-score").textContent(), "1");
  record("human can win a round", true);
  await page.goto(base + "#lab");
  await page
    .locator("#code-editor")
    .fill(
      'from matchlab import MLAgent\nclass MijnAgent(MLAgent):\n    def evaluate(self, observation, candidate):\n        return float("nan")',
    );
  await page.locator("#run-code").click();
  await page.waitForSelector("#console.error", { timeout: 20000 });
  record("Python error shown", await page.locator("#console").textContent());
  assert.deepEqual(errors, []);
  record("uncaught page errors", errors);
} catch (e) {
  record("FAILURE", e.stack);
  await page.screenshot({
    path: "artifacts/qa/integration-failure.png",
    fullPage: true,
  });
  process.exitCode = 1;
} finally {
  await writeFile(
    "artifacts/qa/integration-results.json",
    JSON.stringify(logs, null, 2),
  );
  await browser.close();
}
