package com.shopping.service.auth.oauth.kakao

import com.shopping.context.AuthProvider
import com.shopping.context.UserRole
import com.shopping.service.auth.api.AuthenticationResponse
import com.shopping.service.auth.client.MemberInternalCreateRequest
import com.shopping.service.auth.client.MemberInternalView
import com.shopping.service.auth.client.MemberServiceClient
import com.shopping.service.auth.service.AuthService
import feign.FeignException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class KakaoAuthService(
    private val kakaoApiClient: KakaoApiClient,
    private val memberServiceClient: MemberServiceClient,
    private val passwordEncoder: PasswordEncoder,
    private val authService: AuthService,
) {

    fun loginWithCode(code: String): AuthenticationResponse {
        val tokenResponse = kakaoApiClient.exchangeCodeForToken(code)
        val userInfo = kakaoApiClient.fetchUserInfo(tokenResponse.accessToken)
        val member = findOrCreateMember(userInfo)
        return authService.authenticate(member)
    }

    fun authorizeUrl(state: String?): String = kakaoApiClient.buildAuthorizeUrl(state)

    private fun findOrCreateMember(userInfo: KakaoUserInfo): MemberInternalView {
        val providerId = userInfo.id.toString()

        // 1. provider+providerId로 이미 가입된 회원이면 그대로 사용
        val existingByProvider = findByProviderOrNull(providerId)
        if (existingByProvider != null) return existingByProvider

        // 2. 카카오 이메일이 있으면 같은 이메일로 가입된 LOCAL 회원과 충돌 검사.
        //    이메일은 같지만 LOCAL로 이미 가입한 경우 = 별도 처리 필요. PoC에서는 거부.
        val email = userInfo.kakaoAccount?.email
            ?: throw KakaoOAuthException(
                "카카오 이메일 동의가 필요합니다. 카카오 로그인 동의항목에서 이메일을 허용해주세요.",
            )
        val existingByEmail = findByEmailOrNull(email)
        if (existingByEmail != null && existingByEmail.provider != AuthProvider.KAKAO) {
            throw KakaoOAuthException(
                "이미 ${existingByEmail.provider} 방식으로 가입된 이메일입니다: $email",
            )
        }

        // 3. 신규 회원 생성. 비밀번호는 절대 로그인에 쓰이지 않을 랜덤값 (해시만 채움).
        val displayName = userInfo.kakaoAccount?.profile?.nickname
            ?: userInfo.properties?.nickname
            ?: "카카오회원"
        val randomPassword = UUID.randomUUID().toString()
        return memberServiceClient.create(
            MemberInternalCreateRequest(
                email = email,
                passwordHash = passwordEncoder.encode(randomPassword),
                name = displayName,
                phone = null,
                role = UserRole.CUSTOMER,
                provider = AuthProvider.KAKAO,
                providerId = providerId,
            ),
        )
    }

    private fun findByProviderOrNull(providerId: String): MemberInternalView? = try {
        memberServiceClient.findByProvider(AuthProvider.KAKAO, providerId)
    } catch (e: FeignException.NotFound) {
        null
    }

    private fun findByEmailOrNull(email: String): MemberInternalView? = try {
        memberServiceClient.findByEmail(email)
    } catch (e: FeignException.NotFound) {
        null
    }
}
