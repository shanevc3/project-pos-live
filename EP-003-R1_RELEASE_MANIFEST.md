# EP-003-R1 Release Manifest

## Release

- Version: `v0.7.4 · EP-003-R1`
- Type: Corrective release
- Baseline: User-supplied `project-pos-live-main 3.zip`

## Corrective change

The uploaded repository contained the EP-003 natural-language implementation in the root-level `executive.js`, while the live application and test suite import `core/executive.js`. The runtime module remained on the older implementation, causing GitHub Actions to fail.

This release:

1. Aligns `core/executive.js` with the EP-003 natural-language implementation.
2. Keeps `.github/workflows/deploy.yml` as the only workflow.
3. Adds a verification guard requiring `canonicalizeNaturalLanguage` in the actual runtime module.
4. Advances the visible marker and service-worker cache to the repair release.

## Intended behavior

Existing commands remain available. Natural-language inputs including greetings, polite requests, next-step questions, project creation, note capture, and next-stone phrasing are recognized by the runtime used by `app.js`.
