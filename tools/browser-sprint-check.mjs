import { chromium } from "./vendor/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.BASE_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ||
    (process.platform === "win32"
      ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
      : undefined),
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const results = {};
try {
  await page.goto(base + "#math");
  await page.locator('[data-answer="b"]').click();
  await page.locator("#check-answer").click();
  await page.locator("#lesson-to-code").click();
  await page.waitForSelector(".programming-sprint");
  assert.match(
    await page.locator(".programming-sprint").innerText(),
    /10 MINUTEN TOTAAL/,
  );
  assert.equal(await page.locator("#coding-task option").count(), 5);
  assert.equal(
    await page.locator("#training-options").getAttribute("open"),
    null,
  );
  assert.match(await page.locator("#code-editor").inputValue(), /# TODO/);
  assert.match(await page.locator("#code-editor").inputValue(), /score = 0/);
  await page.locator("#coding-task").selectOption("3");
  await page.locator("#load-programming-starter").click();
  const starter = await page.locator("#code-editor").inputValue();
  assert.match(starter, /kans = candidate\["frequency"\]/);
  assert.match(starter, /tijd = candidate\["cost"\]/);
  await page
    .locator("#code-editor")
    .fill(starter.replace("score = 0", "score = kans / tijd"));
  await page.locator("#run-code").click();
  await page.waitForFunction(
    () =>
      document
        .querySelector("#console")
        ?.textContent.includes("Je agent werkt."),
    {},
    { timeout: 30000 },
  );
  results.python = await page.locator("#console").innerText();
  await page.locator("#quick-compare").click();
  await page.waitForSelector("#validation-result .callout", { timeout: 15000 });
  assert.match(
    await page.locator("#validation-result").innerText(),
    /100 rondes/,
  );
  assert.equal(
    await page.locator("#training-options").getAttribute("open"),
    null,
  );
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("matchlab-v1")).model.episodes,
    ),
    0,
  );
  results.comparison = await page.locator("#validation-result").innerText();
  await mkdir("artifacts/qa", { recursive: true });
  await page.screenshot({
    path: "artifacts/qa/sprint-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "artifacts/qa/sprint-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth),
    390,
  );
  await page.locator('[data-mode="blocks"]').click();
  await page.waitForSelector(".blocklySvg");
  assert.match(await page.locator("#generated-code").textContent(), /return 0/);
  results.blocks = await page.evaluate(() => {
    const B = window.Blockly;
    const gen = window.python?.pythonGenerator || B.Python;
    const block = B.getMainWorkspace().newBlock("match_checked");
    const code = gen.blockToCode(block);
    block.dispose();
    return code[0];
  });
  assert.match(results.blocks, /candidate\["id"\] in observation\["checked"\]/);
  await page.locator('[data-mode="python"]').click();
  await page.locator("#coding-task").selectOption("4");
  await page.locator("#load-programming-starter").click();
  const learnedStarter = await page.locator("#code-editor").inputValue();
  await page
    .locator("#code-editor")
    .fill(learnedStarter.replace("score = 0", "score = geleerd"));
  await page.locator("#quick-train").click();
  await page.waitForFunction(
    () =>
      document.querySelector("#sprint-training-progress")?.style.width ===
      "100%",
    {},
    { timeout: 30000 },
  );
  assert.match(
    await page.locator("#sprint-training-status").innerText(),
    /250 rondes afgerond/,
  );
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("matchlab-v1")).model.episodes,
    ),
    250,
  );
  results.training = await page.locator("#sprint-training-status").innerText();
  assert.deepEqual(errors, []);
  results.errors = errors;
  console.log(JSON.stringify(results, null, 2));
} finally {
  await writeFile(
    "artifacts/qa/sprint-results.json",
    JSON.stringify(results, null, 2),
  );
  await browser.close();
}
