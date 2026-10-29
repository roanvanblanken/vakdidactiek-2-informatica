import { before, test } from "node:test";
import assert from "node:assert/strict";
import { loadPyodide } from "../tools/runtime/node_modules/pyodide/pyodide.mjs";
import { lessons } from "../js/curriculum.js";
import { createDeck, commonSymbol } from "../js/engine.js";
import { MATCHLAB_PYTHON, DISPATCH_PYTHON } from "../js/python-library.js";

const close = (actual, expected, message) =>
  assert.ok(
    Math.abs(actual - expected) < 1e-11,
    message || `${actual} != ${expected}`,
  );
let python;
before(async () => {
  python = await loadPyodide();
  python.FS.writeFile("/home/pyodide/matchlab.py", MATCHLAB_PYTHON);
  python.runPython(DISPATCH_PYTHON);
});

test("Every lesson has one formative answer and a separate open proof with criteria", () => {
  assert.equal(lessons.length, 5);
  assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, 5);
  for (const lesson of lessons) {
    assert.equal(
      lesson.options.filter((option) => option.id === lesson.correct).length,
      1,
    );
    assert.ok(lesson.proof.length > 80);
    assert.equal(lesson.rubric.length, 3);
    assert.ok(lesson.hint && lesson.extension && lesson.objective);
  }
});

test("The standard deck supports the uniform 1/8 and posterior 1/6 claims", () => {
  const deck = createDeck();
  const mine = deck[0];
  assert.equal(
    mine.length,
    8,
    "The curriculum assumes eight icons on the standard card.",
  );
  const counts = new Map(mine.map((symbol) => [symbol, 0]));
  for (const other of deck.slice(1)) {
    const match = commonSymbol(mine, other);
    counts.set(match, counts.get(match) + 1);
  }
  for (const count of counts.values()) close(count / 56, 1 / 8);
  const excluded = new Set(mine.slice(0, 2));
  const remaining = deck
    .slice(1)
    .filter((other) => !excluded.has(commonSymbol(mine, other)));
  assert.equal(remaining.length, 42);
  for (const symbol of mine.slice(2)) {
    close(
      remaining.filter((other) => commonSymbol(mine, other) === symbol).length /
        remaining.length,
      1 / 6,
    );
  }
});

test("Enumerating three attempts proves 37.5% without repetition and 169/512 with it", () => {
  let hitRepeated = 0,
    totalRepeated = 0,
    hitDistinct = 0,
    totalDistinct = 0;
  for (let a = 0; a < 8; a++)
    for (let b = 0; b < 8; b++)
      for (let c = 0; c < 8; c++) {
        const hit = [a, b, c].includes(0);
        totalRepeated++;
        hitRepeated += hit;
        if (new Set([a, b, c]).size === 3) {
          totalDistinct++;
          hitDistinct += hit;
        }
      }
  close(hitRepeated / totalRepeated, 169 / 512);
  close(hitDistinct / totalDistinct, 3 / 8);
  assert.ok(hitDistinct / totalDistinct > hitRepeated / totalRepeated);
});

test("The classroom cost example counts stopping early and the p/c swap uses the right sign", () => {
  const two = (pA, pB, cA, cB) => ({
    ab: pA * cA + pB * (cA + cB) + (1 - pA - pB) * (cA + cB),
    ba: pB * cB + pA * (cB + cA) + (1 - pA - pB) * (cA + cB),
  });
  const equal = two(0.5, 0.5, 0.2, 0.8);
  close(equal.ab, 0.6);
  close(equal.ba, 0.9);
  const unequal = two(0.4, 0.2, 1.2, 0.3);
  close(unequal.ab - unequal.ba, 0.12);
  assert.ok(
    unequal.ba < unequal.ab,
    "B has lower probability but a better probability/cost ratio.",
  );
});

