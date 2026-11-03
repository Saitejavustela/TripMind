# TripMind AI – Product Requirements Document (PRD)

**Version:** 1.0 (Initial Draft)
**Date:** 2026-08-31
**Author:** TripMind AI Product Team
**Status:** Phase 1 – Specify (Pending Human Review)

---

## Phase 0 – Capability Map (Module Decomposition)

This initiative bundles many independently testable capabilities (planning engine, recommendations, live adjustments, collaboration, visa checks, expense tracking, offline support). Per the spec-driven workflow, the capability map is defined **before** any module spec is written. Module boundaries and dependency direction are decided up front, not during implementation.

### Module Table

| Module ID | Responsibility | Depends On |
|-----------|----------------|------------|
| `identity` | User accounts, profiles, sessions, preferences, consent | — |
| `trip-core` | Trip CRUD, dates, destinations, travelers, trip-type taxonomy | `identity` |
| `discovery-data` | Hotels, restaurants, attractions, rentals, activities data ingestion & search index | `identity` |
| `maps-geo` | Geospatial search, places, routing, traffic, interactive map render | `discovery-data` |
| `planning-engine` | AI itinerary generation, route optimization, budget allocation, replanning | `trip-core`, `discovery-data`, `maps-geo`, `weather` |
| `weather` | Forecast, advisory, weather-aware scheduling hints | `maps-geo` |
| `visa-docs` | Visa rules, passport validity, document requirements, advisories | `trip-core` |
| `recommendations` | Hotel/restaurant/attraction/rental/local-food/activities/trends recommendation APIs | `discovery-data`, `maps-geo`, `planning-engine` |
| `live-ops` | Flight/train delays, traffic, closures, event monitoring, auto-replan triggers | `trip-core`, `planning-engine`, `weather` |
| `collaboration` | Shared trips, invites, voting, comments, group budget, preference aggregation | `trip-core`, `identity` |
| `expenses` | Expense capture, categorization, budget tracking, daily/category rollups | `trip-core` |
| `ai-assistant` | Conversational itinerary editor, natural-language modifications, explainability | `planning-engine`, `recommendations`, `identity` |
| `trends` | Social/seasonal signal analysis, hidden-gem scoring, trend surface | `discovery-data`, `recommendations` |
| `notifications` | Email, push, in-app, webhook fan-out for live ops & collaboration | `identity`, `live-ops`, `collaboration` |
| `offline` | Trip download, cached map tiles, emergency info, reservation copies | `trip-core`, `recommendations`, `maps-geo` |
| `payments` | Optional paid plans, booking commissions/fees | `identity` |
| `analytics` | Internal telemetry, product analytics, ML feedback loop | All modules |

### Dependency Direction (DAG)

```
identity → trip-core → planning-engine → live-ops
                ↓             ↓              ↓
            visa-docs    recommendations   notifications
                ↓             ↓              ↓
            expenses     ai-assistant    collaboration
                                ↓
                              trends → recommendations
                            offline → trip-core
                          weather → planning-engine
                         maps-geo → discovery-data
                       discovery-data → identity
                          payments → identity
                         analytics → (all)
```

**Build order (vertical slices, each shippable independently):**

1. `identity` + `trip-core` (foundation)
2. `discovery-data` + `maps-geo` (places + geospatial)
3. `weather` + `recommendations` (surface recommendations)
4. `planning-engine` (core AI itinerary generation)
5. `visa-docs` + `expenses` (traveler support)
6. `ai-assistant` (conversational editing)
7. `trends` + `live-ops` + `notifications` (real-time layer)
8. `collaboration` (multi-user)
9. `offline` (resilience)
10. `payments` (monetization)
11. `analytics` (cross-cutting, built incrementally throughout)

**Interface contract example:** `planning-engine` consumes `recommendations.searchHotels({ near, budget, dates })` — the contract lives in `recommendations` spec; `planning-engine` spec references it.

---

## Phase 1 – Full PRD

### 1. Objective

