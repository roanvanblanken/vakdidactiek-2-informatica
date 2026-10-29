# Ontwerponderzoek Matchlab

Onderzocht op 29 oktober 2026. Dit is de ontwerp- en UX-helft van het verzoek om minstens 50 websites te onderzoeken. De technische helft staat apart.

## Methode en aantallen

Er zijn 36 verschillende websites/domeinen daadwerkelijk met de webbrowsertool geopend, dus niet alleen gevonden in zoekresultaten. Van **27 verschillende domeinen** was voldoende primaire inhoud leesbaar om hieronder concrete observaties en ontwerpbeslissingen vast te leggen. Zeven andere websites leverden alleen een JavaScriptmelding of geen bruikbare inhoud; twee verzoeken mislukten. Die negen tellen niet mee als inhoudelijk onderzochte website.

Het onderzoek betreft de opgehaalde inhoud, navigatie, informatiehiërarchie, expliciete productbeschrijvingen en beschrijvingen van productafbeeldingen. Het is geen volledige gerenderde schermafbeeldingsaudit, contrastmeting of interactietest van deze 25 producten. Visuele voorstellen hieronder zijn onze eigen ontwerpinterpretatie. Er worden geen logo's, illustraties, sprites, teksten of andere beschermde productassets gekopieerd. Eventuele instructies in webpagina's zijn als broninhoud behandeld.

## De 27 inhoudelijk onderzochte websites

