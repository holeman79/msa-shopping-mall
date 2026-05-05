# 소셜 로그인 등록 방법

각 소셜 로그인 프로바이더의 콘솔 등록 절차와 로컬 개발 환경 구성 방법을 모아둔 디렉토리입니다.

## 프로바이더별 가이드

| 프로바이더 | 상태 | 문서 |
|---|---|---|
| 카카오 (Kakao) | ✅ 구현됨 | [kakao.md](./kakao.md) |
| 구글 (Google) | 🔜 예정 | _(추가 예정)_ |
| 네이버 (Naver) | 🔜 예정 | _(추가 예정)_ |

## 공통 사항

- 모든 프로바이더의 client-id / client-secret은 **환경변수**로 주입합니다 (코드/yml에 하드코딩 금지).
- redirect URI는 프론트엔드 라우트 `/auth/callback/{provider}`와 정확히 일치해야 합니다.
- 백엔드(`apps/auth`)는 OAuth 2.0 Authorization Code Grant 플로우만 지원합니다.

## 흐름 요약

```
[프론트] "카카오로 로그인" 버튼 클릭
  ↓ GET /api/auth/oauth/{provider}/authorize-url
[프론트] 받은 URL로 window.location 이동
  ↓ 사용자가 프로바이더에서 인증
프로바이더 → http://localhost:3000/auth/callback/{provider}?code=...
  ↓ 콜백 페이지가 자동으로
[프론트] POST /api/auth/oauth/{provider}/login {code}
  ↓ apps/auth가 코드 교환 → user-info → find/create Member → JWT 발급
[프론트] 토큰 저장 → 홈으로 이동
```

## 새 프로바이더 추가 시 체크리스트

1. `libs/shopping-context`의 `AuthProvider` enum에 추가 (예: `NAVER`)
2. `apps/auth/src/main/kotlin/.../oauth/{provider}/` 패키지 생성
   - `{Provider}OAuthProperties` (`@ConfigurationProperties`)
   - `{Provider}ApiClient` (RestClient로 token 교환 + user info)
   - `{Provider}AuthService` (find/create member 후 `AuthService.authenticate` 위임)
   - `{Provider}AuthController` (`/api/auth/oauth/{provider}/{authorize-url,login}`)
3. `apps/auth/src/main/resources/application.yml`에 `oauth.{provider}.*` 블록 추가
4. `apps/auth/.../config/AuthServiceConfig.kt`의 `@EnableConfigurationProperties`에 `{Provider}OAuthProperties::class` 추가
5. `apps/auth/.../api/AuthExceptionHandler.kt`에 `{Provider}OAuthException` 핸들러 추가
6. 프론트엔드:
   - `front/src/features/auth/api.ts`에 `authApi.{provider}` 추가
   - `front/src/features/auth/hooks.ts`에 `use{Provider}Login` + `start{Provider}OAuthRedirect`
   - `front/src/components/auth/{provider}-login-button.tsx`
   - `front/src/app/auth/callback/{provider}/page.tsx`
   - `/login`, `/signup` 페이지에 버튼 추가
7. 이 폴더에 `{provider}.md` 등록 가이드 작성
