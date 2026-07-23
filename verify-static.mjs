import { access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const requiredFiles = [
  ".nojekyll",
  "404.html",
  "app.js",
  "index.html",
  "manifest.webmanifest",
  "offline.html",
  "styles.css",
  "sw.js",
  "constitution.js",
  "diagnostics.js",
  "executive.js",
  "focus.js",
  "governance.js",
  "memory.js",
  "recovery.js",
  "sessions.js",
  "state.js",
  "testing.js",
  "icon-180.png",
  "icon-192.png",
  "icon-512.png"
];

for (const relativePath of requiredFiles) {
  await access(resolve(root, relativePath), constants.R_OK);
}

const manifest = JSON.parse(await readFile(resolve(root, "manifest.webmanifest"), "utf8"));
if (manifest.start_url !== "./" || manifest.scope !== "./") {
  throw new Error("manifest.webmanifest must keep relative start_url and scope for GitHub Pages.");
}

const serviceWorker = await readFile(resolve(root, "sw.js"), "utf8");
for (const relativePath of requiredFiles.filter(path => path.endsWith(".js") || path.endsWith(".png"))) {
  if (["sw.js"].includes(relativePath)) continue;
  if (!serviceWorker.includes(`./${relativePath}`)) {
    throw new Error(`Service Worker does not precache ${relativePath}`);
  }
}

const indexHtml = await readFile(resolve(root, "index.html"), "utf8");
for (const reference of ["styles.css", "manifest.webmanifest", "app.js"]) {
  if (!indexHtml.includes(reference)) throw new Error(`index.html does not reference ${reference}`);
}

const workflowDirectory = resolve(root, ".github/workflows");
const workflowFiles = (await readdir(workflowDirectory)).filter(file => file.endsWith(".yml") || file.endsWith(".yaml"));
if (workflowFiles.length !== 1 || workflowFiles[0] !== "deploy.yml") {
  throw new Error(`Expected exactly one deployment workflow named deploy.yml; found: ${workflowFiles.join(", ")}`);
}

if (!indexHtml.includes("v0.7.4 · EP-003-R2")) {
  throw new Error("index.html does not contain the EP-003-R2 visible version marker.");
}
if (!serviceWorker.includes("project-pos-axiom-v0.7.4-ep003-r2")) {
  throw new Error("Service Worker cache version was not advanced for EP-003-R2.");
}

const app = await readFile(resolve(root, "app.js"), "utf8");
if (app.includes("./core/")) {
  throw new Error("app.js still depends on nested core paths; EP-003-R2 requires root-level runtime modules.");
}

console.log("Project P.O.S. root-layout repository verification passed.");
