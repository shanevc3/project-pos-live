# Apply EP-003-R3 from iPhone

1. Extract the downloaded ZIP in Files.
2. Upload the contents inside the extracted folder to the root of `project-pos-live`.
3. Commit directly to `main` with:
   `Release v0.7.4 EP-003-R3 verification path repair`
4. Confirm `.github/workflows` still contains only `deploy.yml`.
5. Wait for GitHub Actions `verify` and `deploy` to turn green.
6. Refresh the GitHub Pages site.
7. Confirm `v0.7.4 · EP-003-R3` appears.
8. Test `Hello Axiom` and `Could you please show me the system status?`.

Rollback: restore the previously downloaded working repository ZIP if verification or runtime testing fails.
