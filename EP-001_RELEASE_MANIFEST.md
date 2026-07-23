# EP-001 Release Manifest

**Release:** Project P.O.S. / Axiom v0.7.2 EP-001  
**Purpose:** Remove the conflicting GitHub Pages deployment path while preserving the current working application.  
**Canonical input:** `project-pos-live-main 2.zip`  
**Deployment authority:** `.github/workflows/deploy.yml`

## Files removed

- `.github/workflows/main.yml`

## Application files intentionally modified

- `index.html`
- `404.html`
- `core/state.js`
- `sw.js`
- `manifest.webmanifest`

## Release documentation added

- `CHANGELOG.md`
- `ROLLBACK.md`
- `GITHUB_UPLOAD_IPHONE.md`
- `EP-001_RELEASE_MANIFEST.md`

## Preserved recovery artifact

- `Project_POS_Live_Site_v0.7.1_Public_Safe.zip`

The preserved ZIP is not referenced by the active deployment workflow.

## Verification commands

```sh
npm install
npm run check
```

The packaged release must pass these commands before distribution.
