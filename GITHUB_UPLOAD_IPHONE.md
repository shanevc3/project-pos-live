# Upload EP-002 to GitHub from iPhone

1. Preserve the currently working v0.7.2 repository as the rollback baseline.
2. Download and extract `Project_POS_Axiom_v0.7.3_EP-002_GitHub_Root.zip` in Files.
3. Open `project-pos-live` in Safari and choose **Add file → Upload files**.
4. Select every item inside the extracted folder, including `.github`, `core`, `icons`, and `scripts`.
5. Upload into the repository root, not into an enclosing folder.
6. Commit directly to `main` with:

   `Release v0.7.3 EP-002 greeting recognition patch`

7. Open `.github/workflows` and confirm only `deploy.yml` remains.
8. Wait for the GitHub Actions deployment to finish successfully.
9. Open the live Pages URL in Safari and refresh.
10. Confirm the marker reads `v0.7.3 · EP-002`.
11. Enter or speak `Hello Axiom` and confirm the greeting is recognized.

## Rollback

Use GitHub commit history to revert the EP-002 commit, or restore the protected v0.7.2 EP-001 package. Do not restore `main.yml`.