**What we're building:** TripMind AI is an intelligent, AI-powered travel planning platform that consolidates the entire trip planning workflow into a single, conversational, real-time experience. The product generates a complete, optimized, personalized day-by-day itinerary within seconds, then continuously adapts it during travel.

**Who it's for (Personas):**

| Persona | Description | Primary Jobs-to-be-Done |
|---------|-------------|--------------------------|
| **Solo Explorer** | Individual traveler, 25–45, plans 3–6 trips/year | Discover authentic experiences; avoid tourist traps; manage solo budget |
| **Family Planner** | Parent organizing trips for 2–6 people | Keep everyone happy; balance kid/adult activities; safety-first |
| **Couple / Honeymooner** | Two-person trip, often special occasion | Romantic, unique experiences; reliability; aesthetic spots |
| **Business Traveler** | Frequent work trips, time-constrained | Efficiency; predictable budgets; airport/hotel proximity |
| **Group Coordinator** | Friends planning a shared trip | Democratic decision-making; shared budget; no one left out |
| **International Tourist** | Cross-border travel, needs visa info | Documentation; cultural context; language/currency awareness |

**Why now:** Existing travel planning is fragmented across 5–10 websites. Static itinerary tools don't factor in live weather, traffic, opening hours, or crowd density. AI capability has crossed a quality threshold to produce reliable, conversational travel planning.

**Success looks like:**

- A user enters destination + dates + budget → receives a complete, optimized itinerary in **< 10 seconds**.
- A user says "make it cheaper" → itinerary regenerates within **< 5 seconds**, preserving quality.
- A flight is delayed 2 hours → user receives notification + revised itinerary **< 60 seconds** of detection.
- 70% of generated itineraries are accepted with **≤ 2 modifications** (quality bar).
- Net Promoter Score (NPS) ≥ 50 within 6 months of public launch.

---

### 2. Tech Stack (Recommended – Pending Confirmation)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js 15 (App Router) + React 19 + TypeScript | SSR for SEO, RSC for fast itinerary pages |
| Mobile | React Native (Phase 2) | Shared logic with web |
| Styling | Tailwind CSS + shadcn/ui | Fast, accessible, design-system-friendly |
| State | Zustand (client) + TanStack Query (server) | Lightweight; great for real-time updates |
| Maps | Mapbox GL JS | Performance, vector tiles, custom styling |
| Backend | Node.js (Fastify) + TypeScript | Same language as frontend; strong AI ecosystem |
| API style | tRPC or REST + OpenAPI | Type-safety end-to-end |
| Database (primary) | PostgreSQL 16 + PostGIS | Relational + geospatial in one engine |
| Cache | Redis | Sessions, hot itineraries, rate limits |
| Search/Index | OpenSearch | Hotel/restaurant/attraction full-text search |
| AI/LLM | Multi-model (OpenAI, Anthropic, open-source fallback) | Per-task model selection |
| Async / Jobs | BullMQ on Redis | Itinerary generation, replanning, trend analysis |
| Auth | Auth.js (NextAuth) with OAuth + email magic-link | Fast to ship; social login |
| Storage | S3-compatible (Cloudflare R2) | Map tiles, images, offline bundles |
| Notifications | Resend (email) + Web Push | Reliable, low-friction |
| Observability | OpenTelemetry → Grafana + Sentry | End-to-end traces |
| CI/CD | GitHub Actions + Vercel (web) + Fly.io (workers) | Standard, fast |
| Testing | Vitest (unit) + Playwright (e2e) + k6 (load) | Modern, fast |

**ASSUMPTIONS I'm making — correct me now or I'll proceed with these:**

1. Web app first, native mobile in Phase 2.
2. Server-side itinerary generation; client never directly calls LLMs.
3. B2C primary; B2B (corporate travel) in Phase 3.
4. English UI first; internationalization framework from day one.
5. Compliance targets: GDPR (EU), CCPA (California), SOC 2 Type II within 12 months.
6. MVP supports 50 destinations in Phase 1; expanded to 500+ by GA.

---

### 3. Commands

