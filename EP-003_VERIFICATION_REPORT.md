# EP-003 Verification Report

## Automated checks

Run:

```text
npm run check
```

Required result:

```text
EP-003 natural-language intent tests passed.
Project P.O.S. repository verification passed.
```

## Live iPhone acceptance test

1. Confirm `v0.7.4 · EP-003`.
2. Enter `Hello Axiom`.
3. Enter `Could you please show me the system status?`.
4. Enter `What should I do next?`.
5. Confirm previously working commands still operate.
6. Confirm Safari and Home Screen app both load.

## Known platform limitation

Direct Web Speech recognition remains unavailable in iOS Home Screen standalone mode. Safari voice and Home Screen keyboard dictation remain the supported paths.
