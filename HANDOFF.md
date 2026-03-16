# Figaro Command Center - Session Handoff

> Last updated: 2026-03-15
> Session: 12 (complete)

## Current State

### Done (Session 1)

- Project scaffolded with Next.js 15, TypeScript, Tailwind CSS 4, pnpm
- All production and dev dependencies installed
- TypeScript strict mode configured (noUncheckedIndexedAccess, noUnusedLocals, noUnusedParameters)
- ESLint + Prettier configured with strict rules (no-console warn, no-eval, no-any)
- Environment variable validation with Zod (server + client schemas)
- Prisma 6 initialized with full database schema
- Vitest configured with happy-dom environment and React testing library
- Playwright configured for E2E testing (Chrome + Mobile Chrome)
- Security middleware (route protection, CSRF origin validation)
- Security headers (X-Frame-Options, CSP, HSTS, etc.)
- Figaro brand color tokens in Tailwind (gold, black, cream, teal, dark)
- Skip-to-content accessibility link
- Initial unit tests (formatCurrency, slugify) - 6 tests, all passing
- Governance files created (CLAUDE.md, HANDOFF.md, AUDIT.md, ProjectHealth.md)
- .env.example with all required variables
- All quality gates passing

### Done (Session 2)

- Confirmed PostgreSQL 17 is installed and running on port 5432
- Expanded Tailwind color palette with teal variants (teal-dark #3d7a7a, teal-light #7bc4c4)
- Copied 34 avif gallery images + 6 barber photos (jpeg/png) from old site into public/images/gallery/
- Complete public site redesign with barber-centric experience:
  - **Landing page**: Left-aligned cinematic hero, "Meet the Crew" barber grid (6 barbers with real photos), gallery strip, services preview with teal/gold alternating accents, real customer testimonials (6 reviews, 4.9 rating), teal CTA section
  - **Barbers page**: Hero with teal accents, barber cards with real photos for all 6 barbers (Ricardo, Zeke, Bryam, Johnny, David, Austin), portfolio grid with hover effects
  - **Services page**: "The Menu" with category accents (gold/teal alternating), real descriptions
  - **Contact page**: Real address (114 Leucadia Blvd), phone (760-751-2008), email, hours, social links, teal/gold amenity tags
  - **Book page**: Multi-step wizard with teal progress bar, teal barber selection, gold service selection, teal form focus states
  - **Header**: Teal/gold gradient accent strip, teal nav hover states
  - **Footer**: Teal/gold gradient accent strip, teal hover states, real contact info
- Design system elements:
  - Signature teal->gold->teal gradient stripe on all hero sections, header, footer
  - "-- LABEL" section header pattern with teal line accents
  - Gold/teal alternating card borders with swap on hover
  - Highlight badges with teal SVG icons (Hispanic-Owned, Organic Products, Walk-Ins Welcome, Pet-Friendly)
  - scrollbar-hide utility class for gallery strips
- Updated seed data with real Figaro data
- ESLint: Added `@next/next/no-img-element: off`, excluded `**/*.md` from scans
- Webhint: Created `.hintrc` to suppress `no-inline-styles` (Edge Tools extension)
- Fixed inline CSS style security issue on analytics page (replaced with Tailwind arbitrary values)
- All quality gates passing

### Done (Session 3)

- **PostgreSQL connected**: Database `figaro` + user `figaro_user` confirmed working, `.env` updated with correct password
- **Schema pushed**: `prisma db push` applied all tables to PostgreSQL 17
- **Database seeded**: Full real data - 7 users, 6 barbers, 42 schedules, 7 services, 5 products, 5 inventory items, 5 sample clients, shop settings
- **Auth.js v5 with bcrypt**:
  - Replaced plaintext password check with bcrypt hashing (12 rounds)
  - Added `passwordHash` field to User model
  - Created user accounts for all barbers + receptionist (7 total)
  - Role-based: OWNER (Ricardo), BARBER (Zeke, Bryam, Johnny, David, Austin), RECEPTIONIST (front desk)
  - JWT strategy with role in token/session
  - `auth-utils.ts` with `requireAuth()`, `requireRole()`, `hasRole()` helpers
  - Sign-out action redirects to /login
  - Dev password: `figaro2026` for all accounts
- **Dashboard wired to real data**:
  - Server-side stats: today's appointments, walk-ins, revenue, active barbers, total clients
  - Upcoming appointments list with barber + service details
  - Recently completed appointments with pricing
  - Low stock product alerts (auto-detected from inventory)
- **Booking system backend**:
  - `GET /api/appointments/availability?date=&barberId=&duration=` -- time slot availability engine
  - Checks barber schedule, existing bookings, past-time filtering
  - 30-minute slot increments respecting barber working hours
  - `GET/PATCH /api/appointments/[id]` -- appointment detail + status updates
  - Status transitions: SCHEDULED -> IN_PROGRESS -> COMPLETED/CANCELLED/NO_SHOW
- **Client intake form updated**: Barber dropdown now fetches real barbers from `/api/barbers`
- **Seed made idempotent**: Uses upserts and clean deletes for safe re-runs
- All quality gates passing: type-check (0), lint (0), format (clean), test (6/6), build (28 routes)

### Done (Session 4)

- **Real shop photos integrated**: Copied 4 high-quality JPGs from old site (`shop-barrel.jpg`, `shop-chairs.jpg`, `shop-interior.jpg`, `shop-wall.jpg`) into `public/images/`
  - Used on dark hero banners across all public pages (opacity-25 with dark gradient overlays)
  - Homepage hero: `shop-chairs.jpg` at full opacity with left-to-right gradient reveal
  - Services preview: `shop-interior.jpg` at opacity-10 as subtle atmosphere background
  - CTA section: `shop-wall.jpg` at opacity-20 behind teal gradient overlay
  - Cream body sections kept clean (no background photos) per design intent
- **Homepage streamlined**:
  - Removed "Step Inside Figaro" photo mosaic section
  - Removed gallery strip / auto-scrolling conveyor section
  - Clean flow: Hero -> Testimonials -> Services Preview -> Instagram Feed -> CTA
- **Hero CTA buttons swapped**: "Meet the Crew" is now the primary gold button, "Book Your Cut" is secondary teal outline
- **Branding update**: "Command Center" renamed to "Barbershop Administration" across login page, dashboard header, and top bar
- **Barber data fixed**: Removed fake "Figaro" last names from all 6 barbers (updated both seed file and live database)
- CSS marquee animation added to `globals.css` (currently unused after gallery strip removal -- can be cleaned up or reused later)

### Done (Session 4b — continued)

- **Homepage further streamlined**:
  - Removed Services Preview section from homepage (still accessible via /services page)
  - Final homepage flow: Hero -> Testimonials -> Instagram Feed -> CTA
- **Scroll animations smoothed**:
  - Replaced per-card `whileInView` animations with single grid-level animation (no more stepping/stuttering)
  - Added CSS `ease` curve `[0.25, 0.1, 0.25, 1]` for smoother deceleration
  - Reduced travel distance (`y: 20` -> `y: 12-16`) and widened viewport margins for earlier triggers
- **Logo exploration**: Tested Figaro logo (avif) in hero and navbar with white filter — decided against it, reverted to text-only branding
- Figaro logo file available at `public/images/figaro-logo.avif` for future use

### Done (Session 5)

- **VPS deployed**: Site live on Hostinger VPS, pulled from git
- **Booking flow UX overhaul**:
  - Mobile sticky cart bar at top (replaced broken fixed-bottom approach)
  - Fresha-style service selection with category pills, auto-switching tabs via IntersectionObserver
  - Scroll-to-top on all step navigation (continue, back, breadcrumb clicks)
  - Date picker redesigned: 7-day grid with week pagination arrows (no scrollbars)
- **Availability API fixed** (3 bugs):
  - Response key mismatch (`slots` → `availableSlots`) to match frontend
  - Timezone-safe date parsing (local `new Date(year, month, day)` instead of UTC `new Date("YYYY-MM-DD")`)
  - Returns `"HH:MM"` strings (only available slots) instead of ISO timestamp objects
- **Header nav cleaned up**: Removed redundant "Book Now" and "Services" links; added "View Services" text with animated arrow next to "Book Appointment" CTA
- **Contact page CTAs**: Added "Book Now" (gold) and "Meet Our Crew" (teal outline) buttons to Visit Us card
- **Homepage mobile improvements**:
  - Hero content moved up ~40% on mobile (`items-start pt-24` instead of `items-center`)
  - "Book Your Cut" button solid teal on mobile for visibility (outline on desktop)
- **Barber profile pages**:
  - Hero backgrounds swapped to highlight cut/work photos from each barber's portfolio
  - Background opacity increased (15% → 30%) for more visible work showcase
  - Gradient overlays reduced ~50% for lighter, more photo-forward feel
- **CSS**: Added `animate-bounce-x` keyframe animation for horizontal arrow bounce
- **`bounce-x` animation**: `globals.css` — horizontal arrow animation (1.5s ease-in-out infinite)

### Done (Session 6)

- **Address linked to Google Maps**: Footer, contact page, and booking sidebar address now opens Google Maps in new tab with teal hover
- **Mandatory form fields**: Email and phone now required on both booking form and intake form
  - Booking: added `*` labels, `required` attributes, `canContinue()` validation updated
  - Intake: phone added to required fields, Zod schema updated (`z.string().min(1)`)
- **Booking sidebar logo fix**: Changed from `object-cover` (clipping) to `object-contain`, increased size h-14→h-16, increased sticky offset top-24→top-32
- **Service card text contrast**: Duration and description opacity bumped from /50 and /60 to /70 for better readability

### Done (Session 7)

- **Full-scale audit across all Eight Pillars** — 18 issues found and resolved:
- **Security (Critical)**:
  - Added `apiRequireAuth()` helper to `auth-utils.ts` for API route guards
  - Added auth to 5 unprotected API routes: appointments GET, clients GET/POST, inventory GET, payments POST, appointments/[id] PATCH
  - Moved default barber password from hardcoded source to `DEFAULT_BARBER_PASSWORD` env var
  - Removed hardcoded password display from barber management UI
- **Security (Low)**:
  - Added `preload` directive to HSTS header
  - Removed server-only Resend URL from CSP `connect-src`
- **Bugs (High)**:
  - Fixed day-of-week mismatch in barber schedule creation (0-based → 1-based to match seed/availability convention)
  - Fixed `ownerOnly` type cast bug: `as "OWNER"` → `as UserRole`
- **Structure (High)**:
  - Added error boundaries: `error.tsx`, `loading.tsx`, `not-found.tsx` at app root and dashboard level
- **UX (High)**:
  - Added error state + user feedback to booking form (was silently failing)
- **UX (Medium)**:
  - Fixed dead `/about` link in footer → changed to `/intake` (New Client Form)
- **Performance (Medium)**:
  - Added viewport configuration to root layout (width, initialScale, themeColor)
- **Code Quality (Medium)**:
  - Added try/catch to 6 API routes missing error handling (barbers, barbers/[slug], services, clients GET, inventory, appointments/[id] GET)
  - Made Stripe/Instagram/Resend env vars optional (not yet integrated)
  - Made client env vars optional
- **Code Quality (Low)**:
  - Removed duplicate `formatCurrency`/`formatTime` from dashboard page (imported from utils)
  - Fixed `totalDuration` missing from useEffect dependency array in book page
  - Removed unused CSS marquee animation from globals.css
  - Removed 3 unused dependencies: `@auth/prisma-adapter`, `react-hook-form`, `@hookform/resolvers`
- **Docs**:
  - Fixed CLAUDE.md: "Next.js 15" → "Next.js 16", removed React Hook Form reference
  - Updated .env.example with `DEFAULT_BARBER_PASSWORD`, documented optional sections
  - Full AUDIT.md rewrite with all issues, health scores, security posture, tech debt register
- **Reverted** Header "View Services" link change (was intentionally non-clickable as visual CTA hint)
- All quality gates passing: type-check (0), lint (0), format (clean), test (6/6), build (32 routes, 0 errors)

### Done (Session 8)

- **Header UI polish**:
  - "View Services" text animated with `bounce-x` CSS animation
  - CTA button text changed from "Book Appointment" to "Services"
- **Barber profile background tuning**:
  - Per-barber `HERO_BG_POSITION` map for independent background positioning
  - Bryam's hero background set to "center 60%" (others default "center 25%")
- **Homepage CTA overlay reduced**: Teal overlay opacity from /90 to /65 for more background visibility
- **Children's photos removed from site** (policy: no minors):
  - 5 confirmed images removed from `PORTFOLIO_MAP`, `HERO_BACKGROUNDS`, and barbers listing gallery
  - Johnny's hero background replaced with adult portfolio image
  - 2 borderline images flagged for owner review
- **Premium SEO implementation**:
  - Centralized SEO config (`src/lib/seo.ts`) with business data, geo, keywords, hours
  - 6 JSON-LD schema components: BarberShop, Services, Person, WebSite, Breadcrumbs, FAQ
  - Dynamic `sitemap.ts` with all static + dynamic barber pages
  - `robots.ts` blocking /api/, /login, /dashboard/ from crawlers
  - `manifest.webmanifest` for PWA readiness
  - Enhanced root layout: OpenGraph, Twitter Cards, metadataBase, robots directives, 30+ keywords
  - Homepage refactored: server component with metadata + client `HomeContent` component
  - Per-page metadata on all public pages (homepage, services, barbers, contact, book, intake, login)
  - Dynamic `generateMetadata` for barber profile pages (unique title/description/OG per barber)
  - Breadcrumb JSON-LD on services, barbers, and individual barber pages
  - Service JSON-LD with pricing on services page
  - FAQ JSON-LD (10 questions) on homepage for AI engine rich snippets
  - Book/intake/login pages: metadata via route-level layouts (pages are "use client")
  - Login and intake pages set to `noindex`
- **AI Engine Optimization (AEO)**:
  - `llms.txt` — concise business summary for AI crawlers
  - `llms-full.txt` — comprehensive reference with barber bios, services, FAQ, areas served
  - FAQ JSON-LD feeds direct answers to AI assistants
- **Intake form updates**:
  - Removed "Hair Type" field (form + API Zod schema)
  - Added "Fresha" to referral options
  - "Walked by" changed to "Walked / Drove By"
- All quality gates passing: type-check (0), lint (0), format (clean), test (6/6), build (32 routes + sitemap.xml + robots.txt)

### Done (Session 9)

- **Fixed barber profile Sunday schedule bug**: `DAY_NAMES`/`DAY_ABBREVIATIONS` were 0-indexed arrays but DB stores dayOfWeek 1-7 (Mon-Sun), causing `DAY_NAMES[7]` to be undefined. Switched to `Record<number, string>` keyed 1-7.
- **VPS production debugging**: Diagnosed two production issues from server logs:
  - `UntrustedHost` error — Auth.js rejecting raw IP requests. Fix: `AUTH_TRUST_HOST=true` in VPS `.env`
  - Corrupted `.next` build — missing `required-server-files.json`. Fix: clean rebuild on VPS
- **Send Intake feature**: Clients without completed intake now show a "Send Intake" button on the Clients dashboard page
  - `POST /api/clients/send-intake` — generates pre-filled intake link, sends branded email via Resend if configured, otherwise returns copyable link for staff to share manually
  - Intake form (`/intake`) now accepts `?email=&name=` query params to pre-fill fields
- **Client soft-delete**: Owner-only "Delete" button on Clients page with confirmation dialog
  - `DELETE /api/clients/[id]` — OWNER-only soft delete (sets `deletedAt`)
- All quality gates passing: type-check (0), lint (0), format (clean), build (34 routes)

### Done (Session 10)

- **Backend API review**: Systematically tested all 17+ API endpoints via curl with auth flow
- **Appointment date navigation**: Added prev/next day arrows, Today button, and date label to appointments page
- **Register/POS page** (`/dashboard/register`): Full front-desk system with 4 views:
  - Today's Queue with status chips (Waiting/In Chair/Done/Paid) and action buttons (Start, Complete, Checkout, No Show)
  - Walk-in form: client selection from recent intakes, barber tap-select, service multi-select, mandatory phone
  - Checkout: Cash/Card payment processing
  - QR Code: scannable QR pointing to `/intake` for walk-in self-registration
  - Auto-refreshes queue every 30 seconds, summary chips for queue status
- **Services full CRUD**: Add, edit, remove services from dashboard (previously read-only)
  - `POST /api/services` (OWNER only) — create new service with Zod validation
  - `PATCH/DELETE /api/services/[id]` (OWNER only) — update or soft-delete (isActive: false)
  - Two-click delete confirmation in UI
- **My Profile page fixed**: Barber lookup changed from broken name-based slug to userId matching
- **Profile photo upload system**:
  - `POST /api/upload` — file upload endpoint (JPEG/PNG/WebP/AVIF, max 5MB, STAFF+ role)
  - Saves to `public/images/barbers/` with safe filename pattern
  - Upload UI with 136x136 preview, click-to-upload zone, best practices guidance
- **Intake form kiosk mode**: Auto-resets after 8 seconds for iPad front-desk use
- **Soft-delete client re-registration bug fixed**: Clearing `deletedAt` on re-intake and appointment creation so soft-deleted clients can re-register
- **Sidebar updated**: Added "Register" nav item, moved "My Profile" before "Settings"
- **Policy pages created** (3 new public pages):
  - `/privacy` — Privacy Policy (data collection, usage, retention, rights, photos/media)
  - `/terms` — Terms of Service (services, appointments, pricing, payment, conduct, liability)
  - `/cancellation-policy` — Cancellation Policy (2hr notice, late arrivals, no-shows)
- **Intake form policy links**: "By submitting this form, you agree to our..." with links to all 3 policies (open in new tab to preserve kiosk flow)
- **Test data cleanup**: Removed all test appointments, payments, and appointment items. Hard-deleted 3 test clients. Removed 5 fake seed clients. Only real client (Bas Rosario) remains.
- **Added dependency**: `qrcode.react@^4.2.0` for QR code generation
- All changes type-check clean (0 errors)

### Done (Session 11)

- **Owner master access**: Ricardo (OWNER) can edit his own name + edit other barbers' profiles (firstName, lastName, commissionRate, title, tagline, specialties)
  - `PATCH /api/barbers/[slug]/profile` expanded with `OWNER_EXTRA_FIELDS`
  - My Profile page: owner sees editable name fields, non-owners see disabled field
  - Barbers management page: inline edit form for owner with all editable fields
- **Full inventory CRUD**: Add/edit/restock/delete products from dashboard
  - `POST /api/inventory` — create product + inventory item in transaction
  - `PATCH /api/inventory/[id]` — update product fields and/or inventory (quantity, reorderLevel)
  - `DELETE /api/inventory/[id]` — smart delete (soft-delete if order references, hard delete otherwise)
  - Dashboard UI: add product form, inline edit, restock quick-action, delete with confirmation
- **Rate limiting (TD-008)**: Edge-compatible sliding-window rate limiter in middleware
  - Login: 5 req/min, Intake: 10/min, Booking: 10/min per IP
  - Returns 429 with Retry-After header
  - In-memory Map store with lazy cleanup (no setInterval)
- **Analytics with real data (TD-004)**: Dashboard wired to live DB queries
  - `GET /api/analytics?range=week|month` — summary stats, revenue by day, service breakdown, top barbers
  - Period-over-period comparison (current vs previous week/month)
  - Week/Month toggle, dynamic summary cards with change indicators
  - Revenue by Day bar chart, Service Breakdown pie chart, Top Barbers leaderboard
- **Barber data maps → DB fields (TD-006)**: title, tagline, specialties moved from hardcoded maps to Prisma schema
  - Added `title`, `tagline`, `specialties` fields to Barber model
  - Updated seed with real data for all 6 barbers
  - Public barber pages + layout SEO now read from DB (removed 3 hardcoded maps)
  - Image maps (BARBER_IMAGES, HERO_BACKGROUNDS, PORTFOLIO_MAP) remain as-is (filesystem assets)
  - Owner can edit title/tagline/specialties via profile API
- **Book page refactor (TD-005)**: 902-line monolith split into 8 focused files
  - `src/components/public/booking/` — StepServices, StepProfessional, StepTime, StepConfirm, BookingSidebar, BookingSuccess, types
  - Parent page: 281 lines (state + data fetching + navigation)
  - No file over 281 lines
- **Lint fixes**: Fixed `react-hooks/set-state-in-effect` in analytics and appointments pages
- **Seed fix**: Added `payment.deleteMany()` before appointments to fix FK constraint on re-seed
- All quality gates passing: type-check (0), lint (0), format (clean), test (6/6), build (44 routes)

### Done (Session 12)

- **Contact info corrected**: Phone updated to (760) 701-2038, email to barbershopleucadia@gmail.com, SEO hours to real hours (Mon-Fri 10:30-6:30, Sat-Sun 10-4) across all 6 files
- **Dev:clean script**: Added `pnpm dev:clean` (rimraf .next && next dev) to prevent stale cache issues
- **Middleware optimization**: Skip static assets (_next, images, favicon, files with extensions) in middleware
- **Schema foundation for 5 future features** (single migration):
  - 11 new enums: BarberType, TransactionType, LoyaltyTxType, RewardType, RedemptionStatus, MembershipTier, PlanBillingCycle, SubscriptionStatus, CampaignStatus, CampaignChannel, CampaignScope
  - 12 new models: BarberTransaction, LoyaltyTier, LoyaltyTransaction, LoyaltyReward, LoyaltyRedemption, MembershipPlan, Subscription, SubscriptionUsage, CampaignTemplate, Campaign, CampaignRecipient
  - PaymentMethod enum expanded: ZELLE, CASHAPP, SQUARE, VENMO, OTHER
  - Client model: added passwordHash, emailVerified, preferredBarberId, loyaltyPoints, totalVisits, totalSpent, stripeCustomerId, emailOptOut
  - Barber model: added barberType (COMMISSION/BOOTH_RENTAL), boothRentAmount, acceptedPaymentMethods, zelleHandle, cashappHandle, venmoHandle, squareMerchantId
  - Payment model: added barberId, processedBy, tip, shopCut, barberCut, notes
  - Database reset + fresh init migration (local dev only)
- **Barber Business Units — Commission vs Booth Rental**:
  - `POST /api/payments` expanded: tip tracking, auto commission calculation (shopCut/barberCut from commissionRate), expanded payment methods, barberId attribution
  - `POST/PATCH /api/barbers/manage` updated: barberType, boothRentAmount, acceptedPaymentMethods, payment handles (Zelle/CashApp/Venmo)
  - Commission flow: shop processes payment → shopCut = amount × (1 - rate/100), barberCut = amount × rate/100
  - Booth-rental flow: barber logs payment directly → shopCut = 0, barberCut = full amount
- **4 new API routes**:
  - `GET /api/barbers/[slug]/dashboard` — barber's personal stats (today's appointments, revenue, tips, weekly stats, upcoming, recent payments)
  - `GET /api/barbers/[slug]/calendar` — day/week calendar with appointments + schedule overlay
  - `GET/POST /api/barbers/[slug]/transactions` — commission barbers see payments, booth-rental see self-logged transactions
  - `GET /api/analytics/revenue` — owner-only revenue reporting (per-barber breakdown, commission owed, booth rent, payment method breakdown)
