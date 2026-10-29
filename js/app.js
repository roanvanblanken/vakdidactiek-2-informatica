import {
  createDeck,
  commonSymbol,
  choosePair,
  rng,
  shuffled,
  createModel,
  rankSymbols,
  humanDelay,
  exportAgent,
  importAgent,
} from "./engine.js";
import { SYMBOLS, PRESETS, iconSVG } from "./symbols.js";
import { lessons } from "./curriculum.js";
import { programmingTasks } from "./programming-tasks.js";

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const STARTER = programmingTasks[0].starter;
const initial = {
  name: "Mijn eerste agent",
  lessonIndex: 0,
  answers: {},
  proofs: {},
  code: STARTER,
  mode: "python",
  pythonCode: STARTER,
  model: createModel(),
  parameters: {
    epsilon: 0.15,
    alpha: 0.1,
    seed: 42,
    episodes: 1000,
    environment: "focus",
  },
  preset: "arcade",
  customIcons: {},
  q: 7,
  blockState: null,
};
let state = { ...initial };
try {
  const old = JSON.parse(localStorage.getItem("matchlab-v1") || "null");
  if (old) {
    const clean = importAgent(exportAgent(old));
    state = {
      ...initial,
      ...clean,
      parameters: { ...initial.parameters, ...clean.parameters },
      answers: clean.answers || {},
      lessonIndex: Math.min(4, Math.max(0, old.lessonIndex || 0)),
    };
  }
} catch {
  state = { ...initial };
}
let view = "home",
  selectedAnswer = null,
  workspace = null,
  blocklyPromise = null,
  worker = null,
  workerReady = false,
  workerLoading = null,
  requestId = 0,
  pending = new Map(),
  training = false,
  trainingTotal = 0,
  lastValidation = null,
  lastRun = null,
  arena = null,
  arenaTimer = null,
  roundToken = 0,
  iconTarget = null,
  toastTimer = null;
