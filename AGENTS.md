# AGENTS.md — Context for coding agents

## Project overview

Personal website for Raghav Kaul. Source code lives in `kaulraghav/raghav-website-v2`.
Currently deployed as a preview at `https://kaulraghav.github.io/raghav-website-v2/`.
When ready to go live, it will replace the old site at `https://kaulraghav.github.io`.

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

## Critical: base path handling

The site is deployed under `/raghav-website-v2/` as a preview. All internal links must account for this.

**Every page that constructs internal hrefs must use:**
```ts
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
```

Then build links as `${base}blog/`, `${base}music/`, etc.

**Do NOT use bare absolute paths** like `/blog/` — they will 404 under the base path.

**When going live** (switching to `kaulraghav.github.io`):
1. Remove `base: '/raghav-website-v2'` from `astro.config.mjs`
2. The `base` variable will then resolve to `/` — all links remain correct
3. Push built `dist/` to `master` branch of `kaulraghav/kaulraghav.github.io`

## ⚠️ Do not touch

- `kaulraghav/kaulraghav.github.io` repo — this is the live old site on `master`. Do not push to it without explicit user approval.
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

## Going live checklist (when ready)

- [ ] Remove `base: '/raghav-website-v2'` from `astro.config.mjs`
- [ ] Run `npm run build` and verify
- [ ] Push `dist/` to `master` of `kaulraghav/kaulraghav.github.io`
- [ ] Update `public/admin/config.yml` → `repo: kaulraghav/kaulraghav.github.io`, `branch: master`
- [ ] Update Supabase allowed redirect URLs to include `https://kaulraghav.github.io/*` (already done)
