# Matchlab — docentenhandleiding en wiskundige onderbouwing

Dit lesontwerp koppelt wiskundig argumenteren in 4 vwo aan het ontwerpen, programmeren en evalueren van een zoekagent bij informatica. Dezelfde strategie wordt achtereenvolgens een kansmodel, een onderbouwde beslisregel, een programma en een experiment. De website is het werkmateriaal; dit document maakt de onderwijskeuzes overdraagbaar. De hier beschreven lesplanning is een ontwerpvoorstel, geen voorgeschreven planning uit de aangeleverde documenten.

## Doelgroep, beginsituatie en leerdoelen

4 vwo, ongeveer 16 jaar. Vooronderstellingen: breuken, procenten, vermenigvuldigen en optellen van kansen, gewogen gemiddelden en eenvoudige algebra. Conditionele kans wordt als uitsluiten van mogelijkheden opgebouwd. De verwisselredenering in opdracht 4 is het moeilijkste onderdeel en krijgt een kansentabel als scaffold. Formele eindtermen en de precieze aansluiting bij wiskunde A/B moeten de betrokken vakdocenten vaststellen aan de hand van hun actuele programma; dit document claimt geen geverifieerde eindtermnummers. Kansrekening past inhoudelijk niet vanzelfsprekend in iedere 4-vwo-wiskunde-B-route.

Na deze serie kan de leerling:

1. Een spelregel vertalen naar een model met expliciete aannames en kansen.
2. Een zoekstrategie onderbouwen met een gevalsonderscheid, verwachtingswaarde of algebraïsch verwisselargument.
3. De beslisregel programmeren als `evaluate(observation, candidate)` in Python of als dezelfde beslisregel in blokken.
4. Beschrijven wat een geleerde score, beloning, exploratie en testset doen, en een geleerde strategie onderscheiden van een vooraf geprogrammeerde regel.
5. Een experiment reproduceerbaar vergelijken en uitleggen wat een simulatie kan ondersteunen, en wat een wiskundig bewijs onder gegeven aannames vaststelt.

## Spel en modellering

Het standaardspel gebruikt acht verschillende iconen per kaart. Een complete constructie met orde q = 7 heeft 57 kaarten en 57 symbolen; ieder paar verschillende kaarten heeft precies één symbool gemeen. Deze eigenschap moet door de kaartgenerator en zijn tests gewaarborgd worden. Twee willekeurig samengestelde iconensets hebben deze eigenschap niet automatisch. Het bewijs van het bestaan van projectieve vlakken is geen voorkennis voor deze lessenserie.

Een korte, optionele combinatorische verdieping: ieder van de acht iconen op een kaart staat ook op zeven andere kaarten. Alle 8 × 7 andere kaarten moeten verschillend zijn, anders zou een andere kaart twee iconen met de oorspronkelijke kaart delen. Samen met de oorspronkelijke kaart krijg je 1 + 8 × 7 = 57. Dit argument veronderstelt dat elk icoon op acht kaarten staat en dat ieder kaartpaar precies één icoon deelt; het bewijst op zichzelf niet het bestaan van zo'n kaartenset.

**Zoekmodel.** De agent geeft een prioriteit aan een kandidaat-icoon. De simulatie controleert of dit icoon ook op de andere kaart staat; een controle kost tijd. De verborgen match is niet als `target` of als `other_card` beschikbaar in de evaluatiefunctie. Anders kan een programma de doorsnede direct opvragen en verdwijnt het vraagstuk van zoekvolgorde. Beschikbare gegevens zijn de eigen kaart, eerder afgekeurde iconen, trainingsgeheugen en observeerbare eigenschappen zoals controlekosten. Snelheid en herkenbaarheid zijn eigenschappen van dit onderwijsmodel, geen empirisch gevalideerd model van menselijke waarneming.

**Gelijke kansen.** Als bij een volledig symmetrisch deck de andere kaart uniform uit de 56 overige kaarten komt, zijn de acht iconen op de eigen kaart even waarschijnlijk: elk icoon hoort bij zeven mogelijke andere kaarten, dus P(match) = 7/56 = 1/8. Een frequentieheuristiek kan op dit model niet structureel beter zijn door het ene icoon vaker te kiezen. Kosten en niet-herhalen kunnen wel verschil maken.

