# Programmeren in tien minuten

De programmeeropdracht sluit aan op het niveau van de aangeleverde Fundamenta-voorbeelden: een getal toekennen, een eenvoudige berekening maken, eventueel één `if` gebruiken en een score teruggeven. Een hogere score betekent dat de agent een icoon eerder controleert.

Een tweetal kiest **één tactiek voor het hele programmeerblok van tien minuten**. De vijf programmeeropdrachten zijn alternatieven bij de vijf wiskundevragen; het is niet de bedoeling dat leerlingen vijf agents in tien minuten schrijven. De tijd voor het wiskundige onderzoek en de bewijsbespreking valt buiten deze tien minuten.

## Wat staat al klaar?

De import, de klasse `MijnAgent`, de methode `evaluate`, de parameters, het ophalen van de benodigde getallen en `return score` zijn ingevuld. De starter is uitvoerbaar met `score = 0`: er is nog geen eigen voorkeur. Een leerling vult één berekening in, of bij de eerste tactiek één `if` met één ingesprongen opdracht. Een docent kan de volledige oplossing apart gebruiken als hulp of nabespreking.

Leerlingen hoeven voor dit blok geen bibliotheek te installeren, geen lus of klasse te ontwerpen en geen leeralgoritme of geheugentabel te schrijven. De begrippen `observation` en `candidate` zijn onderdeel van het vaste raamwerk. Een leerling hoeft alleen te begrijpen wat de reeds opgehaalde variabele betekent.

| Tijd | Handeling | Concreet resultaat |
| --- | --- | --- |
| 0–2 min | Lees de gekozen tactiek en voorspel welk voorbeeldicoon voorrang krijgt. | Een voorspelling op basis van het bewijs. |
| 2–6 min | Wijzig het TODO-stuk in de starter en voer de code uit. | Eén eigen scoreregel die zonder foutmelding draait. |
| 6–8 min | Test de agent en controleer of de scoreregel bij het voorbeeld past. | Een vergelijking tussen voorspelling en gedrag. |
| 8–10 min | Vergelijk de uitkomst, leg de keuze in één zin uit en exporteer de agent. | Code en een korte onderbouwing om in te leveren. |

Voor tactiek 5 hoort een korte training bij het testen. De docent zet de standaardinstellingen vooraf klaar; leerlingen hoeven geen hyperparameters te kiezen om de basisopdracht af te ronden. Een lokale scorecontrole kan al aantonen dat de programmeerregel klopt. Een hogere winstscore is geen afvinkvoorwaarde: die hangt ook af van het kaartscenario en toeval.

## Keuze uit vijf kleine programmeeropdrachten

| Wiskundeles | Leerling voegt toe | Wat de regel betekent |
| --- | --- | --- |
| 01 · Geen dubbele checks | Eén `if` met een lagere score bij `al_gecontroleerd`. | Een bewezen onmogelijke match krijgt geen voorrang. De spelengine slaat gecontroleerde iconen al over; dit is een controle van de bewijsregel en geeft in de huidige engine geen extra prestatiewinst. |
| 02 · Eerst wat snel herkenbaar is | Eén expressie met `tijd`. | Bij gelijke kansen krijgt een kortere controletijd voorrang. |
| 03 · Kies de grootste modelkans | Eén toekenning met `kans`. | Bij gelijke kosten krijgt de grootste vooraf gegeven modelkans voorrang. Dit getal is geen leerresultaat. |
| 04 · Vind de beste verhouding | Eén expressie met `kans` en `tijd`. | De grootste kans per tijdseenheid krijgt voorrang. |
| 05 · Durf ook iets anders te proberen | Eén toekenning met `geleerd`. | De agent gebruikt zijn aangeleerde kansscore. De trainer regelt verkennen met epsilon. |

De kanstoets en het geschreven bewijs hebben ieder hun eigen functie. Een goed instapantwoord kiest de eerste programmeerroute; het bewijst niet automatisch dat een leerling zijn redenering beheerst. Leerlingen kunnen naar de andere route wisselen.

## Voorbeeld van het aangeboden raamwerk

```python
from matchlab import EvaluationAgent

class MijnAgent(EvaluationAgent):
    def evaluate(self, observation, candidate):
        kans = candidate["frequency"]
        tijd = candidate["cost"]
        # TODO: bereken de kans per tijdseenheid.
        score = 0
        return score
```

De leerling wijzigt hier alleen de waarde rechts van `score =`. Het doel is de bewezen tactiek vertalen naar een uitvoerbare keuzeregel, niet het uit het hoofd schrijven van Pythonstructuur. Beide variabelen zijn getallen; `tijd` is positief. In de blokkenroute kan dezelfde regel worden opgebouwd met een scoreblok en de bijbehorende getal- of rekenblokken.

## Docent: voorbereiding en beoordeling

Laad de website en Pythonruntime vóór het tijdblok, kies vooraf een kaartscenario en zorg dat het startgeheugen bij een vergelijking gelijk is. Gebruik voor de tijdsregel bij voorkeur het symmetrische scenario, zodat de aanname van gelijke matchkansen past. De kans- en leerregels zijn vooral te onderzoeken in de focuswereld. Een verandering van thema verandert in dit model niet automatisch de vooraf bepaalde herkenningskosten.

Beoordeel of de code draait, de scorevolgorde bij de tactiek past en de leerling die volgorde kan koppelen aan de wiskundige aanname. Voor tactiek 01 kan de docent de twee gevallen rechtstreeks laten uitleggen: reeds gecontroleerd en nieuw. Er zal geen verschil in zoektijd ontstaan, omdat de spelengine herhaling al voorkomt. Voor tactiek 05 zijn de geleerde scores bij een leeg geheugen gelijk; pas na training kunnen er verschillen zijn. Een vaste scoreregel met alleen `kans` of `tijd` verandert niet door trainen. Alleen als de leerling `geleerd` werkelijk gebruikt, kunnen nieuwe leerwaarden de inspectievolgorde beïnvloeden.

Trainingsaantal, leersnelheid alpha, exploratiekans epsilon, seeds, zelfgeschreven beloningsfuncties en langere vergelijkingen zijn **verdieping**. Het basisblok vraagt geen eigen lus met duizenden spellen en geen bibliotheekcode. Houd de training kort, vergelijk op nieuwe testkaarten en trek uit één korte run geen algemene conclusie over de beste agent.

De uitvoerbare starters, hints, oplossingen en succescriteria staan in `js/programming-tasks.js`. Het gebruik van een losse oplossingscode maakt zichtbaar welk werk de leerling zelf nog moet doen; een starter laadt geen complete strategie als voldongen uitkomst.