```bash
# Development
pnpm dev                  # Run web + workers locally
pnpm dev:web              # Frontend only
pnpm dev:worker           # Background workers only
pnpm db:up                # Start Postgres + Redis + OpenSearch via Docker
pnpm db:seed              # Seed sample trips, places, users

# Build
pnpm build                # Production build (all packages)
pnpm build:web
pnpm build:worker

# Test
pnpm test                 # Unit + integration tests
pnpm test:watch
pnpm test:e2e             # Playwright e2e
pnpm test:load            # k6 load test against staging
pnpm test -- --coverage   # With coverage

# Lint & format
pnpm lint                 # ESLint
pnpm lint:fix
pnpm format               # Prettier
pnpm typecheck            # tsc --noEmit

# Database
pnpm db:migrate           # Run migrations
pnpm db:reset             # Drop, recreate, migrate, seed
pnpm db:studio            # Open Prisma/Drizzle studio

# AI / Planning engine
pnpm ai:eval              # Run golden-set evaluations on planning quality
pnpm ai:replay            # Replay last 100 failed plans for analysis
```

---

### 4. Project Structure

```
TripMind-AI/
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── worker/              # Background job runner (BullMQ)
│   └── api/                 # Fastify backend (or colocated in web via route handlers)
├── packages/
│   ├── planning-engine/     # Itinerary generation, optimization
│   ├── recommendations/     # Hotel/restaurant/attraction ranking
│   ├── maps-geo/            # Mapbox helpers, PostGIS queries, routing
│   ├── discovery-data/      # Place data ingestion & search
│   ├── weather/             # Forecast integration
│   ├── visa-docs/           # Visa/passport logic
│   ├── ai-assistant/        # Conversational planner
│   ├── trends/              # Social/seasonal signals
│   ├── live-ops/            # Real-time monitors
│   ├── collaboration/       # Shared trip logic
│   ├── expenses/            # Expense tracking
│   ├── offline/             # Offline bundle builder
│   ├── identity/            # User/auth logic
│   ├── notifications/       # Email/push fan-out
│   ├── payments/            # Stripe, billing
│   ├── analytics/           # Telemetry, events
│   ├── ui/                  # Shared components (shadcn wrappers)
│   └── db/                  # Drizzle schema, migrations, queries
├── data/
│   ├── seed/                # Seed data
│   └── evals/               # AI evaluation golden sets
├── infra/
│   ├── docker-compose.yml   # Local dev
│   ├── terraform/           # Cloud infra
│   └── github-actions/      # CI workflows
├── tests/
│   ├── e2e/                 # Playwright
│   ├── load/                # k6 scripts
│   └── fixtures/            # Test data
├── docs/
│   ├── PRD.md               # This document
│   ├── CAPABILITY-MAP.md    # Phase 0 module map
│   ├── SPEC-*.md            # Per-module specs
│   ├── PLAN.md              # Implementation plan
│   └── tasks/               # tasks.md, plan.md
└── README.md
```

---

### 5. Code Style (TypeScript / React / Node)

**Conventions:**

- 2-space indent, single quotes, trailing commas, no semicolons (Prettier default).
- `camelCase` for variables/functions, `PascalCase` for components/types, `UPPER_SNAKE_CASE` for constants.
- Files: `kebab-case.ts` for non-components, `PascalCase.tsx` for components.
- Prefer named exports; default exports only for Next.js page/layout components.
- Prefer `type` over `interface` unless extending/discriminating unions.
- No `any` — use `unknown` and narrow; ESLint enforces this.

**Example – Itinerary day component (good):**

