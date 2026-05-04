package com.shopping.service.member.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "admin-seed")
data class AdminSeedProperties(
    val email: String,
    val password: String,
    val name: String,
)
