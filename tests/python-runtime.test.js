import { test, before } from "node:test";
import assert from "node:assert/strict";
import { loadPyodide } from "../tools/runtime/node_modules/pyodide/pyodide.mjs";
import { MATCHLAB_PYTHON, DISPATCH_PYTHON } from "../js/python-library.js";

let python;
before(async () => {
  python = await loadPyodide();
  python.FS.writeFile("/home/pyodide/matchlab.py", MATCHLAB_PYTHON);
  python.runPython(DISPATCH_PYTHON);
});
const code = `from matchlab import EvaluationAgent, MLAgent
class MijnAgent(MLAgent):
    def evaluate(self, observation, candidate):
        assert 'other_card' not in observation
        assert 'match' not in observation
        return candidate['q']
`;
function request(type, extra = {}) {
  const payload = {
    type,
    code,
    seed: 42,
    parameters: { environment: "focus" },
    ...extra,
  };
  python.globals.set("_request_json", JSON.stringify(payload));
  return JSON.parse(python.runPython("_dispatch(_request_json)"));
}

test("Python agent inspects its own candidates and never receives the target card", () => {
  const result = request("run", {
    observation: {
      my_card: [0, 8, 16, 24, 32, 40, 48, 49],
      other_card: [0, 9, 18, 27, 36, 45, 47, 50],
    },
  });
  assert.equal(result.match, 0);
  assert.equal(result.steps, 1);
  assert.equal(new Set(result.order).size, 8);
  assert.equal(result.order.length, 8);
  assert.equal(result.searchCost, 1);
});

test("Training executes learner evaluate and changes model weights deterministically", () => {
  const a = request("train", { episodes: 500 });
  const b = request("train", { episodes: 500 });
  assert.equal(a.model.episodes, 500);
  assert.deepEqual(a.model, b.model);
  assert.ok(Object.values(a.model.q).some((q) => q !== 0.125));
  assert.ok(a.model.history.length > 0);
  assert.ok(a.validation.count > 0);
});

test("An independent validation evaluates without updating learned q", () => {
  const trained = request("train", { episodes: 600 });
  const validation = request("validate", {
    model: trained.model,
    episodes: 150,
    seed: 9876,
  });
  assert.deepEqual(validation.model, trained.model);
  assert.equal(validation.validation.count, 150);
  assert.ok(
    validation.validation.meanSteps >= 1 &&
      validation.validation.meanSteps <= 8,
  );
  assert.ok(
    validation.validation.baselineSteps >= 1 &&
      validation.validation.baselineSteps <= 8,
  );
  assert.ok(validation.validation.meanCost >= validation.validation.meanSteps);
  assert.ok(
    validation.validation.baselineCost >= validation.validation.baselineSteps,
  );
});

test("Inspecting expensive symbols contributes to real search cost", () => {
  const result = request("run", {
    code: `from matchlab import EvaluationAgent\nclass MijnAgent(EvaluationAgent):\n    def evaluate(self, observation, candidate):\n        return -candidate['cost']\n`,
    observation: { my_card: [7, 0], other_card: [7, 8] },
  });
  assert.deepEqual(result.order, [0, 7]);
  assert.equal(result.steps, 2);
  assert.equal(result.searchCost, 2.7);
});

test("Curriculum memory.q example reads live numeric symbol keys", () => {
  const result = request("run", {
    model: { q: { 7: 0.9, 0: 0.1 }, episodes: 4, history: [] },
    code: `from matchlab import MLAgent\nclass MijnAgent(MLAgent):\n    def evaluate(self, observation, candidate):\n        return observation['memory']['q'].get(candidate['id'], 0.0)\n`,
    observation: { my_card: [0, 7], other_card: [7, 8] },
  });
  assert.deepEqual(result.order, [7, 0]);
});

test("Training progress supplies completed-batch model snapshots", () => {
  const snapshots = [];
  python.globals.set(
    "_test_progress",
    (completed, total, meanSteps, modelJSON) => {
      snapshots.push({
        completed,
        total,
        meanSteps,
        model: JSON.parse(modelJSON),
      });
    },
  );
  python.globals.set(
    "_request_json",
    JSON.stringify({ type: "train", code, episodes: 50, seed: 42 }),
  );
  const result = JSON.parse(
    python.runPython("_dispatch(_request_json, _test_progress)"),
  );
  assert.equal(snapshots.at(-1).completed, 50);
  assert.equal(snapshots.at(-1).model.episodes, 50);
  assert.equal(snapshots[0].model.episodes, 1);
  assert.deepEqual(snapshots.at(-1).model, result.model);
  python.globals.delete("_test_progress");
});

test("Actual first-inspection learning beats shuffled search in the biased practice world", () => {
  const result = request("train", { episodes: 5000 });
  assert.ok(
    result.validation.meanSteps < result.validation.baselineSteps,
    JSON.stringify(result.validation),
  );
});

test("Student random policies are reproducible with the request seed", () => {
  const randomCode = `import random\nfrom matchlab import EvaluationAgent\nclass MijnAgent(EvaluationAgent):\n    def evaluate(self, observation, candidate):\n        return random.random()\n`;
  const a = request("validate", { code: randomCode, seed: 123, episodes: 30 });
  const b = request("validate", { code: randomCode, seed: 123, episodes: 30 });
  assert.deepEqual(a, b);
  const repeated = python.runPython(`
import random, json
from matchlab import EvaluationAgent, validate
class _RandomAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        return random.random()
_random_agent = _RandomAgent()
json.dumps(validate(_random_agent, episodes=20, seed=77) == validate(_random_agent, episodes=20, seed=77))
`);
  assert.equal(JSON.parse(repeated), true);
});

test("Student policy changes decisions and student stdout reaches the result", () => {
  const result = request("run", {
    code: `from matchlab import EvaluationAgent\nprint('klaar')\nclass MijnAgent(EvaluationAgent):\n    def evaluate(self, observation, candidate):\n        return -candidate['id']\n`,
    observation: { my_card: [5, 4, 3, 2], other_card: [2, 8, 9, 10] },
  });
  assert.deepEqual(result.order, [2, 3, 4, 5]);
  assert.equal(result.steps, 1);
  assert.match(result.stdout, /klaar/);
});

test("NaN, bad syntax and invalid cards become actionable Python errors", () => {
  assert.throws(
    () =>
      request("run", {
        code: code.replace("return candidate['q']", "return float('nan')"),
      }),
    /eindig|getal|finite/,
  );
  assert.throws(
    () => request("run", { code: "class bad syntax" }),
    /SyntaxError/,
  );
  assert.throws(
    () =>
      request("run", { observation: { my_card: [1, 1], other_card: [1, 2] } }),
    /kaart|card/,
  );
});

test("Downloaded Python helpers train, validate and roundtrip actual model data", () => {
  const output = python.runPython(`
import json
from matchlab import MLAgent, train, validate, save, load
_learner = MLAgent()
train(_learner, episodes=50, seed=123)
_copy = load(save(_learner))
json.dumps({'episodes': _copy.model['episodes'], 'same': _copy.model['q'] == _learner.model['q'], 'n': validate(_copy, episodes=20)['count']})
`);
  assert.deepEqual(JSON.parse(output), { episodes: 50, same: true, n: 20 });
});