```tsx
// apps/web/src/features/itinerary/day-view.tsx
import { Card, CardHeader, CardBody } from '@tripmind/ui';
import { Activity, Meal, TransitSegment } from '@tripmind/types';
import { formatLocalTime } from '@tripmind/utils/time';
import { useItineraryContext } from './itinerary-context';

type Props = {
  dayNumber: number;
  activities: Activity[];
  meals: Meal[];
  transit: TransitSegment[];
  totalCost: number;
  currency: string;
};

export function DayView({
  dayNumber,
  activities,
  meals,
  transit,
  totalCost,
  currency,
}: Props) {
  const { preferences } = useItineraryContext();

  return (
    <Card data-testid={`day-${dayNumber}`}>
      <CardHeader>
        <h2>Day {dayNumber}</h2>
        <span className="text-muted">{formatLocalTime(activities[0]?.startTime)}</span>
      </CardHeader>
      <CardBody>
        {activities.map((a) => (
          <ActivityRow key={a.id} activity={a} accessibilityMode={preferences.a11y} />
        ))}
        {meals.map((m) => (
          <MealRow key={m.id} meal={m} />
        ))}
        {transit.map((t) => (
          <TransitRow key={t.id} segment={t} />
        ))}
        <footer className="text-muted">Total: {totalCost} {currency}</footer>
      </CardBody>
    </Card>
  );
}
```

**Why this style:** readable like prose, typed end-to-end, accessibility-aware, no premature abstraction, easy to test.

---

### 6. Testing Strategy

| Test Level | Tool | Scope | Target Coverage |
|------------|------|-------|-----------------|
| Unit | Vitest | Pure functions, hooks, utils, recommendation scoring | 80% lines, 90% branches on `packages/*` |
| Integration | Vitest + Testcontainers (Postgres/Redis) | DB queries, module boundaries, API contracts | Critical paths only |
| Component | Vitest + Testing Library | React components, accessibility | Snapshot-free; behavior-driven |
| E2E | Playwright | Critical user journeys (plan, modify, book, offline) | Top 10 journeys |
| Load | k6 | Planning-engine under 100 concurrent users; search under 1k QPS | p95 latency budget |
| AI Eval | Custom harness + golden sets | Planning quality, hallucination rate, recommendation relevance | ≥ 85% acceptance rate on golden set |
| Visual | Percy (optional) | UI regressions on key pages | Manual on changes |

**Test locations:** co-located as `*.test.ts(x)` next to source; e2e in `tests/e2e/`.

**Per-module test plan:**

- `planning-engine`: golden set of 100 trip scenarios; must hit ≥ 85% acceptance rate.
- `recommendations`: A/B against ground-truth lists; NDCG@10 ≥ 0.7.
- `live-ops`: chaos tests (delayed flight, closed attraction); replan must trigger within SLA.
- `ai-assistant`: conversational regression suite — 50 example dialogues.

---

### 7. Boundaries (Always / Ask First / Never)

**Always do:**

- Run `pnpm test` and `pnpm typecheck` before opening a PR.
- Update the relevant `SPEC-*.md` file when changing module contracts.
- Add tests for any new feature; no untested code lands in `main`.
- Validate all inputs at module boundaries (Zod schemas at every API/worker entry).
- Log structured events with OpenTelemetry context.
- Use feature flags for any user-visible change that affects planning quality.

**Ask first:**

- Adding a new top-level dependency or replacing a framework.
- Schema migrations that drop or rename columns.
- Changes to AI model selection or prompt templates that affect cost > 10%.
- Pricing or payment-flow changes.
- Anything that touches `visa-docs` (regulatory risk).
- Anything that handles passport/travel-document data.

**Never do:**

- Commit secrets, API keys, or user PII to the repo.
- Edit generated files (migrations, generated types) by hand.
- Disable, skip, or delete tests to make CI pass.
- Bypass the planning-engine to serve a "stale" itinerary when live data is required.
- Store payment data — use Stripe/payment processor tokens only.
- Make decisions on behalf of users that involve money (booking, paying) without explicit confirmation.

---

### 8. Core Features – User Stories & Acceptance Criteria

Each feature follows the format: **As a [persona], I want [capability], so that [benefit].** Acceptance criteria use Given/When/Then.

#### F1. AI Trip Planning

- **US-1.1:** As a Solo Explorer, I want to enter destination, dates, budget, and preferences, so that I get a complete itinerary in seconds.
  - **AC:** Given a valid trip input, when I click "Generate", then an itinerary appears in ≤ 10s (p95) with at least: source→destination travel, lodging, ≥ 1 activity/day, ≥ 1 meal recommendation/day, and a per-day cost breakdown.

