import { access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const requiredFiles = [
  ".nojekyll",
  "404.html",
  "app.js",
  "index.html",
  "manifest.webmanifest",
  "offline.html",
  "styles.css",
  "sw.js",
  "core/constitution.js",
  "core/diagnostics.js",
  "core/executive.js",
  "core/focus.js",
  "core/governance.js",
  "core/memory.js",
  "core/recovery.js",
  "core/sessions.js",
  "core/state.js",
  "core/testing.js",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

for (const relativePath of requiredFiles) {
  await access(resolve(root, relativePath), constants.R_OK);
}

const manifest = JSON.parse(
  await readFile(resolve(root, "manifest.webmanifest"), "utf8")
);

if (manifest.start_url !== "./" || manifest.scope !== "./") {
  throw new Error(
    "manifest.webmanifest must keep relative start_url and scope for GitHub Pages."
  );
}

const serviceWorker = await readFile(resolve(root, "sw.js"), "utf8");

for (const relativePath of requiredFiles.filter(path =>
  path.startsWith("core/") || path.startsWith("icons/")
)) {
  if (!serviceWorker.includes(`./${relativePath}`)) {
    throw new Error(`Service Worker does not precache ${relativePath}`);
  }
}

const indexHtml = await readFile(resolve(root, "index.html"), "utf8");
for (const reference of ["styles.css", "manifest.webmanifest", "app.js"]) {
  if (!indexHtml.includes(reference)) {
    throw new Error(`index.html does not reference ${reference}`);
  }
}


const workflowDirectory = resolve(root, ".github/workflows");
const workflowFiles = (await readdir(workflowDirectory)).filter(file =>
  file.endsWith(".yml") || file.endsWith(".yaml")
);

if (workflowFiles.length !== 1 || workflowFiles[0] !== "deploy.yml") {
  throw new Error(
    `Expected exactly one deployment workflow named deploy.yml; found: ${workflowFiles.join(", ")}`
  );
}

if (!indexHtml.includes("v0.7.4 · EP-003")) {
  throw new Error("index.html does not contain the EP-003 visible version marker.");
}

if (!serviceWorker.includes("project-pos-axiom-v0.7.4-ep003")) {
  throw new Error("Service Worker cache version was not advanced for EP-003.");
}

console.log("Project P.O.S. repository verification passed.");
