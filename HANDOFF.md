> Feature **Genius Web (IIP055)** — AI Creation Studio chạy trên trình duyệt, giao diện dark tối giản kiểu Google AI Studio / Davinci. M0 ship **1 feature: AI Image Generator (t2i — Seedream 4.5)**. Funnel kiểu Davinci: **Welcome → Start Free → Login → Paywall → Home → Create → Generate → Result**.
> Doc này bám đúng `genius-web-userflow.drawio` (cùng thư mục). **Design chi tiết: PO gửi sau** (phần Design bỏ qua ở doc này).

Scope
-----

Khách vào web → **Welcome/Intro** (marketing). **Start Free Now** → **Login** (Google/Apple/Email) → **Paywall** ("Pick your plan") → đóng/mua → **Home/Explore**. Từ Home vào **AI Image Generator (t2i)**: nhập prompt + chọn Ratio / số ảnh → **Generate**. Loading hiển thị **dạng blur ngay trong canvas**, **gen N ảnh → N ô loading**. Xong → **Result** (Save / Share / View Gallery / Generate again). **M0: generate FREE cho mọi user** — Paywall chỉ là upsell, đóng được. Subscription (Genius Pro) là sản phẩm trả phí duy nhất, **không có credit**.

Entry & Navigation
------------------

* **Khách mới** mở URL gốc (không có hash) → tự vào **Welcome** đúng **1 lần** (cờ `onboarded`); qua rồi không ép lại.
* SPA hash-router; sidebar trái cố định: **Home · Explore · History · Profile** + nhóm **AI Tools** (Image Generator · Video Generator) + card **Go Pro / Upgrade Now**. (Đã bỏ Templates & Image Editor.) Video Generator → toast "coming soon" (chưa wired).
* Mọi action **tạo nội dung / mua gói / điểm danh** gate đăng nhập: chưa login → mở Login modal → login xong **tự chạy tiếp** action vừa bấm (không bấm lại).

Bảng map màn ↔ route
--------------------

| Mã | Màn | Route / surface | Ghi chú |
| --- | --- | --- | --- |
| W | Welcome / Intro | `#/welcome` (full-screen, ẩn sidebar) | marketing landing; CTA Start Free / Try Genius |
| L | Login | modal | Google / Apple / Email (+ Microsoft `NEEDS`) |
| PW | Paywall "Pick your plan" | modal | mở sau login onboarding & từ Go Pro (topbar) |
| H | Home | `#/home` | hero + create box (toggle ảnh/video · model · Ratio · Images) + 4 card |
| EX | Explore | `#/explore` | masonry grid + tabs (History · Explore · Styles · Spotlight) + bottom prompt dock |
| PR | Profile | `#/profile` | avatar + username + Edit Profile + `N Likes · N Creations` + tabs Creations/Likes |
| C | AI Image Generator (t2i) | `#/app/t2i` | canvas + dock: **toggle ảnh/video** (trên prompt) · model · Ratio · Images |
| GEN | Generating (blur trong canvas) | trên C | N ô blur = N ảnh; mỗi ô resolve độc lập |
| R | Result | trên C | **Save · Share · Report** · View Gallery · Generate again |
| GA | History / Gallery | `#/gallery` | processing / success / failed |
| PL | Plan (Genius Pro) | `#/wallet` | account + gói + Activity; Go Pro → Paywall |
| EA | Earn | `#/earn` | check-in / referral (free Pro time) |

> Sidebar: **Home · Explore · History · Profile** + AI Tools (**Image Generator · Video Generator**). Đã **bỏ** Templates, Image Editor, và card **Go Pro** ở đáy sidebar. Video Generator → toast "coming soon". Toggle ảnh/video trên prompt: chọn Video ở M0 → toast "coming soon".

Flow
----