- **US-1.2:** As a Family Planner, I want to specify traveler count, kids' ages, and pace, so that the itinerary fits my family.
  - **AC:** When kids' ages are provided, the planner excludes age-restricted activities and suggests family-friendly alternatives.

#### F2. Multiple Trip Types

- **US-2.1:** As a Business Traveler, I want a "Business Trip" mode, so that the itinerary prioritizes airport proximity, meeting locations, and quiet workspaces.
  - **AC:** Given trip_type=business, the engine weighs airport distance ≥ 2× and adds ≥ 1 workspace/coffee option per day within 1 km of the hotel.

- All 10 trip types (one-way, round, multi-city, road trip, weekend, family, business, solo, honeymoon, adventure) supported with distinct optimization weights.

#### F3. Intelligent Itinerary Generation

Each generated day must include: wake-up, breakfast, attraction sequence, lunch, afternoon activity, evening experience, shopping opportunity, dinner, hotel check-in/out, transit times, walking distance, and daily budget allocation.

- **AC (F3):** A 5-day plan returns 5 day-cards; each day has ≥ 6 distinct time blocks; total transit time is ≤ 25% of waking hours.

#### F4. Smart Route Optimization

- **US-4.1:** As a Group Coordinator, I want attractions grouped by neighborhood, so that we don't waste time zigzagging.
  - **AC:** Given a day with ≥ 4 planned stops, attractions within the same district are sequenced consecutively, verified by ≤ 1 district transition per day on average.

- **Inputs considered:** distance, traffic, opening hours, crowd density, weather, preferences, transport availability.

#### F5. Budget Optimization

- **US-5.1:** As a Budget-Conscious Traveler, I want the platform to auto-redistribute when over budget, so that I don't blow my budget.
  - **AC:** Given the projected total exceeds budget by > 10%, the planner regenerates with cheaper alternatives; the user sees a "What changed" diff.
  - **Budget split:** Transport 25–35%, Accommodation 25–40%, Food 15–25%, Activities 10–20%, Shopping 5–10%, Emergency 5–10% (configurable).

#### F6. Hotel Recommendation System

Each recommendation includes: pricing, ≥ 3 images, Google Maps link, distance from planned attractions, ≥ 3 nearby restaurants, booking link.

- **AC:** Hotels are ranked by composite score: price-fit (0.3) + distance to attractions (0.3) + rating (0.2) + preference match (0.2).

#### F7. Restaurant Recommendation System

Each recommendation: avg meal price, Maps link, ≥ 2 must-try dishes, veg/vegan flags, reservation link/info.

- **AC:** Filters include cuisine, dietary restrictions, budget, rating ≥ 3.5, distance ≤ 5 km, open during planned visit time.

#### F8. Tourist Attraction Explorer

Each attraction: description, entry fees, free/paid flag, opening/closing hours, recommended duration, crowd level, accessibility, Maps link, ≥ 3 nearby attractions, ≥ 3 nearby restaurants, ticket link.

- **AC:** Free attractions are explicitly tagged and surfaced when budget is tight.

#### F9. Interactive Maps

- **AC:** Map displays hotels, restaurants, attractions, rentals, hospitals, pharmacies, police, fuel, EV charging, public transport. Click → detail panel; "Navigate" opens external maps app.

#### F10. Rental Service Recommendation

Rental types: car, bike, scooter, bicycle, camper van, self-drive.

- **AC:** Each option shows daily cost, rating, pickup/drop-off, insurance, fuel policy, deposit, booking link, distance from hotel/airport.
- **AC:** The system compares ≥ 3 providers and recommends by composite score.

#### F11. Local Food Discovery

- **AC:** Each destination includes ≥ 3 signature dishes with restaurants, ≥ 1 street food option, ≥ 1 seasonal specialty, and ≥ 1 highly-rated local gem.

#### F12. Things To Do

