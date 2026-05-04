# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Spring Boot Kotlin MSA learning project — a shopping-mall split into Eureka/Config/Gateway infra modules plus five domain apps (member, product, order, payment, cart). Stack: Spring Boot 3.5.0, Spring Cloud 2025.0.0, Kotlin 2.1.0, Java 21, Gradle Kotlin DSL multi-module.

The directory `apps/` (not `services/`) holds each microservice — name chosen to avoid confusion with Spring `@Service` classes.

`front/` is a separate Next.js 15 console (App Router + TypeScript strict + Tailwind v4 + TanStack Query + Zustand) used to inspect data across services. It is **not** a Gradle module — managed independently with npm. Mock data lives in `front/src/features/*/mock.ts`; toggle real backend calls via `NEXT_PUBLIC_USE_MOCK=false` in `front/.env.local`. Gateway has a CORS allow-list for `http://localhost:3000`.

## Common commands

```bash
# Start backing infra (Postgres, Redis, Kafka, Kafka UI)
docker compose up -d

# Build everything
./gradlew build

# Build / run a simple single-module app
./gradlew :apps:member:build
./gradlew :apps:member:bootRun

# Build / run the multi-module order app (boot module is the entry point)
./gradlew :apps:order:boot:build
./gradlew :apps:order:boot:bootRun

# Infra
./gradlew :infra:gateway:bootRun

# Tests
./gradlew :apps:order:domain:test
./gradlew :apps:order:boot:test --tests "com.shopping.order.SomeTest.someMethod"

# Front (separate workspace, not Gradle)
cd front && npm install
cd front && npm run dev          # http://localhost:3000
cd front && npm run build && npm run typecheck
```

Boot order matters: `infra:discovery` (8761) → `infra:config` (8888) → `infra:gateway` (8080) → app modules (8081–8085). Apps register with Eureka and are routed by the gateway under `/api/{members,products,orders,payments,carts}/**`.

## Architecture

**Multi-module Gradle layout.** The root `build.gradle.kts` declares Spring Boot / Kotlin plugins with `apply false`, then a `subprojects {}` block applies `kotlin.jvm`, `kotlin.plugin.spring`, and `io.spring.dependency-management` to every child, sets the JDK 21 toolchain, and imports the `spring-cloud-dependencies:2025.0.0` BOM. Each module's `build.gradle.kts` only re-declares the plugin IDs (no versions) and lists its own dependencies — version management lives only at the root.

**Two app shapes coexist:**
1. **Single-module apps** (`apps/member`, `apps/product`, `apps/payment`, `apps/cart`) — one Gradle module per microservice. Use this for small/CRUD-shaped services.
2. **Hexagonal multi-module app** (`apps/order`) — split into the four fixed sub-modules below. Use this when a service grows complex enough that domain/infra separation pays off.

**Multi-module rule (project-wide convention).** When promoting an app to multi-module, the directory structure under `apps/{name}/` MUST be exactly these four:
```
apps/{name}/
├── boot/                             # @SpringBootApplication, controllers, security — the deployable
├── application/                      # Use cases, transaction boundaries (depends on domain)
├── domain/                           # Pure Kotlin: business models, value objects, port interfaces
└── infrastructure/                   # Adapters that implement domain ports
    ├── db/                           # JPA / persistence adapter
    └── client/                       # Feign / external HTTP clients
```
Directory names are short (no `{name}-` prefix). Gradle project paths are `:apps:{name}:boot`, `:apps:{name}:domain`, etc. — no rename. If a second service is later promoted to multi-module and its `boot` (or other sub-module) name collides with `apps:order:boot`, resolve at that point — typically by adding `project(":apps:{name}:boot").projectDir = file("apps/{name}/boot")` together with a unique `include` path, since `.name = ...` rewrites the project path and forces every dependency reference to switch to the prefixed form.

- **Dependency direction**: `boot → application → domain ← infrastructure`. Domain depends on nothing.
- **Component scan**: the boot class lives at `com.shopping.{name}`, so all sub-packages are scanned automatically (entities, repos, Feign clients, beans).
- **Eureka name preserved**: keep `spring.application.name={name}-service` so gateway routes don't change.

**Service discovery & routing.** `infra:discovery` is the Eureka server (self-registration disabled). Every other module registers via `eureka.client.service-url.defaultZone=http://localhost:8761/eureka/`. `infra:gateway` uses `spring-cloud-starter-gateway` with both `discovery.locator.enabled=true` and explicit per-service `Path` predicates routed to `lb://{service-name}`.

**Inter-service communication.** Synchronous calls go through Spring Cloud OpenFeign (apps annotate their boot class with `@EnableFeignClients`) over Eureka-resolved load-balanced URIs. Asynchronous events go over Spring Kafka (`@EnableKafka`) with JSON serializers; the consumer trusts `com.shopping.*` packages (`spring.json.trusted.packages`).

**Authentication is a separate service: `apps/auth`.** Member-service holds identity records; auth-service issues tokens and writes the UserContext cache. Auth depends on member via Feign (`/internal/members/...`). Member-service does NOT issue or verify tokens.

**Public auth endpoints (via gateway):**
- `POST /api/auth/signup` — auth-service: hashes pw → calls `lb://member-service POST /internal/members` → caches UserContext → issues access JWT + refresh token → returns `{token, expiresAt, refreshToken, refreshExpiresAt, member: UserContext}`
- `POST /api/auth/login` — same shape, calls `/internal/members/by-email/{email}` and BCrypt-verifies
- `POST /api/auth/refresh` — accepts `{refreshToken}`, **rotates** (consumes old, issues new pair), 401 if invalid
- `POST /api/auth/logout` — accepts `{refreshToken}`, idempotent revoke (204)
- `POST /api/auth/oauth/{provider}/...` — Phase 2 (Kakao, Google) will live here