```
Start (mở link) → [khách mới: Welcome]
Welcome ─ Start Free Now → Login → (OK) → Paywall
        ─ Try Genius → C (t2i)            (không cần login để xem)
Login ─ OK → Paywall ; Cancel/lỗi → Welcome
Paywall ─ Continue (mua) → [OK → Home(Pro)] / [Fail → ở lại]
        ─ X / Maybe later → Home(Free)
Home ─ prompt/chọn t2i → C ; nav → Plan / Earn / Gallery
C ─ Tap Generate → [Đã login?]
    • Chưa → Login modal → xong tự chạy tiếp
    • Rồi  → GEN (blur N ô) → [Gen OK?]
              ├─ Success → R (ảnh trong canvas)
              └─ Fail → toast/Retry (giữ input) → C
R ─ Save (Photos/Gallery) / Share (OS sheet) / View Gallery / Generate again
Plan ─ Go Pro → Paywall
```

Function Requirements
---------------------

### W — Welcome / Intro

| AC | Scenario | Given | When | Then |
| --- | --- | --- | --- | --- |
| AC1 | S1: khách mới | Lần đầu mở URL gốc (no hash), `onboarded=false` | App boot | Tự điều hướng `#/welcome`; hiện hero + 2 CTA **Start Free Now** · **Try Genius**; nav trên: logo · Sign in · Start Free Now |
| AC1 | S2: đã onboarded | `onboarded=true` hoặc mở kèm hash cụ thể | App boot | KHÔNG ép Welcome; vào thẳng route đang mở / Home |
| AC2 | S1: Start Free — chưa login | Ở Welcome, **chưa** đăng nhập | Tap **Start Free Now** (hoặc **Sign in**) | Set `onboarded=true`; mở **Login**; login xong (lần đầu) → **Home + Paywall** |
| AC2 | S2: Start Free — đã login (cache) | Ở Welcome, **đã** đăng nhập (vd back từ Home về) | Tap **Start Free Now** / **Sign in** | Vào **thẳng Home** với tài khoản đã login trước đó (cache); **KHÔNG** login lại, **KHÔNG** hiện Paywall |
| AC2 | S3: Try Genius | Ở Welcome | Tap **Try Genius →** | Set `onboarded=true`; vào thẳng **C (`#/app/t2i`)**; chưa chặn login |
| AC3 | S1: Back từ Home sau login | Vừa login xong, đang ở **Home** | Tap **Back** (browser) | Điều hướng về **Welcome / Intro** (history: Welcome → Home) |
| AC4 | S1: Pricing/Go Pro (Davinci-ref) | Ở Welcome | Tap Pricing / Go Pro (nếu có) | Mở **Paywall** (hoặc Plan) |

### L — Login (modal)

| AC | Scenario | Given | When | Then |
| --- | --- | --- | --- | --- |
| AC1 | S1: hiển thị | Trigger từ action cần auth | Modal mở | Tiêu đề "Sign in to Genius"; nút Continue with **Google / Apple / Email**; link Terms · Privacy; nút X |
| AC1 | S2: demo mode | `config.firebase` trống | Modal mở | Hiện cảnh báo "⚠ Demo mode — Firebase not configured"; các nút vẫn bấm được (mock login) |
| AC2 | S1: Google | Modal mở | Tap Continue with Google → hoàn tất popup | `S.user` set từ Firebase; đóng modal; toast "Welcome, {tên}"; **chạy tiếp action đang chờ** (`pendingAfterAuth`) |
| AC2 | S2: Apple | Modal mở | Tap Continue with Apple → hoàn tất | Đăng nhập OK như Google (tên lấy displayName, fallback email) |
| AC2 | S3: Email — đăng nhập | Tab Email | Nhập email + password ≥ 6 ký tự → Continue | Đăng nhập; nếu chưa có tài khoản → tự tạo rồi đăng nhập |
| AC2 | S4: Email — invalid | Tab Email | Password < 6 ký tự / bỏ trống | Toast "Check your details"; không submit |
| AC3 | S1: lỗi đăng nhập | Provider lỗi / sai mật khẩu | Nhận lỗi | Toast "Sign-in failed" + message; ở lại modal |
| AC3 | S2: đóng modal | Modal mở | Tap X / click nền ngoài | Đóng modal; huỷ `pendingAfterAuth`; ở lại màn trước (back được) |
| AC4 | S1: khôi phục phiên | Đã đăng nhập trước đó (session còn) | Reload trang | `onAuthStateChanged` set lại `S.user`; render giao diện đã đăng nhập, không bắt login lại |
| AC5 | S1: Microsoft `NEEDS` | (Davinci-ref) | — | Provider Microsoft là tuỳ chọn mở rộng — chưa bật ở M0 |

