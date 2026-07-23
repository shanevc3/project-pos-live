# Upload EP-003 to GitHub from iPhone

1. Preserve the currently running v0.7.3 EP-002 site as the rollback baseline.
2. Download and extract `Project_POS_Axiom_v0.7.4_EP-003_GitHub_Root.zip` in Files.
3. Open `project-pos-live` in Safari.
4. Choose **Add file → Upload files**.
5. Upload the contents inside the extracted folder to the repository root.
6. Commit directly to `main` with:

   `Release v0.7.4 EP-003 natural-language intent recognition`

7. Confirm `.github/workflows` contains only `deploy.yml`.
8. Wait for the GitHub Actions deployment to show a green check.
9. Refresh the GitHub Pages site in Safari.
10. Confirm `v0.7.4 · EP-003`.
11. Run the acceptance tests in `EP-003_VERIFICATION_REPORT.md`.

## Rollback

Revert the EP-003 commit in GitHub or restore the protected v0.7.3 EP-002 package. Never restore the deleted `main.yml` workflow.
