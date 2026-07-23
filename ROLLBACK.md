# EP-001 Rollback Instructions

The original working source is preserved in the separate canonical baseline ZIP supplied before this patch:

`project-pos-live-main 2.zip`

The repository also retains:

`Project_POS_Live_Site_v0.7.1_Public_Safe.zip`

That embedded ZIP is an archival recovery artifact, not an active deployment source.

## Preferred rollback through GitHub

1. Open the `project-pos-live` repository in Safari on iPhone.
2. Open **Commits** and select the commit immediately before the EP-001 upload.
3. Restore the repository files from that commit, or use GitHub's revert function when available.
4. Confirm that `.github/workflows/deploy.yml` is present.
5. Wait for the single **Project POS Deploy** workflow to finish.
6. Open the live site in a fresh Safari tab and verify the expected prior version.

## Full-file rollback from the protected baseline

1. Download and extract `project-pos-live-main 2.zip` from your protected local copy.
2. Upload its contents to the root of `project-pos-live`.
3. Remove files that exist only in EP-001 if a complete historical restoration is required.
4. Commit the restoration with a message such as `Rollback EP-001 to protected v0.7.1 baseline`.
5. Watch GitHub Actions until deployment succeeds.
6. Reload the live site. On iPhone, close and reopen the Home Screen app if cached files remain visible.

## Important

Do not reactivate `.github/workflows/main.yml` merely to roll back. Two active Pages workflows recreate the deployment race that EP-001 removes.
