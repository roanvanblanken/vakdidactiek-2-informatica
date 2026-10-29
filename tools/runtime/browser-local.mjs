import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  process.env.PLAYWRIGHT_PATH
    ? pathToFileURL(process.env.PLAYWRIGHT_PATH).href
    : new URL("../vendor/node_modules/playwright/index.mjs", import.meta.url)
        .href
);
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    (process.platform === "win32"
      ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
      : undefined),
  headless: true,
});
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:4173";
const context = await browser.newContext();
const page = await context.newPage();
const requests = [],
  failed = [],
  errors = [];
page.on("request", (request) => requests.push(request.url()));
page.on("requestfailed", (request) =>
  failed.push({ url: request.url(), error: request.failure()?.errorText }),
);
page.on("pageerror", (error) => errors.push(error.message));
await context.route("**/*", (route) =>
  route.request().url().startsWith(origin) ? route.continue() : route.abort(),
);
try {
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  const result = await page.evaluate(async () => {
    const started = performance.now();
    const worker = new Worker(new URL("./js/python-worker.js", location.href), {
      type: "module",
    });
    const messages = [];
    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Local Python test timed out")),
        45000,
      );
      worker.onerror = (event) => {
        clearTimeout(timeout);
        reject(new Error(event.message));
      };
      worker.onmessage = ({ data }) => {
        messages.push(data);
        if (data.type === "ready") {
          worker.postMessage({
            id: 1,
            type: "train",
            episodes: 500,
            seed: 42,
            code: 'from matchlab import MLAgent\nclass MijnAgent(MLAgent):\n    def evaluate(self, observation, candidate):\n        return candidate["q"]\n',
            parameters: { environment: "focus", epsilon: 0.15, alpha: 0.1 },
          });
        }
        if (data.type === "result") {
          clearTimeout(timeout);
          resolve(data);
        }
        if (data.type === "error") {
          clearTimeout(timeout);
          reject(new Error(data.error));
        }
      };
    });
    worker.terminate();
    return {
      elapsedMs: Math.round(performance.now() - started),
      ready: messages.some((x) => x.type === "ready"),
      snapshots: messages.filter((x) => x.type === "progress" && x.model)
        .length,
      response,
    };
  });
  assert.equal(result.ready, true);
  assert.equal(result.response.model.episodes, 500);
  assert.ok(result.snapshots > 0);
  assert.ok(result.response.searchCost >= result.response.steps);
  assert.ok(
    result.response.validation.meanCost >= result.response.validation.meanSteps,
  );
  assert.ok(
    requests.some((url) =>
      url.endsWith("/assets/vendor/pyodide/pyodide.asm.wasm"),
    ),
  );
  assert.equal(
    failed.filter((x) => x.url.includes("/assets/vendor/pyodide/")).length,
    0,
  );
  await mkdir("artifacts/qa", { recursive: true });
  const summary = {
    elapsedMs: result.elapsedMs,
    snapshots: result.snapshots,
    episodes: result.response.model.episodes,
    validation: result.response.validation,
    runtimeRequests: requests.filter((url) => url.includes("pyodide")),
    failed,
    errors,
  };
  await writeFile(
    "artifacts/qa/python-local-results.json",
    JSON.stringify(summary, null, 2),
  );
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await browser.close();
}
