/* ─────────────────────────────────────────────────────────────────────────
   Genius web — runtime config (CLIENT-SAFE values only)
   Copy this file to `config.js` (gitignored) and fill in.
     cp config.example.js config.js

   ✅ Server-signed web API. The browser sends ONLY two identity headers
      (`x-api-bundleid` + `x-api-email`). The backend resolves the `publicKey`
      by bundleId, reads the `apiKey` from its own env, and signs the request
      itself before forwarding to the workflow service.
      → NO signing secret and NO proxy is needed on the client. Everything in
        this file is public / client-safe by design.

   When porting to Next.js, drop this file and use env vars instead:
     NEXT_PUBLIC_BE_BASE, NEXT_PUBLIC_BUNDLE_ID, NEXT_PUBLIC_WORKFLOW_*  (all client-safe)
   ───────────────────────────────────────────────────────────────────────── */
window.CONFIG = {
  useRealBackend: false,                              // flip true once bundleId is whitelisted + workflowIds are filled
  beBase: "https://api-ai-genius-iip055.aperogroup.ai", // web API base (IIP055). dev/prod per BE.
  bundleId: "",                                       // <-- whitelisted by BE; resolves the signing key server-side

  // Map each mini-app service id → its workflowId on the workflow service.
  // Fill these in as BE sends them. A service with no id here falls back to mock.
  workflows: {
    t2i: "3e01896a-fef2-4896-9a97-b68960d19170",      // AI Image Generator — fal seedream/v4.5/text-to-image
    // "i2i-restyle":     "",   // Image Restyle
    // headshot:          "",   // AI Headshot
    // restore:           "",   // AI Photo Restore
    // i2v:               "",   // Image to Video
    // "living-portrait": "",   // Living Portrait
    // jersey:            "",   // Jersey Try-on
    // makeup:            "",   // AI Looks
  },

  // Firebase Auth — CLIENT-SAFE (public by design; secured by Authorized Domains
  // + security rules, NOT by hiding the key). Paste from Firebase Console →
  // Project settings → Your apps → Web app → SDK setup. Leave blank = demo/mock mode.
  // Setup steps: see firebase-setup.md
  firebase: {
    apiKey: "",
    authDomain: "",          // e.g. genius-web.firebaseapp.com  (add app.genius.aperogroup.io to Authorized domains)
    projectId: "",
    appId: "",
    // messagingSenderId, storageBucket — optional for auth-only
  },

  // Billing — Genius Pro subscription (CLIENT-SAFE: only price ids + redirect urls).
  // The payment provider (Stripe/etc.) + secret keys live on BE. To SELL for real,
  // flip useRealCheckout=true, fill the prices map, and stand up two BE endpoints:
  //   POST {createSessionPath}  body {planId, priceId, successUrl, cancelUrl} → { url }  (provider-hosted Checkout)
  //   GET  {statusPath}         → { active: boolean }                                    (current subscription)
  // Both authenticated by the same identity headers as the AI API (x-api-bundleid + x-api-email).
  // Left false = local mock (subscribe flips plan locally so the flow still demos).
  billing: {
    useRealCheckout: false,
    createSessionPath: "/api/v1/web/billing/checkout",
    statusPath: "/api/v1/web/billing/status",
    prices: { weekly: "", monthly: "", yearly: "" },   // planId → provider price id (e.g. Stripe price_xxx)
    successUrl: "",   // default: current page + ?billing=success
    cancelUrl: ""     // default: current page + ?billing=cancel
  }
};
