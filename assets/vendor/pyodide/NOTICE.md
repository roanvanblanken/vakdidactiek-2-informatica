# Pyodide 314.0.7

Deze ongewijzigde runtimebestanden komen uit het openbare npm-pakket
`pyodide@314.0.7`, vastgelegd in `tools/runtime/package-lock.json`.
Ze worden lokaal met Matchlab gehost, zodat Python op school geen verbinding
met een extern CDN nodig heeft. De runtime wordt pas bij de programmeerwerkplaats
geladen. De totale lokale runtime is ongeveer 13,6 MB, vóór HTTP-compressie.

- Pyodide: Mozilla Public License 2.0; zie `LICENSE-MPL-2.0.txt`.
- CPython en Python-standaardbibliotheek: Python Software Foundation License;
  zie `LICENSE-CPython.txt` voor de licenties en historische vermeldingen.
- Pyodide-broncode van deze versie: https://github.com/pyodide/pyodide/tree/314.0.7
- CPython 3.14.2-broncode: https://github.com/python/cpython/tree/v3.14.2
- Officiële documentatie: https://pyodide.org/

De distributiebestanden zijn niet gewijzigd. Matchlabs eigen lesbibliotheek
staat afzonderlijk in `js/python-library.js`.

Een gewone Python-standaardbibliotheek is beschikbaar. Extra wetenschappelijke
pakketten uit de volledige Pyodide-distributie zijn niet meegeleverd; deze
lessen gebruiken ze niet.
