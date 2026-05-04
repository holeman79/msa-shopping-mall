package com.shopping.infra.gateway

import com.fasterxml.jackson.databind.ObjectMapper
import com.shopping.context.UserContext
import org.springframework.data.redis.core.ReactiveStringRedisTemplate
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

class UserContextNotFoundException(memberId: Long) :
    RuntimeException("UserContext not found for member $memberId — cache may be stale, force re-login.")

@Component
class UserContextResolver(
    private val redisTemplate: ReactiveStringRedisTemplate,
    private val objectMapper: ObjectMapper,
) {
    fun resolve(memberId: Long): Mono<UserContext> =
        redisTemplate.opsForValue().get(key(memberId))
            .map { json -> objectMapper.readValue(json, UserContext::class.java) }
            .switchIfEmpty(Mono.error(UserContextNotFoundException(memberId)))

    private fun key(memberId: Long): String = "user:$memberId"
}