test("The p/c tactic minimizes expected cost across all 40,320 orders of an eight-icon example", () => {
  const probabilities = [0.4, 0.2, 0.15, 0.1, 0.06, 0.04, 0.03, 0.02];
  const costs = [1.2, 0.3, 0.2, 0.5, 0.8, 1.1, 0.7, 1.5];
  const symbols = probabilities.map((_, index) => index);
  const expectedCost = (order) => {
    let elapsed = 0;
    return order.reduce((sum, symbol) => {
      elapsed += costs[symbol];
      return sum + probabilities[symbol] * elapsed;
    }, 0);
  };
  const best = expectedCost(
    [...symbols].sort(
      (a, b) => probabilities[b] / costs[b] - probabilities[a] / costs[a],
    ),
  );
  let compared = 0;
  function visit(prefix, remaining) {
    if (!remaining.length) {
      assert.ok(expectedCost(prefix) >= best - 1e-11);
      compared++;
      return;
    }
    remaining.forEach((symbol, index) =>
      visit(
        [...prefix, symbol],
        remaining.filter((_, other) => other !== index),
      ),
    );
  }
  visit([], symbols);
  assert.equal(compared, 40320);
});

test("Epsilon-greedy includes the favorite in exploration and its eight probabilities sum to one", () => {
  const epsilon = 0.2,
    n = createDeck()[0].length;
  const probabilities = Array.from(
    { length: n },
    (_, index) => epsilon / n + (index === 0 ? 1 - epsilon : 0),
  );
  close(probabilities[0], 0.825);
  close(
    probabilities.reduce((sum, probability) => sum + probability, 0),
    1,
  );
  close(probabilities[0] * 200, 165);
  close(probabilities[1] * 200, 5);
});

test("All five unmodified curriculum agents compile and run in the actual Python dispatcher", () => {
  for (const lesson of lessons) {
    python.globals.set(
      "_curriculum_request",
      JSON.stringify({
        type: "run",
        code: lesson.python,
        seed: 42,
        parameters: { environment: "focus", q: 7 },
        model: { q: { 0: 0.1, 7: 0.9 }, episodes: 5, history: [] },
        observation: {
          my_card: [0, 7, 16, 24, 32, 40, 48, 49],
          other_card: [7, 9, 18, 27, 36, 45, 47, 50],
        },
      }),
    );
    const result = JSON.parse(
      python.runPython("_dispatch(_curriculum_request)"),
    );
    assert.equal(result.match, 7, `Lesson ${lesson.id}`);
    assert.ok(result.steps >= 1 && result.steps <= 8, `Lesson ${lesson.id}`);
    assert.equal(
      new Set(result.order).size,
      8,
      `Lesson ${lesson.id} repeats an inspection.`,
    );
    assert.ok(Number.isFinite(result.searchCost));
    if (lesson.id === "05")
      assert.equal(
        result.order[0],
        7,
        "The memory.q lesson must use live numeric symbol keys.",
      );
  }
  python.globals.delete("_curriculum_request");
});

test("Actual Python model probabilities agree with independently enumerated focus pair probabilities", () => {
  const actual = JSON.parse(
    python.runPython(`
import json
from matchlab import EvaluationAgent, _candidates, _deck
json.dumps({str(q): [{str(s): data['frequency'] for s, data in _candidates(EvaluationAgent(), card, 'focus', q).items()}
                     for card in _deck(q)] for q in (3, 5, 7)})
`),
  );
  for (const q of [3, 5, 7]) {
    const deck = createDeck(q),
      n = deck.length;
    deck.forEach((mine, cardIndex) => {
      const probabilities = Object.fromEntries(
        mine.map((symbol) => [symbol, 0]),
      );
      let cardProbability = 0;
      deck.forEach((other, otherIndex) => {
        if (cardIndex === otherIndex) return;
        const match = commonSymbol(mine, other);
        // An ordered pair can arise from the uniform branch, or its unique
        // common symbol can be selected by the focus branch (if in 0..7).
        const pairProbability =
          0.25 / (n * (n - 1)) + (match < 8 ? 0.75 / (8 * (q + 1) * q) : 0);
        probabilities[match] += pairProbability;
        cardProbability += pairProbability;
      });
      for (const symbol of mine) {
        close(
          actual[q][cardIndex][symbol],
          probabilities[symbol] / cardProbability,
          `Wrong posterior for q=${q}, own card=${cardIndex}, symbol=${symbol}`,
        );
      }
    });
  }
});
