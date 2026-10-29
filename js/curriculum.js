/**
 * Five formative entrances to a mathematical proof and an agent experiment.
 * A correct multiple-choice answer is not an automatically assessed proof.
 * Probabilities below belong to the explicitly stated classroom models.
 */
export const lessons = [
  {
    id: "01",
    kicker: "Kansrekening · geheugen",
    title: "Geen dubbele checks",
    context:
      "Je kaart heeft acht verschillende iconen. Precies één icoon staat ook op de andere kaart. In dit rekenmodel heeft elk van de acht iconen vooraf dezelfde kans om de match te zijn. Twee verschillende iconen zijn al gecontroleerd: allebei fout.",
    prompt:
      "Wat is nu de kans dat één nieuw, nog niet gecontroleerd icoon de match is?",
    options: [
      { id: "a", text: "1/8: de oorspronkelijke kans blijft gelijk" },
      { id: "b", text: "1/6: er blijven zes mogelijke matches over" },
      { id: "c", text: "2/8: er zijn twee iconen afgevallen" },
    ],
    correct: "b",
    explanation:
      "De twee foute iconen kunnen de match niet meer zijn. De zes resterende iconen zijn in dit model nog even waarschijnlijk: elk heeft kans 1/6. Een al afgekeurd icoon opnieuw controleren heeft kans 0.",
    proof:
      "Bewijs waarom opnieuw controleren niet helpt. Bereken daarna de kans om de match binnen drie controles te vinden als je nooit een icoon herhaalt. Vergelijk dit met drie onafhankelijke willekeurige keuzes waarbij herhaling wel is toegestaan. Leg uit welke aanname je gebruikt.",
    hint: "Zonder herhaling heeft de match acht even waarschijnlijke posities in je zoekvolgorde. Bij onafhankelijke keuzes met herhaling is de kans op drie missers (7/8)³.",
    rubric: [
      "Je benoemt één match, acht verschillende iconen en de aanname van gelijke kansen.",
      "Je onderbouwt zonder herhaling: P(raak binnen 3) = 3/8 = 37,5%.",
      "Je onderbouwt met herhaling: 1 − (7/8)³ = 169/512 ≈ 33,0%, en legt het verschil uit.",
    ],
    extension:
      "Bewijs dat het verwachte aantal controles zonder herhaling (1 + 2 + … + 8)/8 = 4,5 is. Wat verandert bij een kaart met n iconen?",
    objective:
      "Ik kan kansen na uitsluiten herberekenen en met een kansmodel bewijzen waarom de agent afgekeurde iconen moet onthouden.",
    python: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        if candidate["id"] in observation["checked"]:
            return -1_000_000
        return 0.0
`,
  },
  {
    id: "02",
    kicker: "Verwachtingswaarde · zichtbaarheid",
    title: "Eerst wat snel herkenbaar is",
    context:
      "Er zijn nog twee mogelijke matches, A en B. Beide hebben kans 1/2. Een controle van A duurt 0,2 seconde; een controle van B 0,8 seconde. Je stopt zodra je de match vindt. De tijden zijn een vereenvoudigd model van herkenbaarheid.",
    prompt: "Welke volgorde heeft de kleinste verwachte zoektijd?",
    options: [
      { id: "a", text: "A → B: gemiddeld 0,6 seconde" },
      { id: "b", text: "B → A: gemiddeld 0,6 seconde" },
      { id: "c", text: "Beide: gemiddeld 1,0 seconde" },
    ],
    correct: "a",
    explanation:
      "Bij A → B ben je met kans 1/2 na 0,2 s klaar, en met kans 1/2 na 1,0 s. Het gemiddelde is 0,6 s. Bij B → A wordt het 0,5 × 0,8 + 0,5 × 1,0 = 0,9 s.",
    proof:
      "Maak voor beide volgordes een kansentabel met de mogelijke stoptijden. Bewijs daarna voor willekeurige positieve controletijden a en b, met a < b en gelijke matchkansen, dat het snellere icoon eerst gemiddeld beter is. Is het snellere icoon ook altijd de juiste match?",
    hint: "Schrijf E(A → B) = a + 0,5b en E(B → A) = b + 0,5a. Trek de twee uitdrukkingen van elkaar af.",
    rubric: [
      "Je rekent met stoptijden: de tweede controle gebeurt alleen na een misser.",
      "Je vindt de verwachte tijden 0,6 s en 0,9 s.",
      "Je bewijst E(A → B) − E(B → A) = 0,5(a − b) < 0, en onderscheidt snelheid van matchkans.",
    ],
    extension:
      "Neem acht even waarschijnlijke iconen. Laat zien wat er gebeurt met de verwachte zoektijd wanneer je twee naast elkaar staande controles in de verkeerde tijdsvolgorde verwisselt.",
    objective:
      "Ik kan met een gewogen gemiddelde onderbouwen waarom mijn agent bij gelijke kansen snelle controles voorrang geeft.",
    python: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        if candidate["id"] in observation["checked"]:
            return -1_000_000
        return -candidate["cost"]
`,
  },
  {
    id: "03",
    kicker: "Data · kansverdeling",
    title: "Laat ervaring meetellen",
    context:
      "In een apart trainingsscenario zijn de mogelijke matches niet even waarschijnlijk. Op een bepaalde kaart is A met kans 0,50 de match en B met kans 0,20. De andere zes iconen delen samen kans 0,30. Iedere controle kost één stap. Vergelijk A → B → rest met B → A → dezelfde rest.",
    prompt:
      "Wat gebeurt er met het verwachte aantal controles als A vóór B komt?",
    options: [
      { id: "a", text: "Dat daalt met 0,30 controle per ronde" },
      { id: "b", text: "Dat daalt met 30 controles per ronde" },
      { id: "c", text: "Dat blijft gelijk: er zijn evenveel iconen" },
    ],
    correct: "a",
    explanation:
      "Als A de match is, bespaar je één stap: kans 0,50. Als B de match is, kost het één stap extra: kans 0,20. Voor de rest verandert niets. De gemiddelde besparing is 0,50 − 0,20 = 0,30 controle.",
    proof:
      "Bewijs met drie gevallen dat vaker voorkomende matches bij gelijke controletijd vóór minder waarschijnlijke matches moeten komen. Generaliseer je redenering naar kansen pA en pB. Leg ook uit waarom een patroon in trainingsdata geen bewijs is dat dezelfde verdeling bij nieuwe kaarten geldt.",
    hint: "Vergelijk alleen de gevallen “A is de match”, “B is de match” en “een ander icoon is de match”. Voor het derde geval hebben beide volgordes dezelfde kosten.",
    rubric: [
      "Je benoemt de winst van één stap bij A en het verlies van één stap bij B.",
      "Je leidt een verwachte besparing pA − pB af en verbindt de conclusie aan gelijke kosten.",
      "Je onderscheidt de aangenomen kansverdeling van een schatting uit training en noemt testen op nieuwe data.",
    ],
    extension:
      "Een eerlijk, volledig symmetrisch kaartspel geeft ieder icoon op je kaart dezelfde matchkans. Voorspel wat frequentieleren dan op de lange duur wel en niet kan verbeteren.",
    objective:
      "Ik kan een prioriteitsregel uit matchkansen afleiden en de beperking van een kansschatting uit trainingsdata uitleggen.",
    python: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        if candidate["id"] in observation["checked"]:
            return -1_000_000
        # Bekende modelkans als referentie voor je voorspelling.
        # Vervang frequency door q om de geleerde schatting te testen.
        return candidate["frequency"]
`,
  },
  {
    id: "04",
    kicker: "Bewijzen · kans per seconde",
    title: "Vind de beste verhouding",
    context:
      "A heeft matchkans 0,40 en controletijd 1,2 s. B heeft matchkans 0,20 en controletijd 0,3 s. De andere iconen delen kans 0,40. Je vergelijkt A → B → rest met B → A → dezelfde rest. Controlekosten zijn positief en de kansen staan vooraf vast.",
    prompt:
      "Welk icoon moet eerst om de verwachte totale zoektijd te verkleinen?",
    options: [
      { id: "a", text: "A: de grootste matchkans gaat altijd voor" },
      { id: "b", text: "B: 0,20 / 0,3 is groter dan 0,40 / 1,2" },
      { id: "c", text: "Beide zijn even goed: A heeft een dubbele kans" },
    ],
    correct: "b",
    explanation:
      "Vergelijk kans per seconde: A geeft 1/3 en B 2/3. B eerst verlaagt de verwachte zoektijd met 0,20 × 1,2 − 0,40 × 0,3 = 0,12 s. De hoogste kans alleen is dus niet genoeg bij ongelijke kosten.",
    proof:
      "Bewijs de kans-per-kostregel. Gebruik de drie gevallen A match, B match en andere match. Toon aan dat A eerst minstens zo goed is als B eerst precies wanneer pA × cB ≥ pB × cA. Deel daarna door de positieve kosten en vertaal dit naar agentcode.",
    hint: "E(A → B) − E(B → A) = pB × cA − pA × cB. De bijdrage van alle latere iconen valt weg, omdat je bij beide volgordes eerst cA + cB betaalt.",
    rubric: [
      "Je houdt rekening met de mogelijkheid dat de match na A en B komt; die bijdrage is in beide volgordes gelijk.",
      "Je leidt pB × cA − pA × cB af en kiest de juiste richting van de ongelijkheid.",
      "Je concludeert: sorteer op aflopende p/c, met positieve kosten en kansen die niet door de volgorde veranderen.",
    ],
    extension:
      "Bereken de verhouding voor alle acht iconen van een eigen voorbeeldkaart. Wat gebeurt er als het kaartthema verandert en daarmee de herkenbaarheid?",
    objective:
      "Ik kan met een verwisselargument de regel kans gedeeld door controletijd bewijzen en als evaluatiefunctie programmeren.",
    python: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        if candidate["id"] in observation["checked"]:
            return -1_000_000
        # Referentie met bekende modelkans; vergelijk ook q / cost.
        return candidate["frequency"] / candidate["cost"]
`,
  },
  {
    id: "05",
    kicker: "Reinforcement learning · exploratie",
    title: "Durf ook iets anders te proberen",
    context:
      "Een lerende agent heeft acht beschikbare iconen en één daarvan heeft nu de hoogste geleerde score. Met kans ε = 0,20 verkent hij: hij kiest dan uniform uit alle acht, inclusief zijn huidige favoriet. Met kans 0,80 kiest hij direct zijn favoriet. Dit heet ε-greedy.",
    prompt:
      "Wat is de kans dat de agent bij zijn eerste keuze toch zijn huidige favoriet kiest?",
    options: [
      { id: "a", text: "80%: alleen de gerichte keuze telt mee" },
      { id: "b", text: "82,5%: 0,80 + 0,20 × 1/8" },
      { id: "c", text: "100%: de hoogste score wint altijd" },
    ],
    correct: "b",
    explanation:
      "De favoriet kan langs twee disjuncte routes gekozen worden: direct, of tijdens verkennen. De totale kans is 0,80 + 0,20/8 = 0,825. Ieder ander icoon heeft kans 0,20/8 = 0,025.",
    proof:
      "Teken een kansboom en bewijs de formule P(favoriet) = 1 − ε + ε/n voor n beschikbare iconen. Bereken voor 200 eerste keuzes het verwachte aantal keuzes voor de favoriet en voor één vast ander icoon. Ontwerp daarna een eerlijke vergelijking van twee ε-waarden: wat houd je gelijk, en welke nieuwe kaarten gebruik je?",
    hint: "Verkennen kan dezelfde keuze opleveren als uitbuiten. Een verwachting is kans × aantal; een concrete reeks hoeft die aantallen niet precies te halen. Train en vergelijk niet op dezelfde verzameling kaarten.",
    rubric: [
      "Je telt de twee routes op en leidt 1 − ε + ε/n af; de kansen over alle iconen tellen op tot 1.",
      "Je vindt 165 verwachte favorietkeuzes en 5 voor één specifiek ander icoon uit 200 eerste keuzes.",
      "Je houdt trainingsbudget, startwaarden, kaartscenario en testseed gelijk, gebruikt nieuwe testkaarten en benoemt toevalsvariatie.",
    ],
    extension:
      "Laat de agent eerst veel en later minder verkennen. Welke extra aanname heb je nodig om te verwachten dat dit beter werkt? Vergelijk meerdere vooraf gekozen seeds.",
    objective:
      "Ik kan exploratie met een kansboom verklaren en een reproduceerbaar experiment ontwerpen om een geleerde strategie te beoordelen.",
    python: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        if candidate["id"] in observation["checked"]:
            return -1_000_000
        q = observation["memory"].get("q", {})
        return q.get(candidate["id"], 0.0)

# Exploratie is een instelling van de trainer (epsilon).
# evaluate geeft de geleerde score; de trainer kiest soms willekeurig.
`,
  },
];
