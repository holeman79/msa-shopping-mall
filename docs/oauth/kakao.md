# 카카오 로그인 등록 방법

> 로컬 개발 환경 기준. 운영 등록 시 도메인/redirect URI만 바꾸면 동일하게 적용됩니다.

## 1. 카카오 개발자 계정 + 앱 생성

1. https://developers.kakao.com 접속 → 카카오 계정으로 로그인
2. 우측 상단 **내 애플리케이션** → **애플리케이션 추가하기**
3. 입력
   - **앱 이름**: `MSA Shopping Mall (dev)` 등 식별 가능한 이름
   - **사업자명**: 개인이면 본인 이름 / 닉네임
4. 생성 후 **앱 키** 메뉴로 이동 → **REST API 키** 복사 (이게 우리가 쓰는 `client-id`)

## 2. 플랫폼 등록

좌측 메뉴 **앱 설정 → 플랫폼**

1. **Web 플랫폼 등록** 클릭
2. **사이트 도메인**:
   ```
   http://localhost:3000
   ```

## 3. 카카오 로그인 활성화

좌측 메뉴 **제품 설정 → 카카오 로그인**

1. **활성화 설정** → **ON**
2. **Redirect URI 등록**:
   ```
   http://localhost:3000/auth/callback/kakao
   ```
   (반드시 프론트엔드 라우트와 정확히 일치 — 끝 슬래시까지 신경 쓰기)

## 4. 동의항목 설정

좌측 메뉴 **제품 설정 → 카카오 로그인 → 동의항목**

| 항목 | 설정 | 비고 |
|---|---|---|
| **카카오계정(이메일)** | **필수 동의** | 우리 백엔드가 이메일을 키로 사용 (`KakaoAuthService`에서 이메일 없으면 거부) |
| 닉네임 | 선택 동의 | 회원 이름으로 사용 (없으면 "카카오회원"이 기본값) |
| 프로필 사진 | 선택 동의 | 현재 미사용 |

> 운영 환경에서 "필수 동의"를 쓰려면 **비즈 앱 전환** 또는 **검수 신청**이 필요할 수 있음. 학습용 앱이면 그대로 OK.

## 5. (선택) Client Secret 사용

좌측 메뉴 **제품 설정 → 카카오 로그인 → 보안**

- **Client Secret 사용**을 ON으로 하면 토큰 교환 시 secret 검증 추가됨 (보안 강화)
- 활성화한 경우 코드를 복사해서 `KAKAO_CLIENT_SECRET` 환경변수로 주입
- OFF로 두면 `KAKAO_CLIENT_SECRET`은 빈 값으로 두면 됨 (yml 기본값)

## 6. 환경변수 + 로컬 실행

```bash
# 필수: REST API 키
export KAKAO_CLIENT_ID=<여기에-rest-api-키-붙여넣기>

# 선택: client secret을 ON으로 설정한 경우
export KAKAO_CLIENT_SECRET=<여기에-secret-붙여넣기>

# 선택: redirect URI를 다르게 운영한다면
# export KAKAO_REDIRECT_URI=http://localhost:3000/auth/callback/kakao

# 백엔드 인프라
docker compose up -d

# Spring Boot 실행 순서
./gradlew :infra:discovery:bootRun &      # 8761 (Eureka)
./gradlew :infra:gateway:bootRun &        # 8080 (Gateway)
./gradlew :apps:member:bootRun &          # 8081 (member)
./gradlew :apps:auth:bootRun &            # 8086 (auth — KAKAO_CLIENT_ID 필요)

# 프론트
cd front && npm run dev                   # 3000
```

## 7. 동작 확인

1. http://localhost:3000/login 접속
2. **카카오로 로그인** 버튼 클릭
3. 카카오 로그인 페이지로 이동 → 동의 → 계속
4. `/auth/callback/kakao?code=...`로 리다이렉트
5. 콜백 페이지가 백엔드 호출 → 토큰 발급 → 홈으로 이동
6. 헤더에 `[일반] {카카오닉네임}` 배지가 보이면 성공

## 8. 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| 카카오 로그인 화면에서 "앱 키가 잘못되었습니다" | `KAKAO_CLIENT_ID`가 잘못됨. REST API 키인지 확인 (JavaScript 키, Native 키와 다름) |
| 카카오 → redirect 후 "redirect_uri mismatch" | 카카오 콘솔의 Redirect URI와 yml의 `redirect-uri`가 정확히 같은지 확인 |
| `OAUTH_FAILURE: 카카오 이메일 동의가 필요합니다` | 동의항목에서 카카오계정(이메일)을 필수 동의로 설정 + 사용자가 이전에 거부한 적 있다면 카카오 계정에서 연결 끊고 재시도 |
| 콜백 페이지에서 `INVALID_REFRESH_TOKEN` 같은 에러 | 콜백이 두 번 호출됨 (브라우저 새로고침 등). code는 일회용이라 재사용 불가 → 로그인 다시 시도 |
| 프로덕션에서 동일 절차 진행 | 카카오 콘솔의 Web 플랫폼/Redirect URI에 운영 도메인 추가 + 비즈 앱 전환 검토 |

## 9. 우리 백엔드의 처리 흐름

```
1. POST /api/auth/oauth/kakao/login {code}
2. KakaoApiClient.exchangeCodeForToken(code)
   → POST kauth.kakao.com/oauth/token
   → access_token 획득
3. KakaoApiClient.fetchUserInfo(access_token)
   → GET kapi.kakao.com/v2/user/me
   → {id, kakao_account.email, kakao_account.profile.nickname}
4. KakaoAuthService.findOrCreateMember:
   a. memberServiceClient.findByProvider(KAKAO, providerId) → 있으면 사용
   b. 없으면 memberServiceClient.findByEmail(email)
      - 다른 provider로 가입 → 거부 (KakaoOAuthException)
      - 없으면 신규 생성 (provider=KAKAO, providerId=kakao_id, password=random)
5. AuthService.authenticate(member)
   → UserContext 캐시 적재 (Redis: user:{id})
   → Access JWT (30분) + Refresh token (14일) 발급
6. 응답: {token, expiresAt, refreshToken, refreshExpiresAt, member}
```

## 10. 보안 노트

- **REST API 키는 GitHub에 절대 커밋 금지**. 환경변수만 사용.
- 운영 환경에서는 Vault / AWS Secrets Manager / GCP Secret Manager 등 사용
- 카카오 access token은 우리 서버에서 1회 사용 후 폐기 (저장 안 함). 우리 시스템 내부 토큰만 발급해서 사용
- Kakao의 refresh token도 받지만 현재는 미사용. 추후 카카오 계정 연결 끊기 등에 활용 가능