**Ongelijke kansen.** Opdrachten 3 en 4 gaan expliciet over een apart scenario met een niet-uniform uitdeelbeleid of een gegeven kansverdeling. Het is didactisch onjuist om hun kansvoordeel zonder die aanname aan het eerlijke symmetrische deck toe te schrijven. Uit trainingsfrequenties verkregen schattingen hebben steekproefvariatie en hoeven niet naar een andere uitdeelverdeling over te dragen. Tel alle aangeboden trainingsvoorbeelden, of corrigeer voor blootstelling; ruwe successen van een door de agent geselecteerde subset zijn geen zuivere kansschatting.

## Vijf opdrachten en antwoordmodel

De exacte leerlingteksten, instapvragen en Python-voorbeelden staan in [curriculum.js](../js/curriculum.js). Elke opdracht heeft één gesloten instapvraag voor een formatieve route, een open bewijsopdracht en drie rubriccriteria. Een juist meerkeuzeantwoord toont alleen dat antwoord op dat moment; het is geen automatisch nagekeken bewijs. De docent of een medeleerling bespreekt het bewijs aan de hand van de rubric.

### 1. Niet herhalen

Na twee verschillende missers blijven zes even waarschijnlijke mogelijkheden over, dus een nieuw icoon heeft kans 1/6. In een willekeurige volgorde zonder herhaling ligt de match op elk van de acht posities even waarschijnlijk. Daarom is P(raak binnen drie) = 3/8. Bij drie onafhankelijke uniforme keuzes met herhaling is de kans op geen match (7/8)³, dus op minstens één match 1 − (7/8)³ = 169/512 ≈ 33,0%. Zonder herhaling is dat 37,5%. Een bewezen misser opnieuw controleren voegt in het onveranderde kaartpaar geen informatie toe. De agent bewaart missers in `checked`.

Verdieping: de verwachte positie zonder herhaling is (1 + … + 8)/8 = 4,5. De vergelijking gaat over hetzelfde onveranderde paar en een vooraf uniforme matchpositie.

### 2. Controlekosten en zichtbaarheid

Als A en B beide kans 1/2 hebben, met kosten a = 0,2 s en b = 0,8 s, dan is E(AB) = (1/2)a + (1/2)(a+b) = 0,6 s. E(BA) = (1/2)b + (1/2)(b+a) = 0,9 s. Algemeen: E(AB) − E(BA) = (a−b)/2. Voor a < b is dit negatief; dus de goedkope controle eerst. Dit gaat over gemiddelde zoektijd, niet over een hogere matchkans voor A. De agent gebruikt `-candidate['cost']` als prioriteit.

### 3. Matchkansen leren

Alle controles kosten één stap. In het scenario met pA = 0,50 en pB = 0,20 bespaart AB tegenover BA één stap wanneer A de match is en verliest één stap wanneer B de match is. Bij een andere match blijven kosten en verdere volgorde gelijk. De verwachte besparing is pA − pB = 0,30 stap. Algemeen hoort bij gelijke kosten een hogere echte matchkans vóór een lagere. Een trainingsfrequentie is een schatting van die kans onder één uitdeelbeleid en een eindig trainingsbudget. De meegeleverde referentiecode gebruikt `frequency`, de bekende conditionele modelkans uit de spelgenerator. Dit is geen geleerde frequentie. Laat de leerling deze vergelijken met `q`, de score die werkelijk door beloningsfeedback verandert, op nieuwe rondes. Voor opdracht 4 is de overeenkomstige vergelijking `frequency / cost` tegenover `q / cost`.

### 4. Kans per kost

Voor twee opeenvolgende kandidaten met kosten cA en cB en vooraf gegeven kansen pA en pB is:

`E(AB) − E(BA) = pB × cA − pA × cB`.

