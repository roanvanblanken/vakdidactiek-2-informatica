import { chromium } from "./vendor/node_modules/playwright/index.mjs";
import { lessons } from "../js/curriculum.js";
import fs from "node:fs";

fs.mkdirSync("artifacts/qa", { recursive: true });
const result = {
  timestamp: new Date().toISOString(),
  errors: [],
  requests: [],
  checks: {},
};
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    (process.platform === "win32"
      ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
      : undefined),
  headless: true,
});
const base = "http://127.0.0.1:4173";
const observe = (page) => {
  page.on("pageerror", (error) => result.errors.push(error.message));
  page.on("requestfailed", (request) =>
    result.requests.push({
      url: request.url(),
      failure: request.failure()?.errorText,
    }),
  );
};
async function layout(page) {
  return page.evaluate(
    (expectedWidth) => ({
      viewport: expectedWidth,
      innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > expectedWidth,
      overflowingElements: [...document.querySelectorAll("main *")]
        .filter((el) => el.getBoundingClientRect().right > expectedWidth + 1)
        .slice(0, 12)
        .map((el) => ({
          tag: el.tagName,
          class: el.className,
          right: Math.round(el.getBoundingClientRect().right),
        })),
      headings: [...document.querySelectorAll("h1")].map((h) => h.textContent),
      unnamedButtons: [...document.querySelectorAll("button")].filter(
        (b) => !b.getAttribute("aria-label") && !b.textContent.trim(),
      ).length,
      unlabeledInputs: [
        ...document.querySelectorAll("input:not([type=file]),select,textarea"),
      ]
        .filter(
          (el) =>
            !el.getAttribute("aria-label") &&
            !document.querySelector('label[for="' + el.id + '"]'),
        )
        .map((el) => el.id),
      smallTargets: [...document.querySelectorAll("a,button")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (r.width < 24 || r.height < 24);
        })
        .map((el) => ({
          text: el.getAttribute("aria-label") || el.textContent.trim(),
          width: Math.round(el.getBoundingClientRect().width),
          height: Math.round(el.getBoundingClientRect().height),
        })),
    }),
    page.viewportSize().width,
  );
}

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  observe(page);
  await page.goto(base, { waitUntil: "networkidle" });
  result.checks.homeDesktop = await layout(page);
  await page.screenshot({
    path: "artifacts/qa/home-desktop.png",
    fullPage: true,
  });
  await page.keyboard.press("Tab");
  result.checks.firstKeyboardTarget = await page.evaluate(() =>
    document.activeElement.textContent.trim(),
  );
  await page.getByRole("button", { name: "Hoe werkt Matchlab?" }).click();
  result.checks.helpDialog = await page
    .locator("#help-dialog")
    .evaluate((el) => el.open);
  await page.keyboard.press("Escape");
  result.checks.helpEscape = !(await page
    .locator("#help-dialog")
    .evaluate((el) => el.open));
  await page.goto(base + "/#math");
  await page.locator('[data-answer="' + lessons[0].correct + '"]').click();
  await page.locator("#check-answer").click();
  result.checks.correctFeedback = await page
    .locator("#answer-feedback")
    .innerText();
  await page
    .locator("#proof-input")
    .fill(
      "Ik neem gelijke kansen aan. Zes kandidaten blijven over, dus de kans is 1/6.",
    );
  await page.locator("#lesson-to-code").click();
  await page.locator("#code-editor").waitFor();
  result.checks.pythonRoute = {
    visible: await page.locator("#code-editor").isVisible(),
    source: await page.locator("#code-editor").inputValue(),
    layout: await layout(page),
  };
  await page.locator("#code-editor").focus();
  await page.keyboard.press("Shift+Tab");
  result.checks.editorKeyboardExit = await page.evaluate(() => ({
    escaped: document.activeElement.id !== "code-editor",
    focused: document.activeElement.textContent.trim().slice(0, 80),
  }));
  await page.goto(base + "/#math");
  result.checks.proofPersisted = await page
    .locator("#proof-input")
    .inputValue();
  await page.goto(base + "/#icons");
  result.checks.iconTileCount = await page.locator("[data-icon]").count();
  const beforeColor = await page
    .locator('[data-icon="0"] path')
    .getAttribute("stroke");
  await page.locator('[data-preset="cosmos"]').click();
  const afterColor = await page
    .locator('[data-icon="0"] path')
    .getAttribute("stroke");
  result.checks.preset = {
    beforeColor,
    afterColor,
    active: await page.locator('[data-preset="cosmos"]').getAttribute("class"),
    saved: await page.evaluate(
      () => JSON.parse(localStorage.getItem("matchlab-v1")).preset,
    ),
  };
  const png = Buffer.from(
    await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#7554ca";
      ctx.fillRect(2, 2, 28, 28);
      return canvas.toDataURL("image/png").split(",")[1];
    }),
    "base64",
  );
  const chooserPromise = page.waitForEvent("filechooser");
  await page.locator('[data-icon="0"]').click();
  await (
    await chooserPromise
  ).setFiles({ name: "eigen-figuur.png", mimeType: "image/png", buffer: png });
  await page.locator('[data-icon="0"].custom img').waitFor();
  result.checks.upload = await page
    .locator('[data-icon="0"] img')
    .evaluate((img) => ({
      complete: img.complete,
      width: img.naturalWidth,
      srcType: img.src.slice(0, 23),
      alt: img.alt,
    }));
  await page.reload();
  result.checks.uploadPersisted = await page
    .locator('[data-icon="0"].custom img')
    .count();
  result.checks.iconsDesktop = await layout(page);
  console.log("Desktop, wiskunderoute, presets en eigen upload gecontroleerd.");
  await context.close();

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobile.newPage();
  observe(mobilePage);
  await mobilePage.goto(base, { waitUntil: "networkidle" });
  result.checks.homeMobile = await layout(mobilePage);
  await mobilePage.screenshot({
    path: "artifacts/qa/home-mobile.png",
    fullPage: true,
  });
  for (const route of ["math", "icons", "arena", "teacher"]) {
    await mobilePage.goto(base + "/#" + route);
    result.checks[route + "Mobile"] = await layout(mobilePage);
    if (route === "math")
      await mobilePage.screenshot({
        path: "artifacts/qa/math-mobile.png",
        fullPage: true,
      });
  }
  await mobilePage.goto(base + "/#arena");
  await mobilePage.locator("#start-game").click();
  await mobilePage.getByText("ZOEK DE MATCH", { exact: true }).waitFor();
  result.checks.arenaStarted = {
    state: await mobilePage.locator("#arena-state").innerText(),
    humanButtons: await mobilePage.locator("#human-card [data-symbol]").count(),
    agentSymbols: await mobilePage.locator("#agent-card .symbol").count(),
    layout: await layout(mobilePage),
  };
  const matchId = await mobilePage.evaluate(() => {
    const a = [...document.querySelectorAll("#human-card [data-symbol]")];
    const names = [...document.querySelectorAll("#agent-card svg title")].map(
      (el) => el.textContent,
    );
    return a.find((el) =>
      names.includes(el.querySelector("title")?.textContent),
    )?.dataset.symbol;
  });
  if (matchId !== undefined)
    await mobilePage
      .locator('#human-card [data-symbol="' + matchId + '"]')
      .click();
  result.checks.arenaClick = {
    score: await mobilePage.locator("#human-score").innerText(),
    message: await mobilePage.locator("#arena-message").innerText(),
    matchingSymbol: matchId,
  };
  result.checks.arenaHiddenControls = {
    startHidden: !(await mobilePage.locator("#start-game").isVisible()),
    nextVisible: await mobilePage.locator("#next-round").isVisible(),
    resetVisible: await mobilePage.locator("#reset-game").isVisible(),
  };
  await mobilePage.screenshot({
    path: "artifacts/qa/arena-mobile.png",
    fullPage: true,
  });
  await mobile.close();
  console.log("Mobiele schermen en speelbare arena gecontroleerd.");

  if (process.argv.includes("--skip-blocks")) {
    console.log(
      "Blokkentest overgeslagen op verzoek tijdens lokaal maken van runtime.",
    );
  } else {
    const blocksContext = await browser.newContext({
      viewport: { width: 1440, height: 1080 },
      deviceScaleFactor: 1,
    });
    const blocks = await blocksContext.newPage();
    observe(blocks);
    await blocks.goto(base + "/#math", { waitUntil: "networkidle" });
    await blocks.locator('[data-answer="a"]').click();
    await blocks.locator("#check-answer").click();
    result.checks.incorrectFeedback = await blocks
      .locator("#answer-feedback")
      .innerText();
    await blocks.locator("#lesson-to-code").click();
    await blocks.waitForFunction(
      () => window.Blockly?.getMainWorkspace()?.getAllBlocks(false).length >= 2,
      null,
      { timeout: 45000 },
    );
    result.checks.blocksInitial = await blocks.evaluate(() => ({
      version: Blockly.VERSION,
      count: Blockly.getMainWorkspace().getAllBlocks(false).length,
      code: document.querySelector("#generated-code").textContent,
    }));
    const originalReturn = await blocks.evaluate(() => {
      const block = Blockly.getMainWorkspace()
        .getAllBlocks(false)
        .find((b) => b.type === "match_score");
      const rect = block.getSvgRoot().getBoundingClientRect();
      return {
        x: rect.x + 35,
        y: rect.y + 13,
        position: block.getRelativeToSurfaceXY(),
      };
    });
    result.checks.blockDragOrigin = originalReturn;
    await blocks.mouse.move(originalReturn.x, originalReturn.y);
    await blocks.mouse.down();
    // Keep the test drag away from Blockly's lower-right trashcan.
    await blocks.mouse.move(originalReturn.x + 55, originalReturn.y - 55, {
      steps: 15,
    });
    await blocks.mouse.up();
    result.checks.blocksDrag = await blocks.evaluate((before) => {
      const block = Blockly.getMainWorkspace()
        .getAllBlocks(false)
        .find((b) => b.type === "match_score");
      if (!block)
        return {
          before: before.position,
          missing: true,
          allBlocks: Blockly.getMainWorkspace()
            .getAllBlocks(false)
            .map((b) => b.type),
        };
      const pos = block.getRelativeToSurfaceXY();
      return {
        before: before.position,
        after: pos,
        moved: pos.x !== before.position.x || pos.y !== before.position.y,
      };
    }, originalReturn);
    await blocks.screenshot({
      path: "artifacts/qa/blocks-after-drag.png",
      fullPage: true,
    });
    // Use Blockly's public connection API after real pointer movement; verify its change event regenerates Python.
    result.checks.blocksReconnect = await blocks.evaluate(async () => {
      const ws = Blockly.getMainWorkspace();
      const score = ws
        .getAllBlocks(false)
        .find((b) => b.type === "match_score");
      const value = score.getInputTargetBlock("SCORE");
      value.setFieldValue("frequency", "FIELD");
      value.outputConnection.disconnect();
      const number = ws.newBlock("math_number");
      number.setFieldValue(7, "NUM");
      number.initSvg();
      number.render();
      score.getInput("SCORE").connection.connect(number.outputConnection);
      value.dispose();
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        connectedType: score.getInputTargetBlock("SCORE").type,
        value: number.getFieldValue("NUM"),
        count: ws.getAllBlocks(false).length,
        code: document.querySelector("#generated-code").textContent,
      };
    });
    await blocks.locator("#run-code").click();
    await blocks.waitForFunction(
      () => {
        const output = document.querySelector("#console");
        return (
          output.textContent.includes("Je agent werkt.") ||
          output.classList.contains("error")
        );
      },
      null,
      { timeout: 30000 },
    );
    result.checks.blocksPythonExecution = await blocks
      .locator("#console")
      .innerText();
    await blocks.screenshot({
      path: "artifacts/qa/blocks-desktop.png",
      fullPage: true,
    });
    result.checks.blocksDesktop = await layout(blocks);
    await blocks.setViewportSize({ width: 390, height: 844 });
    result.checks.blocksMobile = await layout(blocks);
    await blocks.screenshot({
      path: "artifacts/qa/blocks-mobile.png",
      fullPage: true,
    });
    await blocks.reload();
    await blocks.waitForFunction(
      () => window.Blockly?.getMainWorkspace()?.getAllBlocks(false).length >= 2,
      null,
      { timeout: 45000 },
    );
    result.checks.blocksReload = await blocks
      .locator("#generated-code")
      .textContent();
    result.checks.blocksPersistedReturn =
      result.checks.blocksReload.includes("return 7");
    result.checks.mobileToolboxClosed = await blocks.evaluate(() => {
      const ws = Blockly.getMainWorkspace(),
        host = document.querySelector("#blocks-host").getBoundingClientRect();
      return {
        hostWidth: Math.round(host.width),
        toolboxWidth: ws.getToolbox().getWidth(),
        flyoutVisible: ws.getFlyout().isVisible(),
        scale: ws.scale,
      };
    });
    await blocks.screenshot({
      path: "artifacts/qa/blocks-mobile-collapsed.png",
      fullPage: true,
    });
    const category = blocks.getByRole("treeitem").filter({ hasText: "Agent" });
    await category.click();
    result.checks.mobileToolboxOpen = await blocks.evaluate(() => {
      const ws = Blockly.getMainWorkspace();
      return {
        flyoutVisible: ws.getFlyout().isVisible(),
        flyoutBlocks: ws
          .getFlyout()
          .getWorkspace()
          .getAllBlocks(false)
          .map((b) => b.type),
      };
    });
    await blocks.screenshot({
      path: "artifacts/qa/blocks-mobile-category.png",
      fullPage: true,
    });
    await category.click();
    result.checks.mobileToolboxClosedAgain = await blocks.evaluate(
      () => !Blockly.getMainWorkspace().getFlyout().isVisible(),
    );
    await blocksContext.close();
  }
} catch (error) {
  result.fatal = { message: error.message, stack: error.stack };
} finally {
  await browser.close();
  fs.writeFileSync(
    "artifacts/qa/design-results.json",
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
}
