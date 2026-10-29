import {readFile,writeFile} from 'node:fs/promises';
let s=await readFile('js/app.js','utf8');
const replace=(a,b)=>{if(!s.includes(a))throw Error('Missing target: '+a.slice(0,100));s=s.replace(a,b);};
replace('import { lessons } from "./curriculum.js";','import { lessons } from "./curriculum.js";\nimport { programmingTasks } from "./programming-tasks.js";');
s=s.replace(/const STARTER = `[^`]*`;/,'const STARTER = programmingTasks[0].starter;');
replace('state.code = lessons[state.lessonIndex].python;','state.code = programmingTasks[state.lessonIndex].starter;');
replace('Twee werkplaatsen, ieder met je eigen bewaarde code.','Eén tactiek programmeren in circa tien minuten. Het raamwerk staat klaar.');
replace('<div class="callout green" style="margin-top:0"><strong>Jouw onderzoek: ${esc(lessons[state.lessonIndex].title)}</strong><br>${esc(lessons[state.lessonIndex].objective)}<br>Vertaal de tactiek naar een score per figuur. Test eerst je vaste regel; vergelijk daarna eventueel met q of q / cost.</div>','${renderProgrammingSprint()}');
replace('  <section class="training-panel"><div class="surface">','  <div id="validation-result"></div><section class="training-panel"><details id="training-options" class="advanced-training"><summary>Verdieping: trainen en leerparameters <span>OPTIONEEL</span></summary><div class="surface">');
replace('<div id="validation-result"></div><details><summary>Wat leren we precies?</summary>','<details><summary>Wat leren we precies?</summary>');
replace('</p></details></div></section></div>','</p></details></div></details></section></div>');
replace("['candidate[\"q\"]', \"De aangeleerde kansscore (tussen 0 en 1).\"],","['score', 'Hoger getal = dit figuur eerder inspecteren.'],");
replace("['candidate[\"frequency\"]', \"Modelkans in de gekozen oefenwereld.\"],","['kans', 'De gegeven modelkans; staat al in je startcode.'],");
replace("['candidate[\"cost\"]', \"Herkenningskosten (1 tot 1,7).\"],","['tijd', 'De gegeven herkenningskosten; lager is sneller.'],");
replace("['candidate[\"id\"]', \"Vast symboolnummer, van 0 t/m 56.\"],","['geleerd', 'De gegeven leerwaarde; alleen nodig bij tactiek 5.'],");
replace("    ['observation[\"checked\"]', \"Reeds geïnspecteerde symbolen.\"],\n",'');
replace('<p>De hoogste evaluate-score wordt het eerst geïnspecteerd. De engine voorkomt herhaling.</p>','<p>De imports, klasse en functie staan klaar, zoals in Fundamenta. Verander alleen de regels bij TODO. Je hoeft geen spel of leeralgoritme te schrijven.</p>');
replace('async function validateCode() {','async function validateCode(count = 300) {');
replace('$("#validate-button").onclick = validateCode;','$("#validate-button").onclick = () => validateCode();\n  $("#quick-compare").onclick = () => validateCode(100);\n  $("#load-programming-starter").onclick = loadProgrammingStarter;\n  $("#coding-task").onchange = (e) => { if(training)return; state.lessonIndex = Number(e.target.value); save(); render(); };');
replace('consoleOut("> 300 nieuwe kaartparen vergelijken met willekeurig zoeken…");','consoleOut(`> ${count} nieuwe kaartparen vergelijken met willekeurig zoeken…`);');
replace('      episodes: 300,','      episodes: count,');
replace('${v.count || 300} rondes','${v.count || count} rondes');
replace('    "reset-model",','    "reset-model",\n    "quick-compare",\n    "load-programming-starter",\n    "coding-task",');
const start=s.indexOf('function createDefaultBlocks() {');
const end=s.indexOf('function blocksToPython() {',start);
if(start<0||end<0)throw Error('Missing block scaffold target');
s=s.slice(0,start)+`function createDefaultBlocks() {
  const ret = workspace.newBlock('match_score');
  const value = workspace.newBlock('math_number');
  value.setFieldValue(0, 'NUM');
  ret.initSvg(); value.initSvg();
  ret.getInput('SCORE').connection.connect(value.outputConnection);
  value.render(); ret.render(); ret.moveBy(35, 40);
}
`+s.slice(end);
replace('evaluate programmeren in Python of blokken. Parameters, beloning en oefenwereld kiezen. Tussen programmeur en kritische meedenker wisselen.','Eén tactiek programmeren in Python of blokken: 2 minuten lezen, 4 minuten de TODO-regels invullen, 2 minuten testen en 2 minuten vergelijken en exporteren. Het raamwerk staat klaar. Zelf trainen en parameters aanpassen zijn verdieping.');
replace('<span class="eyebrow">LESOPZET · 3 × 50 MINUTEN</span>','<span class="eyebrow">LESOPZET · PROGRAMMEREN: 10 MINUTEN</span>');
const insert=s.indexOf('function renderLab() {');
s=s.slice(0,insert)+`function renderProgrammingSprint() {
  const task = programmingTasks[state.lessonIndex];
  return \`<section class="programming-sprint surface" aria-label="Programmeeropdracht van tien minuten">
    <div class="panel-top"><span class="eyebrow">VAN BEWIJS NAAR CODE</span><span class="badge">10 MINUTEN TOTAAL</span></div>
    <h2>Eén tactiek. Een paar regels Python.</h2>
    <p>Kies één van de vijf tactieken. De imports, klasse en functie staan klaar. Jij vult alleen de TODO-regels in: een score, een berekening of een korte if.</p>
    <ol class="sprint-steps"><li><b>0–2 min</b><span>Lees je tactiek</span></li><li><b>2–6 min</b><span>Verander de score</span></li><li><b>6–8 min</b><span>Test je agent</span></li><li><b>8–10 min</b><span>Vergelijk en exporteer</span></li></ol>
    <div class="sprint-choice"><div class="field"><label for="coding-task">Jouw keuzeopdracht</label><select id="coding-task">\${programmingTasks.map((t,i)=>\`<option value="\${i}" \${i===state.lessonIndex?'selected':''}>\${i+1}. \${esc(t.title)}</option>\`).join('')}</select></div><button class="button small" id="load-programming-starter">Laad startcode ↗</button></div>
    <p class="sprint-goal"><strong>Jouw wijziging:</strong> \${esc(task.goal)}</p>
    <details><summary>Een hint voor jouw score</summary><p>\${esc(task.hint)}</p></details>
    <details><summary>Wanneer is je opdracht af?</summary><ul>\${task.successCriteria.map(c=>\`<li>\${esc(c)}</li>\`).join('')}</ul><p>De startcode werkt al, maar de tactiek is nog niet ingevuld. Alleen op Test klikken maakt je implementatie nog niet compleet.</p></details>
    <div class="button-row"><button class="button lime" id="quick-compare">Vergelijk · 100 rondes ↗</button><button class="button ghost small" data-export>Exporteer je agent ↓</button></div>
    <small>Laad startcode vervangt de code in deze werkplaats. De vijf bewijzen vallen buiten dit programmeerblok. Trainen en hyperparameters zijn optioneel.</small>
  </section>\`;
}
function loadProgrammingStarter() {
  if(training)return;
  if(workspace){workspace.dispose();workspace=null;}
  state.code = programmingTasks[state.lessonIndex].starter;
  state.pythonCode = state.code;
  state.blockState = null;
  save();render();
  toast('Startcode geladen. Verander nu alleen de TODO-regels.');
}
`+s.slice(insert);
await writeFile('js/app.js',s);
