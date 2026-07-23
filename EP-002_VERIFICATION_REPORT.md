# EP-002 Verification Report

## Automated verification

- JavaScript syntax checks: required
- Static repository verification: required
- Single-workflow invariant: required
- Fresh extraction verification: required
- Greeting classifier tests: required

## Manual iPhone verification

After deployment:

1. Confirm the visible marker reads `v0.7.3 · EP-002`.
2. In Safari, enter or speak `Hello Axiom`.
3. Confirm Axiom replies that it is ready instead of reporting an unknown command.
4. Confirm `help` still opens command patterns.
5. Confirm the Home Screen app still loads and accepts typed input or keyboard dictation.
6. Confirm `.github/workflows` contains only `deploy.yml`.

## Known platform limitation

Direct Web Speech recognition remains unavailable in iOS Home Screen standalone mode. EP-002 does not attempt to bypass that platform limitation.
