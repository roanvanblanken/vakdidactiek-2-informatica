# Matchlab — Vakdidactiek 2, wiskunde × informatica

Een zelfstandige Nederlandse HTML-leswebsite voor 4 vwo. Leerlingen bewijzen een zoekstrategie, programmeren die in echte Python of Blockly-blokken, trainen een agent en spelen ertegen. Ontworpen voor de GitHub Pages-repository **vakdidactiek-2-informatica**.

## Starten

Met Node.js 22 of nieuwer:

```sh
npm start
```

Open http://127.0.0.1:4173. Gebruik een webserver, niet rechtstreeks `file://`: de JavaScript-modules en Python-worker vereisen HTTP(S). De website zelf heeft geen Node-server nodig op productie.

Op Windows PowerShell kun je `npm.cmd start` gebruiken als de uitvoeringspolicy `npm.ps1` blokkeert.

## Lesroute

1. Onderzoek vijf wiskundige tactieken. De instapvraag kiest Python Studio bij een correct antwoord, anders Blokkenstudio. Beide routes blijven wisselbaar. Een geschreven bewijs wordt handmatig beoordeeld met zichtbare criteria.
2. Kies **één** tactiek om in **tien minuten totaal** te programmeren, testen en vergelijken. De startcode bevat al imports, `class MijnAgent(EvaluationAgent)` of `class MijnAgent(MLAgent)` en `evaluate(self, observation, candidate)`. Leerlingen vullen een score, berekening of korte `if` in, op het niveau van de aangeleverde Fundamenta-voorbeelden. Een hogere eindige score betekent een eerdere inspectie. De engine voorkomt dubbele inspecties. Zie [de korte programmeeropdracht](docs/programming-10-minutes.md).
3. Test, train met epsilon en alpha en valideer op nieuwe kaartparen tegen een willekeurige referentie. De grafiek toont werkelijk uitgevoerde batches.
4. Speel een match tot vijf punten. De programmeerbare agent krijgt een ontworpen vertraging die afhangt van zijn zoekwerk. Er wordt geen wetenschappelijk gemeten menselijke reactiesnelheid geclaimd.
5. Exporteer één JSON-bestand met code, leergewichten, parameters, iconen en bewijsuitwerkingen. De leerling levert het bestand zelf in. Importeer het op een ander apparaat of bij de docent. Een bestaand werk wordt bij import eerst als back-up gedownload.

De kaartontwerper heeft 57 eigen SVG-figuren, drie paletten en eigen PNG/JPG/WebP-iconen. Uploads worden lokaal naar kleine bitmapiconen geconverteerd. Kaarten gebruiken projectieve vlakken van orde 3, 5 of 7: 13, 31 of 57 kaarten met 4, 6 of 8 symbolen. Elk kaartpaar deelt exact één symbool. De lesopdrachten gebruiken acht symbolen.

## Wat leert de agent?

Het leermodel is een contextuele bandit, een beperkte vorm van reinforcement learning met één beloonde keuze per ronde. De eigen kaart levert de beschikbare acties. Beloning is 1 bij een match op de eerste inspectie en anders 0. Update: `Q ← Q + α × (reward − Q)`. Epsilon bepaalt willekeurige exploratie. `candidate['q']` geeft het geleerde gewicht; eigen evaluate-code bepaalt of en hoe dit wordt gebruikt. Een vaste handgeschreven strategie gaat door trainen niet vanzelf Q gebruiken.

De focuswereld kiest in 75% van de rondes een van de eerste acht symbolen als gedeeld symbool; anders worden twee verschillende kaarten uniform gekozen. De symmetrische wereld heeft die voorkeur niet. Dit onderscheid is essentieel: uniform verdeelde matches bieden geen voorkennis waarmee een frequentiestrategie beter kan worden. `candidate['frequency']` geeft het expliciete model van de gekozen oefenwereld. De andere kaart is geen onderdeel van de leerlingobservatie; de engine handelt inspectie en matchcontrole af. Het spel is een simulatie van visueel zoeken, geen beeldherkenningsnetwerk.