const paths = {
  home: "M3 11 12 3l9 8 M5 10v11h5v-7h4v7h5V10",
  math: "M5 3h14v18H5Z M8 7h8 M8 11h3 M14 11h2 M8 15h3 M14 15h2",
  lab: "M8 3h8 M10 3v6l-6 10a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3 M7 15h10",
  arena:
    "M8 3h8v7a4 4 0 0 1-8 0Z M8 5H4v3a4 4 0 0 0 4 4 M16 5h4v3a4 4 0 0 1-4 4 M12 14v6 M8 21h8",
  icons: "M4 4h6v6H4Z M14 4h6v6h-6Z M4 14h6v6H4Z M17 14v6 M14 17h6",
  teacher: "M2 8l10-5 10 5-10 5Z M6 10v7c4 3 8 3 12 0v-7 M22 8v8",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  code: "m8 6-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18",
  download: "M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5",
  upload: "M12 16V4 M7 9l5-5 5 5 M4 16v5h16v-5",
  calendar: "M4 5h16v16H4Z M8 3v4 M16 3v4 M4 10h16",
  check: "m5 12 4 4L19 6",
  play: "M7 3v18l14-9Z",
  info: "M12 11v6 M12 7h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  spark: "M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z",
};
function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.spark}"/></svg>`;
}
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 4000);
}
function save() {
  try {
    localStorage.setItem("matchlab-v1", JSON.stringify(state));
    $("#save-status").textContent = "Opgeslagen op dit apparaat";
  } catch {
    $("#save-status").textContent = "Opslag vol · exporteer je agent";
  }
  updateNavigation();
}
function unlocked() {
  return Object.keys(state.answers).length > 0;
}
function updateNavigation() {
  const items = [
    ["home", "Start"],
    ["math", "Wiskunde"],
    ["lab", "Agent bouwen"],
    ["arena", "Spelen"],
  ];
  $("#navigation").innerHTML = items
    .map(
      ([id, label]) =>
        `<a class="nav-link ${view === id ? "active" : ""}" href="#${id}" ${view === id ? 'aria-current="page"' : ""}>${icon(id)}<span>${label}</span>${id === "math" ? `<span class="nav-count">${Object.keys(state.answers).length}/5</span>` : ""}</a>`,
    )
    .join("");
  $("#teacher-nav").innerHTML = `${icon("teacher")}<span>Voor de docent</span>`;
  $("#teacher-nav").classList.remove("active");
}
function symbolArt(id) {
  if (state.customIcons?.[id])
    return `<img src="${esc(state.customIcons[id])}" alt="${esc(SYMBOLS[id]?.name || "Eigen symbool")}">`;
  return iconSVG(id, state.preset);
}
function cardHTML(card, kind = "mini", clickable = false) {
  const positions =
    card.length === 4
      ? [
          [32, 30],
          [73, 30],
          [32, 73],
          [73, 73],
        ]
      : card.length === 6
        ? [
            [49, 21],
            [77, 36],
            [77, 68],
            [49, 81],
            [22, 66],
            [22, 35],
          ]
        : [
            [49, 19],
            [74, 29],
            [82, 56],
            [64, 79],
            [36, 81],
            [18, 57],
            [23, 29],
            [49, 49],
          ];
  return `<div class="${kind === "mini" ? "mini-card" : "game-card"} ${kind === "agent" ? "agent" : ""}" ${kind !== "mini" ? 'data-card="' + kind + '"' : ""}>${card
    .map((id, i) => {
      const [x, y] = positions[i];
      return `<${clickable ? "button" : "div"} class="symbol" data-symbol-id="${id}" style="left:${x}%;top:${y}%;--rotation:${((id * 17) % 45) - 22}deg" ${clickable ? `data-symbol="${id}" aria-label="Kies ${esc(SYMBOLS[id]?.name || "symbool " + id)}"` : ""}>${symbolArt(id)}</${clickable ? "button" : "div"}>`;
    })
    .join("")}<span class="card-center-dot"></span></div>`;
}
function heading(eyebrow, title, description = "", right = "") {
  return `<div class="page-heading"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1>${description ? `<p>${description}</p>` : ""}</div>${right}</div>`;
}
function renderHome() {
  const count = Object.keys(state.answers).length;
  const l = lessons[state.lessonIndex];
  return `${heading("MATCHLAB", "Bouw een agent die kan kiezen.", "Begin met een korte wiskundevraag. Daarna geef je je regel aan een agent en speel je met drie stapels.")}
  <section class="simple-start">
    <div class="start-card primary-start"><span class="start-number">1</span><div><h2>Los een wiskundevraag op</h2><p>Onderzoek hoe je beslist welk figuur je eerst controleert.</p><a class="button primary" href="#math">Naar de opgaven</a></div></div>
    <div class="start-card"><span class="start-number">2</span><div><h2>Bouw je agent</h2><p>Kies Python of blokken en geef je agent een score-regel.</p><a class="button" href="#lab">${count ? "Verder bouwen" : "Bekijk de agentstudio"}</a></div></div>
    <div class="start-card"><span class="start-number">3</span><div><h2>Speel met drie stapels</h2><p>Een pot in het midden, jouw stapel en de stapel van je agent.</p><a class="button" href="#arena">Start het spel</a></div></div>
  </section>
  <p class="quiet-note">Je antwoorden en code blijven op dit apparaat staan.</p>`;
  /*
  return `${heading("JOUW IDEEËN. JOUW REGELS.", "Welkom in je lab.", "Hier ontmoeten wiskunde, code en een beetje competitie elkaar.", `<span class="date-chip">${icon("calendar")} 4 vwo · 5 uitdagingen</span>`)}
  <section class="welcome-grid"><div class="hero-panel"><div><span class="eyebrow">VAN BEWIJS NAAR EEN SLIMME AGENT</span><h2 class="hero-title">Een match.<br><em>Duizend</em><br>mogelijkheden.</h2><p>Bewijs je strategie. Programmeer je agent.<br>En ontdek wie de match als eerste ziet.</p></div><a class="button primary" href="#math">${count ? "Verder met je uitdaging" : "Start je eerste uitdaging"} <span>↗</span></a><div class="hero-art" aria-hidden="true"><span class="hero-spark">✳</span>${cardHTML([0, 4, 8, 17, 6, 15, 21, 3])}${cardHTML([9, 12, 4, 14, 18, 1, 22, 10])}</div><span class="hero-footnote">ÉÉN MATCH. ELKE KEER.</span></div>
  <div class="mission-panel"><div class="panel-top"><span class="label">UITDAGING ${String(state.lessonIndex + 1).padStart(2, "0")}</span><span class="badge">WISKUNDE</span></div><h2>${esc(l.title)}</h2><p>Een slimme agent begint bij een goed onderbouwde keuze. Kun jij uitleggen waarom?</p><div class="mission-formula">P(match) <span>→</span> code <span>→</span> winst?</div><a class="text-link" href="#math">Onderzoek de tactiek <span>↗</span></a></div></section>
  <div class="section-heading"><h2>Van inzicht naar impact.</h2><span class="meta">Drie stappen. Jij aan zet.</span></div>
  <section class="journey-grid">${[
    [
      "green",
      "math",
      "01",
      "Eerst begrijpen.",
      "Onderzoek vijf tactieken met kansrekening en combinatoriek.",
      "Ontdek de wiskunde",
      "math",
    ],
    [
      "purple",
      "code",
      "02",
      "Dan zelf bouwen.",
      "Geef je ideeën vorm. Met Python of met echte codeblokken.",
      "Open de agentstudio",
      "lab",
    ],
    [
      "orange",
      "arena",
      "03",
      "Tijd voor de match.",
      "Train je agent, test je voorspelling en speel tegen je eigen code.",
      "Ontdek de arena",
      "arena",
    ],
  ]
    .map(
      ([c, i, n, t, p, b, v]) =>
        `<a class="journey-card" href="#${v}"><span class="journey-num">${n} /</span><div class="feature-icon ${c}">${icon(i)}</div><h3>${t}</h3><p>${p}</p><span class="text-link">${b} <span>↗</span></span></a>`,
    )
    .join("")}</section>
  <div class="home-bottom"><div class="progress-panel"><div class="progress-ring" style="--p:${(count / 5) * 100}%" data-count="${count}/5"></div><div><h4>Elke goede vraag brengt je verder.</h4><p>${count ? `${count} instapvragen onderzocht · ${Object.values(state.proofs).filter((p) => p.trim()).length} eigen uitwerkingen bewaard` : "Je reis begint met je eerste wiskundige tactiek."}</p></div><a href="#math" class="text-link" aria-label="Naar de wiskunde">↗</a></div><a class="quick-panel" href="#icons">${icon("spark")}<div><h4>Jouw kaarten, jouw stijl.</h4><p>Kies een iconenset. Of maak het helemaal van jezelf.</p></div><span class="text-link">↗</span></a></div>`;
  */
}
function renderMath() {
  const l = lessons[state.lessonIndex],
    answer = state.answers[l.id];
  selectedAnswer = answer?.choice || null;
  return `${heading("WISKUNDE", "Welke keuze is slim?", "Beantwoord de opgaven en leg daarna kort uit waarom.", `<div class="step-indicator">${lessons.map((x) => `<i class="${state.answers[x.id] ? "complete" : ""}"></i>`).join("")}</div>`)}<div class="split-layout"><aside><div class="lesson-list">${lessons.map((x, i) => `<button class="lesson-link ${i === state.lessonIndex ? "active" : ""}" data-lesson="${i}"><span class="number">${state.answers[x.id] ? "✓" : i + 1}</span><span><strong>${esc(x.title)}</strong></span></button>`).join("")}</div></aside><article class="surface lesson-content"><span class="eyebrow">OPGAVE ${state.lessonIndex + 1} VAN ${lessons.length}</span><h2>${esc(l.title)}</h2><div class="context-box">${esc(l.context)}</div><div class="question-title">${esc(l.prompt)}</div><div class="options">${l.options.map((o) => `<button class="option ${selectedAnswer === o.id ? "selected" : ""} ${answer && o.id === answer.choice ? (answer.correct ? "correct" : "incorrect") : ""}" data-answer="${o.id}"><span class="letter">${esc(o.id.toUpperCase())}</span>${esc(o.text)}</button>`).join("")}</div><div id="answer-feedback">${answer ? feedbackHTML(l, answer) : ""}</div><button class="button primary" id="check-answer" ${!selectedAnswer ? "disabled" : ""}>${answer ? "Controleer opnieuw" : "Controleer antwoord"}</button><section class="proof-area"><h3>Leg je keuze uit</h3><p>${esc(l.proof)}</p><div class="field"><label for="proof-input">Jouw uitleg</label><textarea id="proof-input" placeholder="Schrijf je berekening en je aanname op.">${esc(state.proofs[l.id] || "")}</textarea></div><details><summary>Hint</summary><p>${esc(l.hint)}</p></details><div class="button-row"><button class="button purple" id="lesson-to-code" ${!answer ? "disabled" : ""}>Gebruik deze regel in je agent</button>${state.lessonIndex < 4 ? '<button class="button ghost" id="next-lesson">Volgende opgave</button>' : ""}</div></section></article></div>`;
  return `${heading("BEGRIJP DE STRATEGIE", "Eerst het bewijs.", "Vijf wiskundige uitdagingen; kies daarna één tactiek om in tien minuten te programmeren.", `<div class="step-indicator">${lessons.map((x) => `<i class="${state.answers[x.id] ? "complete" : ""}"></i>`).join("")}</div>`)}<div class="split-layout"><aside><div class="lesson-list">${lessons.map((x, i) => `<button class="lesson-link ${i === state.lessonIndex ? "active" : ""}" data-lesson="${i}"><span class="number">${state.answers[x.id] ? "✓" : String(i + 1).padStart(2, "0")}</span><span><strong>${esc(x.title)}</strong><small>${state.answers[x.id] ? "Instapvraag onderzocht" : "Kansrekening & strategie"}</small></span></button>`).join("")}</div><p class="lesson-aside-note">Werk in tweetallen. Eén denkt hardop, één stelt kritische vragen. Wissel na iedere uitdaging.<br><br>Een instapantwoord kiest je eerste programmeerroute. Je kunt daarna altijd wisselen.</p></aside><article class="surface lesson-content"><span class="eyebrow">UITDAGING ${state.lessonIndex + 1} / 5 · ${esc(l.kicker)}</span><h2>${esc(l.title)}</h2><p>${esc(l.objective)}</p><div class="context-box">${esc(l.context)}</div><div class="question-title">${esc(l.prompt)}</div><div class="options">${l.options.map((o) => `<button class="option ${selectedAnswer === o.id ? "selected" : ""} ${answer && o.id === answer.choice ? (answer.correct ? "correct" : "incorrect") : ""}" data-answer="${o.id}"><span class="letter">${esc(o.id.toUpperCase())}</span>${esc(o.text)}</button>`).join("")}</div><div id="answer-feedback">${answer ? feedbackHTML(l, answer) : ""}</div><button class="button primary" id="check-answer" ${!selectedAnswer ? "disabled" : ""}>${answer ? "Bekijk mijn route opnieuw" : "Onderzoek mijn antwoord"} <span>↗</span></button><section class="proof-area"><h3>Nu jij: onderbouw het.</h3><p>${esc(l.proof)}</p><div class="field"><label for="proof-input">Jouw redenering <span>Automatisch bewaard</span></label><textarea id="proof-input" placeholder="Noem je aannames. Laat je berekening zien. Leg uit wat dit voor je agent betekent.">${esc(state.proofs[l.id] || "")}</textarea></div><details><summary>Een zetje in de goede richting</summary><p>${esc(l.hint)}</p></details><details><summary>Controleer je bewijs met deze criteria</summary><ul>${(l.rubric || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul><p>Bespreek je redenering met een klasgenoot of docent. De website beoordeelt een geschreven bewijs niet automatisch.</p></details><details><summary>Verdieping</summary><p>${esc(l.extension || "Vergelijk je voorspelling met resultaten uit de agentstudio.")}</p></details><div class="button-row"><button class="button purple" id="lesson-to-code" ${!answer ? "disabled" : ""}>Programmeer deze tactiek ${icon("code")}</button>${state.lessonIndex < 4 ? '<button class="button ghost" id="next-lesson">Volgende uitdaging →</button>' : ""}</div></section></article></div>`;
}
function feedbackHTML(l, a) {
  return `<div class="feedback ${a.correct ? "" : "support"}"><strong>${a.correct ? "Je eerste stap klopt. Je route: Python Studio." : "Laten we dit zichtbaar maken. Je route: Blokkenstudio."}</strong>${esc(l.explanation)}<br>Je bewijs schrijf je hieronder. Beide programmeerroutes blijven beschikbaar.</div>`;
}
function gate() {
  return `<div class="surface empty-state"><div class="feature-icon green">${icon("math")}</div><span class="eyebrow" style="justify-content:center">EERST EEN IDEE</span><h2>Wat wordt jouw strategie?</h2><p>Beantwoord eerst één instapvraag. Zo begin je met een concrete tactiek en kiezen we een passende start in Python of blokken.</p><a href="#math" class="button primary">Naar de eerste uitdaging ↗</a></div>`;
}
function renderProgrammingSprint() {
  const task = programmingTasks[state.lessonIndex];
  return `<section class="programming-sprint surface" aria-label="Programmeeropdracht">
    <div class="panel-top"><span class="eyebrow">JOUW REGEL</span><span class="badge">PUZZEL</span></div>
    <h2>${esc(task.title)}</h2>
    <p>${esc(task.goal)}</p>
    <div class="sprint-choice"><div class="field"><label for="coding-task">Kies een puzzel</label><select id="coding-task">${programmingTasks.map((t, i) => `<option value="${i}" ${i === state.lessonIndex ? "selected" : ""}>${i + 1}. ${esc(t.title)}</option>`).join("")}</select></div><button class="button small" id="load-programming-starter">Start opnieuw</button></div>
    <details open><summary>Hint</summary><p>${esc(task.hint)}</p></details>
    <div class="button-row">${task.lessonId === "05" ? '<button class="button purple" id="quick-train">Train 250 rondes</button>' : ""}<button class="button lime" id="quick-compare">Test 100 kaarten</button><button class="button ghost small" data-export>Exporteer</button></div>
    ${task.lessonId === "05" ? '<div class="sprint-training" role="status"><span id="sprint-training-status">Klaar om te trainen</span><div class="progress-track" aria-label="Voortgang van de training"><div id="sprint-training-progress"></div></div></div>' : ""}
  </section>`;
  return `<section class="programming-sprint surface" aria-label="Programmeeropdracht van tien minuten">
    <div class="panel-top"><span class="eyebrow">VAN BEWIJS NAAR CODE</span><span class="badge">10 MINUTEN TOTAAL</span></div>
    <h2>Eén tactiek. Een paar regels Python.</h2>
    <p>Kies één van de vijf tactieken. De imports, klasse en functie staan klaar. Jij vult alleen de TODO-regels in: een score, een berekening of een korte if.</p>
    <ol class="sprint-steps"><li><b>0–2 min</b><span>Lees je tactiek</span></li><li><b>2–6 min</b><span>Verander de score</span></li><li><b>6–8 min</b><span>Test je agent</span></li><li><b>8–10 min</b><span>Vergelijk en exporteer</span></li></ol>
    <div class="sprint-choice"><div class="field"><label for="coding-task">Jouw keuzeopdracht</label><select id="coding-task">${programmingTasks.map((t, i) => `<option value="${i}" ${i === state.lessonIndex ? "selected" : ""}>${i + 1}. ${esc(t.title)}</option>`).join("")}</select></div><button class="button small" id="load-programming-starter">Laad startcode ↗</button></div>
    <p class="sprint-goal"><strong>Jouw wijziging:</strong> ${esc(task.goal)}</p>
    <details><summary>Een hint voor jouw score</summary><p>${esc(task.hint)}</p></details>
    <details><summary>Wanneer is je opdracht af?</summary><ul>${task.successCriteria.map((c) => `<li>${esc(c)}</li>`).join("")}</ul><p>De startcode werkt al, maar de tactiek is nog niet ingevuld. Alleen op Test klikken maakt je implementatie nog niet compleet.</p></details>
    <div class="button-row">${task.lessonId === "05" ? '<button class="button purple" id="quick-train">Train mijn agent · 250 rondes</button>' : ""}<button class="button lime" id="quick-compare">Vergelijk · 100 rondes ↗</button><button class="button ghost small" data-export>Exporteer je agent ↓</button></div>
    ${task.lessonId === "05" ? '<div class="sprint-training" role="status"><span id="sprint-training-status">Klaar voor een korte training</span><div class="progress-track" aria-label="Voortgang van de training"><div id="sprint-training-progress"></div></div></div>' : ""}
    <small>Laad startcode vervangt de code in deze werkplaats. De vijf bewijzen vallen buiten dit programmeerblok. Tactiek 5 gebruikt één korte training met vaste instellingen. Zelf leerparameters kiezen is verdieping.</small>
  </section>`;
}
function loadProgrammingStarter() {
  if (training) return;
  if (workspace) {
    workspace.dispose();
    workspace = null;
  }
  state.code = programmingTasks[state.lessonIndex].starter;
  state.pythonCode = state.code;
  state.blockState = null;
  save();
  render();
  toast("Startcode geladen. Verander nu alleen de TODO-regels.");
}
function renderLab() {
  if (!unlocked())
    return `${heading("BEWIJS → CODE", "Jouw agentstudio.")}${gate()}`;
  return `${heading("AGENT BOUWEN", "Jouw agentstudio.", "Kies een regel, bouw hem met code of blokken en test hem.", `<div class="lab-header"><div class="segmented"><button data-mode="python" class="${state.mode === "python" ? "active" : ""}">Python Studio</button><button data-mode="blocks" class="${state.mode === "blocks" ? "active" : ""}">Blokkenstudio</button></div></div>`)}<div class="lab-grid"><div>${renderProgrammingSprint()}<div class="editor-panel"><div class="editor-top"><div class="window-dots"><i></i><i></i><i></i></div><span>${state.mode === "python" ? "mijn_agent.py" : "mijn_agent.blokken"} <span style="color:#9ca78f">/</span> ${esc(state.name)}</span><span>PYTHON 3</span></div>${
    state.mode === "python"
      ? `<div class="editor-wrap"><div class="line-numbers" aria-hidden="true">${state.code
          .split("\n")
          .map((_, i) => i + 1)
          .join(
            "<br>",
          )}</div><textarea id="code-editor" class="code-editor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Python agentcode">${esc(state.code)}</textarea></div>`
      : '<div id="blocks-host" class="blocks-host"><div class="blocks-loading"><span class="loading-dot"></span>&nbsp; Je blokkenwerkplaats laden…</div></div><details style="margin:0;border-radius:0"><summary>Bekijk de Python achter je blokken</summary><pre id="generated-code" style="white-space:pre-wrap;font-size:10px"></pre></details>'
  }<div class="editor-bottom"><span id="runtime-status">Python laadt bij de eerste uitvoering</span><div class="button-row" style="margin:0"><button class="button small ghost" id="download-python">.py ↓</button><button class="button primary small" id="run-code">${icon("play")} Test mijn agent</button></div></div><pre id="console" class="console" role="log" aria-live="polite">&gt; Klaar voor jouw eerste experiment.\n&gt; Test je code op een nieuw kaartpaar.</pre></div>
  <div id="validation-result"></div><section class="training-panel"><details id="training-options" class="advanced-training"><summary>Verdieping: trainen en leerparameters <span>OPTIONEEL</span></summary><div class="surface"><div class="panel-top"><h3>Onderzoek wat je agent leert.</h3><span class="badge purple">ECHT LEREN</span></div><p style="font-size:11px;color:var(--muted)">De agent krijgt beloning 1 als zijn eerste inspectie de match vindt, anders 0. Hij leert de verwachte beloning per symbool. Gebruik q in je score om dit geheugen mee te laten spelen; een vaste regel verandert niet door training. Bij gelijke kansen kan leren geen voorkennis creëren.</p><div class="training-grid"><div class="field"><label for="episodes">Trainingen</label><select id="episodes"><option value="250" ${state.parameters.episodes === 250 ? "selected" : ""}>250 · snelle verkenning</option><option value="1000" ${state.parameters.episodes === 1000 ? "selected" : ""}>1.000 · eerste experiment</option><option value="3000" ${state.parameters.episodes === 3000 ? "selected" : ""}>3.000 · verder onderzoeken</option><option value="10000" ${state.parameters.episodes === 10000 ? "selected" : ""}>10.000 · grondig vergelijken</option></select></div><div class="field"><label for="seed">Seed</label><input type="number" id="seed" min="0" max="2147483647" value="${state.parameters.seed}"><small>Dezelfde beginsituatie helpt je vergelijken.</small></div><div class="field"><label for="epsilon">Exploratie ε <span id="epsilon-value">${state.parameters.epsilon.toFixed(2)}</span></label><input type="range" id="epsilon" min="0" max="1" step="0.05" value="${state.parameters.epsilon}"><small>Hoe vaak probeert de agent een willekeurige eerste inspectie?</small></div><div class="field"><label for="alpha">Leersnelheid α <span id="alpha-value">${state.parameters.alpha.toFixed(2)}</span></label><input type="range" id="alpha" min="0.05" max="1" step="0.05" value="${state.parameters.alpha}"><small>Hoe sterk telt één nieuwe ervaring mee?</small></div></div><div class="field"><label for="environment">De oefenwereld</label><select id="environment"><option value="focus" ${state.parameters.environment === "focus" ? "selected" : ""}>Focuswereld · 8 symbolen krijgen extra kans</option><option value="uniform" ${state.parameters.environment === "uniform" ? "selected" : ""}>Symmetrische wereld · eerlijke kaartverdeling</option></select><small>Focuswereld: in 75% van de rondes wordt de match uit de eerste acht symbolen gekozen; anders worden twee willekeurige kaarten gepakt. De validatie gebruikt dezelfde verdeling en nieuwe kaartparen.</small></div><div class="training-stats"><div class="stat-box"><strong id="episodes-stat">${state.model.episodes.toLocaleString("nl-NL")}</strong><span>TRAININGEN IN GEHEUGEN</span></div><div class="stat-box"><strong id="steps-stat">${lastValidation ? lastValidation.meanSteps?.toFixed(2) : "—"}</strong><span>INSPECTIES / VALIDATIERONDE</span></div><div class="stat-box"><strong id="baseline-stat">${lastValidation ? lastValidation.baselineSteps?.toFixed(2) : "—"}</strong><span>WILLEKEURIGE REFERENTIE</span></div></div><div class="training-status"><span id="training-status">Klaar voor een experiment</span><span id="training-count">0 / ${state.parameters.episodes.toLocaleString("nl-NL")}</span></div><div class="progress-track"><div id="training-progress"></div></div><canvas id="training-chart" class="training-chart" aria-label="Gemiddelde zoekstappen per trainingsbatch, lager is beter" role="img"></canvas><div class="chart-labels"><span>Gemiddelde inspecties · lager = sneller</span><span>Trainingsbatches →</span></div><div class="button-row"><button class="button purple" id="train-button">${icon("spark")} Train mijn agent</button><button class="button ghost" id="stop-training" hidden>Stop training</button><button class="button" id="validate-button">Valideer · 300 rondes ↗</button><button class="button ghost small" id="reset-model">Wis leergeheugen</button></div><details><summary>Wat leren we precies?</summary><p>Dit is een contextuele bandit: een kleine vorm van reinforcement learning met één beloonde keuze per ronde. De kandidaatkaart bepaalt de beschikbare acties. Q wordt bijgewerkt met Q ← Q + α × (beloning − Q). Er is geen opeenvolging van toekomstige speltoestanden; een discountfactor γ is hier dus niet nodig. Een MLAgent kan Q gebruiken in evaluate. Code die alleen een vaste score teruggeeft, verandert zijn strategie niet door training.</p></details></div></details></section></div>
  <aside class="lab-side"><div class="surface"><span class="eyebrow">DE AGENT-API</span><h3>Jij geeft de prioriteit.</h3><p>De imports, klasse en functie staan klaar, zoals in Fundamenta. Verander alleen de regels bij TODO. Je hoeft geen spel of leeralgoritme te schrijven.</p>${[
    ["score", "Hoger getal = dit figuur eerder inspecteren."],
    ["kans", "De gegeven modelkans; staat al in je startcode."],
    ["tijd", "De gegeven herkenningskosten; lager is sneller."],
    ["geleerd", "De gegeven leerwaarde; alleen nodig bij tactiek 5."],
  ]
    .map(([c, p]) => `<div class="api-row"><code>${c}</code><p>${p}</p></div>`)
    .join(
      "",
    )}<details><summary>Meer velden</summary><p>candidate: id, q, frequency (ook p), salience, cost.<br>observation: my_card, checked, memory, round. De andere kaart blijft bij de spelengine. Schrijf class MijnAgent(EvaluationAgent) of class MijnAgent(MLAgent), met evaluate(self, observation, candidate).</p></details></div><div class="surface"><span class="eyebrow">NEEM JE WERK MEE</span><div class="field"><label for="agent-name">Agentnaam</label><input id="agent-name" maxlength="100" value="${esc(state.name)}"></div><div class="button-row"><button class="button small" data-export>${icon("download")} Exporteer</button><button class="button small ghost" data-import>${icon("upload")} Importeer</button></div><p style="margin-top:13px">Code, leergeheugen, parameters en bewijsuitwerkingen in één JSON-bestand voor je docent.</p><a href="#arena" class="button lime" style="margin-top:17px;width:100%">Daag je agent uit ↗</a></div></aside></div>`;
}
function renderArena() {
  const pair = choosePair(createDeck(state.q), rng(124));
  return `${heading("SPEL", "Dobbel met drie stapels.", "De pot ligt in het midden. Jij en je agent trekken ieder een eigen kaart. Zoek het figuur dat op jouw kaart en de potkaart staat.")}<section class="arena simple-arena"><div class="arena-top"><span class="label" id="round-label">RONDE 1</span><div class="scoreboard"><b id="human-score">0</b><span>:</span><b id="agent-score">0</b></div><span class="badge" id="arena-state">KLAAR</span></div><div class="pile-counts"><span>Pot: <b id="draw-count">0</b></span><span>Jouw stapel: <b id="human-pile-count">0</b></span><span>Agentstapel: <b id="agent-pile-count">0</b></span></div><div class="arena-cards three-piles"><div class="player-zone"><div class="player-label">JOUW KAART</div><div id="human-card">${cardHTML(pair[0], "human", true)}</div></div><div class="player-zone center-pile"><div class="player-label">POTKAART</div><div id="center-card">${cardHTML(pair[1], "agent")}</div></div><div class="player-zone"><div class="player-label agent">AGENT</div><div id="agent-card">${cardHTML(pair[0], "agent")}</div></div></div><div class="arena-message" id="arena-message">Wie vindt de match het eerst?</div><p class="arena-submessage" id="arena-submessage">Klik op het gedeelde figuur op jouw kaart.</p><div class="arena-bottom"><button class="button primary" id="start-game">${icon("play")} Trek kaarten</button><button class="button ghost" id="next-round" hidden>Volgende ronde</button><button class="button ghost" id="reset-game" hidden>Nieuwe pot</button></div></section>`;
  return `${heading("CODE ONTMOET COMPETITIE", "Zie jij de match eerst?", "Twee kaarten. Precies één gedeeld figuur. Klik het aan op jouw kaart.")}<div class="play-toolbar"><span class="badge purple" id="arena-agent-label">${unlocked() ? "Jouw agentcode + leergeheugen" : "Voorbeeldagent · willekeurig zoeken"}</span><div class="field"><label for="pace">Agenttempo</label><select id="pace"><option value="1.5">Rustig · oefen eerst</option><option value="1" selected>Normaal</option><option value="0.75">Pittig</option></select></div></div><section class="arena"><div class="arena-top"><span class="label" id="round-label">EERSTE TOT 5 PUNTEN</span><div class="scoreboard"><b id="human-score">0</b><span>:</span><b id="agent-score">0</b></div><span class="badge" id="arena-state">KLAAR VOOR DE START</span></div><div class="arena-cards"><div class="player-zone"><div class="player-label"><i></i> JOUW KAART</div><div id="human-card">${cardHTML(pair[0], "human", true)}</div></div><div class="vs">vs.</div><div class="player-zone"><div class="player-label agent"><i></i> ${esc(state.name.toUpperCase())}</div><div id="agent-card">${cardHTML(pair[1], "agent")}</div></div></div><div class="arena-message" id="arena-message">Je strategie krijgt een tegenstander. Jij.</div><p class="arena-submessage" id="arena-submessage">Klik op start. Dan krijgt iedereen tegelijk een nieuw kaartpaar.</p><div class="arena-bottom"><button class="button primary" id="start-game">${icon("play")} Start de match</button><button class="button ghost" id="next-round" hidden>Volgende ronde →</button><button class="button ghost" id="reset-game" hidden>Nieuwe match</button></div></section><div class="arena-description"><div class="surface"><h3>Een tegenstander op speeltempo.</h3><p>De agent krijgt een vertraging die toeneemt met zijn zoekwerk, plus een beetje variatie. Dit is een ontworpen speltempo; geen gemeten gemiddelde reactietijd van mensen.</p></div><div class="surface"><h3>Je code speelt echt mee.</h3><p>De evaluate-scores uit je Python- of blokkenagent bepalen de inspectievolgorde. Een kortere zoekroute geeft de agent een voorsprong.</p></div><div class="surface"><h3>Een misser kost even tijd.</h3><p>Een fout figuur aanklikken geeft 700 ms pauze. Kijk dus goed. De eerste die vijf rondes wint, wint de match.</p></div></div>`;
}
function renderIcons() {
  return `${heading("MAAK HET VAN JEZELF", "Een eigen smoel.", "57 originele figuren. Drie stijlen. En alle ruimte voor jouw ideeën.")}<div class="icon-presets">${PRESETS.map((p) => `<button class="preset-card ${state.preset === p.id ? "active" : ""}" data-preset="${p.id}">${state.preset === p.id ? '<span class="badge">GEKOZEN</span>' : ""}<div class="preset-symbols">${[0, 5, 15].map((i) => iconSVG(i, p.id)).join("")}</div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p></button>`).join("")}</div><div class="section-heading"><h2>Jouw symbolenbibliotheek.</h2><span class="meta">Klik een figuur om het te vervangen.</span></div><div class="surface"><div class="icon-settings"><p>Upload eigen PNG-, JPG- of WebP-iconen.<br>Iedere vervanging blijft op alle kaarten hetzelfde symbool.</p><div class="field" style="margin:0"><label for="deck-size">Kaartformaat</label><select id="deck-size"><option value="3" ${state.q === 3 ? "selected" : ""}>4 figuren · 13 kaarten</option><option value="5" ${state.q === 5 ? "selected" : ""}>6 figuren · 31 kaarten</option><option value="7" ${state.q === 7 ? "selected" : ""}>8 figuren · 57 kaarten (lesstandaard)</option></select></div></div><div class="icon-grid">${SYMBOLS.map((s) => `<button class="icon-tile ${state.customIcons?.[s.id] ? "custom" : ""}" data-icon="${s.id}" title="${esc(s.name)} vervangen" aria-label="Vervang ${esc(s.name)}">${symbolArt(s.id)}<span>${esc(s.name)}</span></button>`).join("")}</div><div class="button-row"><button class="button small ghost" id="reset-icons">Herstel alle originele figuren</button><a class="button small primary" href="#arena">Speel met deze kaarten ↗</a></div><div class="callout green">Elk paar kaarten deelt precies één symbool. De kaartconstructie gebruikt een eindig projectief vlak van orde 3, 5 of 7. De vijf lesopdrachten rekenen met de standaard: acht figuren per kaart.</div></div>`;
}
function renderTeacher() {
  return `${heading("VAKOVERSTIJGEND WERKEN", "Een les die verbanden legt.", "Een werkplaats voor wiskunde en informatica, ontworpen voor 4 vwo.", `<button class="button" data-import>${icon("upload")} Bekijk leerlingagent</button>`)}<div class="teacher-grid"><div><section class="surface"><span class="eyebrow">LESOPZET · PROGRAMMEREN: 10 MINUTEN</span><h2>Bewijzen, bouwen, bevragen.</h2><p>Leerlingen onderzoeken een zoekstrategie, onderbouwen die met kansrekening en vertalen haar naar een programmeerbare agent. Daarna toetsen ze hun voorspelling met experimenten. De interface biedt ondersteuning op basis van een formatieve instapvraag; een route kan steeds worden gewisseld.</p><ol><li><strong>Les 1 — Wiskundig modelleren en bouwen.</strong> Onderzoek tactiek 1 en 2, kies één programmeertactiek en besteed tien minuten aan code, test en vergelijking.</li><li><strong>Les 2 — Kans, kosten en bewijs.</strong> Onderzoek tactiek 3 en 4 met een voorspelling, bewijs en bespreking. Een tweede agent programmeren is verdieping.</li><li><strong>Les 3 — Leren en verdedigen.</strong> Onderzoek tactiek 5, train en valideer op nieuwe kaarten. Lever één agentbestand plus bewijzen en reflectie in.</li></ol><div class="table-scroll"><table><thead><tr><th>Uitdaging</th><th>Wiskundig inzicht</th><th>Programmeertactiek</th></tr></thead><tbody>${lessons.map((l) => `<tr><td>${esc(l.title)}</td><td>${esc(l.kicker)}</td><td>${esc(l.objective)}</td></tr>`).join("")}</tbody></table></div></section><section class="surface"><h2>Bekijk de bewaarde redeneringen.</h2><p>Dit overzicht toont het werk in deze browser. Importeer een leerlingagent om diens werk te bekijken. Bewaar eerst je eigen agent; een import vervangt het actieve werk.</p>${lessons.map((l) => `<div class="teacher-proof"><strong>${esc(l.title)}</strong><pre>${esc(state.proofs[l.id] || "Nog geen eigen uitwerking opgeslagen.")}</pre><details><summary>Beoordelingscriteria en bespreekantwoord</summary><ul>${(l.rubric || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul><p>${esc(l.explanation)}</p></details></div>`).join("")}</section></div><aside><section class="surface"><span class="eyebrow">FORMATIEF BEOORDELEN</span><h2>Een redenering telt.</h2><p>Let op expliciete aannames, een geldige berekening, een uitleg van de agenttactiek en een eerlijke vergelijking. Een goed instapantwoord is nog geen beoordeeld bewijs. Winst in de arena is geen bewijs van een beter leeralgoritme.</p><div class="callout">Leerresultaten zijn hier lokaal. Er is geen leerlingaccount of centrale klassenopslag. Delen gebeurt via een exportbestand; de leerling levert dat zelf in.</div><div class="button-row"><button class="button primary" data-export>${icon("download")} Exporteer werk</button><button class="button" id="download-report">Lesverslag ↓</button></div></section><section class="surface"><h2>Open en overdraagbaar.</h2><p>De website werkt als statische HTML op GitHub Pages. Python draait in een aparte browserworker. De eigen SVG-figuren en alle appcode zitten bij het project.</p><a class="source-link" href="./docs/programming-10-minutes.md" target="_blank" rel="noopener">Programmeeropdracht van tien minuten ↗</a><a class="source-link" href="./docs/curriculum.md" target="_blank" rel="noopener">Lesverantwoording & lokale bronnen ↗</a><a class="source-link" href="./docs/research-design.md" target="_blank" rel="noopener">Onderzoek naar ontwerp en interactie ↗</a><a class="source-link" href="./docs/research-technical.md" target="_blank" rel="noopener">Onderzoek naar wiskunde en techniek ↗</a><a class="source-link" href="./README.md" target="_blank" rel="noopener">Handleiding, beperkingen & publiceren ↗</a><button class="text-link" id="download-library" style="margin-top:18px">Download matchlab.py ↗</button></section><section class="surface"><h3>Bij deze leeromgeving</h3><p style="margin-top:12px">Een eigen matchspel, geïnspireerd op het gedeelde-symboolprincipe. Geen officiële Dobble-uitgave. De lesopbouw sluit aan op de aangeleverde handleiding en colleges; de Fundamenta-voorbeelden inspireerden de klasse-interface, train/validate en JSON-uitwisseling.</p></section></aside></div>`;
}
function render() {
  if (training) stopTraining(false);
  clearTimeout(arenaTimer);
  roundToken++;
  if (workspace) {
    try {
      state.blockState = Blockly.serialization.workspaces.save(workspace);
      workspace.dispose();
    } catch {}
    workspace = null;
  }
  const hash = location.hash.slice(1);
  view = ["home", "math", "lab", "arena", "icons", "teacher"].includes(hash)
    ? hash
    : "home";
  $("#breadcrumb").textContent = {
    home: "Het lab",
    math: "Wiskunde",
    lab: "Agentstudio",
    arena: "De arena",
    icons: "Kaartontwerper",
    teacher: "Voor de docent",
  }[view];
  updateNavigation();
  $("#main").innerHTML = {
    home: renderHome,
    math: renderMath,
    lab: renderLab,
    arena: renderArena,
    icons: renderIcons,
    teacher: renderTeacher,
  }[view]();
  bindCommon();
  if (view === "math") bindMath();
  if (view === "lab" && unlocked()) bindLab();
  if (view === "arena") bindArena();
  if (view === "icons") bindIcons();
  if (view === "teacher") bindTeacher();
}
function bindCommon() {
  $$("[data-export]").forEach((b) => (b.onclick = downloadAgent));
  $$("[data-import]").forEach(
    (b) => (b.onclick = () => $("#agent-file").click()),
  );
  $$("[data-view]").forEach(
    (b) => (b.onclick = () => (location.hash = b.dataset.view)),
  );
}
function bindMath() {
  $$("[data-lesson]").forEach(
    (b) =>
      (b.onclick = () => {
        state.lessonIndex = +b.dataset.lesson;
        save();
        render();
      }),
  );
  $$("[data-answer]").forEach(
    (b) =>
      (b.onclick = () => {
        selectedAnswer = b.dataset.answer;
        $$("[data-answer]").forEach((x) =>
          x.classList.toggle("selected", x === b),
        );
        $("#check-answer").disabled = false;
      }),
  );
  $("#check-answer").onclick = () => {
    const l = lessons[state.lessonIndex];
    state.answers[l.id] = {
      choice: selectedAnswer,
      correct: selectedAnswer === l.correct,
    };
    state.mode = selectedAnswer === l.correct ? "python" : "blocks";
    save();
    render();
  };
  $("#proof-input").oninput = (e) => {
    state.proofs[lessons[state.lessonIndex].id] = e.target.value;
    save();
  };
  $("#lesson-to-code").onclick = () => {
    state.code = programmingTasks[state.lessonIndex].starter;
    state.pythonCode = state.code;
    state.blockState = null;
    save();
    location.hash = "lab";
  };
  if ($("#next-lesson"))
    $("#next-lesson").onclick = () => {
      state.lessonIndex++;
      save();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
}
function consoleOut(text, error = false) {
  const el = $("#console");
  if (el) {
    el.textContent = text;
    el.classList.toggle("error", error);
    el.scrollTop = el.scrollHeight;
  }
}
function download(filename, text, mime = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function syncCode() {
  if (state.mode === "blocks" && workspace) {
    state.code = blocksToPython();
    state.blockState = Blockly.serialization.workspaces.save(workspace);
  } else if ($("#code-editor")) state.code = $("#code-editor").value;
}
function downloadAgent() {
  syncCode();
  save();
  download(
    `${state.name.replace(/[^\p{L}\p{N}_-]/gu, "_") || "agent"}.matchlab.json`,
    exportAgent(state),
    "application/json",
  );
  toast("Agent, leergeheugen en bewijzen geëxporteerd.");
}
$("#agent-file").onchange = async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try {
    if (file.size > 1000000)
      throw new Error("Het bestand is te groot (maximaal 1 MB).");
    const data = importAgent(await file.text());
    if (unlocked() || state.model.episodes > 0) {
      downloadAgent();
    }
    state = {
      ...initial,
      ...data,
      pythonCode:
        data.pythonCode || (data.mode === "python" ? data.code : STARTER),
      answers: data.answers || { "01": { choice: "import", correct: true } },
      parameters: { ...initial.parameters, ...data.parameters },
      proofs: data.proofs || {},
      customIcons: data.customIcons || {},
    };
    if (!Object.keys(state.answers).length)
      state.answers = { "01": { choice: "import", correct: true } };
    state.lessonIndex = 0;
    save();
    if (worker) {
      worker.terminate();
      worker = null;
      workerReady = false;
      workerLoading = null;
    }
    lastValidation = null;
    location.hash = "lab";
    render();
    toast("Agent ingeladen. Je vorige werk is eerst als back-up gedownload.");
  } catch (error) {
    toast(error.message);
  }
};
function bindLab() {
  $$("[data-mode]").forEach(
    (b) =>
      (b.onclick = () => {
        if (training)
          return toast("Stop eerst de training om van werkplaats te wisselen.");
        syncCode();
        if (state.mode === "python") state.pythonCode = state.code;
        state.mode = b.dataset.mode;
        if (state.mode === "python") state.code = state.pythonCode || STARTER;
        save();
        render();
      }),
  );
  if ($("#code-editor")) {
    $("#code-editor").oninput = (e) => {
      state.code = e.target.value;
      state.pythonCode = state.code;
      $(".line-numbers").innerHTML = state.code
        .split("\n")
        .map((_, i) => i + 1)
        .join("<br>");
      save();
    };
    $("#code-editor").onkeydown = (e) => {
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        const t = e.target,
          s = t.selectionStart,
          end = t.selectionEnd;
        t.setRangeText("    ", s, end, "end");
        t.dispatchEvent(new Event("input"));
      }
    };
  } else initBlockly();
  $("#agent-name").oninput = (e) => {
    state.name = e.target.value;
    save();
  };
  for (const key of ["episodes", "seed", "epsilon", "alpha", "environment"]) {
    $("#" + key).oninput = (e) => {
      const v = key === "environment" ? e.target.value : Number(e.target.value);
      if (key === "seed" && (!Number.isInteger(v) || v < 0 || v > 2147483647))
        return;
      state.parameters[key] = v;
      if ($("#" + key + "-value"))
        $("#" + key + "-value").textContent = Number(v).toFixed(2);
      save();
    };
  }
  $("#download-python").onclick = () => {
    syncCode();
    download("mijn_agent.py", state.code);
    toast(
      "Agentcode gedownload. Download matchlab.py via de docentpagina voor lokaal gebruik.",
    );
  };
  $("#run-code").onclick = runCode;
  $("#train-button").onclick = startTraining;
  $("#validate-button").onclick = () => validateCode();
  $("#quick-compare").onclick = () => validateCode(100);
  if ($("#quick-train"))
    $("#quick-train").onclick = () => {
      state.parameters.episodes = 250;
      save();
      startTraining();
    };
  $("#training-options").addEventListener("toggle", drawChart);
  $("#load-programming-starter").onclick = loadProgrammingStarter;
  $("#coding-task").onchange = (e) => {
    if (training) return;
    state.lessonIndex = Number(e.target.value);
    save();
    render();
  };
  $("#stop-training").onclick = () => stopTraining(true);
  $("#reset-model").onclick = () => {
    if (training) return;
    state.model = createModel();
    lastValidation = null;
    save();
    $("#episodes-stat").textContent = "0";
    $("#steps-stat").textContent = "—";
    $("#baseline-stat").textContent = "—";
    drawChart();
    toast("Het leergeheugen is gewist. Je code en bewijzen zijn bewaard.");
  };
  drawChart();
}
function setBusy(busy) {
  for (const id of [
    "run-code",
    "train-button",
    "validate-button",
    "reset-model",
    "quick-compare",
    "quick-train",
    "load-programming-starter",
    "coding-task",
  ])
    if ($("#" + id)) $("#" + id).disabled = busy;
  if ($("#stop-training")) $("#stop-training").hidden = !training;
}
async function ensureWorker() {
  if (workerReady && worker) return;
  if (workerLoading) return workerLoading;
  workerLoading = new Promise((resolve, reject) => {
    worker = new Worker(new URL("./python-worker.js", import.meta.url), {
      type: "module",
    });
    const readyTimeout = setTimeout(() => {
      worker?.terminate();
      worker = null;
      workerLoading = null;
      reject(
        new Error(
          "Python kon niet binnen 90 seconden laden. Vernieuw de pagina en probeer opnieuw.",
        ),
      );
    }, 90000);
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === "ready") {
        clearTimeout(readyTimeout);
        workerReady = true;
        const r = $("#runtime-status");
        if (r) r.textContent = "Python gereed · draait op je apparaat";
        resolve();
        return;
      }
      const p = pending.get(m.id);
      if (m.type === "progress") {
        p?.onProgress?.(m);
        return;
      }
      if (!p) {
        if (m.type === "error" && !workerReady) {
          clearTimeout(readyTimeout);
          workerLoading = null;
          reject(new Error(m.error || m.message || "Python laden mislukt."));
        }
        return;
      }
      clearTimeout(p.timeout);
      pending.delete(m.id);
      if (m.type === "error")
        p.reject(new Error(m.error || m.message || "Pythonfout"));
      else p.resolve(m);
    };
    worker.onerror = () => {
      clearTimeout(readyTimeout);
      workerReady = false;
      workerLoading = null;
      const error = new Error(
        "Python kon niet starten. Vernieuw de pagina en controleer de lokale Python-bestanden.",
      );
      for (const p of pending.values()) {
        clearTimeout(p.timeout);
        p.reject(error);
      }
      pending.clear();
      reject(error);
    };
    const r = $("#runtime-status");
    if (r) r.textContent = "Python-runtime wordt eenmalig geladen…";
  });
  return workerLoading;
}
async function pythonRequest(type, payload = {}, onProgress) {
  await ensureWorker();
  const id = ++requestId;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => {
        pending.delete(id);
        worker?.terminate();
        worker = null;
        workerReady = false;
        workerLoading = null;
        for (const p of pending.values()) {
          clearTimeout(p.timeout);
          p.reject(new Error("Uitvoering gestopt na een vastgelopen agent."));
        }
        pending.clear();
        reject(
          new Error(
            "De agent is gestopt: tijdslimiet bereikt. Controleer op eindeloze lussen.",
          ),
        );
      },
      type === "train" ? 120000 : 20000,
    );
    pending.set(id, { resolve, reject, timeout, onProgress });
    worker.postMessage({
      id,
      type,
      code: state.code,
      model: state.model,
      parameters: { ...state.parameters, q: state.q },
      seed: state.parameters.seed,
      ...payload,
    });
  });
}
async function runCode() {
  syncCode();
  save();
  setBusy(true);
  consoleOut("> Python laden en je agent testen…");
  try {
    const pair = choosePair(createDeck(state.q), rng(state.parameters.seed));
    const r = await pythonRequest("run", {
      observation: { my_card: pair[0], other_card: pair[1] },
    });
    lastRun = r;
    consoleOut(
      `> Je agent werkt.\n> Inspectievolgorde: ${(r.order || []).join(" → ")}\n> Match ${r.match} (${SYMBOLS[r.match]?.name || "symbool"}) gevonden na ${r.steps} inspectie(s).${r.stdout ? "\n" + r.stdout : ""}`,
    );
    toast("Je Python-agent is uitgevoerd.");
  } catch (e) {
    consoleOut(e.message, true);
  } finally {
    setBusy(false);
  }
}
async function startTraining() {
  syncCode();
  save();
  training = true;
  trainingTotal = state.parameters.episodes;
  setBusy(true);
  $("#training-status").textContent = "Python laden…";
  if ($("#sprint-training-status"))
    $("#sprint-training-status").textContent = "Python laden…";
  $("#training-count").textContent = `0 / ${trainingTotal}`;
  $("#training-progress").style.width = "0%";
  if ($("#sprint-training-progress"))
    $("#sprint-training-progress").style.width = "0%";
  try {
    const r = await pythonRequest("train", { episodes: trainingTotal }, (m) => {
      if (!training) return;
      $("#training-status").textContent = "Nieuwe kaartparen onderzoeken…";
      if ($("#sprint-training-status"))
        $("#sprint-training-status").textContent =
          `${m.completed.toLocaleString("nl-NL")} van ${m.total.toLocaleString("nl-NL")} rondes onderzocht`;
      $("#training-count").textContent =
        `${m.completed.toLocaleString("nl-NL")} / ${m.total.toLocaleString("nl-NL")}`;
      $("#training-progress").style.width = (m.completed / m.total) * 100 + "%";
      if ($("#sprint-training-progress"))
        $("#sprint-training-progress").style.width =
          (m.completed / m.total) * 100 + "%";
      if (m.model) {
        state.model = m.model;
        save();
        drawChart();
      }
      if (m.meanSteps && !m.model) {
        const history = state.model.history || [];
        if (!history.length || history.at(-1).episodes !== m.completed)
          history.push({ episodes: m.completed, meanSteps: m.meanSteps });
        state.model.history = history;
        drawChart();
      }
      if ($("#episodes-stat"))
        $("#episodes-stat").textContent = (
          m.model?.episodes ?? state.model.episodes + m.completed
        ).toLocaleString("nl-NL");
    });
    state.model = r.model;
    save();
    $("#episodes-stat").textContent =
      state.model.episodes.toLocaleString("nl-NL");
    $("#training-status").textContent =
      "Training afgerond · valideer nu op nieuwe kaarten";
    if ($("#sprint-training-status"))
      $("#sprint-training-status").textContent =
        `${trainingTotal.toLocaleString("nl-NL")} rondes afgerond · vergelijk nu je agent`;
    $("#training-progress").style.width = "100%";
    if ($("#sprint-training-progress"))
      $("#sprint-training-progress").style.width = "100%";
    drawChart();
    consoleOut(
      `> ${trainingTotal.toLocaleString("nl-NL")} echte trainingsrondes uitgevoerd.\n> Geheugen: ${state.model.episodes.toLocaleString("nl-NL")} rondes.\n> Valideer je agent om de voorspelling te toetsen.${r.stdout ? "\n" + r.stdout : ""}`,
    );
    toast("Training klaar. Tijd om je voorspelling te testen.");
  } catch (e) {
    consoleOut(e.message, true);
    if ($("#training-status"))
      $("#training-status").textContent =
        "Training gestopt · vorige opgeslagen model bewaard";
    if ($("#sprint-training-status"))
      $("#sprint-training-status").textContent =
        "Training gestopt · vorige opgeslagen model bewaard";
  } finally {
    training = false;
    setBusy(false);
  }
}
function stopTraining(notify = true) {
  if (!training) return;
  training = false;
  worker?.terminate();
  worker = null;
  workerReady = false;
  workerLoading = null;
  for (const p of pending.values()) {
    clearTimeout(p.timeout);
    p.reject(
      new Error(
        "Training door jou gestopt. De laatste voltooide batch is bewaard.",
      ),
    );
  }
  pending.clear();
  setBusy(false);
  save();
  if ($("#training-status"))
    $("#training-status").textContent =
      "Gestopt · laatste voltooide batch bewaard";
  if ($("#sprint-training-status"))
    $("#sprint-training-status").textContent =
      "Gestopt · laatste voltooide batch bewaard";
  if (notify) toast("Training gestopt. Je laatste afgeronde batch is bewaard.");
}
async function validateCode(count = 300) {
  syncCode();
  setBusy(true);
  lastValidation = null;
  consoleOut(
    `> ${count} nieuwe kaartparen vergelijken met willekeurig zoeken…`,
  );
  try {
    const r = await pythonRequest("validate", {
      episodes: count,
      seed: (state.parameters.seed + 100003) % 2147483648,
    });
    lastValidation = r.validation || r;
    const v = lastValidation;
    $("#steps-stat").textContent = v.meanSteps.toFixed(2);
    $("#baseline-stat").textContent = v.baselineSteps.toFixed(2);
    $("#validation-result").innerHTML =
      `<div class="callout green"><strong>Nieuwe kaarten, dezelfde oefenwereld.</strong><br>Jouw agent: ${v.meanSteps.toFixed(2)} inspecties per ronde. Willekeurige referentie: ${v.baselineSteps.toFixed(2)}. ${v.count || count} rondes, validatieseed ${(state.parameters.seed + 100003) % 2147483648}. Het leergeheugen is tijdens deze meting bevroren. ${v.meanSteps < v.baselineSteps ? "Je agent zocht in deze steekproef gemiddeld korter." : "De strategie zocht in deze steekproef niet korter dan willekeurig."} Herhaal met een andere seed en ook in de symmetrische wereld.<br><strong>Herkenningskosten:</strong> jouw agent ${(v.meanCost ?? v.meanSteps).toFixed(2)} kosteenheden, referentie ${(v.baselineCost ?? v.baselineSteps).toFixed(2)}. Deze maat telt ook mee in de arena; een kosteenheid is een modelschaal, geen gemeten seconde.</div>`;
    consoleOut(
      `> Validatie klaar. Geen leergewichten aangepast.\n> Agent: ${v.meanSteps.toFixed(3)} stappen. Referentie: ${v.baselineSteps.toFixed(3)} stappen.\n> Sneller in ${Math.round((v.winRate || 0) * 100)}% van de gekoppelde rondes.${r.stdout ? "\n" + r.stdout : ""}`,
    );
  } catch (e) {
    consoleOut(e.message, true);
  } finally {
    setBusy(false);
  }
}
function drawChart() {
  const canvas = $("#training-chart");
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1,
    w = canvas.clientWidth || 500,
    h = 160;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const c = canvas.getContext("2d");
  c.scale(dpr, dpr);
  const data = (state.model.history || [])
    .slice(-100)
    .map((x) =>
      typeof x === "number"
        ? x
        : Number(x.meanSteps ?? x.mean_steps ?? x.steps ?? 4.5),
    );
  c.clearRect(0, 0, w, h);
  c.font = "9px DM Sans";
  c.strokeStyle = "#e7ebdf";
  c.fillStyle = "#97a18c";
  for (let i = 1; i <= 4; i++) {
    const y = 15 + (i - 1) * 39;
    c.beginPath();
    c.moveTo(24, y);
    c.lineTo(w - 8, y);
    c.stroke();
    c.fillText(String(9 - i * 2), 2, y + 3);
  }
  if (!data.length) {
    c.fillStyle = "#a0aa95";
    c.fillText(
      "Je eerste trainingscurve verschijnt hier.",
      Math.max(35, w / 2 - 93),
      80,
    );
    return;
  }
  const points = data.map((v, i) => [
    26 + (i * (w - 40)) / Math.max(1, data.length - 1),
    15 + ((8 - v) / 7) * 124,
  ]);
  c.beginPath();
  c.moveTo(points[0][0], 145);
  for (const p of points) c.lineTo(...p);
  c.lineTo(points.at(-1)[0], 145);
  c.closePath();
  const g = c.createLinearGradient(0, 15, 0, 145);
  g.addColorStop(0, "#b4c98a66");
  g.addColorStop(1, "#b4c98a05");
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = "#91aa67";
  c.lineWidth = 2;
  c.beginPath();
  points.forEach((p, i) => (i ? c.lineTo(...p) : c.moveTo(...p)));
  c.stroke();
}
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () =>
      reject(
        new Error(
          "De blokkenbestanden konden niet laden. Vernieuw de pagina of controleer de websitebestanden.",
        ),
      );
    document.head.append(s);
  });
}
async function initBlockly() {
  try {
    if (!blocklyPromise)
      blocklyPromise = (async () => {
        const base = new URL("../assets/vendor/blockly/", import.meta.url).href;
        for (const f of [
          "blockly_compressed.js",
          "blocks_compressed.js",
          "python_compressed.js",
          "msg/nl.js",
        ])
          await loadScript(base + f);
      })();
    await blocklyPromise;
    if (view !== "lab" || state.mode !== "blocks" || !$("#blocks-host")) return;
    const B = window.Blockly,
      gen = window.python?.pythonGenerator || B.Python;
    if (!gen) throw new Error("Python-generator voor blokken ontbreekt.");
    B.defineBlocksWithJsonArray([
      {
        type: "match_value",
        message0: "%1 van dit figuur",
        args0: [
          {
            type: "field_dropdown",
            name: "FIELD",
            options: [
              ["aangeleerde kans (q)", "q"],
              ["modelkans", "frequency"],
              ["herkenningskosten", "cost"],
              ["opvallendheid", "salience"],
              ["symboolnummer", "id"],
            ],
          },
        ],
        output: "Number",
        colour: 255,
        tooltip: "Een eigenschap van het figuur dat de agent beoordeelt.",
      },
      {
        type: "match_score",
        message0: "geef prioriteit %1",
        args0: [{ type: "input_value", name: "SCORE", check: "Number" }],
        previousStatement: null,
        colour: 105,
        tooltip: "Een hogere prioriteit wordt eerder geïnspecteerd.",
      },
      {
        type: "match_random",
        message0: "willekeurige score 0 tot 1",
        output: "Number",
        colour: 255,
      },
      {
        type: "match_checked",
        message0: "dit figuur is al gecontroleerd",
        output: "Boolean",
        colour: 210,
        tooltip:
          "Waar als dit symbool in de reeds gecontroleerde symbolen staat.",
      },
      {
        type: "match_reward",
        message0: "geleerde beloning van dit figuur",
        output: "Number",
        colour: 105,
        tooltip: "De beloning die dit figuur in eerdere rondes kreeg.",
      },
      {
        type: "match_ratio",
        message0: "kans gedeeld door kosten",
        output: "Number",
        colour: 230,
        tooltip: "Een handige startpuzzel: kans per herkenningskost.",
      },
    ]);
    gen.forBlock.match_value = (block) => [
      `candidate["${block.getFieldValue("FIELD")}"]`,
      gen.ORDER_MEMBER || 2,
    ];
    gen.forBlock.match_random = () => [
      "random.random()",
      gen.ORDER_FUNCTION_CALL || 2,
    ];
    gen.forBlock.match_checked = () => [
      'candidate["id"] in observation["checked"]',
      gen.ORDER_RELATIONAL || 11,
    ];
    gen.forBlock.match_reward = () => [
      'candidate["q"]',
      gen.ORDER_MEMBER || 2,
    ];
    gen.forBlock.match_ratio = () => [
      'candidate["frequency"] / candidate["cost"]',
      gen.ORDER_DIVISION || 5,
    ];
    gen.forBlock.match_score = (block, g) =>
      `return ${g.valueToCode(block, "SCORE", g.ORDER_NONE) || "0"}\n`;
    $("#blocks-host").replaceChildren();
    workspace = B.inject("blocks-host", {
      toolbox: {
        kind: "categoryToolbox",
        contents: [
          {
            kind: "category",
            name: "Agent",
            colour: 105,
            contents: [
              { kind: "block", type: "match_score" },
              { kind: "block", type: "match_value" },
              { kind: "block", type: "match_reward" },
            ],
          },
          {
            kind: "category",
            name: "Puzzels",
            colour: 230,
            contents: [
              { kind: "block", type: "match_ratio" },
              { kind: "block", type: "match_value" },
              { kind: "block", type: "math_arithmetic" },
            ],
          },
          {
            kind: "category",
            name: "Waarden",
            colour: 230,
            contents: [
              { kind: "block", type: "math_number", fields: { NUM: 1 } },
              { kind: "block", type: "variables_get" },
              { kind: "block", type: "variables_set" },
            ],
          },
          {
            kind: "category",
            name: "Als-dan",
            colour: 210,
            contents: [
              { kind: "block", type: "controls_if" },
              { kind: "block", type: "match_checked" },
              { kind: "block", type: "logic_compare" },
              { kind: "block", type: "match_random" },
            ],
          },
        ],
      },
      grid: { spacing: 24, length: 2, colour: "#d9dfd0", snap: true },
      trashcan: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: window.innerWidth < 700 ? 0.65 : 0.9,
        minScale: 0.4,
        maxScale: 1.5,
      },
      renderer: "zelos",
      theme: B.Themes.Classic,
      media: new URL("../assets/vendor/blockly/media/", import.meta.url).href,
    });
    if (state.blockState) {
      try {
        B.serialization.workspaces.load(state.blockState, workspace);
      } catch {
        createDefaultBlocks();
      }
    } else createDefaultBlocks();
    workspace.addChangeListener((e) => {
      if (e.isUiEvent) return;
      state.blockState = B.serialization.workspaces.save(workspace);
      state.code = blocksToPython();
      if ($("#generated-code")) $("#generated-code").textContent = state.code;
      save();
    });
    $("#generated-code").textContent = blocksToPython();
    B.svgResize(workspace);
  } catch (e) {
    blocklyPromise = null;
    const host = $("#blocks-host");
    if (host)
      host.innerHTML = `<div class="blocks-help">${esc(e.message)}<p>Je kunt bovenaan naar Python Studio wisselen en je werk daar voortzetten.</p><button class="button" id="retry-blocks">Opnieuw laden</button></div>`;
    if ($("#retry-blocks")) $("#retry-blocks").onclick = initBlockly;
  }
}
function createDefaultBlocks() {
  const ret = workspace.newBlock("match_score");
  const value = workspace.newBlock("math_number");
  value.setFieldValue(0, "NUM");
  ret.initSvg();
  value.initSvg();
  ret.getInput("SCORE").connection.connect(value.outputConnection);
  value.render();
  ret.render();
  ret.moveBy(35, 40);
}
function blocksToPython() {
  const gen = window.python?.pythonGenerator || window.Blockly?.Python;
  if (!workspace || !gen) return state.code;
  const body = gen.workspaceToCode(workspace).trim();
  return `import random\nfrom matchlab import MLAgent\n\nclass MijnAgent(MLAgent):\n    def evaluate(self, observation, candidate):\n${
    body
      ? body
          .split("\n")
          .map((l) => "        " + l)
          .join("\n")
      : "        return 0"
  }\n`;
}
function bindArena() {
  const deck = shuffled(createDeck(state.q));
  arena = {
    human: 0,
    agent: 0,
    round: 0,
    active: false,
    lockedUntil: 0,
    drawPile: [...deck],
    humanPile: shuffled(deck),
    agentPile: shuffled(deck),
  };
  updatePileCounts();
  $("#start-game").onclick = startRound;
  $("#next-round").onclick = startRound;
  $("#reset-game").onclick = () => {
    clearTimeout(arenaTimer);
    roundToken++;
    render();
  };
  $("#human-card").onclick = (e) => {
    const b = e.target.closest("[data-symbol]");
    if (b) clickSymbol(+b.dataset.symbol, b);
  };
}
function updatePileCounts() {
  if (!arena) return;
  $("#draw-count").textContent = arena.drawPile.length;
  $("#human-pile-count").textContent = arena.humanPile.length;
  $("#agent-pile-count").textContent = arena.agentPile.length;
}
async function startRound() {
  if (arena.active) return;
  clearTimeout(arenaTimer);
  const token = ++roundToken;
  $("#start-game").disabled = true;
  $("#next-round").hidden = true;
  $("#arena-message").textContent = unlocked()
    ? "Je agent maakt zich klaar…"
    : "Nieuwe kaarten klaarzetten…";
  $("#arena-submessage").textContent =
    "De ronde begint pas als beide kaarten zichtbaar zijn.";
  if (!arena.drawPile.length || !arena.humanPile.length || !arena.agentPile.length) {
    $("#arena-message").textContent = "De pot is leeg.";
    $("#arena-submessage").textContent = "Klik op Nieuwe pot om opnieuw te schudden.";
    $("#start-game").disabled = false;
    return;
  }
  const center = arena.drawPile.pop();
  const mine = arena.humanPile.pop();
  const agentCard = arena.agentPile.pop();
  let steps;
  if (unlocked()) {
    try {
      const r = await pythonRequest("run", {
        observation: { my_card: agentCard, other_card: center },
      });
      if (token !== roundToken) return;
      steps = r.searchCost ?? r.steps;
      $("#arena-agent-label").textContent =
        `Jouw agent: ${state.name} · ${state.model.episodes} trainingen`;
    } catch (e) {
      if (token !== roundToken) return;
      $("#arena-message").textContent = "Je agent heeft hulp nodig.";
      $("#arena-submessage").textContent = e.message;
      $("#start-game").disabled = false;
      $("#start-game").hidden = false;
      return;
    }
  } else {
    steps = shuffled(agentCard).indexOf(commonSymbol(agentCard, center)) + 1;
  }
  if (token !== roundToken) return;
  arena.round++;
  arena.active = true;
  arena.center = center;
  arena.match = commonSymbol(mine, center);
  arena.started = performance.now();
  arena.lockedUntil = 0;
  $("#human-card").innerHTML = cardHTML(mine, "human", true);
  $("#center-card").innerHTML = cardHTML(center, "agent");
  $("#agent-card").innerHTML = cardHTML(agentCard, "agent");
  updatePileCounts();
  $("#round-label").textContent = `RONDE ${arena.round}`;
  $('[data-card="human"]').classList.remove("disabled");
  $("#arena-state").textContent = "ZOEK DE MATCH";
  $("#arena-message").textContent = "Eén figuur op allebei de kaarten. Welke?";
  $("#arena-submessage").textContent =
    "Klik het gedeelde figuur aan op jouw kaart.";
  $("#start-game").hidden = true;
  $("#reset-game").hidden = false;
  const pace = 1;
  arenaTimer = setTimeout(
    () => endRound("agent"),
    humanDelay(steps, Math.random, pace),
  );
}
function clickSymbol(id, button) {
  if (!arena?.active || performance.now() < arena.lockedUntil) return;
  if (id === arena.match) {
    button.classList.add("hit");
    endRound("human");
  } else {
    arena.lockedUntil = performance.now() + 700;
    button.classList.add("miss");
    setTimeout(() => button.classList.remove("miss"), 350);
    $("#arena-submessage").textContent =
      "Deze staat niet op allebei de kaarten. Kijk nog eens · 0,7 s pauze.";
  }
}
function endRound(winner) {
  if (!arena?.active) return;
  arena.active = false;
  clearTimeout(arenaTimer);
  arena[winner]++;
  $("#human-score").textContent = arena.human;
  $("#agent-score").textContent = arena.agent;
  $('[data-card="human"]').classList.add("disabled");
  const name = SYMBOLS[arena.match]?.name || "symbool";
  const complete = Math.max(arena.human, arena.agent) >= 5;
  $("#arena-state").textContent = complete
    ? "MATCH AFGEROND"
    : "RONDE AFGEROND";
  $("#arena-message").textContent = complete
    ? winner === "human"
      ? "Jij wint de match. Goed gezien!"
      : "Je agent wint de match. Mooi gebouwd."
    : winner === "human"
      ? "Raak. Jij zag hem eerst!"
      : "De agent had hem nét eerder.";
  updatePileCounts();
  $("#arena-submessage").textContent =
    `De match was ${name.toLowerCase()}. ${winner === "human" ? `Jij vond hem in ${((performance.now() - arena.started) / 1000).toFixed(2)} seconden.` : "De agent was sneller."}`;
  const b = $(`[data-symbol="${arena.match}"]`);
  b?.classList.add("hit");
  $("#next-round").hidden = complete;
  $("#start-game").disabled = false;
}
function bindIcons() {
  $$("[data-preset]").forEach(
    (b) =>
      (b.onclick = () => {
        state.preset = b.dataset.preset;
        save();
        render();
      }),
  );
  $$("[data-icon]").forEach(
    (b) =>
      (b.onclick = () => {
        iconTarget = +b.dataset.icon;
        $("#icon-file").click();
      }),
  );
  $("#deck-size").onchange = (e) => {
    state.q = +e.target.value;
    save();
    toast(
      "Kaartformaat aangepast. De lesopdrachten blijven rekenen met 8 figuren.",
    );
  };
  $("#reset-icons").onclick = () => {
    state.customIcons = {};
    save();
    render();
  };
}
$("#icon-file").onchange = async (e) => {
  const f = e.target.files[0];
  e.target.value = "";
  if (!f || iconTarget === null) return;
  try {
    if (!["image/png", "image/jpeg", "image/webp"].includes(f.type))
      throw new Error("Kies een PNG-, JPG- of WebP-afbeelding.");
    if (f.size > 5e6) throw new Error("Kies een afbeelding van maximaal 5 MB.");
    const bitmap = await createImageBitmap(f);
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    const scale = 88 / Math.max(bitmap.width, bitmap.height),
      w = bitmap.width * scale,
      h = bitmap.height * scale;
    ctx.drawImage(bitmap, (96 - w) / 2, (96 - h) / 2, w, h);
    bitmap.close();
    state.customIcons[iconTarget] = canvas.toDataURL("image/webp", 0.8);
    save();
    render();
    toast("Jouw icoon staat nu op alle bijbehorende kaarten.");
  } catch (err) {
    toast(err.message);
  }
};
function bindTeacher() {
  if ($("#download-library"))
    $("#download-library").onclick = async () => {
      try {
        const { MATCHLAB_PYTHON } = await import("./python-library.js");
        download("matchlab.py", MATCHLAB_PYTHON);
        toast(
          "Python-bibliotheek gedownload voor Thonny of een andere Python-editor.",
        );
      } catch {
        toast("De Python-bibliotheek kon niet worden geladen.");
      }
    };
  if ($("#download-report"))
    $("#download-report").onclick = () => {
      download(
        "matchlab-lesverslag.md",
        `# Matchlab — ${state.name}\n\n## Experiment\nTrainingsrondes: ${state.model.episodes}\nParameters: ${JSON.stringify(state.parameters)}\n\n${lessons.map((l) => `## ${l.title}\n${state.proofs[l.id] || "Nog geen uitwerking"}\n`).join("\n")}\n## Code\n\n\`\`\`python\n${state.code}\n\`\`\`\n`,
        "text/markdown",
      );
    };
}
$("#help-button").onclick = () => $("#help-dialog").showModal();
$("#close-help").onclick = () => $("#help-dialog").close();
$("#help-start").onclick = () => {
  $("#help-dialog").close();
  location.hash = "math";
};
window.addEventListener("hashchange", () => {
  render();
  window.scrollTo({ top: 0 });
});
window.addEventListener("resize", () => {
  drawChart();
  if (workspace) Blockly.svgResize(workspace);
});
window.addEventListener("beforeunload", save);
render();
