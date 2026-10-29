import { MATCHLAB_PYTHON, DISPATCH_PYTHON } from "./python-library.js";

const PYODIDE_BASE = new URL("../assets/vendor/pyodide/", import.meta.url).href;
let running = false;

const ready = (async () => {
  const { loadPyodide } = await import(`${PYODIDE_BASE}pyodide.mjs`);
  const python = await loadPyodide({
    indexURL: PYODIDE_BASE,
    packageBaseUrl: PYODIDE_BASE,
  });
  python.FS.writeFile("/home/pyodide/matchlab.py", MATCHLAB_PYTHON);
  await python.runPythonAsync(DISPATCH_PYTHON);
  self.postMessage({ type: "ready", version: "314.0.7" });
  return python;
})();
// A message also receives a useful error if initialization failed before it arrived.
ready.catch((error) => {
  self.postMessage({
    type: "error",
    error: `Python kon niet laden. Controleer of alle websitebestanden beschikbaar zijn. ${String(error?.message || error)}`,
  });
});

self.onmessage = async ({ data }) => {
  const id = data?.id;
  if (running) {
    self.postMessage({
      id,
      type: "error",
      error:
        "Er draait al een opdracht. Stop die eerst of wacht tot deze klaar is.",
    });
    return;
  }
  running = true;
  try {
    if (
      !data ||
      typeof data !== "object" ||
      !["run", "train", "validate"].includes(data.type)
    ) {
      throw new Error("Onbekende agentopdracht.");
    }
    self.postMessage({
      id,
      type: "progress",
      phase: "runtime",
      completed: 0,
      total: data.episodes || 1,
    });
    const python = await ready;
    python.globals.set("_request_json", JSON.stringify(data));
    python.globals.set(
      "_progress_callback",
      (completed, total, meanSteps, modelJSON) => {
        self.postMessage({
          id,
          type: "progress",
          phase: "training",
          completed,
          total,
          meanSteps,
          model: JSON.parse(modelJSON),
        });
      },
    );
    try {
      const response = await python.runPythonAsync(
        "_dispatch(_request_json, _progress_callback)",
      );
      self.postMessage({ id, type: "result", ...JSON.parse(response) });
    } finally {
      python.globals.delete("_request_json");
      python.globals.delete("_progress_callback");
    }
  } catch (error) {
    const message = String(error?.message || error).slice(-16000);
    self.postMessage({ id, type: "error", error: message });
  } finally {
    running = false;
  }
};