| # | Website en daadwerkelijk geopende URL | Waargenomen in de bron | Toepassing voor Matchlab |
|---|---|---|---|
| 1 | [Brilliant](https://brilliant.org/) | De pagina koppelt wiskunde aan programmeren, beschrijft begeleidende vragen en een gedeeld interactief canvas, en legt uit dat een beoordeling de volgende leerstap kan aanpassen. Ook wordt voortgang expliciet gekoppeld aan wat al beheerst wordt. | Zet het redeneren naast de kaart die leerlingen onderzoeken. Laat een hint een volgende denkstap geven. Toon vijf inhoudelijke stappen met hun status, en laat de route na de beslisvraag rustig en positief verschijnen. |
| 2 | [Codecademy](https://www.codecademy.com/) | De productuitleg onderscheidt een instructiepaneel, een code-editor en een uitvoerpaneel. Browsercode schrijven en direct testen staan centraal. De cursuskaarten vermelden onder andere niveau en tijd. | Een rustige werkbank met opdracht, editor en uitvoer. Een taak krijgt een doel, verwachte inspanning en concrete toets. Eén zichtbare knop voert uit; fouten verschijnen bij de uitvoer. |
| 3 | [Nicky Case](https://ncase.me/) | De site ordent projecten in spelen, lezen en kijken. De projecten gebruiken speelse situaties om onderwerpen als speltheorie en simulatie toegankelijk te maken. Het taalgebruik is informeel en persoonlijk. | Geef de wiskunde een direct speelbaar voorbeeld. Humor zit in originele icoontjes en kleine zinnen, zonder de leerling als kind aan te spreken. |
| 4 | [Red Blob Games](https://www.redblobgames.com/) | De maker beschrijft interactieve visuele uitleg van wiskunde en algoritmen vanuit spelvoorbeelden. De pagina verwijst naar gekoppelde tekst- en diagrammarkering, aanpasbare waarden en responsieve diagrammen. | Laat een geselecteerde tactiek dezelfde figuren in beide kaarten markeren. Maak een voorbeeld stap voor stap inspecteerbaar. De visualisatie blijft naast de korte redenering, zodat leerlingen niet tussen losse schermen hoeven te zoeken. |
| 5 | [Mathigon](https://mathigon.org/) | De landingspagina biedt manipuleerbare wiskunde, patronen, probleemoplossen en tools binnen een duidelijk geordende collectie. Nederlands is aanwezig in de taalselectie. De pagina heeft een aparte ingang voor docenten. | Maak één Nederlandse leeromgeving met een zelfstandige docentenhandleiding. Presets voelen als een gereedschapscollectie, terwijl elke wiskundetaak een eigen compacte plek heeft. |
| 6 | [Explorable Explanations](https://explorabl.es/) | De leesbare pagina introduceert leren door spelen en ordent de collectie op onderwerp en op zelf maken. De dynamische projectlijst zelf was niet beschikbaar zonder JavaScript. | Leerlingen wisselen af tussen voorspellen, uitproberen en uitleggen. Geef een korte uitnodiging tot experimenteren voordat een formule verschijnt. Geen claims over de ongelezen projectlijst. |
| 7 | [Seeing Theory, Brown University](https://seeing-theory.brown.edu/) | De site noemt zich een visuele introductie tot kansrekening en statistiek. Hoofdstukken hebben duidelijke onderdelen, waaronder kansgebeurtenissen, verwachtingswaarde, tellen en voorwaardelijke kans. De bron meldt expliciet dat het een archief is. | Elke van de vijf vragen koppelt één kans- of telidee aan één agenttactiek. Een klein diagram helpt eerst; de formule krijgt daarna een plek in dezelfde kaart. Het archief is inspiratie, geen actuele softwarekeuze. |
| 8 | [Setosa Explained Visually](https://setosa.io/ev/) | De index bundelt korte visuele verklaringen van lastige ideeën, waaronder Markovketens en voorwaardelijke kans. Het project presenteert een concrete vraag per onderwerp. De zichtbare artikelen zijn ouder materiaal. | Gebruik per vraag een korte titel en één centrale beslissing. Maak geen lange theoretische syllabus in de interface; aanvullende theorie kan openklappen. |
| 9 | [Observable](https://observablehq.com/) | De productpagina legt nadruk op een snelle terugkoppellus, code verdeeld in begrijpelijke cellen, zichtbare waarden naast de code en uitleg tussen grafieken en code. Ook eigenaarschap en exporteerbare bestanden worden expliciet genoemd. | Toon na iedere uitvoering herkenbare agentkeuzes en meetwaarden. Een geëxporteerde agent bevat ook de gekozen tactiek en uitleg. Houd code, gedrag en trainingsgrafiek dicht bij elkaar. |
| 10 | [Code.org / CodeAI](https://code.org/en-US) | De pagina maakt doelgroepen en curricula expliciet, waaronder bovenbouwprogramma's. De beschrijving van leren over AI richt zich op begrijpen, bevragen en maken. Docenten hebben een eigen ingang. De geopende root werd naar deze pagina geleid. | Schrijf het doel bovenaan in leerlingentaal: bewijs een tactiek, bouw je agent en meet wat die leert. Voeg een docentenpaneel toe met leerdoelen en klassikale werkvorm. |
| 11 | [Scratch Foundation](https://www.scratchfoundation.org/home) | De geopende Scratch-over-pagina leidde hierheen. De bron beschrijft sleepbare blokken die in elkaar klikken, eigen geüploade of getekende assets en projecten remixen. De nadruk ligt op zelf maken en experimenteren. | De Blokkenstudio moet echt een wijzigbaar programma opleveren. Bied eigen symbolen en presets, een reset naar een werkend begin en een deelbaar bestand. Gebruik een eigen volwassen vormgeving voor blokken en paneel. |
| 12 | [Microsoft MakeCode](https://www.microsoft.com/en-us/makecode) | makecode.com leidde naar deze productpagina. Er is een expliciete overgang van blokken naar JavaScript en Python; een afgebeelde schakelaar ondersteunt die keuze. Tutorials en vaardigheidsroutes geven structuur. | Gebruik dezelfde begrippen en agent-API in beide routes. Laat blokken en Python dezelfde tactiek uitdrukken, zodat leerlingen de overstap kunnen begrijpen. Presenteer de routes als twee werkbanken met dezelfde eindopdracht. |
| 13 | [micro:bit](https://microbit.org/) | De pagina biedt beginnersstappen, docentenmateriaal, MakeCode, Python en een klasomgeving. Ze legt uit dat de juiste programmeeromgeving afhangt van ervaring. Projecten krijgen concrete doelen. | Toon een duidelijke aanbevolen route, houd hulp dichtbij en verberg de mogelijkheid om verder te groeien niet. Geef een export die zonder account naar de docent kan. |
| 14 | [Replit](https://replit.com/) | De site begint met één centrale maakactie en biedt voorbeelden en verschillende soorten projecten. De productpagina benadrukt experimenteren, uitvoeren en een geïntegreerde werkruimte. | De eerste pagina moet meteen naar een echte activiteit leiden. Geef een bruikbare voorbeeldagent, geen leeg editorvlak. Beperk de werkbank tot wat voor deze les nodig is. |
| 15 | [Linear](https://linear.app/) | De productpagina toont werkruimten, compacte navigatie, statussen en voortgang in een concrete applicatiecontext. De tekst benadrukt focus en snelheid. | Een vaste zijbalk geeft oriëntatie, de inhoud krijgt de meeste ruimte en een compact statusblok toont opgeslagen voortgang. Gebruik kleine badges functioneel, bijvoorbeeld voor de actieve route en het trainingsresultaat. |
| 16 | [Vercel](https://vercel.com/) | De pagina heeft een uitgesproken hoofdtitel, primaire actie en geordende productgroepen met concrete toepassingsvoorbeelden. Het begin bevat een interactieve deployment-ingang. | Maak de opening herkenbaar en eigen: één grote claim, één hoofdactie en een echte demonstratie van de kaarten. Houd beheer- en exportacties uit de hoofdactiehiërarchie. |
| 17 | [Stripe](https://stripe.com/en-be) | De site ordent veel functionaliteit in duidelijke modules en gebruikt meetwaarden met context. De opgehaalde pagina combineert productvoorbeelden met korte verklaringen. | Toon trainingsresultaten als betekenisvolle getallen: winstpercentage, gemiddelde zoektijd en aantal uitgevoerde rondes. Vermeld de basis waarop een getal berekend is, zodat een score geen versiering wordt. |
| 18 | [Lichess](https://lichess.org/) | De startpagina onderscheidt spelen, oefenen, leren, analyseren en een computer uitdagen. Een toegankelijkheidsoptie is direct beschikbaar. Spelimport heeft een eigen plek bij de tools. | Scheid oefenen en meten: een Arena met heldere spelstatus en een Lab voor inspectie. Houd de computeruitdaging direct bereikbaar. Maak de importroute expliciet en geef het spel toetsenbordbediening. |
| 19 | [itch.io](https://itch.io/) | De pagina toont browsen via tags, collecties en kaarten met korte beschrijvingen. De bron onderscheidt onder meer browsergames en simulaties. Er is een directe maak-/uploadingang. | Presets krijgen een duidelijke naam, een visueel voorbeeld en een korte sfeerbeschrijving. Gebruik compacte filters en een zichtbare selectie; laat de leerling weten hoeveel symbolen nog nodig zijn. |
| 20 | [Exercism](https://exercism.org/) | De bron beschrijft oefenen met concrete programmeerproblemen, een browser-editor en automatische analyse met verbeterpunten. De oefeningen worden als herkenbare kleine opdrachten gepresenteerd. | Laat de agent eerst een betekenisvolle test doorlopen: geeft hij een geldig symbool terug, klopt de match en stopt hij op tijd? Koppel iedere fout aan een volgende herstelactie. |
| 21 | [Figma](https://www.figma.com/) | De productpagina ordent maken, ontwerpen en bouwen rond één werkruimte. Zichtbare hulpmiddelcollecties bevatten componenten, iconen, sjablonen en kleur-/lettertypetools. De bron beschrijft consistente ontwerpcontext. | Een samenhangend eigen ontwerpsysteem voor kaarten, knoppen, tabs, statussen en symbolen. Preseticonen komen uit één eigen tekenstijl en blijven op dezelfde basisvormen en lijngewichten gebouwd. |
| 22 | [W3C WAI: paginastructuur](https://www.w3.org/WAI/tutorials/page-structure/) | De primaire richtlijn adviseert herkenbare paginaonderdelen, betekenisvolle labels, logisch geneste koppen en geschikte HTML-elementen. Ze licht voordelen voor toetsenbord-, schermlezer- en mobiele gebruikers toe. | Semantische header/nav/main, een skiplink, labels voor alle inputs en echte knoppen voor symbolen. Presets, opties en spelstatus zijn ook in tekst herkenbaar. |
| 23 | [Nielsen Norman Group: voortgang](https://www.nngroup.com/articles/progress-indicators/) | Het artikel behandelt directe terugkoppeling, het verschil tussen onbepaalde activiteit en afgemeten voortgang, aantallen stappen, verklarende tekst en een stopmogelijkheid. De bron bevat ook specifieke aandacht voor spel-/laadverwarring bij kinderen. | Training toont echte verwerkte episodes ten opzichte van een gekozen totaal, met een stopknop en actuele meetwaarden. Geen neppercentages en geen extra minispel tijdens het laden. Het artikel is uit 2014; het principe is als UX-inspiratie gebruikt. |
| 24 | [GOV.UK Design System](https://design-system.service.gov.uk/components/) | De openbare componentcollectie bevat onder meer radiogroepen, fieldsets, foutmeldingen, samenvattingen, bestandsupload, tabs, tags en takenlijsten met gebruiksuitleg en voorbeelden. | Herkenbare, rustige formulierinteractie. Fouten staan bij het veld, de vijf vragen hebben duidelijke statussen en bestandimport krijgt een begrijpelijke melding. De visuele stijl van Matchlab blijft eigen. |
| 25 | [Polypad, Amplify](https://polypad.amplify.com/) | De pagina biedt manipuleerbare wiskundetools, expliciete deelopties en een activiteitnaam. Ze beschrijft gebruik zonder installatie of login en toont gereedschappen zoals kansinstrumenten, logische poorten en functiemachines. De toepassing zelf is dynamisch; de product- en deelinformatie was leesbaar. | Maak het begin direct bruikbaar zonder account. Naam, export en import horen bij het leerlingwerk. Geef de docent een volledig bestand met code, route, bewijsantwoorden en metingen. |
| 26 | [Framer](https://www.framer.com/) | De productpagina toont een canvas met een werkbalk, paginastructuur en assets. Desktop- en tabletweergaven hebben expliciete breedtes. Aanpassen van lettertypen, componenten, breakpoints en effecten wordt als samenhangend proces beschreven. | Ontwerp niet alleen een losse desktopopening: dezelfde kaarten, knoppen en route moeten bewust meeschalen. De symboolkiezer en de werkbank delen hun gereedschapstaal en blijven op tablet begrijpelijk. |
| 27 | [Are.na](https://www.are.na/) | De pagina beschrijft verzamelen, ordenen, zoeken en verbinden als een korte opeenvolging. Collecties zijn benoemd, bewerkbaar en doorzoekbaar. De site noemt bewust gekozen inhoud en vermeldt een eigen lettertype in het colofon. De zichtbare editorial-voorbeelden zijn placeholders en zijn niet als echte artikelen onderzocht. | Laat leerlingen bewust een eigen collectie symbolen samenstellen en deze een naam geven. Houd de interface eigen en geef hun keuzes overzichtelijk terug, zonder een eindeloze aanbevelingsfeed. |

## Onafhankelijke gecombineerde bronnentelling

Na vergelijking met `research-technical.md`: de technische tabel bevat 28 verschillende succesvolle hostnamen. Conservatief worden de drie afzonderlijke GitHub Pages-hosts (`observablehq.github.io`, `liorsinai.github.io` en `deeplearning-jupyterbook.github.io`) als één groep `github.io` geteld, zodat er 26 technische domeingroepen zijn. De ontwerptabel bevat 27 verschillende domeingroepen. Alleen `w3.org` staat in beide rapporten. De gezamenlijke telling is dus **52 unieke domeingroepen: 27 + 26 − 1**. Er zijn samen 55 inhoudelijk beoordeelde tabelregels. Subpagina's en niet-leesbare pogingen verhogen deze telling niet.

De 27 ontwerpdomeinen zijn: `brilliant.org`, `codecademy.com`, `ncase.me`, `redblobgames.com`, `mathigon.org`, `explorabl.es`, `brown.edu`, `setosa.io`, `observablehq.com`, `code.org`, `scratchfoundation.org`, `microsoft.com`, `microbit.org`, `replit.com`, `linear.app`, `vercel.com`, `stripe.com`, `lichess.org`, `itch.io`, `exercism.org`, `figma.com`, `w3.org`, `nngroup.com`, `service.gov.uk`, `amplify.com`, `framer.com` en `are.na`.

De 25 aanvullende technische domeingroepen zijn: `pyodide.org`, `blockly.com`, `github.com`, `mozilla.org`, `web.dev`, `vite.dev`, `vitest.dev`, `python.org`, `farama.org`, `pytorch.org`, `tensorflow.org`, `sagemath.org`, `testing-library.com`, `emscripten.org`, `webassembly.org`, `whatwg.org`, `github.io`, `probabilitycourse.com`, `statlect.com`, `petercollingridge.co.uk`, `jmlr.org`, `playwright.dev`, `jsdelivr.com`, `slo.nl` en `thewessens.net`. De technische W3C-bron is bij de overlap verwerkt.

## Negen pogingen buiten de telling

| Website | Resultaat van de daadwerkelijke opening |
|---|---|
| https://www.duolingo.com/ | Alleen een iframeverwijzing; geen beoordeelbare productinhoud. |
| https://www.khanacademy.org/ | Geen leesbare inhoud in de tool. |
| https://www.desmos.com/ | Geen leesbare inhoud in de tool. |
| https://codecombat.com/ | Geen leesbare inhoud in de tool. |
| https://blockly.games/ | Alleen de melding dat JavaScript vereist is. |
| https://monkeytype.com/ | Alleen JavaScript-/CSS-herstelmeldingen; geen beoordeelde interface. |
| https://m3.material.io/ | Alleen de melding dat JavaScript vereist is. |
| https://www.typeracer.com/ | De URL was niet toegankelijk via de tool. |
| https://jiki.io/ | Ophalen mislukte met een time-out. |

Ook vier afbeeldinglinks vanuit productpagina's zijn geopend: de instructiepaneelafbeelding van Codecademy, een Linear-productafbeelding en een Polypad-voorbeeld werden opgehaald; een Figma-afbeelding mislukte. Dit voegt geen websites toe en wordt niet voorgesteld als een complete visuele audit.

## Eigen ontwerpvoorstel

### Sfeer en vorm

**Matchlab** wordt een speelbaar onderzoekslab voor 4 vwo. De toon is direct en licht droog: leerlingen ontwerpen een tegenstander, bewijzen een tactiek en proberen die te verslaan. Het visuele uitgangspunt is een warm, rustig werkblad met opvallende spelobjecten: achtergrond `#F5F3ED`, diepe inkt `#172B2A`, helder lime `#DDF566` voor de hoofdactie en zacht paars `#7562DE` voor de agent. Dit zijn voorgestelde eigen kleuren; contrastwaarden moeten in de implementatie worden gecontroleerd.

Een ruime opening heeft een grote titel, een korte lesbelofte en twee grote, echte kaarten als demonstratie. Kleine labels zoals `4 VWO`, `WISKUNDE × INFORMATICA` en `5 MISSIES` geven context. De kaarten en symbolen dragen het karakter; de rest van de interface blijft rustig. Een paars verloop of grote decoratieve AI-afbeelding is niet nodig.

Gebruik een krachtige sans-serif voor titels, een rustig leeslettertype voor instructies en monospace alleen waar de inhoud code of een meetwaarde is. Hoekafronding is beperkt en consistent. Een kaart is een spelkaart; een instructiepaneel krijgt een andere, rustigere rand. Zo wordt het geen scherm vol onderling uitwisselbare witte vakjes.

### De route door de les

De zijbalk bevat vier duidelijke plekken: **Bewijs**, **Bouw**, **Train** en **Arena**. Binnen Bewijs staan de vijf opdrachten met `nog doen`, `bezig` of `afgerond`. Het actieve scherm heeft één duidelijke hoofdactie. Een compacte opgeslagen-status geeft vertrouwen dat werk behouden blijft.

Elke vraag volgt dezelfde herkenbare structuur: tactiek, concrete kaart-/kanssituatie, voorspelling, antwoord met korte redenering en gerichte terugkoppeling. Een simulatie ondersteunt het nadenken, maar wordt niet als bewijs gepresenteerd. De agenttactiek uit de vraag krijgt dezelfde naam in de codeomgeving.

Na de beslisvraag verschijnen **Python Studio** of **Blokkenstudio** als aanbevolen werkruimte. Beide leiden tot dezelfde agentopdracht. Labels als 'zwak', 'makkelijk' of 'fout niveau' komen niet voor. De leerling begrijpt welke ondersteuning aangeboden wordt en kan later verder groeien.

### De werkbank

Op een brede laptop: korte opdracht links, editor in het midden, kaart-/uitvoervoorbeeld rechts. De actieve code kan direct getest worden op een klein aantal herkenbare kaartparen. Het resultaat meldt wat de agent koos en waarom dat geldig of ongeldig is. Op een smal scherm worden Opdracht, Code/Blokken en Uitvoer tabs; het spel blijft zonder horizontaal scrollen bruikbaar.

De Blokkenstudio gebruikt slepen en vastklikken, duidelijke categorieën en begrijpelijke Nederlandse labels. Het geproduceerde programma moet zichtbaar inspecteerbaar blijven. Een werkend beginvoorbeeld helpt leerlingen eerst één tactiek te veranderen. Fouten geven concreet aan wat hersteld moet worden.

### Trainen en spelen

Training laat de gekozen tactiek, het aantal verwerkte episodes, de gemiddelde beloning en een kleine echte grafiek zien. `348 / 1.000 rondes` is begrijpelijker dan een onverklaarde spinner. Stoppen blijft beschikbaar. Resultaten worden pas als succes gepresenteerd wanneer ze echt gemeten zijn.

De Arena heeft twee grote kaarten met gelijkwaardige labels `Jij` en de agentnaam, een heldere score en één korte instructie. Klikbare symbolen hebben ruime raakvlakken, een hover-/focusmarkering en een tekstlabel. Een korte reactie na een match maakt zichtbaar wie won. Een volgende ronde begint pas nadat het resultaat leesbaar is. De agent kan menselijke vertraging en vergissingen hebben; de leerling ziet welke moeilijkheid is gekozen.

### Symbolen en delen

De presets vormen originele kleine verzamelingen met een volwassen, speels karakter, bijvoorbeeld **Night Shift** (koptelefoon, noedels, sneaker, skateboard), **Orbit** (satelliet, komeet, helm, planeet), **Odd Objects** (scheve cactus, sok, magneet, koffiekop) en **Mono** (sterke abstracte vormen). Merken, bekende gamefiguren en bestaande Dobble-symbolen worden niet gekopieerd. Kleuren zijn extra herkenningshulp; elke vorm blijft op zichzelf onderscheidbaar.

De symboolkiezer toont een preview van de uiteindelijke kaart en een teller. Eigen uploads krijgen een naam en worden visueel gecontroleerd op herkenbaarheid. Import en export gebruiken een herkenbare agentnaam en een bestand met versienummer. Na import verschijnt wat geladen is, zodat leerlingen niet per ongeluk hun vorige werk overschrijven. De export voor de docent bevat bewijsantwoorden, route, code of blokprogramma, agentinstellingen en echte trainingsresultaten.

### Toetsbare ontwerpcriteria

- De eerste speel- of leeractie is zonder account direct bereikbaar.
- Eén blik maakt actief lesonderdeel, volgende actie en voortgang duidelijk.
- De volledige leerroute werkt met toetsenbord en zichtbare focus.
- Antwoordfeedback ondersteunt een volgende poging en legt een bewijs niet stilzwijgend vast als correct.
- Laadbalken tonen werkelijk verricht werk; training blijft annuleerbaar.
- Animatie is kort en functioneel en respecteert verminderde beweging.
- De Arena blijft speelbaar op een telefoon en een gebruikelijke schoollaptop.
- Geen leerlinggegevens worden voor de basiswerking naar een externe dienst gestuurd.

