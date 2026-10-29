import test from "node:test";
import assert from "node:assert/strict";
import {
  createDeck,
  commonSymbol,
  rng,
  shuffled,
  createModel,
  trainEpisode,
  validateModel,
  rankSymbols,
  humanDelay,
  exportAgent,
  importAgent,
  choosePair,
} from "../js/engine.js";

for (const q of [3, 5, 7]) {
  test(`projectief vlak q=${q}: alle kaartparen delen exact één symbool`, () => {
    const deck = createDeck(q);
    assert.equal(deck.length, q * q + q + 1);
    assert.equal(new Set(deck.flat()).size, deck.length);
    for (let i = 0; i < deck.length; i++) {
      assert.equal(new Set(deck[i]).size, q + 1);
      for (let j = i + 1; j < deck.length; j++)
        assert.equal(deck[i].filter((s) => deck[j].includes(s)).length, 1);
    }
    for (let s = 0; s < deck.length; s++)
      assert.equal(deck.filter((c) => c.includes(s)).length, q + 1);
  });
}
test("niet-priem kaartorde wordt geweigerd", () =>
  assert.throws(() => createDeck(4)));
test("seeds maken toeval reproduceerbaar en shuffle behoudt invoer", () => {
  assert.deepEqual(
    Array.from({ length: 10 }, rng(42)),
    Array.from({ length: 10 }, rng(42)),
  );
  const a = [1, 2, 3, 4];
  assert.deepEqual([...shuffled(a, rng(8))].sort(), a);
  assert.deepEqual(a, [1, 2, 3, 4]);
});
test("kaarten worden onafhankelijk en verschillend gekozen", () => {
  const deck = createDeck(7),
    r = rng(51);
  for (let i = 0; i < 300; i++) {
    const [a, b] = choosePair(deck, r);
    assert.notDeepEqual(a, b);
    assert.ok(commonSymbol(a, b) !== undefined);
  }
});
test("trainen past alleen het gekozen Q-getal aan met echte beloning", () => {
  const m = createModel();
  const before = JSON.stringify(m.q);
  const x = trainEpisode(m, { epsilon: 0, alpha: 0.2, seed: 14 }, rng(2));
  assert.equal(m.episodes, 1);
  assert.notEqual(JSON.stringify(m.q), before);
  assert.ok(x.reward > 0 && x.reward <= 1);
  assert.ok(x.steps >= 1 && x.steps <= 8);
});
test("validatie gebruikt verse kaarten zonder leergewicht te veranderen", () => {
  const m = createModel();
  const before = JSON.stringify(m);
  const v = validateModel(m, 200, 99);
  assert.equal(v.count, 200);
  assert.ok(v.meanSteps >= 1 && v.meanSteps <= 8);
  assert.equal(JSON.stringify(m), before);
});
test("rangschikking gebruikt leerlingprioriteit en controleert nooit dubbel", () => {
  const result = rankSymbols([2, 5, 9], { 2: 1, 5: 9, 9: 4 });
  assert.deepEqual(result, [5, 9, 2]);
});
test("menselijke zoektijd is begrensd en schaalt met het zoekwerk", () => {
  assert.ok(humanDelay(1, rng(1)) >= 900);
  assert.ok(humanDelay(8, rng(1)) > humanDelay(1, rng(1)));
  assert.ok(humanDelay(8, () => 0.999) < 12000);
});
test("agent JSON roundtrip bewaart code, model, bewijs en parameters", () => {
  const a = {
    name: "Team ∆",
    code: "class MijnAgent: pass",
    model: createModel(),
    parameters: { epsilon: 0.15, alpha: 0.1, seed: 42 },
    proofs: { one: "Mijn redenering" },
    preset: "arcade",
  };
  const b = importAgent(exportAgent(a));
  assert.equal(b.name, a.name);
  assert.deepEqual(b.model, a.model);
  assert.deepEqual(b.proofs, a.proofs);
});
test("import weigert ongeldige versies, niet-eindige Q-waarden en uitvoerbare payloads", () => {
  assert.throws(() => importAgent("{}"));
  const a = JSON.parse(exportAgent({ model: createModel(), code: "pass" }));
  a.version = 99;
  assert.throws(() => importAgent(JSON.stringify(a)));
  a.version = 1;
  a.agent.model.q = { x: "javascript:alert(1)" };
  assert.throws(() => importAgent(JSON.stringify(a)));
  assert.throws(() => importAgent("x".repeat(1000001)));
});

const importFixture = () =>
  JSON.parse(
    exportAgent({
      name: "Klas 4",
      code: "class MijnAgent: pass",
      model: createModel(),
    }),
  );
