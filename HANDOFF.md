> **Mục tiêu:** đưa Genius lên **web** (pivot) — AI Creation Studio chạy thẳng trên trình duyệt, giao diện **dark tối giản kiểu Google AI Studio**. Bản M0 ship 1 feature **AI Image Generator (t2i)** wired backend thật; các feature khác ẩn cho tới M1. Doc này để **dev/tester đọc là nắm hết luồng + start được ngay**.
> Project: **IIP055 Genius** · Owner: HoàTTV · Source: `apps/genius-web/` (repo artimind-kb).

Scope
-----

| Feature | Route | Trạng thái |
| --- | --- | --- |
| Home / Explore | `#/home` | live |
| Create (catalog feature) | `#/create` | live |
| AI Image Generator (t2i) | `#/app/t2i` | live — **wired BE thật** (fal Seedream) |
| Gallery | `#/gallery` | live (mock localStorage / server khi có bundleId) |
| Plan (Genius Pro) | `#/wallet` | live — checkout **production-ready** (mock fallback tới khi nối billing) |
| Earn | `#/earn` | live (mock) |

> M0 chỉ `t2i` là feature live. `M0_SERVICES = ["t2i"]` quyết định cái gì hiện ra; thêm feature M1 = thêm id vào mảng này + điền `workflows[id]` trong `config.js`. Không có card "Coming soon", không có feed video.

Run demo
--------

```bash
cd apps/genius-web && python3 -m http.server 8755   # → mở http://localhost:8755/
```

`index.html` self-contained (HTML + CSS + JS inline, không build, không dep). State ở `localStorage` key `genius_web` (xoá để reset). **Live demo:** <https://hoattv-ctrl.github.io/genius-web-demo/> (deploy từ `main` của repo `github.com/hoattv-ctrl/genius-web-demo`).

Entry & Navigation
------------------

* SPA hash-router: sidebar trái (nhóm **Explore** / **Your stuff**) điều hướng giữa Home · Create · Gallery · Plan · Earn.
* Home = **"Explore Genius"**: heading + toggle Models/Agents + prompt bar + lưới feature card.
* Card feature kiểu model-card (icon + tên + mô tả, **không thumbnail**). Tap card → service page `#/app/{id}`.
* Mọi hành động tạo nội dung / mua gói / điểm danh **đều gate đăng nhập** — chưa login thì mở modal, login xong tự chạy tiếp hành động.

Design
------

* **Dark mode**, layout Google AI Studio. Accent tím dùng tiết chế.
* Tokens (`:root` trong `index.html`): `--bg:#131314 · --sidebar:#1b1c1d · --card:#1e1f20 · --card-2:#26282a`; text `--tx:#e8eaed / --tx2:#9aa0a6 / --tx3:#6e7681`; `--primary:#b794f6`; font **Satoshi**; radius 12/16/pill.
* Logo: `assets/logo.png` (sidebar brand + modal đăng nhập).

Monetization — Subscription (KHÔNG có credit)
---------------------------------------------

* **Chỉ bán subscription (Genius Pro). Không có credit/balance ở bất kỳ đâu.**
* **M0: generate FREE cho tất cả, không gating.** Pro chỉ là upsell (không chặn tạo nội dung).
* Sau M0: Free tier có soft-limit (watermark / standard quality), Pro gỡ (HD, no watermark, priority queue). Reward (check-in, referral) tặng **free Pro time**, không phải credit.
* `PLANS[]`: Weekly / Monthly (Most popular) / Yearly. **Bán sub ngay** qua `startCheckout()` → khi `config.billing.useRealCheckout=true` + có price ids + 2 endpoint BE (`/billing/checkout` tạo session redirect, `/billing/status` trả `{active}`) thì charge thật; chưa cấu hình → mock flip để demo. `subscribe()` không đổi chữ ký, chỉ cần ghép BE là bán được.

Auth
----

