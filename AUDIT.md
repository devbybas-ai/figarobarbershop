# Figaro Command Center - Audit Log

> Last updated: 2026-04-11

## Health Dashboard (Twelve Pillars)

| Pillar            | Score | Status                                                                                 |
| ----------------- | ----- | -------------------------------------------------------------------------------------- |
| Security          | 8/10  | Auth on all routes, bcrypt, RBAC, HSTS, CSP, rate limiting. Next.js + Vite vulns open. |
| Reliability       | 9/10  | Error boundaries, API try/catch, idempotent seed, soft deletes                         |
| Accessibility     | 8/10  | Skip-to-content, semantic HTML, lang attr, aria labels, viewport configured            |
| Modularity        | 9/10  | Clean architecture, book page refactored into 8 step components                        |
| Readability       | 9/10  | TypeScript strict, consistent naming, clear file structure                             |
| Maintainability   | 8/10  | Good patterns but test coverage is minimal (6 unit tests)                              |
| Observability     | 7/10  | Console logging only, no structured logging or monitoring                              |
| Performance       | 8/10  | Static pages where possible, middleware skips static assets                            |
| Redundancy        | 7/10  | Single instance, no failover, no automated backups                                     |
| Recovery          | 7/10  | VPS deployed, no recovery runbook, no automated rollback                               |
| Tested & Verified | 5/10  | Only 6 unit tests. No component, API, or integration tests.                            |
| Documented        | 9/10  | Full governance files, project map, SEO config, policy pages                           |

## Issues Tracker

| ID  | Severity | Status | Description                                                                 | Found      | Fixed      |
| --- | -------- | ------ | --------------------------------------------------------------------------- | ---------- | ---------- |
| 009 | Critical | Fixed  | API routes missing auth: appointments GET, clients GET, inventory GET       | 2026-03-08 | 2026-03-08 |
| 010 | Critical | Fixed  | API routes missing auth: appointments/[id] PATCH, payments POST             | 2026-03-08 | 2026-03-08 |
| 011 | High     | Fixed  | Day-of-week mismatch in barber schedule creation (0-based vs 1-based)       | 2026-03-08 | 2026-03-08 |
| 012 | High     | Fixed  | No error boundaries (error.tsx, loading.tsx, not-found.tsx)                 | 2026-03-08 | 2026-03-08 |
| 013 | High     | Fixed  | Booking form silently fails on error (no user feedback)                     | 2026-03-08 | 2026-03-08 |
| 014 | Medium   | Fixed  | Footer links to non-existent /about page                                    | 2026-03-08 | 2026-03-08 |
| 015 | Medium   | Fixed  | Header View Services text not clickable (not a link)                        | 2026-03-08 | 2026-03-08 |
| 016 | Medium   | Fixed  | Default password hardcoded in source and displayed in UI                    | 2026-03-08 | 2026-03-08 |
| 017 | Medium   | Fixed  | ownerOnly type cast bug in barbers/manage route                             | 2026-03-08 | 2026-03-08 |
| 018 | Medium   | Fixed  | Env validation crashes app if Instagram/Resend keys missing                 | 2026-03-08 | 2026-03-08 |
| 019 | Medium   | Fixed  | Missing viewport configuration in root layout                               | 2026-03-08 | 2026-03-08 |
| 020 | Medium   | Fixed  | Multiple API routes missing try/catch error handling                        | 2026-03-08 | 2026-03-08 |
| 021 | Low      | Fixed  | Duplicate formatCurrency in dashboard page                                  | 2026-03-08 | 2026-03-08 |
| 022 | Low      | Fixed  | Book page useEffect missing totalDuration dependency                        | 2026-03-08 | 2026-03-08 |
| 023 | Low      | Fixed  | HSTS header missing preload directive                                       | 2026-03-08 | 2026-03-08 |
| 024 | Low      | Fixed  | CSP connect-src included Resend (server-only API)                           | 2026-03-08 | 2026-03-08 |
| 025 | Low      | Fixed  | Unused dependencies: @auth/prisma-adapter, react-hook-form                  | 2026-03-08 | 2026-03-08 |
| 026 | Low      | Fixed  | CLAUDE.md said Next.js 15 but actually running Next.js 16                   | 2026-03-08 | 2026-03-08 |
| 027 | Info     | Open   | Homepage is fully client-rendered (no SSR benefits for SEO body)            | 2026-03-08 | --         |
| 028 | Info     | Fixed  | Analytics dashboard uses hardcoded sample data                              | 2026-03-08 | 2026-03-09 |
| 029 | Info     | Fixed  | Barber profile pages use hardcoded data maps for specialties/title/tagline  | 2026-03-08 | 2026-03-09 |
| 030 | High     | Fixed  | My Profile page broken: name-based barber lookup fails for non-barber names | 2026-03-09 | 2026-03-09 |
| 031 | High     | Fixed  | Soft-deleted clients blocked from re-registering via intake form            | 2026-03-09 | 2026-03-09 |
| 032 | Medium   | Fixed  | Services page was read-only (no add/edit/remove capability)                 | 2026-03-09 | 2026-03-09 |
| 033 | Medium   | Fixed  | Appointments page had no date navigation (only hidden date picker)          | 2026-03-09 | 2026-03-09 |
| 034 | Low      | Fixed  | All seed clients had deletedAt set (accidentally soft-deleted)              | 2026-03-09 | 2026-03-09 |
| 035 | Medium   | Fixed  | Inventory page was read-only (no add/edit/restock/delete)                   | 2026-03-09 | 2026-03-09 |
| 036 | Medium   | Fixed  | No rate limiting on login/form endpoints                                    | 2026-03-09 | 2026-03-09 |
| 037 | Medium   | Fixed  | Book page was 902-line monolith (hard to maintain)                          | 2026-03-09 | 2026-03-09 |
| 038 | Low      | Fixed  | Seed failed on re-run due to payment FK constraint on appointments          | 2026-03-09 | 2026-03-09 |
| 039 | Low      | Fixed  | react-hooks/set-state-in-effect lint errors in analytics + appointments     | 2026-03-09 | 2026-03-09 |
| 040 | Medium   | Fixed  | Contact info wrong: phone, email, hours incorrect across 6 files            | 2026-03-15 | 2026-03-15 |
| 041 | High     | Fixed  | VPS builds failing: git pull as root changed file ownership                 | 2026-03-18 | 2026-03-18 |
| 042 | High     | Fixed  | NEXTAUTH_URL pointed to raw IP instead of domain (auth login spinning)      | 2026-03-18 | 2026-03-18 |
| 043 | Medium   | Fixed  | Prisma migration baseline missing on VPS (schema drift)                     | 2026-03-18 | 2026-03-18 |
| 044 | High     | Open   | Next.js 16.1.7 DoS vulnerability (Server Components) -- patch in 16.2.3+    | 2026-04-11 | --         |
| 045 | High     | Open   | Vite 7.x `server.fs.deny` bypass (transitive via unpinned Vitest)           | 2026-04-11 | --         |
| 046 | High     | Open   | Vite 7.x arbitrary file read via WebSocket (transitive via unpinned Vitest) | 2026-04-11 | --         |
| 047 | Moderate | Open   | Vite 7.x path traversal in optimized deps .map handling (transitive)        | 2026-04-11 | --         |
| 048 | Medium   | Open   | Vitest not pinned -- ^4.1.2 pulls Vite 7.x (needs Node 22, we run Node 20)  | 2026-04-11 | --         |
| 049 | Medium   | Open   | SECURITY-AUDIT.md missing -- required for all live projects                 | 2026-04-11 | --         |

