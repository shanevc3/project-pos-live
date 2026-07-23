# Changelog

## v0.7.2 · EP-001 · First Verified Patch Release

### Changed

- Removed `.github/workflows/main.yml`, the secondary deployment workflow that extracted and deployed the archived v0.7.1 ZIP.
- Retained `.github/workflows/deploy.yml` as the single authoritative GitHub Pages deployment pipeline.
- Updated the visible Axiom version marker to `v0.7.2 · EP-001`.
- Updated the internal application version to `0.7.2`.
- Advanced the service-worker cache name so iPhone and Home Screen installations can receive the patched application shell.
- Updated the web-app manifest description for EP-001.

### Unchanged

- Application behavior, interface structure, local-first storage, voice controls, core modules, icons, and offline support were intentionally preserved.
- `Project_POS_Live_Site_v0.7.1_Public_Safe.zip` remains in the repository as a recovery artifact only. It is no longer used by any active deployment workflow.
