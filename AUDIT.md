# Figaro Command Center - Audit Log

> Last updated: 2026-03-08

## Health Dashboard

| Dimension        | Score | Status                                                                       |
| ---------------- | ----- | ---------------------------------------------------------------------------- |
| Security         | 9/10  | Strong - auth on all sensitive API routes, bcrypt, RBAC, HSTS preload, CSP   |
| Structure        | 9/10  | Good - clear architecture, separation of concerns, error boundaries in place |
| Performance      | 8/10  | Good - static pages where possible, build passing, Recharts SSG warning only |
| Accessibility    | 8/10  | Good - skip-to-content, semantic HTML, lang attribute, aria labels           |
| Inclusivity      | 9/10  | Good - inclusive language, no assumptions                                    |
| UX               | 9/10  | Strong - branded design, real photos, booking error feedback                 |
| Universal Design | 8/10  | Good - keyboard accessible foundations, viewport configured                  |
| R3S              | 9/10  | Strong - error.tsx, loading.tsx, not-found.tsx, API try/catch everywhere     |

## Issues Tracker

| ID  | Severity | Status | Description                                                           | Found      | Fixed      |
| --- | -------- | ------ | --------------------------------------------------------------------- | ---------- | ---------- |
| 009 | Critical | Fixed  | API routes missing auth: appointments GET, clients GET, inventory GET | 2026-03-08 | 2026-03-08 |
| 010 | Critical | Fixed  | API routes missing auth: appointments/[id] PATCH, payments POST       | 2026-03-08 | 2026-03-08 |
| 011 | High     | Fixed  | Day-of-week mismatch in barber schedule creation (0-based vs 1-based) | 2026-03-08 | 2026-03-08 |
| 012 | High     | Fixed  | No error boundaries (error.tsx, loading.tsx, not-found.tsx)           | 2026-03-08 | 2026-03-08 |
| 013 | High     | Fixed  | Booking form silently fails on error (no user feedback)               | 2026-03-08 | 2026-03-08 |
| 014 | Medium   | Fixed  | Footer links to non-existent /about page                              | 2026-03-08 | 2026-03-08 |
| 015 | Medium   | Fixed  | Header View Services text not clickable (not a link)                  | 2026-03-08 | 2026-03-08 |
| 016 | Medium   | Fixed  | Default password hardcoded in source and displayed in UI              | 2026-03-08 | 2026-03-08 |
| 017 | Medium   | Fixed  | ownerOnly type cast bug in barbers/manage route                       | 2026-03-08 | 2026-03-08 |
| 018 | Medium   | Fixed  | Env validation crashes app if Instagram/Resend keys missing           | 2026-03-08 | 2026-03-08 |
| 019 | Medium   | Fixed  | Missing viewport configuration in root layout                         | 2026-03-08 | 2026-03-08 |
| 020 | Medium   | Fixed  | Multiple API routes missing try/catch error handling                  | 2026-03-08 | 2026-03-08 |
| 021 | Low      | Fixed  | Duplicate formatCurrency in dashboard page                            | 2026-03-08 | 2026-03-08 |
| 022 | Low      | Fixed  | Book page useEffect missing totalDuration dependency                  | 2026-03-08 | 2026-03-08 |
| 023 | Low      | Fixed  | HSTS header missing preload directive                                 | 2026-03-08 | 2026-03-08 |
| 024 | Low      | Fixed  | CSP connect-src included Resend (server-only API)                     | 2026-03-08 | 2026-03-08 |
| 025 | Low      | Fixed  | Unused dependencies: @auth/prisma-adapter, react-hook-form            | 2026-03-08 | 2026-03-08 |
| 026 | Low      | Fixed  | CLAUDE.md said Next.js 15 but actually running Next.js 16             | 2026-03-08 | 2026-03-08 |
| 027 | Info     | Open   | Homepage is fully client-rendered (no SSR benefits for SEO body)      | 2026-03-08 | --         |
| 028 | Info     | Open   | Analytics dashboard uses hardcoded sample data                        | 2026-03-08 | --         |
| 029 | Info     | Open   | Barber profile pages use hardcoded data maps for images/specialties   | 2026-03-08 | --         |

## Tech Debt Register

| ID     | Description                                                  | Priority | Added      |
| ------ | ------------------------------------------------------------ | -------- | ---------- |
| TD-001 | Upgrade to Prisma 7 when Node 22+ is available               | Low      | 2026-03-06 |
| TD-003 | Add CSP nonce-based script loading (replace unsafe-inline)   | Medium   | 2026-03-06 |
| TD-004 | Analytics page uses sample data (wire to real Recharts data) | Medium   | 2026-03-06 |
| TD-005 | Refactor book/page.tsx (845 lines) into step components      | Medium   | 2026-03-08 |
| TD-006 | Move barber profile hardcoded data maps into DB fields       | Medium   | 2026-03-08 |
| TD-008 | Add rate limiting on login and public form endpoints         | Medium   | 2026-03-08 |
| TD-009 | Migrate middleware to Next.js 16 proxy convention            | Low      | 2026-03-08 |

## Security Posture

| Check                       | Status                                   |
| --------------------------- | ---------------------------------------- |
| Security headers configured | Yes (HSTS with preload)                  |
| CSP configured              | Yes (Tier B - unsafe-inline for styles)  |
| CSRF protection             | Yes (Origin validation)                  |
| Auth middleware             | Yes (dashboard UI routes protected)      |
| API route auth              | Yes (all sensitive routes guarded)       |
| Password hashing            | Yes (bcrypt, 12 rounds)                  |
| Role-based access           | Yes (OWNER, BARBER, RECEPTIONIST, STAFF) |
| Input validation pattern    | Yes (Zod schemas on all API routes)      |
| Secrets in .gitignore       | Yes                                      |
| Default password from env   | Yes (not hardcoded in source)            |

## Audit History

| Date       | Type      | Summary                                                                                                       |
| ---------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| 2026-03-06 | Initial   | Project setup complete. Security foundations in place.                                                        |
| 2026-03-06 | Session 3 | DB connected, auth with bcrypt, dashboard live data, booking API. All quality gates passing.                  |
| 2026-03-06 | Session 4 | Real shop photos, homepage streamlined, branding updated, barber data corrected.                              |
| 2026-03-08 | Session 7 | Full-scale audit. 18 issues fixed across security, bugs, UX, structure, performance, docs. All gates passing. |
