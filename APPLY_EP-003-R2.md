# Apply EP-003-R2 on iPhone

1. Extract the ZIP in Files.
2. Upload all root files to the `project-pos-live` repository root.
3. Ensure `.github/workflows` contains only `deploy.yml`.
4. Commit directly to `main` with:
   `Release v0.7.4 EP-003-R2 root-layout verification repair`
5. Wait for both `verify` and `deploy` to turn green.
6. Refresh the live GitHub Pages site and confirm `v0.7.4 · EP-003-R2`.
7. Test `Hello Axiom` and one conversational command.

This release intentionally removes runtime dependence on nested folders because iPhone uploads can flatten their contents.
