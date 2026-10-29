# Browsercontrole van ontwerp en interactie

Uitgevoerd op 29 oktober 2026 met echte Chrome, aangestuurd door Playwright. Geteste website: `http://127.0.0.1:4173`. Elke route is onderzocht in een nieuwe browsercontext, zonder de bestaande browseropslag van de gebruiker te wijzigen. De uitvoering is reproduceerbaar met `node tools/qa-design.mjs`; `--skip-blocks` slaat de afhankelijkheid van Blockly tijdelijk over.

## Hercontrole met lokale afhankelijkheden

De volledige hercontrole slaagt zonder ongehanteerde paginafouten en zonder mislukte netwerkverzoeken. Zowel de goed- als foutroute werkt. **Echte Blockly 13.3.0 is geladen, een blok is met de muis versleept, een ander waardeblok is verbonden, de Python-generator heeft nieuwe code gemaakt en de echte lokale Python-runtime heeft die gegenereerde code uitgevoerd.** De wijziging blijft na herladen bewaard.

| Controle na de correcties | Waargenomen resultaat |
|---|---|
| Lokale fonts, Blockly en Python | Geen externe aanvragen nodig in deze geteste flow; nul `requestfailed`-events. |
| Desktop 1440 px | Home, Pythonstudio, blokkenstudio en kaartontwerper hebben documentbreedte 1440. |
| Mobiel 390 px | Home, wiskunde, iconen, arena, docentpagina en blokkenstudio hebben documentbreedte 390. De leslijst scrolt binnen haar eigen begrensde container. |
| Arena-acties | Na een geslaagde ronde is Start verborgen; Volgende ronde en Nieuwe match zijn zichtbaar. |
| Python-editor | Shift+Tab verlaat het codeveld en verplaatst de focus naar Blokkenstudio. |
| Home | Eén `h1`, lokale lettertypen en een juiste markering op de gedeelde bliksem; de mobiele kaartillustratie staat onder de omschrijving. |
| Kleine klikdoelen | Home, studio, iconen, arena en docentpagina hebben in de laatste steekproef geen gemeten doel kleiner dan 24 px. De bibliotheeklink heeft extra klikhoogte gekregen. |
| Blokken laden | Twee werkelijk bewerkbare startblokken, versie 13.3.0; bron genereert `return candidate["q"]`. |
| Blokken slepen | Een echte pointerdrag verplaatst het retourblok van `(35,40)` naar een andere canvaspositie. |
| Blokken verbinden | Het q-waardeblok wordt via Blockly's publieke connection-API losgekoppeld en vervangen door `math_number` met waarde 7. Het change-event genereert `return 7`. Dit deel test programmatische verbindingen, niet het precies met de muis vastklikken van een connector. |
| Gegenereerde code uitvoeren | Test mijn agent meldt een echte inspectievolgorde en vindt symbool 40, Vinylplaat, na vier inspecties. |
| Blokkenopslag | Na volledige paginaherlading staat hetzelfde getalblok verbonden en bevat de gegenereerde bron nog `return 7`. |
| Mobiele blokkenbibliotheek | De nieuwe categorietoolbox is 81 px breed binnen een host van 352 px; het werkcanvas behoudt circa 271 px. De flyout is aanvankelijk gesloten en de schaal is 0,65. |
| Categorie openen en sluiten | Agent is werkelijk aangeklikt: de flyout toont de drie agentblokken. Opnieuw aanklikken sluit de flyout en geeft de canvasruimte terug. |

De eerste testdrag kwam op de prullenbak rechtsonder terecht en verwijderde de blokken. Dat was normaal Blockly-gedrag, geen websitefout. De controle is herhaald met een veilige doelpositie en heeft de verplaatsing bevestigd.

**Laatste status: geen blokkerende bevindingen open binnen deze controle.** De permanent zichtbare flyout is vervangen door categorieën Agent, Rekenen en Logica. Zowel de gesloten als de geopende mobiele categorie is opnieuw bekeken. De oorspronkelijke mobiele overflow, verborgen actieknoppen, kleine gemeten links, hero-overlap, dubbele hoofdkop en toetsenbordval zijn in de laatste versie opgelost. Het volledige script eindigt zonder `fatal`, met nul mislukte verzoeken en nul paginafouten.

## Historische eerste controle — onderstaande fouten zijn inmiddels hersteld

De eerste controleronde vond plaats voordat fonts en programmeerafhankelijkheden lokaal werden opgenomen. Google Fonts en het Blockly-CDN werden in deze testomgeving geweigerd met `net::ERR_NETWORK_ACCESS_DENIED`. De interface bleef bruikbaar met systeemlettertypen en de foutmelding voor de blokkenomgeving werd zichtbaar. Dit wordt niet voorgesteld als een geslaagde uitvoering van Blockly.

