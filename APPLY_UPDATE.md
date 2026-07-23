# Apply PH-009 update in Working Copy

Copy the contents of this folder into the root of `project-pos-live` while the
local branch is `development`.

This update adds or replaces only:

- `.github/workflows/deploy.yml`
- `package.json`
- `package-lock.json`
- `scripts/verify-static.mjs`
- `scripts/stage-pages.mjs`

Commit message:

`Add PH-009 verification and Pages deployment`

Then push `development`, create a pull request into `main`, and merge only after
reviewing the changed files.

Expected result after merge:

- `verify` passes
- `deploy` passes
- GitHub Pages publishes the staged `dist` artifact
