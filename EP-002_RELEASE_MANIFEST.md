# EP-002 Release Manifest

**Release:** Project P.O.S. / Axiom v0.7.3 EP-002  
**Baseline:** Verified v0.7.2 EP-001  
**Patch type:** Small additive command-recognition improvement

## Intended change

Axiom now recognizes ordinary greetings instead of preserving them as unknown commands.

Recognized examples:

- `Hello Axiom`
- `Hi Axiom`
- `Hey Axiom`
- `Good morning Axiom`
- `Good afternoon Axiom`
- `Good evening Axiom`

The response confirms Axiom is ready and points the user to `help` for available command patterns.

## Files changed

- `core/executive.js`
- `app.js`
- `index.html`
- `404.html`
- `core/state.js`
- `package.json`
- `package-lock.json`
- `manifest.webmanifest`
- `sw.js`
- `scripts/verify-static.mjs`
- `CHANGELOG.md`

## Deployment invariant

`.github/workflows/deploy.yml` remains the only active GitHub Pages workflow. No secondary deployment workflow is included.