test("import bewaart een complete geldige leswerkplaats zonder onbekende configuratie over te nemen", () => {
  const fixture = importFixture();
  Object.assign(fixture.agent, {
    q: 5,
    mode: "blocks",
    preset: "cosmos",
    lessonIndex: 3,
    parameters: {
      seed: 7,
      episodes: 250,
      epsilon: 0.2,
      alpha: 0.1,
      environment: "uniform",
      unknown: "ignored",
    },
    answers: {
      "01": { choice: "b", correct: true },
      unrecognized: { choice: "x", correct: true },
    },
    proofs: { "01": "Twee iconen vallen af." },
    blockState: {
      blocks: {
        languageVersion: 0,
        blocks: [{ type: "match_score", id: "abc", x: 35, y: 40 }],
      },
    },
    unsupportedRuntimePath: "/not-a-configuration-setting",
  });
  fixture.agent.model.history = [
    {
      episode: 10,
      meanSteps: 3.4,
      meanCost: 4.3,
      firstHitRate: 0.2,
      extra: "ignored",
    },
  ];
  const imported = importAgent(JSON.stringify(fixture));
  assert.equal(imported.q, 5);
  assert.equal(imported.mode, "blocks");
  assert.equal(imported.lessonIndex, 3);
  assert.deepEqual(imported.answers, { "01": { choice: "b", correct: true } });
  assert.deepEqual(imported.blockState, fixture.agent.blockState);
  assert.deepEqual(imported.model.history, [
    { episode: 10, meanSteps: 3.4, meanCost: 4.3, firstHitRate: 0.2 },
  ]);
  assert.equal(imported.unsupportedRuntimePath, undefined);
  assert.equal(imported.parameters.unknown, undefined);
});

test("import weigert kaart-, route- en lesconfiguratie die de interface zou laten vastlopen", () => {
  for (const [field, value] of [
    ["q", 99],
    ["q", "7"],
    ["mode", "invalid"],
    ["preset", "missing"],
    ["lessonIndex", 5],
    ["lessonIndex", 0.5],
  ]) {
    const fixture = importFixture();
    fixture.agent[field] = value;
    assert.throws(() => importAgent(JSON.stringify(fixture)), Error, field);
  }
  for (const value of [0, -1, 100001, 1.5, "1000"]) {
    const fixture = importFixture();
    fixture.agent.parameters = { episodes: value };
    assert.throws(
      () => importAgent(JSON.stringify(fixture)),
      /trainingsbudget/,
    );
  }
});

test("import valideert geschiedenis en tekstuitwerkingen voordat de interface ze gebruikt", () => {
  for (const history of [
    {},
    "curve",
    [null],
    [{ meanSteps: "4" }],
    [{ meanSteps: 0 }],
    [{ meanSteps: 9 }],
    [{ meanSteps: 4, meanCost: 99 }],
    [{ meanSteps: 4, episode: -1 }],
    Array.from({ length: 201 }, () => ({ meanSteps: 4 })),
  ]) {
    const fixture = importFixture();
    fixture.agent.model.history = history;
    assert.throws(
      () => importAgent(JSON.stringify(fixture)),
      Error,
      JSON.stringify(history).slice(0, 80),
    );
  }
  for (const proofs of [
    [],
    { "01": [] },
    { "01": null },
    { "01": "x".repeat(20001) },
  ]) {
    const fixture = importFixture();
    fixture.agent.proofs = proofs;
    assert.throws(() => importAgent(JSON.stringify(fixture)), /bewijs|tekst/i);
  }
  const fixture = importFixture();
  fixture.agent.answers = { "01": { choice: "b", correct: "yes" } };
  assert.throws(() => importAgent(JSON.stringify(fixture)), /instapantwoord/i);
});

test("import kopieert geen bijzondere objectsleutels en begrenst opgeslagen blokken", () => {
  const fixture = importFixture();
  fixture.agent.proofs = JSON.parse('{"__proto__":"onveilig"}');
  assert.throws(() => importAgent(JSON.stringify(fixture)), /bewijs|tekst/i);
  fixture.agent.proofs = {};
  fixture.agent.blockState = JSON.parse(
    '{"blocks":{"constructor":{"polluted":true}}}',
  );
  assert.throws(() => importAgent(JSON.stringify(fixture)), /veldnaam/);
  fixture.agent.blockState = { text: "x".repeat(150001) };
  assert.throws(
    () => importAgent(JSON.stringify(fixture)),
    /blokkenwerkplaats/,
  );
  delete fixture.agent.blockState;
  fixture.agent = JSON.parse(
    JSON.stringify(fixture.agent).replace(
      '"name":',
      '"__proto__":{"polluted":true},"name":',
    ),
  );
  const imported = importAgent(JSON.stringify(fixture));
  assert.equal(Object.getPrototypeOf(imported), Object.prototype);
  assert.equal(Object.hasOwn(imported, "__proto__"), false);
  assert.equal({}.polluted, undefined);
});

test("ongeldige JSON-wortels geven een leesbare importfout", () => {
  for (const text of ["null", "[]", "1", '"agent"'])
    assert.throws(() => importAgent(text), /ondersteund Matchlab/);
});
