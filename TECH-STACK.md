# TripMind AI — Technical Architecture Document

**Version:** 1.0
**Date:** 2026-08-31
**Status:** Recommended Stack — Pending Confirmation

---

## 1. Overview

This document defines the full technology stack for TripMind AI, a next-generation AI-powered travel planning platform. Choices are justified by product requirements: SEO-critical travel content, AI-heavy itinerary generation, real-time trip monitoring, geospatial queries, and a glassmorphism UI matching the design system spec (`design-spec.html`).

**Key drivers:**

- SSR required for travel SEO (destination pages indexed by Google).
- AI orchestration with multi-model routing for cost control.
- Geospatial-first data (attractions, hotels, routes by distance).
- Real-time live trip adjustments (delays, closures, weather).
- Complex state: itinerary generation, collaborative planning, expense tracking.
- Glassmorphism UI matching the `design-spec.html` aesthetic.

---

## 2. Tech Stack Summary

```
Frontend:      Next.js 15 + React 19 + TypeScript
Styling:       Tailwind CSS v4 + shadcn/ui + GSAP
State:         Zustand (client) + TanStack Query (server)
Backend:       Node.js 22 + Fastify + Vercel AI SDK
AI:            OpenAI GPT-4o (primary) + Anthropic Claude (fallback)
Optimization:  Google OR-Tools + Mapbox Directions Matrix
Database:      PostgreSQL 16 + PostGIS + Redis + OpenSearch
Maps:          Mapbox GL JS + Mapbox Directions API
Realtime:      WebSockets (native) + Socket.io
Storage:       Cloudflare R2
Auth:          Auth.js (NextAuth)
Payments:      Stripe
Notifications:  Resend (email) + Web Push
Hosting:       Vercel (frontend/API) + Railway (workers)
DevOps:        Docker Compose + GitHub Actions + Sentry + Grafana
Testing:       Vitest + Playwright + k6
```

---

## 3. Layer-by-Layer Decisions

### 3.1 Frontend

#### Framework: Next.js 15 (App Router)

| Factor | Decision | Rationale |
|--------|----------|-----------|
| **Rendering** | SSR + SSG for destination pages; RSC for itinerary components | Travel destination pages need Google indexing. App Router's `generateStaticParams` + ISR gives fresh content with CDN performance. |
| **Routing** | App Router file-based routing | Built-in, type-safe, supports layouts and loading states. |
| **Language** | TypeScript 5 | Full-stack type safety from DB schema to UI components. |
| **Bundler** | Turbopack (Next.js default) | 10× faster cold starts than Webpack; compatible with Vite ecosystem. |

