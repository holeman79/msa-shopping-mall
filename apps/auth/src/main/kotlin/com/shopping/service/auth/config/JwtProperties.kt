package com.shopping.service.auth.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "jwt")
data class JwtProperties(
    val secret: String,
    val accessExpirationMinutes: Long,
    val refreshExpirationDays: Long,
    val issuer: String,
)