### PW — Paywall "Pick your plan"

| AC | Scenario | Given | When | Then |
| --- | --- | --- | --- | --- |
| AC1 | S1: hiển thị | Sau login onboarding, chưa Pro | Paywall mở | So sánh **Free vs Pro** (Unlimited · HD · No watermark · Priority · Early access); 3 gói **Weekly (Most popular) / Monthly / Yearly**; nút **Continue**; **Maybe later**; X; dòng "Cancel anytime · secure checkout" + Terms/Privacy |
| AC1 | S2: đã Pro → bỏ qua | `S.plan==="pro"` | Trigger paywall | Không hiện paywall (không có gì để bán) |
| AC1 | S3: social proof (Davinci-ref) `NEEDS` | — | Paywall mở | (tuỳ chọn) "X người đã tham gia hôm nay" — chưa bật M0 |
| AC2 | S1: chọn gói | Paywall mở | Tap 1 gói | Gói được highlight (radio/viền tím); cập nhật giá hiển thị |
| AC2 | S2: Continue (mua) | Đã chọn gói | Tap Continue | `startCheckout(planId)`: billing bật → redirect Checkout provider; chưa bật → mock flip Pro + toast "Welcome to Genius Pro" |
| AC2 | S3: mua thành công | Quay về từ provider `?billing=success` | App load lại | Toast "Payment received"; `refreshSubscription()` xác nhận `{active}` → `S.plan=pro`; UI Pro khắp nơi |
| AC2 | S4: mua fail / huỷ | `?billing=cancel` hoặc lỗi tạo session | Quay về / nhận lỗi | Toast tương ứng; **ở lại Free**; không khoá tính năng (M0 free) |
| AC3 | S1: đóng → Home | Paywall mở | Tap **X / Maybe later** | Đóng paywall → vào **Home** (Free); vẫn dùng generate bình thường |
| AC4 | S1: Restore (Davinci-ref) `NEEDS` | — | Tap Restore Purchases | Khôi phục sub nếu có — endpoint `NEEDS_BE` |
| AC5 | S1: payment methods | (provider-hosted) | Tại trang Checkout | PayPal / Google Pay / Card do **provider** xử lý (FE không giữ thông tin thẻ) |

### H — Home / Explore

| AC | Scenario | Given | When | Then |
| --- | --- | --- | --- | --- |
| AC1 | S1: hiển thị | Ở `#/home` | Render | Heading "Explore Genius" + toggle Models/Agents; prompt bar; **chỉ feature live** (t2i); không coming-soon, không feed video |
| AC2 | S1: quick prompt | Ở Home | Gõ prompt → **Generate** | Điều hướng `#/app/t2i`, prompt điền sẵn vào dock |
| AC2 | S2: prompt trống | Ở Home | Bấm Generate khi ô trống | Toast "Type a prompt first"; không điều hướng |
| AC3 | S1: vào feature | Lưới feature card | Tap card "AI Image Generator" | Vào `#/app/t2i` |
| AC4 | S1: nav | Sidebar | Tap Gallery / Plan / Earn | Điều hướng đúng tab; nav item active |

### C — AI Image Generator (t2i): canvas + prompt dock

