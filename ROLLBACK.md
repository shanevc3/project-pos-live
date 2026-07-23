# Rollback Instructions

## Preferred rollback

Use GitHub commit history to revert the EP-003 release commit. This restores v0.7.3 EP-002 while preserving the single `deploy.yml` workflow.

## Package rollback

Upload the protected contents of `Project_POS_Axiom_v0.7.3_EP-002_GitHub_Root.zip` to the repository root. Confirm `.github/workflows` still contains only `deploy.yml`.

## Never restore

Do not restore `.github/workflows/main.yml`. It was the conflicting archived-ZIP deployment path removed by EP-001.
