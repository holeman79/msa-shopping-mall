package com.shopping.service.auth.oauth.kakao

import com.fasterxml.jackson.annotation.JsonProperty
import com.shopping.service.auth.config.KakaoOAuthProperties
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.util.LinkedMultiValueMap
import org.springframework.util.MultiValueMap
import org.springframework.web.client.RestClient
import org.springframework.web.client.body

class KakaoOAuthException(message: String) : RuntimeException(message)

data class KakaoTokenResponse(
    @JsonProperty("access_token") val accessToken: String,
    @JsonProperty("token_type") val tokenType: String,
    @JsonProperty("refresh_token") val refreshToken: String?,
    @JsonProperty("expires_in") val expiresIn: Long,
)

data class KakaoUserInfo(
    val id: Long,
    @JsonProperty("kakao_account") val kakaoAccount: KakaoAccount?,
    val properties: KakaoProperties?,
)

data class KakaoAccount(
    val email: String?,
    @JsonProperty("is_email_valid") val isEmailValid: Boolean?,
    @JsonProperty("is_email_verified") val isEmailVerified: Boolean?,
    val profile: KakaoProfile?,
)

data class KakaoProfile(
    val nickname: String?,
)

data class KakaoProperties(
    val nickname: String?,
)

@Component
class KakaoApiClient(
    private val restClient: RestClient,
    private val properties: KakaoOAuthProperties,
) {

    fun exchangeCodeForToken(code: String): KakaoTokenResponse {
        val body: MultiValueMap<String, String> = LinkedMultiValueMap<String, String>().apply {
            add("grant_type", "authorization_code")
            add("client_id", properties.clientId)
            add("redirect_uri", properties.redirectUri)
            add("code", code)
            if (properties.clientSecret.isNotBlank()) {
                add("client_secret", properties.clientSecret)
            }
        }
        return runCatching {
            restClient.post()
                .uri(properties.tokenUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(body)
                .retrieve()
                .body<KakaoTokenResponse>()
                ?: throw KakaoOAuthException("카카오 토큰 응답이 비어있습니다.")
        }.getOrElse { e ->
            throw KakaoOAuthException("카카오 토큰 교환 실패: ${e.message}")
        }
    }

    fun fetchUserInfo(accessToken: String): KakaoUserInfo {
        return runCatching {
            restClient.get()
                .uri(properties.userInfoUrl)
                .header("Authorization", "Bearer $accessToken")
                .retrieve()
                .body<KakaoUserInfo>()
                ?: throw KakaoOAuthException("카카오 사용자 정보 응답이 비어있습니다.")
        }.getOrElse { e ->
            throw KakaoOAuthException("카카오 사용자 정보 조회 실패: ${e.message}")
        }
    }

    fun buildAuthorizeUrl(state: String?): String {
        val params = buildList {
            add("response_type=code")
            add("client_id=${properties.clientId}")
            add("redirect_uri=${properties.redirectUri}")
            if (state != null) add("state=$state")
        }.joinToString("&")
        return "${properties.authorizeUrl}?$params"
    }
}