**Token model.** Access token = JWT, **30-min TTL**, claims `sub`/`email`/`role`. Refresh token = opaque UUID, **14-day TTL**, stored server-side at Redis key `refresh:{token}` → `{memberId, issuedAt, expiresAt}`. Each `/refresh` call deletes the consumed token and issues a brand-new one (rotation). The frontend's `lib/api/client.ts` intercepts 401 from non-`/auth/*` paths, calls `/api/auth/refresh` once via a shared promise (so concurrent requests don't trigger N refreshes), retries the original request with the new access token, and clears the session if the refresh itself fails.

**Internal endpoints (Feign-only, NOT routed by gateway):**
- `GET /internal/members/by-email/{email}`, `GET /internal/members/{id}`, `POST /internal/members` on member-service. Reachable only via Eureka because gateway only routes `/api/**`.

**Gateway flow.** `JwtAuthenticationFilter` (order = -100) validates JWT signature, then reads `user:{id}` from Redis and forwards `X-User-Context` (Base64 JSON). No `X-User-Id`/`X-User-Role`. Public paths (`jwt.public-paths`): `/api/auth/**`, `/actuator/**`. CORS preflight (OPTIONS) bypasses the filter. Services consume the context via `@AuthUser UserContext` (auto-config from `libs/shopping-context`).

**Cache ownership** is intentionally split: `apps/auth` is the **sole writer** (every successful authentication or refresh) and the gateway is **read-only**. No HTTP fallback. If cache is missing, gateway returns 401 `USER_NOT_FOUND` → client triggers refresh / re-logs in. To make this safe, `user-context-cache.ttl-minutes` (20160m / 14d) is aligned with the refresh-token TTL, so as long as the refresh flow is alive the cache is alive. Cache miss only happens on Redis restart/flush or admin-forced eviction (both intentional "force-logout" semantics).

Roles: `CUSTOMER`, `SELLER`, `ADMIN`. Self-signup is allowed only for CUSTOMER/SELLER; ADMIN is provisioned by `AdminSeeder` (in member-service) on first boot using `admin-seed.*` properties (default `admin@msa-shop.com` / `admin1234` — change in non-dev). The shared JWT `secret` lives in `apps/auth` and `infra/gateway` yml — must match.

**Shared library `libs/shopping-context`.** Holds the canonical `UserContext` data class, role/status enums, `@AuthUser` annotation, header codec, and a Spring Boot auto-configuration that registers a `HandlerMethodArgumentResolver`. Every app depends on `project(":libs:shopping-context")` so adding `@AuthUser user: UserContext` to any controller "just works." The libs module imports `spring-boot-dependencies:3.5.0` BOM directly (the root `subprojects {}` only ships the spring-cloud BOM, which doesn't manage `spring-webmvc` and `spring-boot-autoconfigure` directly).

**Persistence.** Each app owns its own Postgres database (`member_db`, `product_db`, `order_db`, `payment_db`, `cart_db`) — created by `scripts/init-db.sql`, which runs on first container start. JPA modules use `kotlin("plugin.jpa")` and an `allOpen` block opening `@Entity`, `@MappedSuperclass`, and `@Embeddable` so Kotlin classes work with Hibernate proxies. `ddl-auto: update` is on for now (learning project).

**Config server.** `infra:config` runs in `native` profile and serves files from its own classpath (`classpath:/config/`) — no git backend. To add centralised config, drop `{service-name}.yml` under `infra/config/src/main/resources/config/`.

## Conventions worth knowing

**Adding a new app**
- Pick a shape: start single-module under `apps/{name}/`. Promote to multi-module (mirror `apps/order/`) only when the service grows complex.
- Register the module(s) in `settings.gradle.kts`.
- Package layout: `com.shopping.{name}` (single-module: `com.shopping.{name}.*`; multi-module: `com.shopping.{name}.{domain,application,infrastructure}.*`).
- Add `@EnableFeignClients` / `@EnableKafka` on the boot class only if used.
- Give it its own DB in `scripts/init-db.sql`.
- Add a `Path=/api/{name}s/**` route in `infra/gateway`'s `application.yml`.

**When promoting a single-module app to multi-module (mirror `apps/order/`)**
- Use the four fixed directory names: `boot`, `application`, `domain`, `infrastructure/{db,client}`. No `{name}-` prefix on directories.
- Only the `boot` module applies `id("org.springframework.boot")` — library modules must not, or their regular `jar` task gets disabled and other modules can't depend on them.
- `domain` should stay framework-light. Avoid Spring/JPA dependencies there.
- `application` may use Spring stereotypes / `@Transactional` — depends on `spring-context` + `spring-tx`, not `spring-boot-starter-*`.
- `infrastructure/db` applies `kotlin("plugin.jpa")` + the `allOpen` block, depends on `spring-boot-starter-data-jpa`.
- `infrastructure/client` depends on `spring-cloud-starter-openfeign`. The `@EnableFeignClients` annotation lives on the `boot` class, so the `boot` module also needs `spring-cloud-starter-openfeign`.
- Keep all packages under `com.shopping.{name}.*` so the boot module's `@SpringBootApplication` scans them automatically.

**Don't pin versions in module `build.gradle.kts` files** — Spring Boot / Spring Cloud / Kotlin versions all come from the root and the cloud BOM.