* **Firebase Auth thật** (Google / Apple / Email) — bật khi `config.firebase.apiKey` có giá trị; chưa cấu hình → **mock fallback** (demo offline chạy được, modal hiện cảnh báo "Demo mode").
* `onAuthStateChanged` là single source of truth → set `S.user` → render. Reload trang giữ nguyên phiên.
* Firebase web config là client-safe (bảo vệ bằng Authorized Domains) → để trong `config.js`. Setup: `firebase-setup.md`.

Backend wiring (chỗ DUY NHẤT có logic thật)
-------------------------------------------

* Mọi call gói trong **`callBackend(service, input, onStatus)`**. Browser chỉ gửi 2 header định danh `x-api-bundleid` + `x-api-email` — **BE tự ký server-side** (không proxy, không secret ở browser).
* Flow: `POST /api/v1/web/execute {workflowId, input}` → `runId` → poll `GET /api/v1/web/:runId/status` mỗi ~4s đến `completed|failed|cancelled`. Gallery server: `GET /api/v1/web/jobs?page=&limit=`.
* **t2i đã wired**: fal `seedream/v4.5/text-to-image`, `workflowId 3e01896a-…`. `buildInput.t2i` phát đúng schema; `parseOutput` đọc `output.resultFile`.
* **Real vs Mock**: chỉ gọi BE thật khi đủ `useRealBackend:true` **+** service có `workflowId` **+** `config.bundleId` đã set; thiếu bất kỳ cái nào → tự mock.
* **Còn chờ BE**: ⚠ `bundleId` whitelist (điền `config.js` là t2i chạy thật e2e) · workflowId + schema input các service M1 · bước upload/host ảnh (presigned) cho i2i/i2v.
* Contract đầy đủ: `.claude/rules/be-services/ai-workflow-api.md` (execute/poll/presigned, mã lỗi `ERR01–ERR25`).

Rules chung
-----------

* **Chưa đăng nhập mà bấm Run / Subscribe / Check-in → mở modal đăng nhập**, login xong tự chạy tiếp hành động vừa bấm.
* **Run mà prompt trống → toast "Type a prompt first"**, không tạo job. (Service cần ảnh mà chưa upload → toast "Upload a photo first".)
* **Mở thẳng route service chưa live → toast "coming soon" + về `#/create`.**
* **Tạo job xong**: item vào đầu Gallery (status `processing`); panel Result hiện spinner + nhãn trạng thái; xong → `success` (kết quả + lưu Gallery + toast), lỗi → `failed` (lỗi hiển thị **cố định** ở Result + toast).
* **Mỗi kết quả đều Save vào Gallery; ở service page có "View in Gallery" / "Run again".**
* **Mất mạng / timeout / BE lỗi → message lỗi đúng nguyên nhân** ("Network error…", "Timed out…", hoặc message từ BE). Timeout: service thường 90s, async (video) 5 phút.
* **Subscribe → `startCheckout`**: billing bật → redirect tới Checkout của provider (BE giữ secret); chưa bật → mock flip `Pro active`. Quay lại `?billing=success` → `refreshSubscription()` xác nhận từ BE. **Cancel → về Free**.

User Flow
---------

**Chung:** `Sidebar → chọn màn`. Mọi action tạo nội dung/mua/điểm danh → nếu chưa login: `modal Sign in (Google/Apple/Email) → login → tự chạy tiếp`.

**Generate (t2i):** `#/home gõ prompt → Generate (hoặc tap card AI Image Generator)` → `#/app/t2i` (prompt điền sẵn) → chỉnh Ratio (1:1/9:16/16:9) · Images (1/2/4) ở dock dưới (optional) → bấm nút **gửi** (mũi tên) hoặc Enter → [chưa login → modal → login → chạy tiếp] → job `processing` (spinner + trạng thái) → [BE completed → Result hiện ảnh + lưu Gallery + toast "ready ✦" | failed/timeout → Result hiện lỗi cố định + toast].

**Gallery:** `#/gallery` → [chưa login → empty "Sign in" | mock → list localStorage mới nhất trước | real (có bundleId) → fetch `/jobs` từng trang + pager Prev/Next] → mỗi item badge `Processing / Success / Failed`.

