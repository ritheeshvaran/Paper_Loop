# Paper & Loop — PRD

## Original Problem Statement
Build paperandloop.com — a premium youth merchandise brand (Posters + Keychains) targeting 15-30 y/o Gen Z. Editorial, minimal, "Nike/Nothing/Apple" of poster culture. Full spec provided by user with color system, typography (Cabinet Grotesk + Satoshi), motion inventory, page-by-page layouts, and admin dashboard.

## Stack (as built)
- Backend: FastAPI + MongoDB (motor)
- Frontend: React 19 + React Router 7 + Framer Motion + Tailwind + shadcn/ui + sonner + lucide-react
- Auth: JWT (email+password, bcrypt), stored in localStorage as `pl_token`
- Payments: Manual GPay QR + Transaction ID (per spec §5.12)

## Personas
- Customer (15-30 y/o Gen Z): mobile-first, drop-culture; browses without login, signs in at checkout.
- Admin (single super-admin `ritheeshvaran2007@gmail.com`; multi-admin future-ready via role field).

## Implemented (2026-02)
- Customer: Home (cinematic hero, marquee, collections, best-sellers, trending, coming-soon, why, newsletter), Collections (category chips + sort + banner), PDP (gallery + specs + qty + add-to-cart + wishlist + Room Preview compositor with 3 room templates + related products), Search overlay, About, Coming Soon, Cart drawer with fly-to-cart animation, Login/Register, Account (editable profile), Wishlist, Orders list + detail with animated timeline, 3-step Checkout (review → GPay QR → confirmation), Custom cursor (desktop), Glassmorphic sticky nav, Mobile hamburger menu.
- Admin: Sidebar shell, Dashboard (KPIs + top products), Orders (list + detail + forward-only status advance + delivery date), Products (list + create/edit/delete modal), Categories, Customers, Settings (announcement, QR, contact, hero images).
- Backend: 30+ REST endpoints; state machine enforced; stock reservation on checkout + restoration on cancel; discounts computed server-side; activity log for admin status changes.

## Deferred (P1/P2)
- OTP email registration (currently plain JWT)
- Instagram gallery, Testimonials carousel, Reviews/ratings
- Bundle "Complete the Look" cross-sell
- Referral / share cards (OG image gen)
- WhatsApp order status notifications
- Restock alerts email fire
- Scheduled discount auto-activation cron
- Activity log UI (data captured; no viewer)
- Product image upload (currently URLs only) + WebP transcoding
- Multi-admin invitations UI

## Test Credentials
See `/app/memory/test_credentials.md`
