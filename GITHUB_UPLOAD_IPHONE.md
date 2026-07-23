# Upload EP-001 to GitHub from iPhone

This package is a complete repository-root release. Upload the **contents inside the extracted folder**, not the enclosing folder itself.

## Safer test-first path

1. In GitHub, create a new test repository or a temporary branch from the current `project-pos-live` state.
2. Download and extract `Project_POS_Axiom_v0.7.2_EP-001_GitHub_Root.zip` in the iPhone Files app.
3. In Safari, open the test repository and choose **Add file → Upload files**.
4. Upload all extracted files and folders to the repository root.
5. Confirm that `.github/workflows/deploy.yml` exists and `.github/workflows/main.yml` does not.
6. Commit with: `Deploy v0.7.2 EP-001 single-pipeline patch`.
7. Open **Actions** and wait for **Project POS Deploy** to complete successfully.
8. Test the Pages URL in Safari. Confirm the top version marker reads `v0.7.2 · EP-001`.
9. Test the Home Screen installation. Close and reopen it so the new service-worker cache can activate.

## Apply to the live repository

After the test deployment succeeds, repeat the same root upload in `project-pos-live`.

## Verification checklist

- Only one workflow runs: **Project POS Deploy**.
- No workflow extracts `Project_POS_Live_Site_v0.7.1_Public_Safe.zip`.
- The live version marker reads `v0.7.2 · EP-001`.
- Axiom opens in Safari.
- Axiom opens from the Home Screen.
- Existing local data remains available.
- Offline fallback still loads after the new cache has been installed once online.
