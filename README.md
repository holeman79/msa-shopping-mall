# MSA Shopping Mall

Spring Boot Kotlin 기반 MSA 학습 프로젝트.

## 구성

### 인프라
| 모듈 | 포트 | 역할 |
|------|------|------|
| `infra/discovery` | 8761 | Eureka 서버 (서비스 디스커버리) |
| `infra/config` | 8888 | Spring Cloud Config Server |
| `infra/gateway` | 8080 | API Gateway (라우팅·로드밸런싱) |

### 서비스
| 모듈 | 포트 | 역할 |
|------|------|------|
| `services/member-service` | 8081 | 회원·인증 |
| `services/product-service` | 8082 | 상품·카탈로그 |
| `services/order-service` | 8083 | 주문 |
| `services/payment-service` | 8084 | 결제 |
| `services/cart-service` | 8085 | 장바구니 |

## 통신 방식
- **동기**: Spring Cloud OpenFeign + Eureka 기반 서비스 디스커버리
- **이벤트**: Spring Kafka (이벤트 발행·구독)

## 기술 스택
- Spring Boot 3.5.0
- Spring Cloud 2025.0.0
- Kotlin 2.1.0
- Java 21
- Gradle Kotlin DSL (멀티모듈)

## 실행 순서

### 1. 인프라 기동
```bash
docker compose up -d
```
- Postgres (5432), Redis (6379), Kafka (9092), Kafka UI (8090)

### 2. 서비스 기동 순서
1. `infra/discovery` (Eureka 먼저)
2. `infra/config`
3. `infra/gateway`
4. 각 service 모듈

### 3. 빌드
```bash
./gradlew build
```

### 4. 단일 서비스 실행
```bash
./gradlew :services:member-service:bootRun
```

## API 라우팅 (Gateway 경유)
- `GET http://localhost:8080/api/members/**` → member-service
- `GET http://localhost:8080/api/products/**` → product-service
- `GET http://localhost:8080/api/orders/**` → order-service
- `GET http://localhost:8080/api/payments/**` → payment-service
- `GET http://localhost:8080/api/carts/**` → cart-service

## 모니터링
- Eureka: http://localhost:8761
- Kafka UI: http://localhost:8090
- Actuator: http://localhost:{port}/actuator