| AC | Scenario | Given | When | Then |
| --- | --- | --- | --- | --- |
| AC1 | S1: empty state | Vào `#/app/t2i`, chưa có kết quả | Render | Canvas trống ("Describe what you want to create"); dock dưới đáy: chip model · **Ratio** (1:1 / 9:16 / 16:9) · **Images** (1/2/4) · textarea · nút gửi tròn |
| AC1 | S2: prefill từ Home | Đến từ quick-gen | Render | Textarea điền sẵn prompt mang từ Home |
| AC1 | S3: restore kết quả gần nhất | Đã từng gen thành công cho t2i | Render | Canvas hiển thị kết quả thành công gần nhất + "Recent on this app" |
| AC2 | S1: chọn Ratio | Ở C | Tap 1:1 / 9:16 / 16:9 | Pill được chọn (viền tím); map vào `imageSize` của payload |
| AC2 | S2: chọn Images | Ở C | Tap 1 / 2 / 4 | Pill được chọn; map vào `numImages`/`max_images` |
| AC2 | S3: nhập prompt | Ở C | Gõ vào textarea | Textarea auto-grow; lưu vào `CURRENT_INPUT.prompt` |
| AC3 | S1: Generate — prompt trống | Prompt rỗng | Tap nút gửi | Toast "Type a prompt first"; không tạo job |
| AC3 | S2: Generate — chưa login | Có prompt hợp lệ, chưa login | Tap gửi | Mở **Login**; login xong **tự chạy tiếp** generate (không bấm lại) |
| AC3 | S3: Generate — hợp lệ | Có prompt, đã login | Tap gửi | Tạo job (status `processing`) đầu Gallery; canvas chuyển sang **GEN** (N ô blur); toast "Generating…" |
| AC4 | S1: free M0 | User Free | Generate | KHÔNG bị chặn bởi credit/limit (M0 free cho tất cả); Pro chỉ upsell |

### GEN — Generating (loading blurr ngay trong canvas)

> Loading hiển thị **NGAY trong canvas màn C, dạng BLUR overlay** — không chuyển màn loading riêng. **Số ô loading = số ảnh yêu cầu** (Images). Mỗi ô resolve độc lập.

| AC | Scenario | Given | When | Then |
| --- | --- | --- | --- | --- |
| AC1 | S1: 1 ảnh | Images = 1 | Bắt đầu gen | Canvas hiện **1 ô blur** phủ vùng kết quả + spinner/shimmer + nhãn trạng thái ("Generating…") |
| AC1 | S2: nhiều ảnh | Images = 2 / 4 | Bắt đầu gen | Canvas hiện **lưới N ô blur** (2 → 2 ô; 4 → lưới 4 ô), mỗi ô 1 placeholder blur |
| AC2 | S1: resolve từng ô | Đang gen N ô | 1 ảnh trả về xong | Ô tương ứng **bỏ blur, hiện ảnh**; các ô còn lại vẫn loading (độc lập) |
| AC2 | S2: tất cả xong | Mọi ô resolve | Hoàn tất | Chuyển trạng thái **R (Result)**; lưu kết quả vào Gallery; toast "ready ✦" |
| AC3 | S1: lỗi 1 ô | Đang gen N ô | 1 ô fail | Ô đó hiện trạng thái lỗi + **Retry ô đó**; không phá các ô đã xong |
| AC3 | S2: lỗi toàn bộ / timeout | Mất mạng / timeout (~90s) / server lỗi | Nhận lỗi | Canvas hiện **lỗi cố định** (không biến mất như toast) + toast "Generation failed"; message đúng nguyên nhân; **giữ input** để Retry |
| AC4 | S1: Cancel | Đang loading | Tap Cancel | Huỷ job → bỏ các ô loading; giữ input (prompt/ratio/images); về trạng thái C |
| AC5 | S1: dock khả dụng | Đang loading | — | Prompt dock vẫn hiển thị (xem được input đang gen) |

### R — Result + actions

| AC | Scenario | Given | When | Then |
| --- | --- | --- | --- | --- |
| AC1 | S1: hiển thị | Gen thành công | Render | Canvas hiển thị ảnh kết quả (lưới nếu nhiều ảnh); nút **View in Gallery** / **Generate again**; trên ảnh: Save · Share |
| AC2 | S1: Save | Có ảnh kết quả | Tap Save | Lưu vào Gallery (đã tự lưu) / tải về máy; toast success/failed |
| AC2 | S2: Share | Có ảnh kết quả | Tap Share | Mở system share sheet (Web Share API) với ảnh kết quả |
| AC2 | S3: View Gallery | Có ảnh kết quả | Tap View in Gallery | Điều hướng `#/gallery` |
| AC2 | S4: Generate again | Có ảnh kết quả | Tap Generate again | Chạy lại generate với input hiện tại (qua lại GEN) |