| Onderdeel | Werkelijk uitgevoerd | Resultaat |
|---|---|---|
| Home desktop | Eerste ronde 1440 × 1080, laatste ronde viewport 1440 × 1000; volledige schermafbeelding en documentbreedte | Breedte 1440; geen horizontale overflow. |
| Home mobiel | 390 × 844, mobiele Chrome-context | Breedte 390; geen documentoverflow. Kaartillustratie overlapt een deel van de omschrijving. |
| Wiskunderoute goed | Optie B van de eerste vraag aangeklikt, antwoord gecontroleerd, bewijs geschreven, programmeeractie geopend | Python Studio wordt zichtbaar met de bijbehorende `EvaluationAgent`-code. De geschreven redenering blijft bewaard bij terugnavigeren. |
| Wiskunderoute fout | Optie A aangeklikt en gecontroleerd | Ondersteunende terugkoppeling benoemt Blokkenstudio. De gevraagde route wordt geopend. |
| Wiskunde mobiel | Zelfde mobiele viewport, document- en elementbreedtes gemeten | **Fout:** documentbreedte 850 bij clientbreedte 390. De horizontale leslijst maakt haar gridkolom te breed. |
| Kaartontwerper | 57 knoppen geteld, Cosmic Club aangeklikt, kleur en opslag gecontroleerd | 57 symbolen; palet verandert en `preset: cosmos` wordt opgeslagen. |
| Eigen figuur | Geldige PNG vanuit canvas gemaakt, via echte filechooser geüpload, pagina herladen | Upload wordt een WebP van 96 × 96; de vervanging blijft na herladen aanwezig. |
| Arena mobiel | Zonder ontgrendelde eigen agent gestart, acht knoppen en acht agentsymbolen gecontroleerd, gemeenschappelijk symbool aangeklikt | Werkende ronde; menselijke score gaat naar 1 en de melding bevestigt de juiste match. Geen horizontale overflow. |
| Mobiele overige schermen | Iconen, arena en docentpagina op 390 px | Documentbreedte blijft 390. |
| Basis toetsenbord | Eerste Tab, hulp openen, Escape | Eerste doel is de skiplink. Hulpdialoog opent en Escape sluit hem. |
| Basis labels | Buttons en inputs op de bovenstaande schermen op naam/label gecontroleerd | Geen naamloze knoppen of ongelabelde gewone inputs aangetroffen. Dit is geen volledige schermlezer- of WCAG-audit. |
| JavaScript | Browser `pageerror`-events verzameld tijdens de uitgevoerde routes | Geen ongehanteerde paginafouten. |

Een eerste uploadpoging gebruikte een ongeldige éénpixel-PNG als testfixture. Deze poging is vervangen door een geldig canvasbestand; de foutieve fixture wordt niet als websitefout meegeteld.

## Eerdere bevindingen, allemaal afgehandeld en hercontroleerd

1. **Verborgen actieknoppen blijven zichtbaar.** `.button { display: inline-flex }` overschrijft de standaardpresentatie van het `hidden`-attribuut. In de arena stonden daardoor Start de match, Volgende ronde en Nieuwe match tegelijk zichtbaar. Dezelfde oorzaak kan Stop training raken. Aanbevolen: een globale `[hidden] { display: none !important }`.
2. **Horizontale overflow van Wiskunde op mobiel.** De `aside` met de horizontale leslijst heeft een te grote intrinsieke minimumbreedte. Aanbevolen: `min-width: 0` voor het gridkind, een begrensde scrollbare lijst en een mobiele kolom met `minmax(0, 1fr)`.
3. **Mobiele hero-art overlapt de omschrijving.** De kaarten liggen over een deel van 'Bewijs je strategie. Programmeer je agent.' Aanbevolen: afzonderlijke ruimte voor tekst en illustratie of de kaarten lager plaatsen.
4. **Kleine klikdoelen.** De losse voortgangspijl was 12 × 23 px, de footerlink circa 56 × 9 px op mobiel; de bibliotheekdownload op de docentpagina circa 131 × 15 px. Meer klikpadding en een duidelijk focusgebied zijn wenselijk. Een geïsoleerde maatmeting bewijst op zichzelf geen WCAG-overtreding, omdat context en afstand ook meetellen.
5. **Koppenhiërarchie.** Home had twee `h1`-elementen. Eén duidelijke paginatitel helpt de documentstructuur; de tweede titel kan visueel gelijk blijven met een passend ander element.
6. **Mogelijke toetsenbordval in de Python-editor.** De eerste bronversie onderschept zowel Tab als Shift+Tab en plaatst vier spaties. Laat minimaal Shift+Tab normaal navigeren of bied een benoemde ontsnappingshandeling. Dit punt kwam uit gerichte code-inspectie en is nog niet als complete toetsenbordtest afgevinkt.
7. **Demonstratiemarkering.** Op de eerste desktopafbeelding markeert de stippelcirkel een pizzapunt, terwijl bliksem het gedeelde symbool is. De hoofdbouwer had dit onafhankelijk geconstateerd en past de illustratie aan.

## Bewijsbestanden

- `artifacts/qa/home-desktop.png`
- `artifacts/qa/home-mobile.png`
- `artifacts/qa/math-mobile.png`
- `artifacts/qa/arena-mobile.png`
- `artifacts/qa/blocks-desktop.png`
- `artifacts/qa/blocks-mobile.png`
- `artifacts/qa/blocks-mobile-collapsed.png` — definitieve categorietoolbox gesloten.
- `artifacts/qa/blocks-mobile-category.png` — definitieve Agent-categorie geopend.
- `artifacts/qa/design-results.json`
- `artifacts/qa/symbols.png` — afzonderlijke visuele controle van 57 oorspronkelijke SVG-symbolen; alle 57 paden hebben een geldige niet-nul geometrie.

## Afbakening

De bovenstaande screenshots zijn opnieuw gemaakt na het lokaal opnemen van de lettertypen en programmeerafhankelijkheden. Daadwerkelijke training/validatie en import/export worden parallel door de hoofdbouwer getest en worden niet dubbel als hier uitgevoerde controles geclaimd. Dit verslag omvat geen volledige schermlezertest, formele WCAG-certificering of test op alle browsermerken.
