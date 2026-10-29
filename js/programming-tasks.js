/**
 * Five short programming puzzles, aligned with the math lessons.
 * A pair chooses ONE task for its programming slot. The import, class, method,
 * field access and return are supplied; students change the TODO section only.
 * Starters deliberately score every candidate equally and are valid Python.
 */
export const programmingTasks = [
  {
    lessonId: "01",
    title: "Sla een afgekeurd icoon over",
    goal: "Een gecontroleerd figuur mag geen prioriteit krijgen. Gebruik een if en geef het een lagere score.",
    starter: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        al_gecontroleerd = candidate["id"] in observation["checked"]
        score = 0
        # TODO: geef een al gecontroleerd icoon een lagere score.
        return score
`,
    hint: "Gebruik if al_gecontroleerd: en zet daaronder, met vier extra spaties, een opdracht die score negatief maakt. De score van een nieuw icoon blijft 0.",
    solution: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        al_gecontroleerd = candidate["id"] in observation["checked"]
        score = 0
        if al_gecontroleerd:
            score = -1
        return score
`,
    successCriteria: [
      "Mijn code draait zonder foutmelding.",
      "Een gecontroleerd icoon krijgt een lagere score dan een nieuw icoon.",
      "Ik leg uit waarom deze regel in de huidige spelengine geen extra prestatiewinst geeft: gecontroleerde iconen worden al niet opnieuw aangeboden.",
    ],
    example: {
      input: "A is al gecontroleerd; B is nog niet gecontroleerd.",
      expected:
        "Bijvoorbeeld: score(A) = -1 en score(B) = 0, dus B krijgt voorrang.",
    },
    estimatedMinutes: 10,
  },
  {
    lessonId: "02",
    title: "Laat het snelste icoon voorgaan",
    goal: "Een snelle controle is handig. Geef een kortere herkenningstijd een hogere score.",
    starter: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        tijd = candidate["cost"]
        # TODO: een kleinere tijd moet een hogere score krijgen.
        score = 0
        return score
`,
    hint: "De agent kiest de hoogste score. Welke is hoger: -0.2 of -0.8? Je kunt een getal van teken laten veranderen met een minteken.",
    solution: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        tijd = candidate["cost"]
        score = -tijd
        return score
`,
    successCriteria: [
      "Mijn code draait zonder foutmelding.",
      "Het icoon met de kleinste tijd krijgt de hoogste score.",
      "Ik verbind mijn regel aan het bewijs: snelste eerst is hier gunstig als de matchkansen gelijk zijn.",
    ],
    example: {
      input: "A: tijd = 0.2; B: tijd = 0.8. Beide zijn even waarschijnlijk.",
      expected:
        "Bijvoorbeeld: score(A) = -0.2 en score(B) = -0.8, dus A krijgt voorrang.",
    },
    estimatedMinutes: 10,
  },
  {
    lessonId: "03",
    title: "Laat de grootste kans voorgaan",
    goal: "Gebruik de kans die al bij elk figuur staat. De grootste kans krijgt de hoogste score.",
    starter: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        kans = candidate["frequency"]
        # TODO: een grotere kans moet een hogere score krijgen.
        score = 0
        return score
`,
    hint: "Je hebt de kans al als getal. Welke waarde kan score krijgen zodat een kans van 0.50 hoger eindigt dan een kans van 0.20?",
    solution: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        kans = candidate["frequency"]
        score = kans
        return score
`,
    successCriteria: [
      "Mijn code draait zonder foutmelding.",
      "Het icoon met de grootste kans krijgt de hoogste score.",
      "Ik benoem de aanname uit mijn bewijs: de controles kosten evenveel. Deze kans komt uit het gekozen rekenmodel en is geen aangeleerde score.",
    ],
    example: {
      input: "A: kans = 0.50; B: kans = 0.20. De controletijden zijn gelijk.",
      expected: "score(A) = 0.50 en score(B) = 0.20, dus A krijgt voorrang.",
    },
    estimatedMinutes: 10,
  },
  {
    lessonId: "04",
    title: "Programmeer kans per seconde",
    goal: "Maak een slimme verhouding: kans gedeeld door herkenningstijd.",
    starter: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        kans = candidate["frequency"]
        tijd = candidate["cost"]
        # TODO: bereken de kans per tijdseenheid.
        score = 0
        return score
`,
    hint: "Een snelheid zoals kilometer per uur bereken je door te delen. Gebruik in Python / voor delen en zet kans en tijd in de volgorde van je bewezen verhouding.",
    solution: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        kans = candidate["frequency"]
        tijd = candidate["cost"]
        score = kans / tijd
        return score
`,
    successCriteria: [
      "Mijn code draait zonder foutmelding.",
      "Mijn score gebruikt zowel kans als tijd en geeft de grootste verhouding voorrang.",
      "Ik kan met een voorbeeld uitleggen waarom de grootste kans niet altijd de beste eerste keuze is.",
    ],
    example: {
      input: "A: kans = 0.40, tijd = 1.2; B: kans = 0.20, tijd = 0.3.",
      expected: "score(A) ≈ 0.33 en score(B) ≈ 0.67, dus B krijgt voorrang.",
    },
    estimatedMinutes: 10,
  },
  {
    lessonId: "05",
    title: "Gebruik wat je agent geleerd heeft",
    goal: "Gebruik de geleerde beloning. De trainer geeft een punt als de eerste keuze raak is; jij gebruikt die ervaring.",
    starter: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        geleerd = candidate["q"]
        # TODO: laat de aangeleerde kansscore meetellen.
        score = 0
        return score
`,
    hint: "geleerd bevat al een getal uit het leergeheugen. Gebruik dit als score. Voor de eerste training zijn alle geleerde scores gelijk; er is dan nog geen voorkeur.",
    solution: `from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        geleerd = candidate["q"]
        score = geleerd
        return score
`,
    successCriteria: [
      "Mijn code draait zonder foutmelding en gebruikt de variabele geleerd.",
      "Een icoon met een hogere geleerde kansscore krijgt voorrang als de agent zijn kennis gebruikt. Tijdens training kan de trainer ook een willekeurige eerste inspectie kiezen.",
      "Ik vergelijk vóór en na een korte training met nieuwe testkaarten. Ik weet dat training geen garantie op verbetering geeft en dat de scores bij de start gelijk zijn.",
    ],
    example: {
      input: "Na training: A heeft geleerd = 0.60 en B heeft geleerd = 0.10.",
      expected:
        "score(A) = 0.60 en score(B) = 0.10, dus bij gebruik van zijn kennis kiest de agent A eerst.",
    },
    estimatedMinutes: 10,
  },
];
