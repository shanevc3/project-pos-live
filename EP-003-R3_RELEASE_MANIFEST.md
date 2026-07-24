# EP-003-R3 Release Manifest

## Release
- Version: `v0.7.4 · EP-003-R3`
- Purpose: verification-path and iPhone root-layout reliability repair
- Baseline: user-supplied running `project-pos-live-main 4(1).zip`

## Repairs
1. Corrected `test-intents.mjs` to import `./executive.js` from the repository root.
2. Removed the broken `../core/executive.js` dependency that caused GitHub Actions `ERR_MODULE_NOT_FOUND`.
3. Corrected the duplicated visible version marker (`EP-003-R2-R2`).
4. Updated the service-worker cache key to force the repaired runtime to refresh.
5. Changed the Apple touch icon reference to the root-level icon for iPhone upload compatibility.
6. Added verification guards that reject the exact broken import and icon path before deployment.

## Deployment invariant
Exactly one workflow remains: `.github/workflows/deploy.yml`.
