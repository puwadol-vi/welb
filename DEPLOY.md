# Next.js on Cloudflare: Deployment

## Deploy script

```bash
npx opennextjs-cloudflare build && npx opennextjs-cloudflare deploy
```

If deploy fails: check **Wrangler config** (`wrangler.toml`), **env** (see below), and that `.open-next/` exists after the build.

## Supabase env (required for DB)

The app uses **`@supabase/supabase-js`** only. Workers don’t read `.env` at runtime. Set secrets in Cloudflare:

```bash
npx wrangler secret put NEXT_PUBLIC_SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Use your Supabase project URL and the **service_role** key (Project → Settings → API). For server-side only you can use `SUPABASE_URL` instead of `NEXT_PUBLIC_SUPABASE_URL`; the client reads either. Then redeploy.

---

## All ways to run Next.js on Cloudflare (and limitations)

| Method | What it is | Pros | Cons | Limitations |
|--------|-------------|------|------|-------------|
| **1. OpenNext + Workers** (what you use) | `@opennextjs/cloudflare` builds Next.js for Cloudflare Workers (Workerd + Node compat). | Full App Router, RSC, SSR, **ISR**, Server Actions, API routes, streaming. Node compat. Use KV/R2/D1; Supabase via HTTP. | Needs Wrangler + config. | Node.js middleware (Next 15.2+) not supported. |
| **2. next-on-pages** | `@cloudflare/next-on-pages` builds for **Cloudflare Pages** (Edge). | Git-based deploys, preview branches, simple “connect repo” flow. | **Archived (read-only)** Sep 2025. Edge-only, no Node runtime. | No real ISR; Edge-only APIs; many Node libs (e.g. some DB drivers) don’t work. Not recommended for new apps. |
| **3. Static export + Pages** | `next build` with `output: 'export'` → static HTML in `out/`. Upload to Pages as static assets. | Very simple, no Workers runtime, cheap. | No SSR, no API routes, no ISR, no Server Actions. | Only CSR/SSG. No `getServerSideProps`/RSC server logic. Not suitable if you need API or DB on the server. |
| **4. Hybrid (static + external API)** | Static export for frontend; run API/DB elsewhere (e.g. separate Worker, Supabase Edge Functions, or another host). | Next frontend on CF; backend decoupled. | Two deployments; CORS and auth to manage. | Next.js API routes and server-side DB access are not in this Next app; they live elsewhere. |

---

## Per-method summary

### 1. OpenNext + Cloudflare Workers (recommended for you)

- **CSR:** ✓  
- **SSR:** ✓  
- **ISR:** ✓ (needs KV namespace in `wrangler.toml`; you have `NEXT_CACHE`)  
- **App Router + API routes:** ✓  
- **Supabase:** ✓ via `@supabase/supabase-js`; set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Workers.

**Limitations:** No Node.js middleware; compatibility date and `nodejs_compat` required.

---

### 2. next-on-pages (Pages / Edge)

- **CSR:** ✓  
- **SSR:** ✓ (Edge only)  
- **ISR:** Limited / not real ISR  
- **App Router / API routes:** Partially (Edge-compatible only)

**Limitations:** Project archived; Edge runtime only; no Node runtime; many Node-based DB drivers and libs don’t work. Not recommended for new projects.

---

### 3. Static export (Pages, static only)

- **CSR / SSG:** ✓  
- **SSR / ISR / API routes / Server Actions:** ✗  

**Limitations:** Only static output; no server-side DB or API in this Next app.

---

### 4. Hybrid (static Next on CF + backend elsewhere)

- Next: static on Pages (or even Workers with static assets).
- API/DB: different service (e.g. Supabase, another Worker, or other host).

**Limitations:** Next.js server features (API routes, RSC server data, Server Actions) are not used in this Next app for DB/API; those live in the other service.

---

## What to use for your stack

Your app uses **Next.js with CSR, ISR, SSR, App Router API routes, and Supabase Postgres**. The only option that supports all of that on Cloudflare is **OpenNext + Workers**, which you already use.

- **Supabase:** set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the Worker.  
- Deploy: `npx opennextjs-cloudflare build && npx opennextjs-cloudflare deploy` (or via Git/CI).

For deploy via Git: Cloudflare Workers → Build configuration → build command `npx opennextjs-cloudflare build`, output `.open-next`, and set the Supabase env in “Build variables and secrets”.
