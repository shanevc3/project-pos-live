# EP-003 Release Manifest

**Release:** Project P.O.S. / Axiom v0.7.4 EP-003  
**Direction:** Build Era implementation under PE-001  
**Baseline:** Verified v0.7.3 EP-002 live repository

## Intended capability increase

Axiom now recognizes common conversational phrasing and resolves it into the existing command system without replacing or weakening canonical commands.

## Modified runtime files

- `core/executive.js`
- `app.js`
- `core/state.js`
- `index.html`
- `404.html`
- `manifest.webmanifest`
- `sw.js`
- `package.json`
- `package-lock.json`
- `scripts/verify-static.mjs`

## Added verification file

- `scripts/test-intents.mjs`

## Deployment protection

- Exactly one workflow remains: `.github/workflows/deploy.yml`.
- No archived ZIP is used as a deployment source.
- All user data remains in the existing local-storage schema and is migrated in place.
