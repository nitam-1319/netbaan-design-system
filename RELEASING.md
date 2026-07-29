# Releasing @netbaan-project/ui (private, GitHub Packages)

The package is published **privately** to GitHub Packages and is only installable
by accounts with access to the `netbaan-project/front-npm` repo. Nothing is
published to the public npm registry (the scope is pinned to
`https://npm.pkg.github.com` via `publishConfig` and `.npmrc`).

Only `dist/` + the knowledge files ship (`files` allowlist) — **no source leaks**.

## Recommended: release via CI (GitHub Actions)

`.github/workflows/release.yml` publishes using the repo's built-in
`GITHUB_TOKEN`, which has package-write rights to its own org — so releasing
does **not** depend on any person's org membership or personal token (this is
what fixes `403 permission_denied: create_package` from a personal account).

```sh
npm version patch          # bump + tag locally (or minor | major)
git push                   # push the bump commit
git push origin vX.Y.Z     # pushing the tag triggers the release workflow
```

Or run it manually: **Actions → Release → Run workflow**.

> First release only: if even CI is denied `create_package`, an org **owner**
> must allow the repo's Actions to create packages (Org/Repo → Settings →
> Actions/Packages), or publish v0.0.x once by hand to create the package.

## Manual release (fallback — requires org package-publish rights)

## One-time setup

1. **Keep the GitHub repo private.** Package visibility follows the repo; a
   private repo → a private package. Nobody outside its collaborators can install it.
2. **Create a GitHub Personal Access Token (classic)** with `write:packages` and
   `read:packages` (and `repo` for a private repo). Store it, e.g. in your shell:
   ```sh
   export NODE_AUTH_TOKEN=ghp_xxxxxxxx
   ```
   The committed `.npmrc` reads this env var — the token itself is never committed.

## Cut a release

```sh
npm version patch        # or minor | major — updates package.json + git tag
npm publish              # runs prepack (gen:barrel + build:js + build:css + build:catalog),
                         # ships only dist/ + catalog/AGENTS/CATALOG/RECIPES
git push && git push --tags
```

`npm publish` respects `publishConfig.registry`, so it goes to GitHub Packages —
never public npm. Verify the version bump is intended before publishing (a
published version cannot be overwritten).

## Consume it in a project

Add an `.npmrc` to the consuming project (token via env, not committed):

```
@netbaan-project:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Then:

```sh
npm i @netbaan-project/ui react react-dom @base-ui/react lucide-react
```

```tsx
import "@netbaan-project/ui/styles.css";     // once, at the app root
import { Button, ThemeProvider } from "@netbaan-project/ui";
```

The catalog for AI agents ships inside the package:
`node_modules/@netbaan-project/ui/CATALOG.md` (+ `catalog.json`, `AGENTS.md`,
`RECIPES.md`). Point your agent config at it (or copy `AGENTS.md`'s rules into the
consuming project's own `AGENTS.md`).

## Notes

- **Versioning:** simple `npm version` is used (solo/own-use). If releases get
  more frequent, adopt Changesets for changelog automation.
- **Never** run `npm publish --access public` or change `publishConfig.registry`
  — that is the only way this would leave GitHub Packages.
