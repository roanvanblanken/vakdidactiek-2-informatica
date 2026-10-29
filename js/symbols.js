// Original, font-independent line drawings. Symbol identity is stable across themes.
// Geometry is native SVG; no third-party illustrations, emoji, or external assets.
const drawings = [
  [
    "Controller",
    "M7 7h10c2 0 3 2 3.5 5l1 5c.3 2-1.4 3-2.8 1.6L16 16H8l-2.7 2.6C3.9 20 2.2 19 2.5 17l1-5C4 9 5 7 7 7Z M8 10v5 M5.5 12.5h5 M16 10.8h.1 M18.3 13.2h.1",
  ],
  [
    "Pizzapunt",
    "M4 5c5-3 11-3 16 0L12 22Z M4 5l1.5 3c4-2.2 9-2.2 13 0 M10 10a1 1 0 1 0 0 .1 M14 13a1 1 0 1 0 0 .1 M10.5 16a.7.7 0 1 0 0 .1",
  ],
  [
    "Schedel",
    "M8 18v3h8v-3c4-1 6-4 6-8a10 8 0 0 0-20 0c0 4 2 7 6 8Z M8 10a2 2 0 1 0 0 .1 M16 10a2 2 0 1 0 0 .1 M11 15l1-2 1 2 M10 18v3 M14 18v3",
  ],
  [
    "Cassette",
    "M4 4h16a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a2 2 0 0 1 2-2Z M6 7h12v7H6Z M8 10a1.4 1.4 0 1 0 0 .1 M16 10a1.4 1.4 0 1 0 0 .1 M7 20l2-4h6l2 4",
  ],
  ["Bliksem", "M14 2 4 14h7l-1 8L21 9h-8Z"],
  [
    "Saturnus",
    "M19 7a8 8 0 1 1-14 9 M5 10a8 8 0 0 1 12-6 M4 12C-1 17 1 20 9 17s15-9 13-11c-1-2-5 0-7 1 M5 15l1 2 M17 7l2 2",
  ],
  [
    "Koptelefoon",
    "M3 14v-3a9 9 0 0 1 18 0v3 M3 13h4v8H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 1-2Z M21 13h-4v8h3a2 2 0 0 0 2-2v-4a2 2 0 0 0-1-2Z M7 20h3",
  ],
  [
    "Kersen",
    "M10 14C10 9 13 5 16 3 M17 15c1-5 0-9-1-12 M16 3c-5-1-7 1-7 4 4 1 6-1 7-4Z M10 17a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z M22 18a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  ],
  [
    "Raket",
    "M9 16C5 9 11 3 21 2c0 10-6 16-13 13Z M9 8 4 9l-2 6 6-1 M15 15l-1 5-6 2 1-6 M6 18l-3 3 M16 6a2 2 0 1 0 0 .1",
  ],
  [
    "Spook",
    "M4 21V10a8 8 0 0 1 16 0v11l-4-3-4 3-4-3Z M8 9v3 M16 9v3 M10 15q2 2 4 0",
  ],
  [
    "Vlam",
    "M13 2c2 6-4 7-2 11 2-1 4-3 4-6 6 4 8 9 4 13C9 28-4 14 7 7c-1 5 0 7 2 8 0-5 4-7 4-13Z M12 15c-4 4-3 6 0 7 3-1 4-3 0-7Z",
  ],
  [
    "Cactus",
    "M9 22V6a3 3 0 0 1 6 0v16 M9 14H6a4 4 0 0 1-4-4V7h4v3h3 M15 16h3a4 4 0 0 0 4-4V9h-4v3h-3 M6 22h12 M11 7v2 M13 17v2",
  ],
  ["Hart", "M12 21 3.5 13C-3 6 7-2 12 6 17-2 27 6 20.5 13Z"],
  [
    "Sneaker",
    "M3 15 5 4l4 1 2 6 10 5a3 3 0 0 1 1 3v2H2v-6Z M3 17h19 M10 10l3-2 M13 12l3-2 M16 14l3-2",
  ],
  [
    "Skateboard",
    "M6 4c-4 1-4 5-1 7l9 9c2 3 6 3 7-1 1-2-1-4-3-6L9 5C8 4 7 4 6 4Z M5 9l4-4 M15 19l4-4 M5 14l-2 2 M8 17l-2 2 M15 4l2-2 M18 7l2-2",
  ],
  [
    "Paddenstoel",
    "M2 13a10 10 0 0 1 20 0Z M9 13l-1 8h8l-1-8 M7 8a1 1 0 1 0 0 .1 M15 7a1.5 1.5 0 1 0 0 .1 M12 11h.1",
  ],
  [
    "Smiley",
    "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z M7 9v2 M17 9v2 M6 14c2 6 10 6 12 0",
  ],
  [
    "Diamant",
    "M2 8l5-5h10l5 5-10 14Z M2 8h20 M7 3l-1 5 6 14 6-14-1-5 M6 8l6-5 6 5",
  ],
  ["Kroon", "M3 6l5 6 4-9 4 9 5-6-2 14H5Z M5 16h14 M12 18h.1"],
  [
    "Maan",
    "M20 15A9.5 9.5 0 1 1 9 3a9 9 0 0 0 11 12Z M17 3v4 M15 5h4 M21 9v2 M20 10h2",
  ],
  [
    "Wolk",
    "M7 18a5 5 0 1 1 0-10 7 7 0 0 1 13 3 3.5 3.5 0 0 1 0 7Z M7 21l-1 2 M13 21l-1 2 M19 21l-1 2",
  ],
  ["Ster", "M12 2l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z"],
  [
    "Sleutel",
    "M14 9a6 6 0 1 1-2-5 6 6 0 0 1 2 5Z M13 12l9 9 M17 16l3-3 M20 19l3-3 M6 7h.1",
  ],
  [
    "Slot",
    "M6 11V7a6 6 0 0 1 12 0v4 M4 11h16v11H4Z M12 15a1.5 1.5 0 1 0 0 .1 M12 17v2",
  ],
  ["Magneet", "M3 3h6v10a3 3 0 0 0 6 0V3h6v10a9 9 0 0 1-18 0Z M3 8h6 M15 8h6"],
  ["Batterij", "M2 7h17v12H2Z M19 10h3v6h-3 M6 10v6 M10 10v6 M14 10v6"],
  [
    "Toverdrank",
    "M8 2h8v4h-2v4c8 3 10 12-2 12S2 13 10 10V6H8Z M5 15c4-3 10 3 14 0 M10 17h.1 M15 19h.1",
  ],
  [
    "Burger",
    "M3 10a9 7 0 0 1 18 0Z M3 13h18 M2 16h20 M3 19h18l-2 3H5Z M7 6h.1 M12 5h.1 M16 7h.1 M5 13l4 3 5-3 4 3",
  ],
  [
    "Friet",
    "M4 10h16l-2 12H6Z M5 10 4 3l4-1 1 8 M10 10V1h4v9 M15 10l2-6 4 1-2 5 M9 14v4 M15 14v4",
  ],
  [
    "Donut",
    "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M3 9l3 1 1-4 4 1 3-3 3 4 4 1 M6 16l1 1 M16 17l1-1 M12 5v1",
  ],
  ["Frisdrank", "M6 7h12l-2 15H8Z M5 7h14 M13 7l1-5h6 M9 12h6 M9 15h6"],
  [
    "Noedels",
    "M2 11h20c0 8-5 11-10 11S2 19 2 11Z M4 16h16 M7 6c-2-2 2-2 0-4 M11 7c2-2-2-2 0-4 M15 8l4-7 M18 8l5-6 M6 11V9h9",
  ],
  [
    "Koffie",
    "M3 8h13v9c0 6-13 6-13 0Z M16 10h3c5 0 4 7-3 7 M2 23h16 M6 5c-2-2 2-2 0-4 M11 5c-2-2 2-2 0-4",
  ],
  [
    "Zonnebril",
    "M2 8h7l1 8H4Z M14 8h8l-2 8h-5Z M9 10c1-2 4-2 5 0 M2 8 1 5 M22 8l1-3 M4 10l2 3 M17 10l2 3",
  ],
  [
    "Toetsenbord",
    "M2 6h20v14H2Z M5 9h1 M9 9h1 M13 9h1 M17 9h2 M5 13h1 M9 13h1 M13 13h1 M17 13h2 M7 17h10",
  ],
  [
    "Computermuis",
    "M12 2c5 0 8 4 8 9v3c0 6-3 8-8 8s-8-2-8-8v-3c0-5 3-9 8-9Z M4 11h16 M12 2v9 M12 5v2",
  ],
  [
    "Camera",
    "M2 8h5l2-4h6l2 4h5v13H2Z M16 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z M18 10h1",
  ],
  [
    "Filmklapper",
    "M2 9h20v13H2Z M2 9 1 4 21 1l1 5Z M5 3l4 5 M12 2l4 5 M6 13h12 M6 17h8",
  ],
  [
    "Microfoon",
    "M8 3a4 4 0 0 1 8 0v9a4 4 0 0 1-8 0Z M5 10v2a7 7 0 0 0 14 0v-2 M12 19v4 M8 23h8 M8 6h8",
  ],
  [
    "Speaker",
    "M5 2h14v20H5Z M14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z M16 15a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z M12 15h.1",
  ],
  [
    "Vinylplaat",
    "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M5 11a7 7 0 0 1 6-6 M19 13a7 7 0 0 1-6 6 M12 12h.1",
  ],
  ["Floppy", "M3 2h15l4 4v16H2V2Z M6 2v7h11V2 M6 22V13h12v9 M13 4v3 M9 17h6"],
  [
    "Laptop",
    "M4 3h16v14H4Z M2 17h20l1 4H1Z M9 19h6 M8 8l-2 2 2 2 M16 8l2 2-2 2",
  ],
  [
    "Robot",
    "M4 7h16v14H4Z M12 7V3 M10 2h4 M8 10v3 M16 10v3 M8 17h8 M10 17v2 M14 17v2 M1 11v6 M23 11v6",
  ],
  [
    "Dobbelsteen",
    "M6 2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Z M7 6v2 M17 6v2 M12 11v2 M7 16v2 M17 16v2",
  ],
  [
    "Schaakpaard",
    "M5 22v-3l4-3-4-2 2-7 5-5 5 2 3 8-3 7v3Z M9 7l4 2-3 4 M15 6h.1 M5 19h12",
  ],
  [
    "Beker",
    "M6 2h12v8a6 6 0 0 1-12 0Z M6 4H2v4c0 4 4 4 5 4 M18 4h4v4c0 4-4 4-5 4 M12 16v5 M7 22h10",
  ],
  [
    "Stopwatch",
    "M21 14a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z M12 5V2 M9 1h6 M19 7l2-2 M12 9v5l3 2",
  ],
  [
    "Doelwit",
    "M21 12a9 9 0 1 1-9-9 M17 12a5 5 0 1 1-5-5 M12 12l9-9 M17 2v5h5 M12 12h.1",
  ],
  [
    "Atoom",
    "M22 12a10 4.5 0 1 1-20 0 10 4.5 0 1 1 20 0Z M17 20.66a10 4.5 60 1 1-10-17.32 10 4.5 60 1 1 10 17.32Z M17 3.34a10 4.5-60 1 1-10 17.32 10 4.5-60 1 1 10-17.32Z M12 12h.1",
  ],
  [
    "DNA",
    "M7 2c0 10 10 10 10 20 M17 2C17 12 7 12 7 22 M8 5h8 M10 9h4 M10 15h4 M8 19h8",
  ],
  [
    "Ufo",
    "M6 11a6 7 0 0 1 12 0 M2 12c0-3 20-3 20 0s-4 5-10 5S2 15 2 12Z M7 20l-2 3 M12 20v3 M17 20l2 3 M7 13h.1 M12 14h.1 M17 13h.1",
  ],
  [
    "Telescoop",
    "M2 8l14-6 5 10-14 6Z M18 6l3-1 2 4-3 1 M12 16v6 M12 17l-5 6 M12 17l5 6 M5 7l5 10",
  ],
  [
    "Komeet",
    "M4 13c-4 5 2 12 7 8 4-3 1-10-3-9l9-10-4 9 9-5-9 10 M7 16h.1 M6 20h.1",
  ],
  [
    "Bloem",
    "M12 8c-6-12-14 2-5 4-11 7 3 15 5 5 6 11 15-2 5-5 10-7-4-15-5-4Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  ],
  [
    "Kikker",
    "M5 10C-1 1 11 0 10 7h4C13 0 25 1 19 10c8 11-22 13-14 0Z M7 6h.1 M17 6h.1 M6 14q6 6 12 0 M9 18l-3 4 M15 18l3 4",
  ],
  ["Papieren vliegtuig", "M1 10 23 1l-7 22-5-9Z M11 14 23 1 M11 14l-1 7 4-4"],
];

const arcadeColors = [
  "#7554ca",
  "#dc593f",
  "#267d78",
  "#c38317",
  "#456ab4",
  "#b54c83",
];

export const SYMBOLS = Object.freeze(
  drawings.map(([name, path], id) =>
    Object.freeze({
      id,
      name,
      path,
      color: arcadeColors[id % arcadeColors.length],
    }),
  ),
);

export const PRESETS = Object.freeze([
  Object.freeze({
    id: "arcade",
    name: "After School",
    description:
      "Sneakers, snacks en een verloren cassette. Kleurrijk met een knipoog.",
    colors: Object.freeze([...arcadeColors]),
  }),
  Object.freeze({
    id: "cosmos",
    name: "Cosmic Club",
    description:
      "Dezelfde herkenbare crew, in paars, koraal en kosmisch blauw.",
    colors: Object.freeze([
      "#7054cf",
      "#3377b8",
      "#c04d83",
      "#177e86",
      "#bd6339",
      "#5963a7",
    ]),
  }),
  Object.freeze({
    id: "studio",
    name: "Ink Studio",
    description:
      "Strakke inkt, rustige kleuren. Voor wie op de vorm wil focussen.",
    colors: Object.freeze([
      "#183c3a",
      "#355e5b",
      "#416360",
      "#1f4547",
      "#48666b",
      "#294f54",
    ]),
  }),
]);

const escapeXML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

/** Return trusted inline SVG, safely resolving arbitrary imported symbol IDs. */
export function iconSVG(id, preset = "arcade") {
  const numericId = typeof id === "number" ? id : Number(id);
  const symbol =
    Number.isInteger(numericId) && numericId >= 0 && numericId < SYMBOLS.length
      ? SYMBOLS[numericId]
      : SYMBOLS[0];
  const theme = PRESETS.find((item) => item.id === preset) || PRESETS[0];
  const color = theme.colors[symbol.id % theme.colors.length];
  const strokeWidth =
    theme.id === "studio" ? "1.65" : theme.id === "cosmos" ? "1.8" : "1.9";
  const lineJoin = theme.id === "studio" ? "miter" : "round";
  return `<svg class="symbol-icon" xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 26 26" width="64" height="64" role="img" aria-label="${escapeXML(symbol.name)}" focusable="false"><title>${escapeXML(symbol.name)}</title><path d="${symbol.path}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="${lineJoin}"/></svg>`;
}
