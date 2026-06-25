# genius-web

Web pivot codebase for Genius (IIP055). See product plan: `kb/iip055-genius/web-pivot-plan.md`.

## Current contents

| File | What |
|---|---|
| `index.html` | **M0 app prototype** — Pixverse-pattern AI portal. Self-contained (HTML + inline CSS/JS, no build, no deps). Open directly in a browser. Full flow works end-to-end with **mocked** generation. |
| `config.example.js` → `config.js` | Client-safe runtime config (BE base, workflow ids, **Firebase web config**). Copy the example to `config.js` (gitignored) and fill in. |
| `firebase-setup.md` | Step-by-step Firebase Console setup to turn on real auth. |
| `.env.example` | Server-side **secrets** (BE signature key) for the Next.js port — never client-side. |
| `marketing-landing.html` | Previous App-Store acquisition funnel (deeplink → App Store). Kept as a marketing page; superseded by the app for the web pivot. |

## What the prototype does (Pixverse logic/flow)

Mirrors `app.pixverse.ai`: **browse feed → pick a Mini App → input → generate → async job → result lands in Gallery.**

**Monetization = subscription (Genius Pro) ONLY. There are NO credits anywhere.** At **M0 generation is free for everyone** — no balance, no limits, no gating. Pro is shown purely as an upsell. Later, the Free tier gets *soft* limits (watermark / standard quality) and Pro removes them (HD, no watermark, priority) — but never a credit balance. Growth rewards (daily check-in, referral) grant **free Pro time**, not credits.

- **Home** — prompt bar (quick t2i) + hero + Mini Apps + community feed (seeded with bundled assets, to be replaced by Nam's CDN content).
- **Create** — catalog of the 6 M1 services (mini apps).
- **Service page** — one reusable template for all 6: input (prompt / upload / style) → Run → live job status → result. Reused per `SERVICES[]` config.
- **Gallery** — user history with `processing / success / failed` states.
- **Plan** — account + plan status (Free / Pro), **Genius Pro plans** (weekly/monthly/yearly), activity log. No credits — generation is free at M0.
- **Earn** — daily check-in + referral + affiliate — rewards are **free Pro time** (Pixverse "Earn" lever, adapted to a sub model).
- **Auth** — **real Firebase Auth** (Google / Apple / Email) gating generation, with mock fallback when unconfigured. Setup: `firebase-setup.md`.

State persists in `localStorage` (`genius_web` key). Clear it to reset.

## The 6 services (M1 V1)

`t2i` (AI Image Generator, Seedream) · `i2i-restyle` · `headshot` · `restore` · `i2v` (Image→Video, async) · `living-portrait` (async). Defined in the `SERVICES[]` array — add a service = add one object.

## Wiring real generation (the ONE place to change)

All backend logic is isolated in `callBackend()`, which calls the **server-signed web API** (`/api/v1/web/*`). The browser sends **only** two identity headers — `x-api-bundleid` + `x-api-email` — and BE resolves the signing key by bundleId and signs server-side. **No proxy, no browser secret.**

- Base: `https://api-ai-genius-iip055.aperogroup.ai`. `useRealBackend: true`.
- **t2i is wired** → fal `seedream/v4.5/text-to-image`, workflowId `3e01896a-fef2-4896-9a97-b68960d19170`. `buildInput.t2i` emits the real schema (`prompt`, `imageSize:"square_hd"`, `numImages`, `max_images`, `seed`, `syncMode`, `enableSafetyChecker`); `parseOutput` reads `output.resultFile`.
- Per service: `callBackend()` does `POST /api/v1/web/execute { workflowId, input }` → polls `GET /api/v1/web/:runId/status` every ~4s until `completed|failed|cancelled`.
- A service with **no workflowId**, or while **no bundleId** is set, auto-falls back to the mock so the catalog still demos.
- `fetchJobs()` wraps `GET /api/v1/web/jobs` for an optional server-backed Gallery.
- **⚠ Last blocker — `bundleId`:** BE must provide the whitelisted bundle id that resolves the signing key. Drop it into `config.js → bundleId` and t2i goes live end-to-end. (Verified the endpoint is up: missing-header requests return the documented `ERR119` 400s.)
- **Still pending from BE:** workflowIds for the other services, their `input` schemas, and an image upload/host step for i2i/i2v (local objectURLs aren't server-reachable).

## Design system (sourced from the iOS app)

Tokens in `:root` (Figma `wV87UrqGWiJrr0YgzEAFI0`): dark theme (`#000` / `#15131D` / `#1E1C28` / `#382D4A`), violet gradient `#B14DFF → #7A2BF6`, **Satoshi** type (Fontshare CDN), rounded-card radii + pill buttons.

## Notes for FE dev

- **Tech stack is your call** — this is a runnable reference. Port to Next.js/React; carry the `:root` token block + the `SERVICES[]` / `PACKS[]` / `FEED[]` config and the screen flow verbatim.
- Swap mock auth → **Firebase** (Google + Apple + Email), mock Pro → **Stripe subscription Checkout + webhook** (flips `plan` to `pro`) at M1, seed `FEED[]` → **Nam's CDN assets** (`po/hoattv/genius/content-ops/`).
- Subscription prices (`PLANS[]`) are **indicative** — finalized at M1.

> ⚠️ **Model note:** the locked `web-pivot-plan.md` describes a pay-as-you-go *credit* model. Per PO (HoàTTV, 2026-06-15), Genius now monetizes via **subscription**, not credit sales. This prototype reflects the subscription decision; the plan doc should be reconciled.
