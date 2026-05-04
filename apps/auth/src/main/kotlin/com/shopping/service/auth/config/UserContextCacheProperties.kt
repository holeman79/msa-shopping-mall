package com.shopping.service.auth.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "user-context-cache")
data class UserContextCacheProperties(
    val ttlMinutes: Long,
)
