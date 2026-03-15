# Technology Stack

Every choice below was selected against three criteria: **is it simple to set up?**, **does the Lagos/Nigerian dev market have talent for it?**, and **does it avoid introducing infrastructure the architecture doesn't require?**

## Core Stack

| Layer | Technology | Why This One |
|---|---|---|
| **Language** | TypeScript (strict mode) | One language across API, web, mobile, and workers. Non-negotiable given the spec's typed interfaces and shared contracts. |
| **Runtime** | Node.js (LTS — currently v22) | Battle-tested, largest ecosystem, best AI-assisted coding support, deepest Nigerian talent pool. |
| **HTTP Framework** | Fastify | 2–3× Express throughput, built-in JSON schema validation and serialization, plugin architecture maps perfectly to the modular monolith. |
| **Database** | PostgreSQL 16 | Schema-per-package, row-level security, declarative partitioning, full-text search — all native. |
| **ORM / Query Builder** | Drizzle ORM | Code-first TypeScript schemas, generates clean SQL migrations, ~5KB bundle, no binary dependencies, SQL-like API that doesn't hide what's running. |
| **Monorepo Tool** | Turborepo + pnpm workspaces | Minimal config, fast caching, non-intrusive — just runs your scripts faster. pnpm's symlink-based `node_modules` is the most efficient for monorepos. |
| **Background Jobs** | BullMQ + Redis | The outbox relay, reconciliation jobs, notification dispatch, and reporting workers all need a reliable queue. BullMQ gives retries, delayed jobs, priorities, and dead-letter handling out of the box. |
| **Cache / Rate Limiting** | Redis (same instance as BullMQ at launch) | Rate limiting in a fast key-value store. Redis handles both this and BullMQ — one piece of infrastructure doing double duty. |

## Client Applications

| Layer | Technology | Why This One |
|---|---|---|
| **Web Client** | Next.js (App Router) | SSR for SEO on public profiles/listings, React Server Components for performance, file-based routing. Strong React/Next.js familiarity in the Nigerian dev community. |
| **Mobile Client** | Expo (React Native) | Officially recommended way to start React Native projects in 2026. Same TypeScript, same React mental model. EAS Build removes the "you need a Mac" barrier. OTA updates bypass app store review. |
| **Admin Dashboard** | Next.js (same stack as web, separate app) | Shares the `contracts` package. No need to learn a different framework for admin. |

## External Services

| Layer | Technology | Why This One |
|---|---|---|
| **Auth** | Custom (built in the `auth` package) | The auth domain is deeply intertwined with business logic — invites, referrals, tiers, KYC. Use `argon2` for hashing, `jose` for JWTs, `arctic` for social login adapters. |
| **File Storage** | S3-compatible object storage | Cloudflare R2 (zero egress fees) or AWS S3. Abstracted behind the `media` module interface. |
| **Email** | Resend or Postmark | Simple transactional email APIs. Pluggable behind the platform package's email channel adapter. |
| **Payment Gateway** | Paystack | Nigerian-first, well-documented API, webhook-based — exactly what the finance package's gateway adapter expects. Flutterwave as a secondary option. |
| **Deployment** | Single VPS or managed container (Railway, Render, or DigitalOcean App Platform) | A modular monolith is one deployable. One API process + one worker process is all you need until past 10,000 active members. |
| **CI/CD** | GitHub Actions | Free for public repos, generous minutes for private. Turborepo's remote cache integrates natively. |

## Toolchain

| Tool | Purpose |
|---|---|
| **pnpm 9.x** | Package management. Symlink-based `node_modules`, fastest installs, native workspace support. |
| **Turborepo 2.x** | Task caching and orchestration across monorepo packages. |
| **TypeScript 5.x (strict)** | One `tsconfig.base.json` at root, extended per package. |
| **Vitest** | Testing. Fast, native TypeScript support, compatible with Fastify and Drizzle. |
| **Biome** | Linting + formatting in one tool. Faster than ESLint + Prettier combined. Written in Rust. |
| **tsx** | Run TypeScript directly in development without a build step. |
| **tsup** | Bundle packages for production when needed. |

## Why These Over Alternatives

**Fastify over Express, Hono, or NestJS.** Express has no built-in validation or serialization. Hono is optimised for edge/serverless cold starts — irrelevant for a monolith on a persistent server. NestJS adds decorators, DI containers, and a steep learning curve for something the architecture already handles with its own DI wiring. Fastify's plugin architecture is modular without being heavy — each package registers as a Fastify plugin with its own routes and lifecycle hooks.

**Drizzle ORM over Prisma or Kysely.** Drizzle schemas are plain TypeScript files — each package defines its own in its own directory, matching the layout exactly. The SQL-like API lets you write the finance package's atomic conditional updates and ledger invariants precisely. No Rust binary dependency (~5KB vs Prisma's ~50MB). `drizzle-kit` generates clean, reviewable SQL migration files — critical for a system that handles money. Kysely is a pure query builder without schema management or migrations.

**Turborepo over Nx.** The repo layout is a standard pnpm workspace. Turborepo adds caching without changing the structure. One `turbo.json` file. Nx is more powerful but heavier to adopt for a team of 1–3 engineers. If the team grows to 5+, Nx is a reasonable migration target.

**Expo over Flutter.** Same language (TypeScript), shared `contracts` package, no Mac required for iOS builds (EAS Build), OTA updates for marketplace bug fixes. Flutter uses Dart — separate language, separate expertise, smaller Nigerian talent pool.

**Custom auth over Clerk/Auth0/Supabase Auth.** The auth package has invite codes with per-tier limits, referral chains, admin approval queues, KYC flows, and a custom tier system. No off-the-shelf service models this.

## What You Don't Need at Launch

| Thing People Will Suggest | Why You Should Skip It |
|---|---|
| **Kubernetes** | One API process and one worker process. A managed container platform is sufficient until independent scaling per package is needed. |
| **Kafka / RabbitMQ** | BullMQ + the database outbox covers event needs. Graduate to a dedicated broker when throughput demands it. |
| **Elasticsearch** | Start with PostgreSQL full-text search for 1–10K members. The search index worker is already wired to swap backends later. |
| **GraphQL** | REST with Fastify's schema validation gives typed request/response contracts without the complexity of schema stitching across 6 business packages. |
| **Terraform / Pulumi** | Infrastructure-as-code for two containers and a database is premature. Use the hosting platform's UI. |
| **Microservices** | This entire document exists to explain why you don't need them yet. |
