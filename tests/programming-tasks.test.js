import { before, test } from "node:test";
import assert from "node:assert/strict";
import { loadPyodide } from "../tools/runtime/node_modules/pyodide/pyodide.mjs";
import { programmingTasks } from "../js/programming-tasks.js";
import { MATCHLAB_PYTHON, DISPATCH_PYTHON } from "../js/python-library.js";
let python;
before(async () => {
  python = await loadPyodide();
  python.FS.writeFile("/home/pyodide/matchlab.py", MATCHLAB_PYTHON);
  python.runPython(DISPATCH_PYTHON);
});
test("Five optional ten-minute tasks supply a runnable unfinished scaffold and separate solution", () => {
  assert.deepEqual(
    programmingTasks.map((t) => t.lessonId),
    ["01", "02", "03", "04", "05"],
  );
  for (const task of programmingTasks) {
    assert.equal(task.estimatedMinutes, 10);
    assert.match(task.starter, /# TODO/);
    assert.match(task.starter, /score = 0/);
    assert.notEqual(task.starter, task.solution);
    assert.ok(task.goal && task.hint && task.successCriteria.length >= 2);
    assert.ok(
      task.starter.split("\n").filter((l) => l.trim()).length <= 12,
      "The provided scaffold must stay short.",
    );
  }
});
test("All scaffolds and worked solutions execute in the real game without extra student setup", () => {
  for (const task of programmingTasks)
    for (const code of [task.starter, task.solution]) {
      python.globals.set(
        "_request_json",
        JSON.stringify({ type: "run", code, seed: 42 }),
      );
      const result = JSON.parse(python.runPython("_dispatch(_request_json)"));
      assert.ok(result.steps >= 1 && result.steps <= 8, task.lessonId);
    }
});
test("The cost and probability solutions implement the actual mathematical tactics", () => {
  const candidate = { id: 0, cost: 1.6, frequency: 0.4, q: 0.7 };
  const expected = { "02": -1.6, "03": 0.4, "04": 0.25, "05": 0.7 };
  for (const task of programmingTasks.filter((t) => t.lessonId !== "01")) {
    python.globals.set("_code", task.solution);
    python.globals.set("_candidate", JSON.stringify(candidate));
    const value = python.runPython(
      "import json\nnamespace = {}\nexec(_code, namespace)\nnamespace['MijnAgent']().evaluate({'checked': []}, json.loads(_candidate))",
    );
    assert.ok(Math.abs(value - expected[task.lessonId]) < 1e-9, task.lessonId);
  }
});
test("The memory task teaches an exclusion rule without claiming engine-level learning gain", () => {
  const task = programmingTasks[0];
  python.globals.set("_code", task.solution);
  const scores = python
    .runPython(
      "namespace = {}\nexec(_code, namespace)\na = namespace['MijnAgent']()\n[a.evaluate({'checked': [3]}, {'id': 3}), a.evaluate({'checked': [3]}, {'id': 4})]",
    )
    .toJs();
  assert.ok(scores[0] < scores[1]);
  assert.match(
    [task.goal, task.hint, ...task.successCriteria].join(" "),
    /engine|spelengine/i,
  );
});
