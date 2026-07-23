# EP-003-R2 Release Manifest

## Purpose
Repair GitHub Actions verification and make the release resilient to iPhone uploads that flatten nested folders.

## Changes
- Runtime imports now use root-level modules.
- Verification, intent tests, and staging run from root-level scripts.
- Service-worker precache now uses root-level runtime modules and icons.
- Manifest icon paths now use root-level icons.
- GitHub Actions uses Node.js 24.
- Exactly one workflow remains: `.github/workflows/deploy.yml`.

## Preserved
- Natural-language intent recognition from EP-003.
- Existing event preservation, governance, memory, recovery, sessions, diagnostics, and UI behavior.
- Existing nested `core/`, `icons/`, and `scripts/` folders remain as compatibility/reference copies, but deployment no longer depends on them.
