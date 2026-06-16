# Genius — Web Demo (IIP055)

Pixverse-style AI creation portal (M0 prototype). **Real-backend build.**

- **Live:** https://hoattv-ctrl.github.io/genius-web-demo/
- **Login:** real Firebase (Google) — project `iip055-genius`.
- **Generate:** AI Image Generator → server-signed `/api/v1/web/*` (fal seedream v4.5).
  Requires BE to register the fal-ai key for the web bundleId (else jobs return ERR103).
- **Gallery:** pulls the signed-in user's jobs from `GET /api/v1/web/jobs`.

Single-file app (`index.html`) + runtime config (`config.js`). The values in
config.js (Firebase web key, bundleId, BE base, workflowId) are client-safe by
design — security is enforced server-side (BE signing key) + Firebase Authorized
Domains, not by hiding these.
