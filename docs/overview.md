7# MSA Shopping Mall — 프로젝트 설명

Spring Boot 3 + Kotlin 으로 마이크로서비스 아키텍처(MSA)를 학습하기 위한 쇼핑몰 도메인 예제 프로젝트다. 도메인을 5개 서비스로 분리하고, 그 앞에 Eureka·Config·Gateway 인프라 모듈을 두어 서비스 디스커버리·중앙 설정·게이트웨이 라우팅을 실제로 동작시켜 보는 데 초점이 맞춰져 있다.

## 목적

- MSA의 핵심 구성 요소(서비스 디스커버리, API Gateway, Config Server)를 코드로 직접 구성해 보기
- 동기 통신(OpenFeign)과 비동기 이벤트(Kafka)를 한 프로젝트 안에서 함께 다루어 보기
- 도메인별로 데이터베이스를 분리(Database per Service)하고, 서비스 간 결합도를 낮추는 설계 연습

## 기술 스택

| 영역 | 사용 기술 |
|------|-----------|
| Language | Kotlin 2.1.0, Java 21 |
| Framework | Spring Boot 3.5.0, Spring Cloud 2025.0.0 |
| Build | Gradle Kotlin DSL (멀티모듈) |
| Persistence | Spring Data JPA + Hibernate, PostgreSQL 16 |
| Messaging | Apache Kafka (Spring Kafka, JSON Serializer) |
| Cache | Redis 7 (예약: 추후 사용) |
| Discovery | Spring Cloud Netflix Eureka |
| Config | Spring Cloud Config Server (native profile) |
| Gateway | Spring Cloud Gateway |
| Sync 통신 | Spring Cloud OpenFeign |

## 모듈 구성

```
msa-shopping-mall
├── infra
│   ├── discovery     # Eureka 서버 (8761)
│   ├── config        # Spring Cloud Config Server (8888, native)
│   └── gateway       # Spring Cloud Gateway (8080)
└── services
    ├── member-service    # 회원·인증     (8081, member_db)
    ├── product-service   # 상품·카탈로그 (8082, product_db)
    ├── order-service     # 주문         (8083, order_db)
    ├── payment-service   # 결제         (8084, payment_db)
    └── cart-service      # 장바구니     (8085, cart_db)
```

루트 `build.gradle.kts` 에서 Spring Boot · Kotlin · Spring Cloud BOM 을 한 번 선언하고, `subprojects {}` 블록으로 모든 하위 모듈에 공통 플러그인과 JDK 21 toolchain 을 적용한다. 그래서 각 모듈의 `build.gradle.kts` 는 버전 없이 plugin id 와 자기 모듈에 필요한 의존성만 선언한다.

## 아키텍처

### 요청 흐름 (동기)

```
Client
  │
  ▼
Gateway (8080)  ──[Eureka 조회]──▶  Discovery (8761)
  │
  ├─ /api/members/**  ─▶  member-service  (lb://member-service)
  ├─ /api/products/** ─▶  product-service
  ├─ /api/orders/**   ─▶  order-service   ──Feign──▶ product-service / payment-service ...
  ├─ /api/payments/** ─▶  payment-service
  └─ /api/carts/**    ─▶  cart-service
```

- 모든 서비스는 부팅 시 Eureka 에 자기 자신을 등록한다.
- Gateway 는 `Path` 프레디킷으로 경로별 라우팅을 정의하고, `lb://{service-name}` 형태로 Eureka 가 알려주는 인스턴스에 로드밸런싱한다.
- 서비스 간 호출이 필요한 경우(주문 → 상품 재고 확인, 주문 → 결제 요청 등)는 OpenFeign 으로 처리한다. 호출 측 Application 클래스에 `@EnableFeignClients` 가 붙어 있다.

### 이벤트 흐름 (비동기)

```
Producer service ──▶ Kafka topic ──▶ Consumer service(s)
                       (localhost:9092)
```

- Spring Kafka 의 `JsonSerializer` / `JsonDeserializer` 로 도메인 이벤트를 주고받는다.
- 컨슈머는 `spring.json.trusted.packages: com.shopping.*` 설정으로 사내 패키지의 모든 이벤트 클래스를 신뢰한다.
- 각 서비스는 자체 컨슈머 group-id (`{service}-group`) 를 사용하므로 같은 토픽을 여러 서비스가 독립적으로 구독할 수 있다.

