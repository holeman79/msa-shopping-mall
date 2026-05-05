package com.shopping.service.auth.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "oauth.kakao")
data class KakaoOAuthProperties(
    val clientId: String,
    val clientSecret: String,
    val redirectUri: String,
    val authorizeUrl: String,
    val tokenUrl: String,
    val userInfoUrl: String,
)