Categories: adventure, nature, cultural, museum, festival, shopping, hiking, water sports, nightlife, photography.

- **AC:** Each activity has price, duration, location, optional booking link; surfaced based on user interests.

#### F13. Social Media Trend Analysis

- **AC:** Trending surface includes: ≥ 5 trending cafés, ≥ 3 hidden gems, ≥ 3 viral food spots, newly opened attractions, local festivals, seasonal experiences, popular photo spots.
- **Guardrails:** No engagement-bait ranking; freshness window = 30 days; must verify location exists in our `discovery-data` index.

#### F14. Live Trip Adjustments

Monitors: flight delays, train delays, traffic, weather, attraction closures, local events.

- **US-14.1:** As a Business Traveler, I want automatic replanning when my flight is delayed, so that I don't miss activities.
  - **AC:** On detecting a delay > 60 min, the system pushes a notification with the revised itinerary in ≤ 60s and a one-tap "Accept changes" action.

#### F15. Collaborative Trip Planning

- **AC:** Members join via invite link; can suggest attractions, vote on hotels/restaurants, comment, manage shared budget.
- **AC:** When ≥ 3 preferences conflict, the AI suggests a balanced compromise and explains the trade-off.

#### F16. Visa and Passport Requirement Checker

- **AC:** Given passport country + destination + travel date, the system returns: visa required (yes/no/visa-on-arrival/e-visa), required documents, processing time, fees, entry regulations, official links, and current advisories.
- **AC:** Passport expiry < 6 months at departure triggers a warning.

#### F17. Weather-Aware Planning

- **AC:** Outdoor activities are scheduled in favorable weather windows; indoor alternatives auto-substitute when forecast shows rain or extreme conditions.

#### F18. Expense Tracking

- **AC:** Users can log expenses by category, see daily/category rollups, remaining budget, and a per-day chart. Receipt photo upload supported.

#### F19. AI Travel Assistant

- **AC:** Users can issue natural-language modifications: "make it cheaper", "add a vegetarian restaurant", "extend by 1 day", "skip museums". The assistant explains each change ("Saved $45 by switching Hotel X → Hotel Y, both 4★").

#### F20. Offline Travel Support

- **AC:** Users can download a trip bundle (PDF + offline map tiles + reservation copies + emergency numbers) and access it without network. Bundle regenerates 24h before departure.

---

### 9. MoSCoW Prioritization (for MVP / Phase 1 Launch)

| Priority | Features |
|----------|----------|
| **Must** (MVP) | F1, F2, F3, F4, F5, F6, F7, F8, F9, F19 |
| **Should** (Phase 1.5) | F10, F11, F12, F14, F17, F20 |
| **Could** (Phase 2) | F13, F15, F16, F18 |
| **Won't (this cycle)** | — (all features retained on roadmap) |

---

### 10. Phased Roadmap

| Phase | Duration | Scope | Exit Criteria |
|-------|----------|-------|---------------|
| **0 – Foundations** | Weeks 1–3 | `identity`, `trip-core`, dev infra, design system | Auth working; trip CRUD live in staging |
| **1 – Discovery** | Weeks 4–7 | `discovery-data`, `maps-geo`, `weather`, base `recommendations` | User can search 50 destinations; map renders |
| **2 – Planning MVP** | Weeks 8–12 | `planning-engine`, `ai-assistant` (read-only) | Itinerary generated < 10s for 100 golden tests |
| **3 – Live** | Weeks 13–16 | `live-ops`, `notifications`, weather-aware replan | Delay → replan in < 60s; NPS ≥ 30 internal |
| **4 – Personalization** | Weeks 17–20 | Trends, expense tracking, offline bundle | NPS ≥ 40 in private beta (200 users) |
| **5 – Collaboration** | Weeks 21–24 | `collaboration`, visa docs, payments | Multi-user trips; GA launch to 10k users |
| **6 – Scale** | Months 7–9 | 500+ destinations, native mobile (RN), B2B lite | 100k MAU; SOC 2 Type II |

---

### 11. Non-Functional Requirements (NFRs)

