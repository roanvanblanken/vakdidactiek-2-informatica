import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
const port = process.env.TEST_PORT || "4175";
const server = spawn(process.execPath, ["tools/serve.mjs"], {
  env: { ...process.env, PORT: port },
  stdio: ["ignore", "pipe", "inherit"],
  windowsHide: true,
});
try {
  let ready = false;
  for (let i = 0; i < 40; i++) {
    try {
      ready = (await fetch(`http://127.0.0.1:${port}/`)).ok;
      if (ready) break;
    } catch {}
    await wait(100);
  }
  if (!ready) throw Error("De lokale testserver kon niet starten.");
  const check = spawn(process.execPath, ["tools/browser-check.mjs"], {
    env: { ...process.env, BASE_URL: `http://127.0.0.1:${port}/` },
    stdio: "inherit",
    windowsHide: true,
  });
  process.exitCode = await new Promise((resolve, reject) => {
    check.once("error", reject);
    check.once("exit", (code) => resolve(code ?? 1));
  });
} finally {
  server.kill();
}