Python wordt echt uitgevoerd door een vastgezette, lokaal meegeleverde Pyodide 314.0.7-runtime in een afzonderlijke webworker. De eveneens lokaal meegeleverde Blockly 13.3.0 genereert Python voor dezelfde runtime. De eigen module `matchlab.py` is vanuit de docentpagina downloadbaar en gebruikt alleen de Python-standaardbibliotheek, zodat agentcode ook in Thonny kan draaien. De interface is geïnspireerd op de door de gebruiker aangeleverde Fundamenta-voorbeelden; er is geen externe `bke`-bibliotheek nodig.

## Tests en TDD

De kern- en Python-tests zijn vóór de implementaties toegevoegd en eerst met falende uitkomsten uitgevoerd. Installeer de vastgezette test-runtime en voer de tests uit:

```sh
npm ci --prefix tools/runtime --no-audit --no-fund
npm test
npm run build
```

De automatische tests controleren alle kaartparen van de drie kaartformaten, herhaalbare seeds, leerupdates, validatie zonder mutatie, JSON-validatie, de vijf korte programmeertaken en echte uitvoering van leerlingcode in Python. Testafhankelijkheden komen niet in de gebouwde website. Geslaagde browsercontroles, reproduceerinstructies en bevindingen staan in [docs/verification.md](docs/verification.md).

## GitHub Pages

De workflow `.github/workflows/pages.yml` test, bouwt en publiceert bij een push naar `main`.

1. Maak de repository `vakdidactiek-2-informatica` en push dit project naar `main`.
2. Kies in **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. De meegeleverde workflow publiceert `dist/`. De verwachte URL is `https://<github-gebruikersnaam>.github.io/vakdidactiek-2-informatica/`.

Alle lokale assetpaden zijn relatief, ook worker- en modulepaden. De site kan daardoor onder een GitHub Pages-projectpad draaien. Bij hosting vanuit een branch kan de projectroot ook direct als statische website worden gebruikt. Er zijn geen geheime sleutels of backend nodig.

## Opslag en afhankelijkheden

Werk wordt opgeslagen in `localStorage` op het apparaat. Er zijn geen accounts, analytics, berichten aan docenten of centrale leerlinggegevens. Exporteer regelmatig een back-up: browserdata kan worden gewist en lokale opslag heeft een limiet. Grote hoeveelheden eigen iconen kunnen die limiet bereiken; de interface meldt dat.

Alle productiebestanden, inclusief Python (~13,6 MB), Blockly en de twee lettertypen, worden vanuit dezelfde website geladen. Er zijn geen CDN- of Google Fonts-verzoeken. De zware Python-runtime laadt alleen bij de eerste uitvoering. Het kaartspel, de wiskunde en de originele SVG-figuren werken zonder Python. Browsercache kan downloads versnellen; de app gebruikt geen offline serviceworker. Pythonfouten worden in de console getoond. Langlopende agentcode kan worden gestopt en heeft een tijdslimiet. Een worker is geen veiligheidsgrens voor vijandige code: inspecteer geïmporteerde code voordat je die uitvoert.

## Verantwoording

- [Lesverantwoording met bronpagina's uit de aangeleverde documenten](docs/curriculum.md)
- [Ontwerponderzoek, 27 websites](docs/research-design.md)
- [Technisch en wiskundig onderzoek, 28 websites](docs/research-technical.md)

De twee onderzoeksrapporten omvatten samen 52 unieke, conservatief gegroepeerde domeinen. Openingen die geen leesbare informatie opleverden worden apart vermeld en niet meegerekend. Dit is bronnen- en structuuronderzoek; er wordt geen complete visuele of functionele audit van iedere externe website geclaimd. Er zijn geen externe illustraties of commerciële Dobble-assets gekopieerd.

## Meegeleverde pakketten

`assets/vendor/pyodide` bevat Pyodide onder MPL 2.0 plus CPython-licenties. `assets/vendor/blockly` bevat Blockly onder Apache 2.0. `assets/fonts` bevat DM Sans en Space Grotesk onder SIL Open Font License. De licentieteksten worden meegeleverd. De bronbestanden uit `tools/vendor/package-lock.json` zijn vastgezet; `npm ci --prefix tools/vendor` en `node tools/vendor-assets.mjs` vernieuwen die assets reproduceerbaar. De versie van Pyodide staat in `tools/runtime/package-lock.json`.

In de teksteditor voegt Tab vier spaties in; Shift+Tab verlaat de editor. De twee werkplaatsen bewaren ieder hun eigen versie. Een wissel is geen automatische vertaling van willekeurige Python naar blokken.