**Plan:** `#/wallet` → account row + trạng thái gói + 3 gói + perks + Activity → **Subscribe** (login nếu cần) → Pro active → (Cancel → Free).

**Earn:** `#/earn` → Check-in (login nếu cần → toast streak) · Copy referral (→ clipboard + toast) · Affiliate ("Coming at M4").

Coverage — Happy cases
----------------------

| # | Màn | Case | Kết quả mong đợi |
| --- | --- | --- | --- |
| HC-1 | Home | Mở `#/home` | "Explore Genius" + prompt bar + **chỉ feature live** (t2i); không coming-soon, không feed video |
| HC-2 | Home | Gõ prompt → Generate | Sang `#/app/t2i`, prompt điền sẵn |
| HC-3 | Auth | (chưa login) bấm Run input hợp lệ | Mở modal → login xong **tự chạy generate** (không bấm lại) |
| HC-4 | t2i | (đã login) Run prompt hợp lệ | Job `processing` vào Gallery; Result spinner → `success`: hiện ảnh + toast "ready ✦" |
| HC-5 | t2i | Run lại / mở lại service | "Recent on this app" + preview kết quả gần nhất |
| HC-6 | Gallery | (real mode) mở Gallery | Fetch `/jobs` 1 lần/trang + pager; item đúng badge trạng thái |
| HC-7 | Plan | Subscribe 1 gói | `Pro active` khắp UI; gói disabled; Activity log + toast |
| HC-8 | Earn | Check-in / Copy referral | Toast "Checked in 🎁" / link vào clipboard + toast |

Coverage — Edge cases
---------------------

| # | Màn | Case | Kết quả mong đợi |
| --- | --- | --- | --- |
| EC-1 | t2i | Run prompt trống | Toast "Type a prompt first"; không tạo job |
| EC-2 | t2i | BE failed/cancelled/timeout/mất mạng | Item `failed`; Result hiện **lỗi cố định** + toast "Generation failed"; message đúng nguyên nhân |
| EC-3 | Service | Mở `#/app/{id}` của feature chưa live | Toast "coming soon" + redirect `#/create` |
| EC-4 | BE | Real mode nhưng thiếu email | Trả "Please sign in first." (không gọi BE) |
| EC-5 | BE | Thiếu `bundleId` / workflowId / `useRealBackend=false` | Tự chạy **mock**, demo vẫn render kết quả |
| EC-6 | Gallery | Chưa đăng nhập | Empty state "Sign in to see your creations" |
| EC-7 | Gallery | Vừa tạo job mới | Lần mở Gallery kế tiếp refetch trang 1 |
| EC-8 | Auth | Email password < 6 ký tự / thiếu field | Toast "Check your details"; không submit |
| EC-9 | Auth | (chưa cấu hình Firebase) đăng nhập | Mock login; modal có cảnh báo "Demo mode" |
| EC-10 | Auth | Reload trang khi đang đăng nhập | Giữ phiên (onAuthStateChanged set lại user) |
| EC-11 | Plan | Đang Pro → Cancel | Về Free; Activity log + toast |
| EC-12 | t2i | (M0) user Free generate | Không bị gating bởi credit/limit (M0 free cho tất cả) |

Event tracking
--------------

Đo App funnel (drop qua từng bước), time-to-result, paywall/subscribe, virality (referral), chất lượng service (success/fail rate). Mapping event chi tiết: bổ sung sau khi chốt sheet tracking (tham chiếu mẫu app: IIP055 World Cup Edition tracking sheet).

---

| Stakeholder | PIC | Status | Related |
| --- | --- | --- | --- |
| PO | HoàTTV |  | `apps/genius-web/README.md` · `kb/iip055-genius/web-product-doc.md` |
| Dev |  |  | `config.example.js` · `firebase-setup.md` · `.claude/rules/be-services/ai-workflow-api.md` |
| Test |  |  | Coverage HC/EC ở trên |