## Tech Debt Register

| ID     | Description                                                  | Priority | Added      |
| ------ | ------------------------------------------------------------ | -------- | ---------- |
| TD-001 | Upgrade to Prisma 7 when Node 22+ is available               | Low      | 2026-03-06 |
| TD-003 | Add CSP nonce-based script loading (replace unsafe-inline)   | Medium   | 2026-03-06 |
| TD-004 | ~~Analytics page uses sample data~~ **RESOLVED Session 11**  | ~~Med~~  | 2026-03-06 |
| TD-005 | ~~Refactor book/page.tsx into step components~~ **RESOLVED** | ~~Med~~  | 2026-03-08 |
| TD-006 | ~~Move barber data maps into DB fields~~ **RESOLVED**        | ~~Med~~  | 2026-03-08 |
| TD-008 | ~~Add rate limiting on login/form endpoints~~ **RESOLVED**   | ~~Med~~  | 2026-03-08 |
| TD-009 | Migrate middleware to Next.js 16 proxy convention            | Low      | 2026-03-08 |
| TD-010 | Expand test coverage (components, API routes, integration)   | Medium   | 2026-03-21 |
| TD-011 | Homepage fully client-rendered (no SSR for SEO body content) | Low      | 2026-03-08 |

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
| Rate limiting               | Yes (login 5/min, forms 10/min per IP)   |

## Audit History

| Date       | Type       | Summary                                                                                                                                                                     |
| ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-06 | Initial    | Project setup complete. Security foundations in place.                                                                                                                      |
| 2026-03-06 | Session 3  | DB connected, auth with bcrypt, dashboard live data, booking API. All quality gates passing.                                                                                |
| 2026-03-06 | Session 4  | Real shop photos, homepage streamlined, branding updated, barber data corrected.                                                                                            |
| 2026-03-08 | Session 7  | Full-scale audit. 18 issues fixed across security, bugs, UX, structure, performance, docs. All gates passing.                                                               |
| 2026-03-09 | Session 11 | Backend completion. Owner access, inventory CRUD, rate limiting, real analytics, DB fields, book refactor. 4 TD items resolved. All 5 gates passing.                        |
| 2026-03-15 | Session 12 | Schema foundation (11 enums, 12 models). Barber business units (commission vs booth-rental). 4 new APIs, 5 new dashboard pages. Role-based sidebar. Contact info corrected. |
| 2026-03-18 | Session 13 | Platform details page. VPS permission fix (chown). NEXTAUTH_URL corrected. Prisma migration baseline.                                                                       |
| 2026-03-21 | Session 14 | Project map tour. Verified and filled figaro.md project map. Updated stale governance files.                                                                                |
| 2026-04-11 | Session 15 | Governance audit. Twelve Pillars applied. 4 dep vulns found (1 Next.js high, 3 Vite via unpinned Vitest). SECURITY-AUDIT.md flagged missing.                                |