| Category | Requirement |
|----------|-------------|
| **Performance** | p95 itinerary generation ≤ 10s; p95 search ≤ 300ms; LCP < 2.5s on 4G |
| **Availability** | 99.9% monthly for read paths; 99.5% for planning writes |
| **Scalability** | 100k MAU by month 9; 1M MAU by year 1 |
| **Security** | All data TLS 1.3 in transit, AES-256 at rest; OAuth2/OIDC; GDPR/CCPA compliant; SOC 2 within 12 months |
| **Privacy** | Document/photo data encrypted; user can export/delete account (right to be forgotten); no third-party tracking on offline bundles |
| **Accessibility** | WCAG 2.1 AA: keyboard nav, screen-reader labels, color contrast, offline-readable fonts |
| **i18n / l10n** | English (launch), Spanish, French, German, Japanese, Hindi, Mandarin (year 1) |
| **Observability** | Every user action traceable; planning failures auto-captured to eval pipeline |
| **Cost** | ≤ $0.08 per generated itinerary at MVP scale; ≤ $0.04 by GA |

---

### 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LLM hallucination in recommendations | High | High | Grounded retrieval from `discovery-data`; eval suite; human spot-checks |
| Place data quality / freshness | High | High | Multi-source ingestion; community reports; freshness SLAs in monitoring |
| Live-ops data source outages | Medium | High | Multi-provider fallback (FlightAware + AviationStack); cached last-known state |
| Regulatory: visa info accuracy | Low | Critical | Always show "verify with official source" disclaimer; partner with iVisa/Timatic |
| Cost overrun from LLM usage | Medium | Medium | Per-request token budgets; model routing (small for simple plans, large for complex) |
| Cold-start for new destinations | Medium | Medium | Seed 50 destinations at launch; expand as data partners sign |
| Privacy breach of travel documents | Low | Critical | Document vault encrypted client-side; zero-knowledge for passport scans; SOC 2 |

---

### 13. Open Questions (Human Input Required)

1. **Target geographies for MVP:** US/EU/India first, or global?
2. **Booking integration:** Affiliate links only, or do we aspire to full in-app booking? (Big scope difference.)
3. **Pricing model:** Free + Pro subscription, or commission-based on bookings?
4. **Data partners:** Do we have agreements with Booking.com, Google Places, OpenTable, etc., or use scraping + ToS-respecting aggregation?
5. **B2B priority:** Should we leave hooks for corporate travel from day 1?
6. **Native mobile:** RN acceptable, or do you want Swift/Kotlin from the start?
7. **Brand:** Is "TripMind AI" the final name, or are you open to alternatives?
8. **AI tone:** Playful/adventurous (Hopper-style) or precise/professional (Concur-style)?

---

### 14. Glossary

- **Itinerary** — A day-by-day plan of activities, meals, transit, and lodging for a trip.
- **Live ops** — Real-time monitoring systems that detect disruptions and trigger replanning.
- **Replan** — A revision to an in-progress itinerary due to a live event.
- **Golden set** — A fixed set of trip scenarios used to evaluate planning quality.
- **Discovery data** — Aggregated hotel/restaurant/attraction/activity data from various sources.
- **Voucher** — A reservation/booking confirmation stored with the itinerary.

---

## Approval Checklist (for Human Reviewer)

- [ ] Capability map (module table + build order) reviewed and approved
- [ ] Tech stack choices acceptable
- [ ] Assumptions (web-first, B2C, etc.) confirmed or corrected
- [ ] MoSCoW prioritization acceptable
- [ ] Phased roadmap timeline feasible
- [ ] Open questions answered (or deferred to a follow-up)
- [ ] NFRs (perf, security, accessibility) acceptable
- [ ] Ready to proceed to **Phase 2: Plan** (technical implementation plan in `tasks/plan.md`)

---

*Once this PRD is approved, the next step is to create per-module specs (`SPEC-identity.md`, `SPEC-trip-core.md`, …) following the capability map, then generate `tasks/plan.md` and `tasks/todo.md` for implementation.*
