import { mkdir, copyFile, cp, rm } from "node:fs/promises";
import { resolve } from "node:path";
const root = process.cwd(),
  dist = resolve(root, "dist");
if (
  !dist.startsWith(resolve(root) + "\\") &&
  !dist.startsWith(resolve(root) + "/")
)
  throw Error("Unsafe output path");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const file of ["index.html", "styles.css", "README.md"])
  await copyFile(resolve(root, file), resolve(dist, file));
for (const folder of ["js", "assets", "docs"])
  await cp(resolve(root, folder), resolve(dist, folder), { recursive: true });
await copyFile(resolve(root, "index.html"), resolve(dist, "404.html"));
await copyFile(resolve(root, ".nojekyll"), resolve(dist, ".nojekyll"));
console.log(
  "Static site ready: dist/ (HTML, CSS, JavaScript, SVG, lesdocumentatie).",
);
