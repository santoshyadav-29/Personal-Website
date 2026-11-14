# Santosh Yadav — personal site

Astro + React islands, Convex backend, and `@convex-dev/auth` (email/password, optional GitHub/Google).

Public pages render CMS content from Convex. `/personal-stuff` is a private admin area (blog CMS, site sections, private file storage).

## Prerequisites

- Node.js `>= 22.23.4`
- npm

## Local development (anonymous Convex, no login)

```bash
npm install

# 1) Start / configure a local anonymous Convex backend
export CONVEX_AGENT_MODE=anonymous
npx convex init          # first time only — writes CONVEX_* into .env.local
npx convex dev           # keep running: push functions + watch

# 2) In another terminal, set Convex Auth + admin env on that deployment
#    (generate keys once — see .env.example)
npx convex env set JWT_PRIVATE_KEY "-----BEGIN PRIVATE KEY----- …"
npx convex env set JWKS '{"keys":[…]}'
npx convex env set SITE_URL http://localhost:4321
npx convex env set ADMIN_EMAIL you@example.com

# 3) Point the Astro app at the local backend (also in .env.local)
PUBLIC_CONVEX_URL=http://127.0.0.1:3210
PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:3211
PUBLIC_SITE_URL=http://localhost:4321

# 4) Seed migrated content (safe to re-run)
npx convex run seed:seedAll

# 5) Run the site
npm run dev
```

Open http://localhost:4321

### Make yourself admin

1. Set `ADMIN_EMAIL` on the Convex deployment to your email.
2. Sign up / sign in on `/auth` with that email.
3. You are treated as admin immediately (server checks `ADMIN_EMAIL`). Optionally also run:

```bash
npx convex run users:setAdminRoleForEmail '{"email":"you@example.com"}'
```

(while signed in as that user, or after `ADMIN_EMAIL` matches).

## Deploy Convex (one command)

From a machine logged into Santosh’s Convex account:

```bash
npx convex deploy
```

Then set the **same** env vars on the **production** deployment:

| Variable | Required | Purpose |
| --- | --- | --- |
| `JWT_PRIVATE_KEY` | yes | Convex Auth signing key |
| `JWKS` | yes | Convex Auth public JWKS |
| `SITE_URL` | yes* | Site origin (`https://your.domain`) — needed for OAuth |
| `ADMIN_EMAIL` | yes | Admin identity (Santosh’s email) |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | no | GitHub OAuth |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | no | Google OAuth |

\*Password auth works without `SITE_URL`; OAuth redirects need it.

On the **hosting** side for the Astro app, set:

| Variable | Purpose |
| --- | --- |
| `PUBLIC_CONVEX_URL` | Production Convex URL (`https://….convex.cloud`) |
| `PUBLIC_CONVEX_SITE_URL` | HTTP Actions URL (`https://….convex.site`) |
| `PUBLIC_SITE_URL` | Canonical site URL |

Astro uses `@astrojs/vercel` automatically when `VERCEL=1` (Vercel builds). Locally it keeps `@astrojs/node` in standalone mode for `npm run build` / `astro preview`.

Seed production once:

```bash
npx convex run seed:seedAll --prod
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Astro dev server |
| `npm run build` | `astro check` + production build |
| `npm run convex:local` | `CONVEX_AGENT_MODE=anonymous convex dev` |
| `npm run convex:deploy` | `npx convex deploy` |
| `npm run seed` | `convex run seed:seedAll` |

## Auth model

- Anyone can sign up / sign in (password; OAuth if configured).
- Signed-in public users can like and comment on published posts.
- Admin is decided **only on the server** via `ADMIN_EMAIL` (and optional `users.role === "admin"` set by seed/CLI). The client cannot grant admin.
- Every admin query/mutation/file proxy calls `requireAdmin()`.

## Private files

Blobs live in Convex file storage. Metadata is admin-only. Bytes are served from `GET /private-file/:id` on the Convex HTTP Actions URL and require a Convex Auth bearer token belonging to the admin.

## Content

Homepage sections, FAQ, and blog posts are stored in Convex (`siteSections`, `posts`). The previous markdown/hardcoded copy is migrated by `seed:seedAll`.