De afleiding vergelijkt drie disjuncte gebeurtenissen. Bij A-match is het verschil −cB; gewogen bijdrage −pA cB. Bij B-match is het verschil +cA; gewogen bijdrage +pB cA. Wanneer de match later komt, hebben beide volgordes al cA + cB gekost en is het verschil nul. AB is minstens zo goed als BA precies als pA cB ≥ pB cA, dus, bij positieve kosten, pA/cA ≥ pB/cB. Door opeenvolgende verkeerd geordende paren te verwisselen ontstaat een volgorde van aflopende p/c die de verwachte zoektijd minimaliseert binnen dit model. De kansen en kosten moeten onafhankelijk van de gekozen volgorde vastliggen. Menselijke vermoeidheid en contextafhankelijke herkenning kunnen die aanname schenden.

Bij de getallen uit de instapvraag is A: 0,40/1,2 = 1/3 en B: 0,20/0,3 = 2/3. B eerst is gemiddeld 0,20 × 1,2 − 0,40 × 0,3 = 0,12 s sneller.

### 5. Exploratie en eerlijk vergelijken

Epsilon-greedy met n beschikbare acties verkent met kans ε uniform over alle n acties, inclusief de favoriet. Anders wordt de unieke favoriet gekozen. Daarom is P(favoriet) = (1−ε) + ε/n. Voor ε = 0,20 en n = 8 is dit 0,825. Ieder ander icoon heeft kans 0,025 en de acht kansen tellen op tot 1. In 200 eerste keuzes is het verwachte aantal favorietkeuzes 165; voor één specifiek ander icoon is dat 5. Concrete aantallen hoeven niet precies overeen te komen met deze verwachtingen.

De agent kan zo acties onderzoeken die hij op basis van onvolledige informatie nog onderschat. Er volgt geen garantie uit de kansboom dat één epsilon altijd beter leert. Houd bij een vergelijking het trainingsbudget, beginscores, beloningsregel en scenario gelijk. Gebruik een vooraf vastgelegde verzameling nieuwe testrondes met dezelfde seeds voor beide versies en test meerdere seeds. Rapporteer bijvoorbeeld gemiddeld aantal controles en gemiddelde simulatietijd. Winst tegen een menselijke speler hangt ook af van diens reactietijd en is geen zuivere maat voor zoekkwaliteit.

Een bekende regel zoals p/c is een geprogrammeerde heuristiek. Een score die door beloningsfeedback wordt bijgewerkt is geleerd. Een scenario met onafhankelijke acties en directe beloning kan nauwkeuriger als banditmodel worden uitgelegd; een volledige reinforcement-learningclaim vraagt om benoemde toestanden, acties, beloning en eventuele toekomstige opbrengsten. De gekozen trainer moet dit transparant maken.

## Lesplanning: drie lessen van 50 minuten

| Moment | Leeractiviteiten | Zichtbare opbrengst |
| --- | --- | --- |
| Les 1, 0–8 min | Eerst één ronde spelen; laat leerlingen hun zoekgedrag beschrijven. Introduceer de hele taak: bouw en verdedig een goede zoekagent. | Eigen tactiek en concrete onderzoeksvraag. |
| Les 1, 8–20 min | In tweetallen opdracht 1; eerst individueel kans voorspellen, daarna bewijs en geheugenregel bespreken. | Kansmodel, vergelijking herhalen/niet herhalen, bewijsnotitie. |
| Les 1, 20–35 min | Opdracht 2 met een kansentabel. Eén leerling rekent, één zoekt een tegenvoorbeeld; wissel rollen. | Verwachtingswaarde met expliciete aannames. |
| Les 1, 35–45 min | Kies één tactiek uit de vijf. Vul de korte startcode aan, test en vergelijk de agent. Tien minuten totaal; imports, klasse en functie zijn al gegeven. | Werkende agent en eerste meetresultaat. |
| Les 1, 45–50 min | Individuele exitvraag: welke bewering is bewezen, en welke alleen waargenomen? | Formatieve informatie voor de volgende les. |
| Les 2, 0–15 min | Opdracht 3: geef vooraf een niet-uniform scenario; laat de drie gevallen uitschrijven. | Verdediging van frequentieprioriteit en beperking. |
| Les 2, 15–30 min | Opdracht 4; hulp op verzoek: kansentabel, woordelijk gevalsonderscheid, algebra. | Generaliseerbaar p/c-bewijs. |
| Les 2, 30–45 min | Vergelijk een gegeven referentieagent met de eigen agent of bespreek welke score bij tactiek 4 hoort; voorspel, voer uit en verklaar. Een tweede implementatie is verdieping. | Voorspelling en modelcontrole. |
| Les 2, 45–50 min | Twee tweetallen beoordelen elkaars bewijs met de rubric. | Gerichte peerfeedback, eigen verbetering. |
| Les 3, 0–12 min | Opdracht 5 met kansboom; leg epsilon en leren uit. | Juiste exploratiekansen. |
| Les 3, 12–30 min | Train; wijzig één parameter per experiment. Houd testdata apart. | Reproduceerbaar experimentlogboek. |
| Les 3, 30–42 min | Exporteer agent en bewijs; een ander tweetal laadt de agent en herhaalt de test. | Overdraagbaar agentbestand en resultaat. |
| Les 3, 42–50 min | Individuele verdediging van één keuze en één beperking. | Eigen begrip naast het groepsproduct. |

