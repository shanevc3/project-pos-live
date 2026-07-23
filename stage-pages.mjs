import { cp, mkdir, rm } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dist = resolve(root, "dist");
const files = [
  ".nojekyll", "404.html", "app.js", "index.html", "manifest.webmanifest",
  "offline.html", "styles.css", "sw.js", "constitution.js", "diagnostics.js",
  "executive.js", "focus.js", "governance.js", "memory.js", "recovery.js",
  "sessions.js", "state.js", "testing.js", "icon-180.png", "icon-192.png", "icon-512.png"
];
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const file of files) await cp(resolve(root, file), resolve(dist, file));
console.log("GitHub Pages root-layout artifact staged in dist/.");
