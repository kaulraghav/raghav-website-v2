# AGENTS.md — Context for coding agents

## Project overview

Personal website for Raghav Kaul. Source code lives in `kaulraghav/raghav-website-v2`.
Deployed at `https://kaulraghav.github.io` — pushing to `main` builds and publishes automatically.

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Astro 6 (static output) |
| Hosting | GitHub Pages, deployed via GitHub Actions on push to `main` |
| CMS | Sveltia CMS at `/admin` — writes markdown to this repo, triggers rebuild |
| CMS OAuth | Cloudflare Worker at `https://raghav-cms-auth.kaulraghav.workers.dev` |
| Likes | Supabase (project: `https://yjgthlmkjjqjnsmciczg.supabase.co`) |
| Like auth | Google OAuth via Supabase Auth |

## Functional requirements

1. **Home** — reverse-chronological activity feed aggregating blog posts, music, and gallery items grouped by month
2. **Blog** — tag filters, month-wise archive sidebar, likes with Google auth on each post
3. **Music** — grid of YouTube/SoundCloud embed cards
4. **Gallery** — photo grid with captions
5. **Contact** — email link and resume PDF download
6. **CMS** — all content (posts, music, gallery, images) must be manageable from `/admin` without touching source code

## Content collections

Defined in `src/content.config.ts`. Content files live in:

- `src/content/blog/*.md` — blog posts
- `src/content/music/*.md` — music embeds
- `src/content/gallery/*.md` — gallery photos

## Internal links

Every page that constructs internal hrefs must use:
```ts
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
```

Then build links as `${base}blog/`, `${base}music/`, etc. Do NOT use bare absolute paths like `/blog/`.

## ⚠️ Do not touch

- `kaulraghav/kaulraghav.github.io` repo — the deploy workflow pushes built files here automatically. Do not push manually without explicit user approval.
- Cloudflare Worker secrets (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`) — already set via `wrangler secret put`. Do not re-upload or log them.
- Supabase anon key in `src/pages/blog/[slug].astro` — public by design (Supabase RLS enforces security), but do not move it server-side.

## Agent workflow rules

- **Always run `npm run build` and confirm it passes before marking any task done.**
- **Batch small changes — do not commit after every file edit.** The user commits in logical groups.
- **Get explicit user approval before committing or pushing.**
- **Get explicit user approval before any destructive git operations** (reset, force push, branch delete).
- When adding new pages or changing navigation, update `src/layouts/BaseLayout.astro` nav array.
- When adding new content types, update both `src/content.config.ts` and `public/admin/config.yml`.

## Deployment

Push to `main` → GitHub Actions builds Astro → deploys to GitHub Pages automatically (~35 seconds).
Workflow file: `.github/workflows/deploy.yml`.

CMS saves (via Sveltia CMS at `/admin`) commit directly to `main` → same pipeline triggers.

## Deployment

Push to `main` → GitHub Actions builds Astro → pushes `dist/` to `kaulraghav/kaulraghav.github.io` master → live at `https://kaulraghav.github.io` (~35 seconds).

CMS saves (via Sveltia CMS at `/admin`) commit directly to `main` → same pipeline triggers.