Voor een workshop van 30 minuten voor medestudenten: 3 minuten context en leerdoelen, 5 minuten spelen en voorspellen, 8 minuten opdracht 4 in leerlingrol, 6 minuten programmeren/experimenteren, 5 minuten didactische bespreking en 3 minuten evaluatie. Dit is een demonstratie van het onderwijsontwerp. Het vervangt niet de volledige leerlinglessenserie. Plan feedbacktijd conform de actuele afspraken met de opleider; de oude introductieslides noemen tien minuten feedback na de workshop.

## Differentiatie en samenwerking

De instapvraag kiest per opdracht een eerste ondersteuning: juist → Python, onjuist → blokken met zichtbare beslisregels. Beide routes houden hetzelfde wiskundige doel. De route is formatief en aanpasbaar; één meerkeuzeantwoord is onvoldoende om programmeervaardigheid of een vast niveau vast te stellen. Laat een leerling na uitleg opnieuw proberen en naar Python overstappen. Bied hints in stappen aan en bouw hulp af wanneer de leerling de regel zelfstandig kan verklaren.

Een blokkenroute verlaagt syntaxislast maar moet daadwerkelijk dezelfde Python-regel opleveren en laten uitvoeren. Zij is geen reden om de bewijsvraag over te slaan. Snelle leerlingen krijgen de generalisatie naar n iconen, het verwisselargument voor een volledige volgorde of een onderzoek naar distributieverschuiving. Dit geeft een toegankelijke instap en verdere uitdaging zonder vaste niveaugroepen.

Werk in tweetallen met wisselende rollen: bestuurder/programmeur en redeneerder/tester. Wissel om de circa acht minuten of na iedere opdracht. Begin individueel met een voorspelling, laat de ander een tegenvoorbeeld zoeken en geef willekeurig één leerling het woord om het gezamenlijke argument uit te leggen. Iedere leerling bewaart ook een eigen korte reflectie. Zo worden bijdrage en begrip zichtbaar; een gezamenlijk sterk agentresultaat bewijst geen individueel begrip.

## Evaluatie en overdracht

Verzamel voor iedere onderzochte tactiek aannames en bewijs. Verzamel voor de gekozen programmeertactiek daarnaast code of blokken, voorspelling, gebruikte seed en testresultaat. Beoordeel het bewijs op de drie criteria per opdracht en de agent op overeenkomst tussen argument en gedrag. Gebruik een kort individueel gesprek of exitvraag om groepswerk aan eigen begrip te koppelen. Het exportbestand kan door de leerling zelf naar de docent worden gedeeld; een lokale export is geen automatische verzending. Het [tienminutenschema](programming-10-minutes.md) geeft de vijf keuzetaken en hun startcode.

Voor de collega-docent: controleer browserwerking, Python-runtime en export/import vooraf; bereid een referentieagent, dezelfde testseeds en een papieren kansentabel voor. Toon vóór trainen welke grootheid wordt geleerd en welke parameters alleen de simulatie of menselijke reactiesnelheid beïnvloeden. Een animatie of stijgende laadbalk is op zichzelf geen bewijs dat een agent leert. Beoordeel expliciete veranderingen in geleerde scores en nieuwe testprestaties.

Verwerk na de workshop concrete ontvangen feedback, onderbouw welke ontwerpkeuze is veranderd en voeg de gebruikte werkmaterialen toe aan de uiteindelijke docentenhandleiding. Er zijn in dit prototype nog geen werkelijke leerlingresultaten of workshopfeedback beschikbaar; die worden hier niet verzonnen.