### GA — Gallery

| AC | Scenario | Given | When | Then |
| --- | --- | --- | --- | --- |
| AC1 | S1: chưa login | Chưa đăng nhập | Vào `#/gallery` | Empty state "Sign in to see your creations" + nút Sign in |
| AC1 | S2: trống | Đã login, chưa có job | Vào Gallery | Empty state "Nothing here yet" |
| AC2 | S1: trạng thái item | Có job | Render | Mỗi item badge đúng: `Processing` (spinner) / `Success` (media) / `Failed` (icon lỗi) + nhãn service |
| AC3 | S1: mock mode | Chưa cấu hình bundleId | Vào Gallery | Hiển thị `S.gallery` từ localStorage, mới nhất trước, không phân trang |
| AC3 | S2: server mode | Có bundleId + useRealBackend | Vào Gallery | Fetch `GET /web/jobs?page=&limit=12` **1 lần/trang**; pager Prev/Next; tạo job mới → lần sau refetch trang 1 |

### PL — Plan (Genius Pro)

| AC | Scenario | Given | When | Then |
| --- | --- | --- | --- | --- |
| AC1 | S1: hiển thị | Ở `#/wallet` | Render | Account row; trạng thái gói (Free / 👑 Pro active); 3 gói + perks; Activity log; **không** có credit/balance |
| AC2 | S1: Go Pro | Free | Tap gói / Go Pro | Mở **Paywall** (qua `startCheckout`) |
| AC2 | S2: Cancel Pro | Đang Pro | Tap Cancel | `S.plan=free`; Activity log; toast "Pro cancelled"; UI về Free |

### EA — Earn

| AC | Scenario | Given | When | Then |
| --- | --- | --- | --- | --- |
| AC1 | S1: check-in | Ở `#/earn` | Tap "Check in today" (login nếu cần) | Activity log + toast "Checked in 🎁" (streak → free Pro day) |
| AC2 | S1: referral | Ở Earn | Tap Copy link | Copy link giới thiệu vào clipboard + toast "Link copied" |
| AC3 | S1: affiliate | Ở Earn | Tap Learn more | Toast "Coming at M4" |

Non Function Requirements
-------------------------

* **M0: generate FREE cho mọi user** — Paywall chỉ upsell, X/Maybe later đóng được → vào Home. Sau M0: Free có soft-limit (watermark/standard), Pro gỡ (HD, no watermark, priority).
* **Subscription only — KHÔNG có credit/balance** ở bất kỳ đâu. Reward (check-in/referral) tặng **free Pro time**.
* Auth: chưa login + Generate/Subscribe/Check-in → mở Login → xong **tự chạy tiếp** action. `onAuthStateChanged` là single source of truth; reload giữ phiên.
* Generate: loading **blur trong canvas**, **N ô = N ảnh**, mỗi ô resolve độc lập. Lỗi 1 ô → Retry ô đó; lỗi toàn bộ → lỗi cố định + giữ input. Timeout t2i ~90s. Mất mạng → message "Network error".
* Backend: browser chỉ gửi `x-api-bundleid` + `x-api-email`; **BE ký server-side** (không secret/proxy ở client). Real BE chỉ khi đủ `useRealBackend` + `workflowId` + `bundleId`; thiếu → tự **mock** (demo offline vẫn render).
* Billing: provider-hosted Checkout (PayPal/GPay/Card do provider); FE không giữ thông tin thẻ. `refreshSubscription` đọc trạng thái từ BE.
* App self-contained (HTML + inline CSS/JS, không build); state ở `localStorage` key `genius_web`.

Backend wiring (chỗ DUY NHẤT có logic thật)
-------------------------------------------

