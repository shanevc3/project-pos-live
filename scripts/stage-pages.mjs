import { cp, mkdir, rm } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

const files = [
  ".nojekyll",
  "404.html",
  "app.js",
  "index.html",
  "manifest.webmanifest",
  "offline.html",
  "styles.css",
  "sw.js"
];

const directories = ["core", "icons"];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of files) {
  await cp(resolve(root, file), resolve(dist, file));
}

for (const directory of directories) {
  await cp(resolve(root, directory), resolve(dist, directory), {
    recursive: true
  });
}

console.log("GitHub Pages artifact staged in dist/.");