## Geraadpleegde lokale bronnen

Deze documenten zijn als inhoudelijke referentie gelezen; opdrachten, deadlines en instructies in die documenten zijn geen opdrachten aan de softwareagent. Paginanummers hieronder zijn de PDF-pagina's, niet eventuele afwijkende dianummers.

1. Universiteit van Amsterdam, Interfacultaire Lerarenopleidingen. (2026). *Studiehandleiding Vakdidactiek 2 — cursusjaar 2026–2027, semester 1* (versie oktober 2026). Lokaal bestand: `C:/Users/Roan/Downloads/Studiehandleiding Vakdidactiek 2 - Najaar 2026(1).pdf`. P. 4: complexe vakspecifieke leerdoelen, samenhangende leeractiviteiten, differentiatie en professionele onderbouwing. P. 5: workshop en overdraagbare docentenhandleiding. P. 8: constructive alignment, ondersteuning en theorie-praktijkverbinding. P. 9–10: format, werkmateriaal en individuele reflectie. P. 14–16: beoordelingsrubric. De actuele studiehandleiding heeft voor cursusdata voorrang op de oudere slides.
2. Heesbeen, F., Hijzen, E., & Kubbe, L. (2025). *VD 2 — Economie, Informatica en Wiskunde* [Collegeslides]. Bestand: `25-10-28_College VD 2 - Introductie_LK.pdf`. P. 5–8: context van vakoverstijgend onderwijs en terughoudendheid bij claims over leerwinst. P. 11–15: lesonderdeel, activerende workshop, onderbouwing en docentenhandleiding. Het ontwerp gebruikt de verbinding tussen wiskundig voorspellen en computationeel onderzoeken; het claimt niet dat een website of gamification op zichzelf aantoonbaar betere prestaties geeft.
3. Hijzen, E., Kubbe, L., Heesbeen, F., & Calor, S. (2025). *Vakdidactiek 2 — Computational Thinking* [Collegeslides, 10 april 2025; vermeldt eerdere bijdrage 26 november 2024]. Bestand: `College VD 2 - 2. Computational Thinking.pdf`. P. 13–15: probleem formuleren, computationele oplossing, interpretatie en evaluatie. P. 17–21: CT is meer dan een programmeercursus; gegevens, simulatie, testen en iteratieve verfijning. P. 30–32: argumenteren, analyseren en evalueren. Daarom lopen de lessen expliciet van model naar code naar interpretatie en modelkritiek.
4. De Bruin, D. J., Heesbeen, F., & Kubbe, L. (z.d.). *VD 2 — Samenwerkend leren* [Collegeslides]. Bestand: `College VD 2 - Samenwerkend leren_LK.pdf`. P. 9–10: risico's, individuele aanspreekbaarheid, afhankelijkheid en rollen. P. 13–15: tijdelijk aanpassen en afbouwen van hulp, peerfeedback en individueel werk. Dit onderbouwt de wisselende rollen, individuele voorspelling en eigen exitvraag.
5. *Vakdidactiek 2 — Differentiëren / Hele taak eerst / Low floor, high ceiling* (z.d.) [Collegeslides]. Bestand: `Vakdidactiek2 HTE Differentiëren+LFHC.pdf`. P. 11: convergente en divergente differentiatie. P. 16: monitoren om onjuiste groepsindeling te voorkomen. P. 18 en 22: differentiatie in hulpmiddelen en tempo. P. 49–50: toegankelijke instap met open verdieping. P. 74–76: scaffolding bij de hele taak. Dit onderbouwt de aanpasbare ondersteuningsroute, dezelfde minimumdoelen en de verdiepingsvragen.

De aangeleverde PowerPointbestanden zijn alternatieve formaten of oudere varianten van deze thema's. Voor bovenstaande bronverwijzingen zijn de genoemde leesbare PDF-versies gebruikt. De bronnen zijn ontwerpgrondslag; een definitieve academische handleiding vraagt daarnaast de door de opleiding verlangde onderbouwing met oorspronkelijke vakdidactische literatuur en verwerking van echte workshopfeedback.
