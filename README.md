# Genius — Web Demo (IIP055)

Pixverse-style AI creation portal (M0 prototype). **Public demo runs in mock mode** —
sign-in and generation are simulated so the full flow is testable without a backend.

- **Live:** https://hoattv-ctrl.github.io/genius-web-demo/
- Pick a mini-app → add a prompt/photo → generate → result lands in your Gallery.
- Only **AI Image Generator** is the focus service; others are catalog previews.

Single-file app (`index.html`) + runtime config (`config.js`). Backend wiring
(server-signed `/api/v1/web/*`) is built-in but disabled in this public build.
