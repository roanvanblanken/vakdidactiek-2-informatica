import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve(process.argv.includes("--dist") ? "dist" : "."),
  port = Number(process.env.PORT || 4173);
const base = process.argv.find((x) => x.startsWith("--base="))?.slice(7) || "/";
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".wasm": "application/wasm",
  ".woff2": "font/woff2",
};
http
  .createServer(async (req, res) => {
    try {
      let pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (!pathname.startsWith(base)) throw Error();
      pathname = "/" + pathname.slice(base.length);
      if (pathname.endsWith("/")) pathname += "index.html";
      const file = resolve(root, "." + pathname);
      if (file !== root && !file.startsWith(root + sep)) {
        res.writeHead(403);
        return res.end("Forbidden");
      }
      if (
        file.includes(`${sep}node_modules${sep}`) ||
        file.includes(`${sep}.git${sep}`)
      ) {
        res.writeHead(403);
        return res.end("Forbidden");
      }
      if (!(await stat(file)).isFile()) throw Error();
      res.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Matchlab: http://127.0.0.1:${port}${base}`),
  );