> **Note on Vite:** The original prompt mentioned Vite. Next.js uses Turbopack (its Rust-based bundler, derived from Vite's principles). Vite is the better choice if the app is purely a client-side SPA with no SSR requirement. For TripMind AI, SSR is a hard requirement for travel SEO — so Next.js is the correct choice. Vite-compatible patterns (CSS imports, asset handling) all work identically.

#### Styling: Tailwind CSS v4 + shadcn/ui

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **CSS framework** | Tailwind CSS v4 | Direct translation of `design-spec.html` utility classes to Tailwind config. `liquid-glass` and `liquid-glass-strong` become Tailwind component classes. |
| **Component library** | shadcn/ui | Accessible, copy-paste primitives (no npm dependency). Cards, buttons, modals, dropdowns all match the glassmorphism spec. |
| **Animation** | GSAP + Framer Motion | GSAP for parallax, boomerang, scroll choreography. Framer Motion for page transitions, drag, and gesture UI. |
| **Icons** | lucide-react | Tree-shakeable, consistent stroke weight, matches the design system. |

#### State Management

| Layer | Tool | Rationale |
|-------|------|-----------|
| **Client state** | Zustand | Lightweight store for preferences, theme, UI toggles, active itinerary state. No boilerplate. |
| **Server state** | TanStack Query | Caching, background refetch, optimistic updates for API calls. Critical for live-replan polling. |

---

### 3.2 Backend

#### Runtime: Node.js 22 + Fastify

| Choice | Rationale |
|--------|-----------|
| **Node.js 22** | Native ESM, improved performance, `fetch` API built-in, WebSocket support in core. |
| **Fastify** | 2× faster than Express, TypeScript-native, built-in validation (Zod), excellent plugin ecosystem. Colocate with Next.js API routes at MVP; extract to Fastify microservice at scale. |

> **Alternative:** Colocate all API routes inside Next.js (`app/api/`) for MVP. Extract Fastify only when job queue or CPU-heavy planning logic needs isolated scaling.

#### API Style

- **tRPC** for internal API (end-to-end type safety, no schema generation needed).
- **REST + OpenAPI** for external integrations (Amadeus, Google Places, Mapbox).
- All inputs validated with **Zod** at every boundary.

---

### 3.3 Artificial Intelligence

#### AI Orchestration: Vercel AI SDK

| Feature | Benefit |
|---------|---------|
| Multi-model routing | Route simple queries (hotel availability check) to `gpt-4o-mini`; complex itinerary generation to `gpt-4o`; nuanced recommendation explanations to `claude-sonnet`. |
| Streaming responses | Users see itinerary building in real time, not waiting 10s for a wall of text. |
| Prompt management | Centralized prompt templates, versioning, A/B testing. |
| Token budgeting | Per-request budgets prevent runaway LLM costs. |

#### Models

| Task | Model | Cost Priority |
|------|-------|---------------|
| Itinerary generation | GPT-4o | Primary (highest quality) |
| Simple recommendations | GPT-4o-mini | Cost optimization |
| Nuanced explanations, empathy | Claude Sonnet 4 | Fallback / nuance |
| Route optimization signals | Gemini Flash | Fast, cheap |

#### Planning Engine: Google OR-Tools

| Component | Tool | Rationale |
|-----------|------|-----------|
| **Route optimization** | OR-Tools (Node.js) + Mapbox Directions Matrix | Constraint-based solver for TSP variants (time windows, venue opening hours, transit modes, preference weights). Mapbox provides real travel time including traffic. |
| **Budget allocation** | Custom linear solver | Distribute budget across categories with min/max constraints. OR-Tools CP-SAT solver handles this well. |
| **Recommendation scoring** | Redis + weighted formula | Composite score: `0.3 × price_fit + 0.3 × distance + 0.2 × rating + 0.2 × preference_match`. No ML needed at MVP; Redis stores precomputed scores. |

---

### 3.4 Data Layer

#### Primary Database: PostgreSQL 16 + PostGIS

| Extension | Use Case |
|-----------|----------|
| **PostGIS** | `ST_DWithin` (attractions within 5km), `ST_Distance`, `ST_MakeLine` (route geometry), `ST_Buffer` (search radius), nearest-neighbor via `KNN gist`. |
| **pgvector** | Future: semantic search over attraction descriptions, user preference embeddings. |
| **pg_trgm** | Fuzzy text search on place names without needing a separate OpenSearch instance at MVP. |

#### Why not Supabase?
Supabase is excellent for rapid prototyping. TripMind AI's PostGIS requirements are deep (routing, KNN, geometry operations), so native PostgreSQL gives more control. Supabase can be revisited in Phase 3 if the team wants to offload ops.

#### Caching: Redis

| Use Case | Rationale |
|----------|-----------|
| Session storage | Auth.js session adapter |
| Hot itineraries | Cache generated plans; invalidate on live-update |
| Rate limiting | Per-user, per-endpoint limits |
| Job queue | BullMQ backing (itinerary generation, replanning, trend analysis) |
| Recommendation cache | Precomputed scores for popular destinations, TTL 1 hour |

#### Search: OpenSearch

| Index | Documents | Search Type |
|-------|-----------|-------------|
| `places` | Hotels, restaurants, attractions | Full-text with typo tolerance, filters by category/rating/price |
| `activities` | Events, tours, experiences | Geo-bounded + keyword |
| `trends` | Trending spots, hidden gems | Freshness-weighted scoring |

> **MVP simplification:** At MVP (50 destinations), `pg_trgm` + PostGIS is sufficient. Add OpenSearch when place count exceeds ~10,000 or when typo-tolerant search quality degrades.

#### Object Storage: Cloudflare R2

| Content | Rationale |
|---------|-----------|
| Offline map tiles | Pre-rendered vector tiles for offline bundle |
| Uploaded receipts | Expense tracking image uploads |
| Itinerary PDF exports | Generated PDFs stored for offline access |
| Cached attraction images | CDN-backed, zero egress cost |

---

### 3.5 Maps & Geospatial

#### Mapbox GL JS

| Feature | Use Case |
|---------|----------|
| **Vector tiles** | Dark-themed custom map style matching `design-spec.html` |
| **Mapbox Directions API** | Turn-by-turn navigation, estimated travel times |
| **Mapbox Matrix API** | All-pairs travel time between stops for route optimization |
| **Mapbox Geocoding** | Address → lat/lng, reverse geocoding for "near this location" |
| **Mapbox Isochrone** | "What's reachable within 30 minutes from this hotel?" |

> **Why not Google Maps?** Mapbox offers better customization for dark-mode maps and is significantly cheaper at TripMind AI's expected scale. Google Maps API costs scale linearly with usage; Mapbox has more favorable pricing for high-volume itinerary queries.

---

### 3.6 Real-Time & Notifications

#### WebSockets (native + Socket.io)

| Channel | Event | Payload |
|---------|-------|---------|
| `trip:{tripId}` | `plan:updated` | New itinerary slice |
| `trip:{tripId}` | `delay:detected` | Flight/train delay + replan offer |
| `trip:{tripId}` | `member:joined` | Collaborative trip member joined |

#### Notification Stack

| Channel | Tool | Use Case |
|---------|------|----------|
| **Email** | Resend | Itinerary generated, delay alert, document expiry reminder |
| **Push** | Web Push API + Service Worker | Live replan notification (in-app or browser push) |
| **In-app** | Zustand store + WebSocket | Real-time plan updates |

---

### 3.7 Integrations

| Service | API | Purpose |
|---------|-----|---------|
| **Amadeus** | Self-Service APIs | Real-time flights, hotels, train data |
| **Google Places** | Places API | Attractions, restaurants, reviews |
| **Tomorrow.io** | Weather API | Forecast + alerts for weather-aware scheduling |
| **Booking.com** | Affiliate API | Hotel availability + pricing |
| **iVisa / Sherpa** | Visa API | Visa requirements, document checklists |
| **OpenStreetMap** | Overpass API | Free POI data, backup to Google Places |

---

### 3.8 Payments

#### Stripe

| Feature | Use Case |
|---------|----------|
| **Subscriptions** | Pro plan ($9.99/mo) — unlimited itineraries, offline bundle, collaboration |
| **Checkout** | Premium booking links (hotels, tours) — affiliate revenue share |
| **Connect** | Partner travel agencies — split payments, marketplace model |

> No card data stored locally. Stripe tokens only. PCI compliance handled entirely by Stripe.

---

### 3.9 Authentication

#### Auth.js (NextAuth v5)

| Provider | Use Case |
|---------|----------|
| **Google** | Primary social login |
| **Apple** | iOS user convenience |
| **Email magic link** | Password-free signup |
| **OAuth 2.0** | Future: enterprise SSO |

Sessions stored in Redis via `@auth/core` adapter. JWT sessions for stateless API auth.

---

### 3.10 Infrastructure & DevOps

#### Hosting

| Layer | Platform | Rationale |
|-------|----------|-----------|
| **Frontend** | Vercel | Native Next.js support, edge functions, preview deploys, analytics |
| **Background workers** | Railway | Simple container deploy, auto-scaling, Redis included |
| **Database** | Railway (Postgres) or Neon | Managed Postgres; Neon for serverless cold starts |
| **Object storage** | Cloudflare R2 | No egress fees; integrates with Cloudflare Pages for static assets |

#### Observability

| Tool | Purpose |
|------|---------|
| **OpenTelemetry** | Distributed tracing from API request → LLM call → DB query → response |
| **Sentry** | Error tracking with source maps, performance monitoring |
| **Grafana** | Metrics dashboards (LLM cost, p95 latency, error rate) |
| **Datadog** | (Alternative) APM for production if scale demands it |

#### Testing

| Level | Tool | Target |
|-------|------|--------|
| Unit | Vitest | 80% line coverage on all `packages/*` |
| Integration | Vitest + testcontainers | DB queries, API contracts |
| Component | Vitest + Testing Library | React components, accessibility |
| E2E | Playwright | Top 10 critical journeys |
| Load | k6 | Planning engine < 100 concurrent users |
| AI Quality | Custom eval harness | ≥ 85% acceptance rate on 100-scenario golden set |

---

## 4. Project Structure

```
TripMind-AI/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   ├── app/               # App Router pages + API routes
│   │   ├── components/        # UI components
│   │   ├── features/          # Feature slices (itinerary, maps, expenses)
│   │   └── lib/               # Client-side utilities
│   └── worker/                # BullMQ job runner (separate process)
├── packages/
│   ├── planning-engine/        # Itinerary generation + OR-Tools
│   ├── recommendations/       # Hotel/restaurant/attraction scoring
│   ├── maps-geo/              # Mapbox helpers + PostGIS queries
│   ├── discovery-data/        # Data ingestion (Amadeus, Google Places)
│   ├── weather/               # Tomorrow.io integration
│   ├── visa-docs/             # Visa requirement engine
│   ├── ai-assistant/           # Conversational editor
│   ├── trends/                # Social/seasonal signals
│   ├── live-ops/              # Real-time monitors + replan triggers
│   ├── collaboration/         # Shared trips, voting, comments
│   ├── expenses/              # Expense tracking
│   ├── offline/               # Offline bundle builder
│   ├── identity/              # Auth.js wrapper
│   ├── notifications/         # Resend + Web Push
│   ├── payments/              # Stripe integration
│   ├── analytics/            # Telemetry + event pipeline
│   ├── ui/                   # Shared shadcn/ui components
│   └── db/                   # Drizzle ORM schema + migrations
├── data/
│   ├── seed/                 # 50-destination seed data
│   └── evals/                # Golden set for AI evaluation
├── infra/
│   ├── docker-compose.yml    # Postgres + Redis + OpenSearch
│   ├── terraform/             # Cloud infrastructure
│   └── github-actions/       # CI/CD workflows
└── tests/
    ├── e2e/                  # Playwright
    ├── load/                 # k6
    └── fixtures/             # Test data factories
```

---

## 5. Alternative Stacks

| If you prefer... | Use instead | Trade-off |
|-----------------|-------------|-----------|
| **Simpler MVP setup** | Supabase (Postgres + Auth + Realtime + Storage) | Less control, vendor lock-in; faster to ship |
| **Pure SPA (no SSR)** | Vite + React + TanStack Router + TanStack Query | Simpler, but no SEO for travel content |
| **Python-native AI** | FastAPI + LangChain + scikit-learn (Python backend) | Stronger ML ranking; two language runtimes |
| **Edge-first** | Next.js Edge Runtime + Cloudflare D1 + Workers | Lower latency globally; PostgreSQL features limited |
| **Budget hosting** | Coolify (self-hosted) | Free; operational overhead |
| **Managed everything** | Vercel (all-in) | Fastest deploy; costs scale with usage |

---

## 6. Build Order

```
Sprint 0:  Project bootstrap, design tokens → Tailwind config, Auth.js
Sprint 1:  Trip CRUD, PostGIS schema, place search API
Sprint 2:  Mapbox integration, recommendation scoring
Sprint 3:  Planning engine (OR-Tools), itinerary generation
Sprint 4:  AI assistant, budget optimizer
Sprint 5:  Live ops (WebSockets, replan), notifications
Sprint 6:  Collaboration, expense tracking, offline bundle
Sprint 7:  Visa docs, trends, payments (Pro plan)
Sprint 8:  Performance optimization, 500+ destinations, load testing
```

---

## 7. Open Questions

1. **Deployment target:** Vercel (recommended) or Railway (already using)?
2. **Python vs Node for AI:** Keep planning in Node.js (recommended) or extract to Python microservice?
3. **Managed vs self-hosted DB:** Neon/Railway (managed, recommended) or self-hosted on Coolify/DigitalOcean?
4. **Data sources:** Partner with Amadeus/Booking.com officially, or aggregate via ToS-compliant scraping for MVP?
5. **Native mobile:** React Native (recommended for shared logic) or Swift/Kotlin for day-one native?
6. **Auth provider:** Google + Apple + magic link (recommended) or add Microsoft/enterprise SSO from day 1?

---

## 8. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-31 | Next.js 15 over Vite SPA | SSR required for travel SEO |
| 2026-08-31 | PostgreSQL + PostGIS over Supabase | Deep PostGIS operations; Supabase as future migration path |
| 2026-08-31 | Mapbox over Google Maps | Cheaper at scale, better dark-theme customization |
| 2026-08-31 | Vercel AI SDK over raw API calls | Multi-model routing, streaming, token budgeting built-in |
| 2026-08-31 | OpenSearch deferred to post-MVP | `pg_trgm` + PostGIS sufficient for 50 destinations |
| 2026-08-31 | Cloudflare R2 over S3 | Zero egress fees for offline bundles + map tiles |

---

*This document should be reviewed against `PRD.md` and `design-spec.html` before implementation begins. Update this file when decisions change — it is the source of truth for technology choices.*
