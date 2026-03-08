# Figaro Command Center - Project Instructions

> Standards reference: `.claude/BuiltByBasProjectSetup.md`

## Project Overview

Full-stack barbershop command center for Figaro Barbershop Leucadia. Public-facing website + internal dashboard for booking, client management, barber management, inventory, analytics, and product sales.

## Tech Stack (LOCKED)

| Layer           | Choice                   |
| --------------- | ------------------------ |
| Language        | TypeScript (strict)      |
| Framework       | Next.js 15 (App Router)  |
| Styling         | Tailwind CSS 4           |
| Animation       | Motion (Framer Motion)   |
| Database        | PostgreSQL (self-hosted) |
| ORM             | Prisma 6                 |
| Auth            | Auth.js (NextAuth v5)    |
| Testing         | Vitest + Playwright      |
| Package Manager | pnpm                     |
| Linting         | ESLint + Prettier        |
| Version Control | Git + GitHub             |
| CI/CD           | GitHub Actions           |

### Additional Tools

- Stripe Connect (payments)
- Instagram Graph API (feed integration)
- Recharts (dashboard visualizations)
- React Hook Form + Zod (forms + validation)
- Resend (transactional emails)
- node-cron (scheduled tasks)

## Architecture

```
src/
  app/
    (public)/       # Public website routes
    (dashboard)/    # Command center routes (auth required)
    api/            # API routes
  components/
    ui/             # Shared UI components
    layout/         # Layout components (header, footer, sidebar)
    public/         # Public site components
    dashboard/      # Dashboard components
  lib/              # Utilities, db client, helpers
  config/           # Environment validation, constants
  types/            # Shared TypeScript types
  test/             # Test setup and utilities
  middleware.ts     # Auth + CSRF protection
prisma/
  schema.prisma     # Database schema
e2e/                # Playwright E2E tests
```

## Standards

This project follows the BuiltByBas Dev Studio Bible (Part II). Key rules:

### Eight Pillars

1. Security Minded - Can this be exploited?
2. Structure - Can someone else pick this up tomorrow?
3. Performance - Does this respect the user's time and device?
4. Inclusive - Can everyone use this?
5. Non-Bias - Does this assume or exclude?
6. UX Minded - Does this feel intentional and clear?
7. Universal Design - Does this work for the widest range of people?
8. R3S - What happens when something fails?

### Conflict Resolution

- Security > Performance > Convenience
- Accessibility > Aesthetics
- Data Privacy > Feature Completeness

### Prohibited Actions

- Never force-push to shared branches
- Never commit .env or secrets
- Never inject user-supplied data as raw HTML
- Never use `any` type
- Never pass raw request body to database
- Never store tokens in localStorage/sessionStorage
- Never expose secret keys to client bundles
- Never skip auth checks on protected routes
- Never delete user data without confirmation
- Never log PII
- Never ship without passing quality gates
- Never use eval/exec/new Function with input
- Never skip hooks or bypass safety checks
- Never use @ts-ignore without documented justification

### Naming Conventions

- Components/Classes: PascalCase
- Functions/Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase
- Files: Match primary export
- Directories: kebab-case

### Git Commits

Format: `<type>: <description>`
Types: feat, fix, docs, style, refactor, test, build, chore
Always include: `Co-Authored-By: Claude <noreply@anthropic.com>`

## Quality Gates

All must pass before shipping:

1. `pnpm type-check` - 0 errors
2. `pnpm lint` - 0 errors
3. `pnpm format:check` - formatted
4. `pnpm test` - all passing
5. `pnpm build` - 0 errors

## Governance Files

| File             | Purpose                          |
| ---------------- | -------------------------------- |
| CLAUDE.md        | Project instructions (this file) |
| HANDOFF.md       | Session continuity tracker       |
| AUDIT.md         | Quality and issues tracker       |
| ProjectHealth.md | Health summary                   |
| .env.example     | Environment variable template    |

## Session Protocol

### Starting a Session

1. Read HANDOFF.md for current state
2. Read AUDIT.md for open issues
3. Read ProjectHealth.md for health status

### During a Session

- Follow the Eight Pillars on every decision
- Update HANDOFF.md with progress
- Log issues in AUDIT.md as found

### Ending a Session

- Update HANDOFF.md with: done, in-progress, next, blockers
- Run quality gates
- Update AUDIT.md with any new issues or fixes
