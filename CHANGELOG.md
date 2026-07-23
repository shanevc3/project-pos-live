# Changelog

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
