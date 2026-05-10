# raghav-website-v2

Personal website for Raghav Kaul — blog, music, photography.

**Live:** https://kaulraghav.github.io

## Tech stack

| Layer | Tool |
|---|---|
| Framework | [Astro 6](https://astro.build) (static output) |
| Hosting | GitHub Pages, deployed via GitHub Actions on push to `main` |
| CMS | [Sveltia CMS](https://github.com/sveltia/sveltia-cms) at `/admin` |
| CMS Auth | Cloudflare Worker OAuth proxy (`cms-auth-worker/`) |
| Likes | [Supabase](https://supabase.com) + Google OAuth |

## Local development

**Prerequisites:** Node.js 22+ — install via [nvm](https://github.com/nvm-sh/nvm):

```sh
nvm install 22
nvm use 22
```

### Start the dev server

```sh
npm install
npm run dev
```

The dev server starts at `http://localhost:4321/raghav-website-v2`.

### Build and preview the production output

```sh
npm run build
npm run preview
```

### Stamp post timestamps locally (optional)

In production, post `date` fields are automatically stamped with the git commit
timestamp (America/Los_Angeles) by `scripts/stamp_dates.py`. For local testing
with accurate sort order, run it manually before building:

```sh
python scripts/stamp_dates.py
npm run build
npm run preview
```

Requires Python 3.9+ and a full git history (`git clone` without `--depth`).
This modifies the local markdown files — do not commit those changes.

## Content

Managed via the CMS at `/admin` (requires GitHub login via Sveltia CMS).

| Type | Location |
|---|---|
| Blog posts | `src/content/blog/*.md` |
| Music | `src/content/music/*.md` |
| Gallery | `src/content/gallery/*.md` |
| Images | `public/images/` |

## Deployment

Push to `main` → GitHub Actions builds Astro → deploys to GitHub Pages (~35 s).

Blog post `date` fields are stamped at build time with the file's first git
commit timestamp in PST/PDT. The source files are not modified — the stamp is
ephemeral and only affects the build output.

## Going live

See `AGENTS.md` for the going-live checklist.
