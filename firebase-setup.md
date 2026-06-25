# Firebase Auth — setup (Genius web, M0)

The prototype (`index.html`) ships with Firebase Auth wired (Google · Apple · Email).
Until `config.js → firebase` is filled, it runs in **demo/mock mode** (fake sign-in).
Follow these steps once to make it real.

## 1. Create the Firebase project
1. [Firebase Console](https://console.firebase.google.com) → **Add project** → name it `genius-web` (or reuse the Apero project if one exists).
2. Skip / enable Analytics as you prefer.

## 2. Register a Web app
1. Project Overview → **</> (Web)** → register app `genius-web`.
2. Copy the `firebaseConfig` object → paste the fields into `config.js → firebase`
   (`apiKey`, `authDomain`, `projectId`, `appId`).
   - These are **client-safe / public** — they're protected by Authorized Domains + security rules, not by secrecy. OK to ship to the browser.

## 3. Enable sign-in providers
Build → **Authentication** → **Sign-in method** → enable:
- **Google** — one click (set support email).
- **Email/Password** — toggle on.
- **Apple** — requires an Apple Developer account: create a Services ID + key, fill the Apple provider form. (Can defer; Google + Email are enough to unblock M0.)

## 4. Authorize your domains
Authentication → Settings → **Authorized domains** → add:
- `localhost` (already there — for local testing)
- `app.genius.aperogroup.io` (production)
- any staging/preview domain (e.g. Vercel `*.vercel.app`)

> ⚠️ Sign-in popups fail with `auth/unauthorized-domain` if the domain isn't listed.

## 5. Test
- `localhost` won't work from a `file://` double-click for OAuth popups. Serve locally:
  ```bash
  cd apps/genius-web && python3 -m http.server 5173
  # open http://localhost:5173
  ```
- Click **Create** → a gated action → **Continue with Google** → real popup → signed in.
- Mock mode (no config) still works by double-clicking `index.html`.

## What's mocked vs real
| Piece | M0 prototype | Production target |
|---|---|---|
| Auth | ✅ **real Firebase** (this doc) | Firebase |
| User profile store | `localStorage` | Firestore user doc on first login |
| Wallet / Pro | mock (`localStorage`) | Firestore + Stripe subscription (M1) |
| Generation | mock | BE-AI-Wrapper proxy (after ChiênBM whitelist) |

## Notes for the Next.js port
- Use the **modular** SDK (`firebase/app`, `firebase/auth`) instead of the compat CDN build used here.
- Put client-safe config in `NEXT_PUBLIC_FIREBASE_*` env vars.
- For SSR/session, exchange the Firebase ID token for a session cookie via the Admin SDK (server-only service-account key — that one IS a secret, keep it in server env).
