# Changelog

## v0.7.4 EP-003-R3
- Fixed GitHub Actions `ERR_MODULE_NOT_FOUND` caused by `test-intents.mjs` importing `../core/executive.js`.
- Standardized active verification and runtime imports on repository-root files.
- Corrected the duplicated visible release marker.
- Advanced the service-worker cache and root Apple touch icon reference.
- Added regression guards for the failed EP-003 upload paths.

## v0.7.4 EP-003-R2

- Repaired GitHub Actions verification for iPhone-flattened uploads.
- Moved runtime and verification dependencies to repository-root files.
- Updated service-worker and manifest paths to root-level modules and icons.
- Updated workflow runtime to Node.js 24.

## v0.7.4 · EP-003 · Natural-Language Intent Recognition

- Added polite conversational phrasing support without changing existing canonical commands.
- Added wake-word handling for both `Axiom, hello` and `hello Axiom`.
- Added natural requests such as `show me`, `can you`, `could you`, and `I would like you to`.
- Added a direct `show_next_step` intent for questions such as `What should I do next?`.
- Added automated intent regression tests.
- Preserved the single `deploy.yml` workflow and all existing runtime behavior.

## v0.7.3 · EP-002 · Greeting Recognition Patch

- Added direct recognition for common greetings including `Hello Axiom`, `Hi Axiom`, and time-of-day greetings.
- Added a concise ready response that directs users to `help`.
- Preserved the verified single GitHub Pages deployment pipeline.
- Advanced application, visible release, and service-worker cache versions.
- Retained all existing EP-001 behavior and the documented iOS Home Screen speech limitation.

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

## v0.7.4 · EP-003-R1

- Corrected the EP-003 runtime-module mismatch.
- Aligned `core/executive.js` with the natural-language intent implementation.
- Added a verification guard so this specific mismatch cannot silently recur.
- Advanced the visible marker and service-worker cache for the repair release.