### 데이터

- **Database per Service** — 각 서비스가 별도 PostgreSQL 데이터베이스를 소유한다 (`scripts/init-db.sql` 에서 5개 DB 를 한 번에 생성).
- JPA 모듈은 `kotlin("plugin.jpa")` 와 `allOpen { annotation("jakarta.persistence.Entity") ... }` 블록으로 `@Entity` 클래스를 자동 open 처리한다 (Hibernate proxy / lazy loading 호환).
- 학습 단계이므로 `ddl-auto: update`. 운영 전환 시 Flyway 등으로 마이그레이션을 옮길 것.

### 설정

- `infra:config` 는 `native` 프로파일로 동작하며, `classpath:/config/` 를 search-location 으로 사용한다. 운영 환경의 git 백엔드와 다르게, 학습 단계에서는 jar 안에 yml 을 묶어 배포하는 방식으로 단순화했다.
- 공통 설정을 중앙화하려면 `infra/config/src/main/resources/config/{service-name}.yml` 을 추가하면 된다.

## 실행 방법

### 1. 인프라 컨테이너 기동

```bash
docker compose up -d
```

`docker-compose.yml` 이 띄우는 컨테이너:

| 컨테이너 | 포트 | 용도 |
|----------|------|------|
| shopping-postgres | 5432 | 5개 서비스 DB (init-db.sql 자동 실행) |
| shopping-redis | 6379 | 캐시 |
| shopping-zookeeper | 2181 | Kafka 의존 |
| shopping-kafka | 9092 | 이벤트 브로커 |
| shopping-kafka-ui | 8090 | Kafka 모니터링 UI |

### 2. 모듈 기동 순서

다른 서비스가 Eureka 에 등록될 곳이 필요하므로 **반드시 discovery 부터** 띄운다.

1. `:infra:discovery`
2. `:infra:config`
3. `:infra:gateway`
4. `:services:*-service` (순서 무관)

```bash
./gradlew :infra:discovery:bootRun
./gradlew :infra:config:bootRun
./gradlew :infra:gateway:bootRun
./gradlew :services:member-service:bootRun
# ... product, order, payment, cart
```

### 3. 빌드 / 테스트

```bash
./gradlew build                                 # 전체 빌드
./gradlew :services:order-service:test          # 단일 모듈 테스트
./gradlew :services:order-service:test --tests "com.shopping.service.SomeTest"
```

## 모니터링 / 진입점

- Eureka 대시보드: <http://localhost:8761>
- Gateway: <http://localhost:8080>
- Kafka UI: <http://localhost:8090>
- 각 서비스 Actuator: `http://localhost:{port}/actuator` (`health`, `info`, `metrics` 만 노출)

## 새 서비스 추가 체크리스트

1. `settings.gradle.kts` 에 `services:{name}-service` 추가
2. 모듈 `build.gradle.kts` 작성 (member-service / cart-service 와 동일한 형태, 버전 명시 X)
3. `com.shopping.service.{Name}Application` 클래스 생성, 필요에 따라 `@EnableFeignClients` / `@EnableKafka` 부여
4. `application.yml` 에 포트, Postgres datasource, Kafka, Eureka 설정 추가
5. `scripts/init-db.sql` 에 `CREATE DATABASE {name}_db;` 추가
6. `infra/gateway/src/main/resources/application.yml` 의 `routes` 에 `Path=/api/{name}s/**` 라우트 추가
7. JPA 사용 시 `kotlin("plugin.jpa")` + `allOpen` 블록 잊지 말 것

## 향후 학습 주제 (계획)

- Saga 패턴으로 주문→결제→재고 흐름의 분산 트랜잭션 처리
- Outbox 패턴으로 DB 트랜잭션과 Kafka 발행 일관성 확보
- Spring Cloud Gateway 에 인증/인가, 레이트리밋 추가
- Resilience4j 로 회로차단·재시도·타임아웃 적용
- 분산 추적 (Micrometer Tracing + Zipkin/Tempo)