- **Role-based sidebar navigation**: Barbers see My Dashboard/Calendar/Register/Transactions/Profile; Owner sees everything; Receptionist/Staff see overview/register/appointments/clients
- **5 new dashboard pages**:
  - `/dashboard/my-dashboard` — barber's personal overview (stats cards, today's queue, upcoming appointments, recent payments)
  - `/dashboard/my-calendar` — day view with schedule overlay, date navigation, appointment cards with status/payment info
  - `/dashboard/my-register` — barber's payment processing (expanded payment methods for booth-rental, checkout flow with tip input)
  - `/dashboard/my-transactions` — transaction history table with earnings/tips summary
  - `/dashboard/revenue` — owner-only revenue report (gross/shop/commission/tips totals, booth rent tracking, payment method breakdown, per-barber table)
- All quality gates passing: type-check (0), lint (0), test (6/6)

### Blockers

- None

### Next Steps (Session 13)

1. Update seed data to set barber types (commission vs booth-rental) and remove fake clients
2. Client Portal (Phase 2): client auth, portal pages, booking within portal
3. Loyalty Program (Phase 3): points engine, tiers, rewards, redemption
4. Memberships & Subscriptions (Phase 4): plans, Stripe subscriptions, visit tracking
5. Marketing Center (Phase 5): email campaigns, templates, audience engine, tracking
6. Review 2 borderline images flagged in Session 8
7. Stripe frontend completion (payment forms)
8. E2E tests for key flows

