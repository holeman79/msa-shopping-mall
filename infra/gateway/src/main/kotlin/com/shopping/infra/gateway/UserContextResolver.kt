package com.shopping.infra.gateway

import com.fasterxml.jackson.databind.ObjectMapper
import com.shopping.context.UserContext
import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.ReactiveStringRedisTemplate
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.time.Duration

class UserContextNotFoundException(memberId: Long) :
    RuntimeException("UserContext not found for member $memberId")

@Component
class UserContextResolver(
    private val redisTemplate: ReactiveStringRedisTemplate,
    private val memberServiceWebClient: WebClient,
    private val objectMapper: ObjectMapper,
    private val properties: UserContextProperties,
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val ttl: Duration = Duration.ofMinutes(properties.cacheTtlMinutes)

    fun resolve(memberId: Long): Mono<UserContext> =
        redisTemplate.opsForValue().get(key(memberId))
            .map { json -> objectMapper.readValue(json, UserContext::class.java) }
            .switchIfEmpty(fetchFromMemberService(memberId).flatMap { ctx -> cache(ctx).thenReturn(ctx) })

    private fun fetchFromMemberService(memberId: Long): Mono<UserContext> =
        memberServiceWebClient.get()
            .uri("/api/members/{id}", memberId)
            .retrieve()
            .bodyToMono(UserContext::class.java)
            .doOnError { e -> log.warn("Member-service lookup failed for id={}: {}", memberId, e.message) }
            .onErrorResume { Mono.error(UserContextNotFoundException(memberId)) }

    private fun cache(context: UserContext): Mono<Boolean> {
        val json = objectMapper.writeValueAsString(context)
        return redisTemplate.opsForValue().set(key(context.id), json, ttl)
    }

    private fun key(memberId: Long): String = "user:$memberId"
}
