# Verificatie van de opgeleverde versie

Uitgevoerd op 29 oktober 2026. Publicatie naar GitHub Pages is voorbereid, maar nog niet uitgevoerd: in deze sessie is GitHub niet verbonden en zijn geen GitHub-credentials beschikbaar. Er is geen repository aangemaakt of push gedaan. De gewenste repositorynaam is `vakdidactiek-2-informatica`.

## Automatische tests

`npm test`: **40 geslaagd, 0 mislukt**. De tests zijn tijdens de ontwikkeling eerst tegen ontbrekende implementaties uitgevoerd en daarna groen gemaakt. Ze controleren onder andere:

- Alle kaartparen, symboolaantallen en frequenties voor de drie kaartformaten.
- Veilige, begrensde import van agenten, uitwerkingen, iconen en blokkenstate.
- Alle vijf lesagents in echte Python, afzonderlijke open bewijsopdrachten en consistente instapvragen.
- De p/kost-regel tegen alle 40.320 zoekvolgordes van een voorbeeld.
- Exacte conditionele focuskansen door onafhankelijke enumeratie van kaartparen.
- Werkelijke deterministische leerupdates, voortgangssnapshots en validatie zonder modelmutatie.
- Het verschil tussen leerlingstrategieën, numerieke uitvoerfouten en Python train/save/load-helpers.
- Vijf korte, uitvoerbare startcodes met een niet ingevulde tactiek, en vijf oplossingen die in de echte Python-runtime de bedoelde score berekenen.

`npm run build`: geslaagd. De uitvoer is zelfstandige statische HTML/CSS/JavaScript met de nodige lokale assets. Productie bevat geen node_modules, tests of leerlingopslag.

## Browserintegratie

Echte Chrome met Playwright, in afzonderlijke testcontexten. De hoofdroute is getest vanuit de bronwebsite én vanuit de gebouwde `dist/` onder `/vakdidactiek-2-informatica/`, zodat module-, worker-, lettertype- en assetpaden ook onder het GitHub Pages-projectpad worden gebruikt.

Bevestigd: juiste instaproute, bewijsopslag, Pythonuitvoering, 1.000 trainingen, validatie op 300 verse gekoppelde kaartparen, herstel na herladen, JSON-export en import, een winnende menselijke spelronde en leesbare foutmelding bij een NaN-score. Geen ongehanteerde paginafouten.

In de reproduceerbare focusproef (seed 42, α 0,1, ε 0,15) gebruikte de getrainde agent 2,12 inspecties per validatieronde, tegenover 4,52 voor de willekeurige referentie. De kosten waren 2,87 tegenover 6,08. Dit is een meetresultaat voor deze bewust scheve oefenwereld; het is geen garantie voor andere verdelingen.

De afzonderlijke ontwerpcontrole bevestigt echte Blockly-load, pointerdrag, een via Blockly's openbare connection-API veranderd waardeblok, nieuwe Python-generatie, uitvoering en opslag na herladen. Ook upload/presetwisseling, helpdialoog, focus, verborgen knoppen en mobiel 390 px zijn gecontroleerd. De uiteindelijke blokkenbibliotheek is inklapbaar. Zie [het volledige ontwerprapport](qa-design.md).

De korte programmeerroute is daarnaast op 29 oktober 2026 in Chrome getest met `node tools/browser-sprint-check.mjs`: taak 4 starten met TODO, één scoreregel aanpassen, uitvoeren en vergelijken over 100 nieuwe rondes; de gegenereerde Blockly-conditie voor een reeds gecontroleerd icoon; taak 5 aanpassen en werkelijk 250 rondes trainen met zichtbare voortgang; geen paginafouten of horizontale overflow bij 390 px. De taak-4-agent had in deze steekproef 2,25 inspecties per ronde tegenover 4,47 bij willekeurige zoekvolgorde. Dit is een concreet testresultaat, geen vaste winstgarantie.

Alle productieafhankelijkheden worden lokaal geladen. De Python-worker is aanvullend getest terwijl externe verzoeken actief waren geblokkeerd. De eerste browserstart inclusief 500 trainingen en validatie duurde lokaal ongeveer 3–4 seconden. Dit is een meting op deze computer, geen algemene prestatielimiet.

## Reproduceren

```sh
npm ci --prefix tools/runtime --no-audit --no-fund
npm ci --prefix tools/vendor --no-audit --no-fund
npm test
npm run test:browser
npm run build
node tools/browser-sprint-check.mjs  # met npm start in een ander venster
```

De browsercontrole gebruikt op Windows standaard de geïnstalleerde Chrome. `CHROME_PATH` kan dit overschrijven. Op andere systemen gebruikt zij Playwright Chromium; installeer zo nodig eerst de bijbehorende browser met `npx --prefix tools/vendor playwright install chromium`. `PLAYWRIGHT_PATH` kan de modulelocatie overschrijven. De testserver start en stopt automatisch. De uitgebreidere ontwerpcontrole kan met een draaiende `npm start` worden uitgevoerd via `node tools/qa-design.mjs`.

## Grenzen

Er is geen volledige audit met alle browsers of echte leerlingen gedaan. De blokken zijn met een pointer verplaatst, maar de specifieke nieuwe connector is via de officiële API verbonden. Bewijzen worden door een mens beoordeeld. Agentcode is bewerkbare Python; inspecteer geïmporteerde code vóór uitvoering. Er is geen centrale klasopslag of automatische verzending naar de docent. De publicatie is pas voltooid na een echte, succesvolle GitHub Pages-deployment.
