# Paper & Loop — PRD

## Original Problem Statement
Build paperandloop.com — a premium youth merchandise brand (Posters + Keychains). Editorial, minimal, "Nike/Nothing/Apple" of poster culture. Complete spec provided including color system, typography, motion, page-by-page layouts and admin dashboard.

## Stack (as built)
- Backend: FastAPI + MongoDB (motor)
- Frontend: React 19 + React Router 7 + Framer Motion + Tailwind + shadcn/ui + Recharts + sonner + lucide
- Auth: JWT (email+password, bcrypt) + real email OTP for registration & password reset (Resend-ready with dev-code fallback)
- Payments: Manual GPay QR + Transaction ID
- Media: File upload to /app/backend/uploads, served via /api/uploads/*

## Personas
- Customer (15-30 Gen Z) — browses without login; signs in at checkout.
- Admin (`ritheeshvaran2007@gmail.com`) — full CRUD via /admin/*

## Implemented (2026-02)
### Customer
- Home: cinematic hero carousel, marquee, editorial collection tiles, best sellers, trending, coming soon, why-choose-us, real gallery, testimonials carousel, real newsletter subscribe
- Collections + category chips + sort + banner
- PDP: gallery + specs + qty + add-to-cart + wishlist + **Room Preview** (3 templates) + **Restock alert** for out-of-stock + related products
- Cart drawer with fly-to-cart & digit-roll totals; search overlay; wishlist; account (editable profile); orders list + detail with animated timeline; 3-step Checkout → GPay QR → animated confirmation
- **3-step OTP Registration** (email → 6-digit OTP → details)
- **Forgot Password** flow (email → OTP → new password)
- Custom desktop cursor; glass sticky nav; mobile hamburger menu; fully responsive at 375 / 768 / 1440

### Admin
- Sidebar shell, Dashboard KPIs + top products
- Orders (search + filter + advance status + delivery date + timeline)
- Products (CRUD + **image upload** + flags + visibility)
- Categories (CRUD)
- **Discounts** (percent/flat, targets product/category/all, scheduled window, apply/reset)
- Customers (list + spend metrics)
- **Analytics** (revenue area chart 14d + status pie + top products + category bars)
- **Testimonials + Gallery** content management
- **Activity Log** (all admin changes audited)
- Settings (announcement, QR, contact, hero images)

### Backend
- 40+ REST endpoints, all `/api`-prefixed
- Order state machine, forward-only, restock on cancel
- OTP: bcrypt-hashed, 10-min JWT verification, 5/10min rate limit
- Newsletter, restock-alerts, testimonials, gallery, discounts, activity_log collections
- Fire-and-forget welcome + status-change emails
- File upload with type + size validation
- `CI=true yarn build` passes zero warnings, 284KB gzipped

## Test Credentials
See `/app/memory/test_credentials.md`

## Deferred (P2)
- Real ESP configuration (RESEND_API_KEY env var — production path is ready)
- WhatsApp order-status notifications
- Referral / share-card OG image generation  
- Multi-admin invitations UI
- Product variants (T-shirts sizing) when apparel drops
