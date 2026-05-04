package com.shopping.service.auth.context

import com.fasterxml.jackson.databind.ObjectMapper
import com.shopping.context.UserContext
import com.shopping.service.auth.config.UserContextCacheProperties
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.stereotype.Component
import java.time.Duration

@Component
class UserContextCache(
    private val redisTemplate: StringRedisTemplate,
    private val objectMapper: ObjectMapper,
    private val properties: UserContextCacheProperties,
) {
    private val ttl: Duration = Duration.ofMinutes(properties.ttlMinutes)

    fun put(context: UserContext) {
        val json = objectMapper.writeValueAsString(context)
        redisTemplate.opsForValue().set(key(context.id), json, ttl)
    }

    fun evict(memberId: Long) {
        redisTemplate.delete(key(memberId))
    }

    private fun key(memberId: Long): String = "user:$memberId"
}
