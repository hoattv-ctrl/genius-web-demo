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
  useRealBackend: true,                               // t2i wired; needs bundleId below to actually run
  beBase: "https://api-ai-genius-iip055.aperogroup.ai", // web API base (IIP055). dev/prod per BE.
  bundleId: "aiphotogenerator.aifaceeditor.aivideogenerator.aibeauty.web", // whitelisted by BE; resolves the signing key server-side

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
    // Firebase project iip055-genius, web app "test-noti-web". Web config is
    // CLIENT-SAFE (public by design; secured by Authorized Domains + rules).
    // ⚠ Add localhost + hoattv-ctrl.github.io to Auth → Settings → Authorized domains.
    apiKey: "AIzaSyAAP0F3fVHjjf5-u8n0slwvo8MZFLaHsFg",
    authDomain: "iip055-genius.firebaseapp.com",
    projectId: "iip055-genius",
    appId: "1:965419273267:web:19471f4a6e57d48db0e746",
    messagingSenderId: "965419273267",
    storageBucket: "iip055-genius.firebasestorage.app",
    measurementId: "G-YDSMGWP07G"
  }
};
