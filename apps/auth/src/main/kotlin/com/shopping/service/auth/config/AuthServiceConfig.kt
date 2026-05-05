package com.shopping.service.auth.config

import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.client.RestClient

@Configuration
@EnableConfigurationProperties(
    JwtProperties::class,
    UserContextCacheProperties::class,
    KakaoOAuthProperties::class,
)
class AuthServiceConfig {

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

    @Bean
    fun restClient(): RestClient = RestClient.create()
}
