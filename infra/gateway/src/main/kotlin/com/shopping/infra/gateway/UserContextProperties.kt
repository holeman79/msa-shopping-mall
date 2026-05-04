package com.shopping.infra.gateway

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "user-context")
data class UserContextProperties(
    val cacheTtlMinutes: Long,
    val memberServiceBaseUrl: String,
)