## Decisions Made

- Prisma 6 (not 7) due to Node 20 compatibility on this machine (TD-001)
- happy-dom over jsdom for Vitest (ESM compatibility with Node 20)
- Geist font family (sans + mono) for clean, modern look
- Route groups: (public) for public site, (dashboard) for command center
- CSRF protection via Origin header validation in middleware
- Soft deletes on Client model (deletedAt field)
- Commission tracking on Barber model for revenue analytics
- Local dev first, migrate to Hostinger VPS when ready
- Domain: figaroleucadia.com (existing)
- PostgreSQL 17 is shared on this machine -- MUST use isolated DB + user for Figaro
- Teal (#5ba5a5) as strong secondary accent color alongside gold (#c9a84c) -- inspired by old site's colorful Leucadia banner
- Left-aligned hero layout (not centered) for more cinematic, less cookie-cutter feel
- Barbers front and center on landing page -- "Meet the Crew" is the primary CTA
- Static `<img>` tags for gallery images (not Next.js `<Image>`) -- simpler for avif/jpeg/png mix
- bcrypt with 12 salt rounds for password hashing
- JWT session strategy (not database sessions) for simpler deployment
- All barbers get user accounts linked to their barber profiles
- Availability engine uses 30-minute slot increments
- Shop photos only on dark hero/atmosphere sections, cream body sections stay clean
- Barber last names left empty (not "Figaro") -- only first names displayed
- `llms.txt` / `llms-full.txt` for AI engine optimization (ChatGPT, Perplexity, Google AI Overviews)
- Server component pattern for SEO: extract "use client" content to components, use route-level layouts for metadata on client pages
- FAQ data centralized in `src/lib/faq.ts` for reuse across JSON-LD and future FAQ page

## Session Log

| Session | Date       | Summary                                                                                                                                                                                                                                                              |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | 2026-03-06 | Full project setup. Tech stack approved and locked. All scaffolding, security, testing, governance, and quality gates complete.                                                                                                                                      |
| 2       | 2026-03-06 | Public site redesign complete. Barber-centric design with teal/gold palette, real photos for all 6 barbers, real service data, customer testimonials, gallery integration. Seed data updated with real Figaro business data. All quality gates passing.              |
| 3       | 2026-03-06 | Database connected and seeded. Auth.js v5 with bcrypt + role-based access. Dashboard wired to live data. Booking availability engine built. Intake form updated with real barbers. All quality gates passing.                                                        |
| 4       | 2026-03-06 | Real shop photos integrated across site. Homepage streamlined (removed mosaic + gallery strip). Hero buttons swapped. "Command Center" -> "Barbershop Administration". Barber fake last names removed from DB + seed.                                                |
| 4b      | 2026-03-08 | Continued homepage polish: removed services section, smoothed scroll animations, tested logo placement. Ready for VPS deployment.                                                                                                                                    |
| 5       | 2026-03-08 | VPS deployed. Booking UX overhaul (mobile cart, date picker, scroll-to-top). Availability API fixed. Header nav cleanup. Contact CTAs. Barber profile hero backgrounds. Mobile homepage improvements.                                                                |
| 6       | 2026-03-08 | Google Maps address links. Mandatory email/phone on booking + intake. Booking sidebar logo fix. Service card text contrast improvement.                                                                                                                              |
| 7       | 2026-03-08 | Full-scale audit. 18 issues fixed across security (API auth, HSTS, CSP), bugs (day-of-week, type cast), UX (error boundaries, booking feedback), code quality (try/catch, unused deps, env validation), docs. All quality gates passing.                             |
| 8       | 2026-03-09 | Premium SEO (JSON-LD, OpenGraph, sitemap, robots, per-page metadata, dynamic barber metadata). AI engine optimization (llms.txt, FAQ JSON-LD). Children's photos removed. Intake form updates (removed hair type, added Fresha referral). All quality gates passing. |
| 9       | 2026-03-09 | Fixed Sunday schedule bug on barber profiles. VPS production debugging (UntrustedHost, corrupted build). Send Intake button with email/link delivery. Client soft-delete (OWNER only). Intake form pre-fill from query params. All quality gates passing.            |
| 10      | 2026-03-09 | Backend review + major feature build. Register/POS page, services CRUD, My Profile fix + photo upload, intake kiosk mode, policy pages (privacy/terms/cancellation), soft-delete re-registration fix, test data cleanup. Type-check clean.                           |
| 11      | 2026-03-09 | Backend completion. Owner master access, inventory CRUD, rate limiting, real analytics, barber DB fields, book page refactor. 5 tech debt items resolved (TD-004/005/006/008). All 5 quality gates passing.                                                           |
| 12      | 2026-03-15 | Feature expansion Phase 1. Schema foundation (11 enums, 12 models). Barber business units (commission vs booth-rental). Expanded payments (tips, 8 methods, commission calc). 4 new APIs + 5 new dashboard pages. Role-based sidebar. Contact info corrected. All quality gates passing. |
