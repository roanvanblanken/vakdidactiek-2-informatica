export function rng(seed = 42) {
  let a = Number(seed) >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffled(array, random = Math.random) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function createDeck(q = 7) {
  if (![3, 5, 7].includes(q)) throw new Error("Kies kaartorde 3, 5 of 7.");
  const cards = [],
    infinity = q * q;
  for (let slope = 0; slope < q; slope++)
    for (let b = 0; b < q; b++) {
      const card = [];
      for (let x = 0; x < q; x++) card.push(x * q + ((slope * x + b) % q));
      card.push(infinity + slope);
      cards.push(card);
    }
  for (let x = 0; x < q; x++)
    cards.push([
      ...Array.from({ length: q }, (_, y) => x * q + y),
      infinity + q,
    ]);
  cards.push(Array.from({ length: q + 1 }, (_, i) => infinity + i));
  return cards;
}
export function commonSymbol(a, b) {
  return a.find((x) => b.includes(x));
}
export function choosePair(
  deck,
  random = Math.random,
  environment = "uniform",
) {
  if (environment === "focus" && random() < 0.75) {
    const target = Math.floor(random() * Math.min(8, deck.length));
    const containing = deck.filter((c) => c.includes(target));
    return shuffled(containing, random)
      .slice(0, 2)
      .map((c) => shuffled(c, random));
  }
  const i = Math.floor(random() * deck.length);
  let j = Math.floor(random() * (deck.length - 1));
  if (j >= i) j++;
  return [shuffled(deck[i], random), shuffled(deck[j], random)];
}
export function createModel() {
  return {
    q: Object.fromEntries(
      Array.from({ length: 57 }, (_, i) => [String(i), 0.125]),
    ),
    episodes: 0,
    history: [],
  };
}
export function rankSymbols(card, scores = {}) {
  return [...new Set(card)].sort(
    (a, b) => (Number(scores[b]) || 0) - (Number(scores[a]) || 0),
  );
}
export function trainEpisode(model, parameters = {}, random = Math.random) {
  const {
    epsilon = 0.15,
    alpha = 0.1,
    environment = "focus",
    q = 7,
  } = parameters;
  const [mine, other] = choosePair(createDeck(q), random, environment),
    match = commonSymbol(mine, other);
  const order = rankSymbols(shuffled(mine, random), model.q);
  if (random() < epsilon) {
    const i = Math.floor(random() * order.length);
    [order[0], order[i]] = [order[i], order[0]];
  }
  const chosen = order[0],
    reward = chosen === match ? 1 : 0;
  model.q[chosen] =
    (model.q[chosen] ?? 0.125) + alpha * (reward - (model.q[chosen] ?? 0.125));
  model.episodes++;
  return { reward, steps: order.indexOf(match) + 1, chosen };
}
export function validateModel(
  model,
  count = 200,
  seed = 1001,
  environment = "focus",
  q = 7,
) {
  const random = rng(seed),
    deck = createDeck(q);
  let sum = 0,
    baseline = 0,
    wins = 0,
    ties = 0;
  for (let i = 0; i < count; i++) {
    const [mine, other] = choosePair(deck, random, environment),
      match = commonSymbol(mine, other);
    const steps = rankSymbols(mine, model.q).indexOf(match) + 1,
      rs = shuffled(mine, random).indexOf(match) + 1;
    sum += steps;
    baseline += rs;
    if (steps < rs) wins++;
    if (steps === rs) ties++;
  }
  return {
    count,
    meanSteps: sum / count,
    baselineSteps: baseline / count,
    winRate: wins / count,
    ties: ties / count,
    seed,
    environment,
  };
}
export function humanDelay(searchCost, random = Math.random, pace = 1) {
  return Math.round(
    (1000 + Math.max(1, Math.min(13.6, searchCost)) * 260 + random() * 700) *
      Math.max(0.7, Math.min(1.8, pace)),
  );
}
export function exportAgent(agent) {
  return JSON.stringify(
    {
      format: "matchlab-agent",
      version: 1,
      createdAt: new Date().toISOString(),
      agent: {
        ...agent,
        name: agent.name || "Mijn agent",
        model: agent.model || createModel(),
      },
    },
    null,
    2,
  );
}
export function importAgent(text) {
  if (typeof text !== "string" || text.length > 1000000)
    throw new Error("Het bestand is te groot (maximaal 1 MB).");
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Dit bestand is geen geldige JSON.");
  }
  const record = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);
  const finite = (value, min, max) =>
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max;
  const integer = (value, min, max) =>
    Number.isInteger(value) && value >= min && value <= max;
  const safeKey = (key) =>
    !["__proto__", "prototype", "constructor"].includes(key);
  if (
    !record(data) ||
    data.format !== "matchlab-agent" ||
    data.version !== 1 ||
    !record(data.agent)
  )
    throw new Error(
      "Dit is geen ondersteund Matchlab-agentbestand (versie 1).",
    );
  const a = data.agent;
  if (typeof a.code !== "string" || a.code.length > 60000)
    throw new Error("Agentcode ontbreekt of is te groot.");
  if (typeof a.name !== "string" || a.name.length > 100)
    throw new Error("Ongeldige agentnaam.");
  if (!record(a.model) || !record(a.model.q))
    throw new Error("Leergeheugen ontbreekt.");
  for (const [k, v] of Object.entries(a.model.q))
    if (!/^([0-9]|[1-4][0-9]|5[0-6])$/.test(k) || !finite(v, 0, 1))
      throw new Error("Ongeldige leergewichten.");
  if (!integer(a.model.episodes, 0, 1e9))
    throw new Error("Ongeldig aantal trainingen.");
  const history = a.model.history ?? [];
  if (!Array.isArray(history) || history.length > 200)
    throw new Error(
      "Ongeldige trainingsgeschiedenis (maximaal 200 meetpunten).",
    );
  const cleanHistory = history.map((point) => {
    if (!record(point) || !finite(point.meanSteps, 1, 8))
      throw new Error("Ongeldig meetpunt in de trainingsgeschiedenis.");
    const clean = { meanSteps: point.meanSteps };
    for (const key of ["episode", "episodes"])
      if (point[key] !== undefined) {
        if (!integer(point[key], 0, 1e9))
          throw new Error("Ongeldig trainingsnummer in de geschiedenis.");
        clean[key] = point[key];
      }
    if (point.meanCost !== undefined) {
      if (!finite(point.meanCost, 1, 13.6))
        throw new Error("Ongeldige zoekkosten in de geschiedenis.");
      clean.meanCost = point.meanCost;
    }
    if (point.firstHitRate !== undefined) {
      if (!finite(point.firstHitRate, 0, 1))
        throw new Error("Ongeldige trefkans in de geschiedenis.");
      clean.firstHitRate = point.firstHitRate;
    }
    return clean;
  });
  // Rebuild only supported fields. Unrecognized imported state never becomes
  // live application configuration, and special object keys are not assigned.
  const clean = {
    name: a.name,
    code: a.code,
    model: {
      q: Object.fromEntries(Object.entries(a.model.q)),
      episodes: a.model.episodes,
      history: cleanHistory,
    },
  };
  if (a.pythonCode !== undefined) {
    if (typeof a.pythonCode !== "string" || a.pythonCode.length > 60000)
      throw new Error("Ongeldige bewaarde Python-code.");
    clean.pythonCode = a.pythonCode;
  }
  if (a.parameters !== undefined) {
    if (!record(a.parameters)) throw new Error("Ongeldige leerparameters.");
    const p = a.parameters,
      parameters = {};
    for (const key of ["epsilon", "alpha"])
      if (p[key] !== undefined) {
        if (!finite(p[key], 0, 1)) throw new Error("Ongeldige leerparameter.");
        parameters[key] = p[key];
      }
    if (p.seed !== undefined) {
      if (!integer(p.seed, 0, 2147483647)) throw new Error("Ongeldige seed.");
      parameters.seed = p.seed;
    }
    if (p.episodes !== undefined) {
      if (!integer(p.episodes, 1, 100000))
        throw new Error("Ongeldig trainingsbudget.");
      parameters.episodes = p.episodes;
    }
    if (p.environment !== undefined) {
      if (!["uniform", "focus"].includes(p.environment))
        throw new Error("Onbekende oefenwereld.");
      parameters.environment = p.environment;
    }
    clean.parameters = parameters;
  }
  if (a.q !== undefined) {
    if (![3, 5, 7].includes(a.q)) throw new Error("Ongeldig kaartformaat.");
    clean.q = a.q;
  }
  if (a.mode !== undefined) {
    if (!["python", "blocks"].includes(a.mode))
      throw new Error("Ongeldige programmeerroute.");
    clean.mode = a.mode;
  }
  if (a.preset !== undefined) {
    if (!["arcade", "cosmos", "studio"].includes(a.preset))
      throw new Error("Onbekende iconenset.");
    clean.preset = a.preset;
  }
  if (a.lessonIndex !== undefined) {
    if (!integer(a.lessonIndex, 0, 4)) throw new Error("Ongeldige leskeuze.");
    clean.lessonIndex = a.lessonIndex;
  }
  if (a.proofs !== undefined) {
    if (!record(a.proofs) || Object.keys(a.proofs).length > 100)
      throw new Error("Ongeldige bewijsuitwerkingen.");
    const entries = Object.entries(a.proofs);
    for (const [key, value] of entries)
      if (
        !safeKey(key) ||
        key.length > 100 ||
        typeof value !== "string" ||
        value.length > 20000
      )
        throw new Error(
          "Een bewijsuitwerking moet tekst van maximaal 20.000 tekens zijn.",
        );
    clean.proofs = Object.fromEntries(entries);
  }
  if (a.answers !== undefined) {
    if (!record(a.answers)) throw new Error("Ongeldige instapantwoorden.");
    clean.answers = {};
    for (const id of ["01", "02", "03", "04", "05"])
      if (Object.hasOwn(a.answers, id)) {
        const answer = a.answers[id];
        if (
          !record(answer) ||
          typeof answer.choice !== "string" ||
          !/^(?:[a-z]|import)$/.test(answer.choice) ||
          typeof answer.correct !== "boolean"
        )
          throw new Error("Ongeldig instapantwoord.");
        clean.answers[id] = { choice: answer.choice, correct: answer.correct };
      }
  }
  if (a.customIcons !== undefined) {
    if (!record(a.customIcons) || Object.keys(a.customIcons).length > 57)
      throw new Error("Ongeldige iconen.");
    const entries = Object.entries(a.customIcons);
    for (const [k, v] of entries)
      if (
        !/^([0-9]|[1-4][0-9]|5[0-6])$/.test(k) ||
        typeof v !== "string" ||
        v.length > 100000 ||
        !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v)
      )
        throw new Error("Ongeldig eigen icoon.");
    clean.customIcons = Object.fromEntries(entries);
  }
  if (a.blockState !== undefined) {
    if (a.blockState === null) clean.blockState = null;
    else {
      if (!record(a.blockState) || JSON.stringify(a.blockState).length > 150000)
        throw new Error("Ongeldige of te grote blokkenwerkplaats.");
      let count = 0;
      const clone = (value, depth = 0) => {
        if (++count > 10000 || depth > 40)
          throw new Error("De blokkenwerkplaats is te complex.");
        if (Array.isArray(value))
          return value.map((item) => clone(item, depth + 1));
        if (record(value))
          return Object.fromEntries(
            Object.entries(value).map(([key, item]) => {
              if (!safeKey(key))
                throw new Error("Ongeldige veldnaam in de blokkenwerkplaats.");
              return [key, clone(item, depth + 1)];
            }),
          );
        if (typeof value === "number" && !Number.isFinite(value))
          throw new Error("Ongeldig getal in de blokkenwerkplaats.");
        return value;
      };
      clean.blockState = clone(a.blockState);
    }
  }
  return clean;
}