* `callBackend()`: `POST /api/v1/web/execute {workflowId, input}` → `runId` → poll `GET /api/v1/web/:runId/status` mỗi ~4s đến `completed|failed|cancelled`. Gallery: `GET /api/v1/web/jobs`.
* **t2i wired**: fal `seedream/v4.5/text-to-image`, `workflowId 3e01896a-…`. `buildInput.t2i` đẩy `prompt`, `imageSize` (Ratio), `numImages`/`max_images` (Images). `parseOutput` đọc `output.resultFile` — **cần mở rộng đọc mảng `images[]`** để render N ô.
* **Billing**: `startCheckout` → `POST {billing.createSessionPath}` → redirect; `refreshSubscription` ← `{billing.statusPath}` `{active}`; `handleBillingReturn` xử lý `?billing=success|cancel`.
* Contract đầy đủ: `.claude/rules/be-services/ai-workflow-api.md` (mã lỗi `ERR01–ERR25`).

Coverage — Config flags (web dùng `config.js`, không Remote Config app)
----------------------------------------------------------------------

| # | Scenario | Given | When | Then |
| --- | --- | --- | --- | --- |
| CF-1 | `useRealBackend=false` | Chưa nối BE | Generate | Chạy **mock**, canvas vẫn render N ô + ảnh mẫu |
| CF-2 | `useRealBackend=true` + thiếu `bundleId` | bundleId rỗng | Generate | Fallback **mock** (không gọi BE) |
| CF-3 | Đủ `useRealBackend`+`workflowId`+`bundleId` | Cấu hình đủ | Generate | Gọi BE thật (execute → poll → result) |
| CF-4 | `billing.useRealCheckout=false` | Billing chưa cấu hình | Subscribe | Mock flip Pro (demo); không charge |
| CF-5 | `billing.useRealCheckout=true` + prices + endpoints | Billing đủ | Subscribe | Redirect Checkout provider → charge thật |
| CF-6 | `firebase.apiKey` rỗng | Chưa cấu hình Firebase | Login | Mock login + cảnh báo "Demo mode" |
| CF-7 | `M0_SERVICES=["t2i"]` | Mặc định | Home/Create | Chỉ hiện t2i; không coming-soon |

Appendix — Key config / CMS
---------------------------

`config.js`: `useRealBackend` (Bool) · `beBase` · `bundleId` (`NEEDS_BE` whitelist) · `workflows.t2i` · `firebase{…}` (client-safe) · `billing{useRealCheckout, createSessionPath, statusPath, prices{weekly,monthly,yearly}, successUrl, cancelUrl}`. Giá gói (`PLANS[].usd`) `NEEDS` PO chốt. Provider price ids `NEEDS_BE`.

Pre-Rollout
-----------

| Type | Attribute | Value | Condition | PIC | Status |
| --- | --- | --- | --- | --- | --- |
| Config | `useRealBackend` | `true` khi bundleId whitelisted + workflowIds đủ | First version | | |
| Config | `bundleId` | BE cấp (whitelist resolve signing key) | First version | | `NEEDS_BE` |
| Config | `billing.useRealCheckout` | `true` để bán thật + điền `prices` | Change monetization | | `NEEDS_BE` (2 endpoint checkout/status) |
| API | t2i workflow | Input: prompt + imageSize + numImages; Output: image URL(s); poll status | First version | | wired |
| API | Billing | `/billing/checkout` (tạo session) · `/billing/status` (`{active}`) + webhook | First version | | `NEEDS_BE` |
| Firebase | Auth | Google/Apple/Email + Authorized Domains (localhost, domain prod) | First version | | live |
| RevCat / Payment | gói + giá | Weekly/Monthly/Yearly — giá chốt cuối | Change pricing | | `NEEDS` |

---

| Stakeholder | PIC | Status | Related Document |
| --- | --- | --- | --- |
| PO | HoàTTV | | `genius-web-userflow.drawio` · `README.md` · `kb/iip055-genius/web-product-doc.md` |
| MO | | | |
| PD | | | Design chi tiết — PO gửi sau |
| Dev | | | `config.example.js` · `firebase-setup.md` · `.claude/rules/be-services/ai-workflow-api.md` |
| Test | | | Function Requirements (AC) + Coverage ở trên |
