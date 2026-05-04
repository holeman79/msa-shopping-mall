package com.shopping.service.auth.security

import com.fasterxml.jackson.databind.ObjectMapper
import com.shopping.service.auth.config.JwtProperties
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import java.time.Duration
import java.time.Instant
import java.util.UUID

data class IssuedRefreshToken(
    val token: String,
    val expiresAt: Instant,
)

data class RefreshTokenRecord(
    val memberId: Long,
    val issuedAt: Instant,
    val expiresAt: Instant,
)

class RefreshTokenNotFoundException : RuntimeException("리프레시 토큰이 만료되었거나 존재하지 않습니다.")

/**
 * Refresh tokens are opaque random strings stored server-side in Redis,
 * keyed as `refresh:{token}` -> JSON record. Each successful login or refresh
 * creates a new entry; using a token to refresh REPLACES it (token rotation).
 */
@Component
class RefreshTokenStore(
    private val redisTemplate: StringRedisTemplate,
    private val objectMapper: ObjectMapper,
    private val properties: JwtProperties,
) {
    private val ttl: Duration = Duration.ofDays(properties.refreshExpirationDays)

    fun issue(memberId: Long): IssuedRefreshToken {
        val now = Instant.now()
        val expiresAt = now.plus(ttl)
        val token = UUID.randomUUID().toString()
        val record = RefreshTokenRecord(memberId = memberId, issuedAt = now, expiresAt = expiresAt)
        redisTemplate.opsForValue().set(key(token), objectMapper.writeValueAsString(record), ttl)
        return IssuedRefreshToken(token = token, expiresAt = expiresAt)
    }

    fun consume(token: String): RefreshTokenRecord {
        val raw = redisTemplate.opsForValue().get(key(token)) ?: throw RefreshTokenNotFoundException()
        // Rotation: 사용 즉시 폐기. 새 토큰은 호출자가 issue()로 발급.
        redisTemplate.delete(key(token))
        return objectMapper.readValue(raw, RefreshTokenRecord::class.java)
    }

    fun revoke(token: String) {
        redisTemplate.delete(key(token))
    }

    private fun key(token: String): String = "refresh:$token"
}
