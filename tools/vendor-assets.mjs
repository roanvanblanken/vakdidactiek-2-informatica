import { mkdir, copyFile, cp, readdir } from "node:fs/promises";
import { resolve } from "node:path";
const base = resolve("tools/vendor/node_modules"),
  blockly = resolve("assets/vendor/blockly"),
  fonts = resolve("assets/fonts");
await mkdir(blockly, { recursive: true });
await mkdir(fonts, { recursive: true });
await mkdir(resolve(blockly, "msg"), { recursive: true });
for (const f of [
  "blockly_compressed.js",
  "blocks_compressed.js",
  "python_compressed.js",
  "LICENSE",
])
  await copyFile(resolve(base, "blockly", f), resolve(blockly, f));
await copyFile(
  resolve(base, "blockly/msg/nl.js"),
  resolve(blockly, "msg/nl.js"),
);
await cp(resolve(base, "blockly/media"), resolve(blockly, "media"), {
  recursive: true,
});
for (const name of ["dm-sans", "space-grotesk"]) {
  const source = resolve(base, "@fontsource-variable", name);
  await copyFile(
    resolve(source, `files/${name}-latin-wght-normal.woff2`),
    resolve(fonts, `${name}-latin-wght-normal.woff2`),
  );
  const license = (await readdir(source)).find((f) =>
    /^(license|ofl)/i.test(f),
  );
  if (license)
    await copyFile(
      resolve(source, license),
      resolve(fonts, `${name}-LICENSE.txt`),
    );
}
console.log("Blockly 13.3.0 en beide lettertypen staan lokaal, met licenties.");
