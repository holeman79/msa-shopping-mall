package com.shopping.infra.gateway

import com.fasterxml.jackson.databind.ObjectMapper
import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import org.slf4j.LoggerFactory
import org.springframework.cloud.gateway.filter.GatewayFilterChain
import org.springframework.cloud.gateway.filter.GlobalFilter
import org.springframework.core.Ordered
import org.springframework.core.io.buffer.DataBuffer
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.server.reactive.ServerHttpResponse
import org.springframework.stereotype.Component
import org.springframework.util.AntPathMatcher
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono
import java.time.Instant
import javax.crypto.spec.SecretKeySpec

@Component
class JwtAuthenticationFilter(
    private val properties: JwtProperties,
    private val objectMapper: ObjectMapper,
) : GlobalFilter, Ordered {

    private val log = LoggerFactory.getLogger(javaClass)
    private val pathMatcher = AntPathMatcher()
    private val key = SecretKeySpec(properties.secret.toByteArray(), "HmacSHA256")
    private val parser = Jwts.parser().verifyWith(key).build()

    override fun getOrder(): Int = -100

    override fun filter(exchange: ServerWebExchange, chain: GatewayFilterChain): Mono<Void> {
        if (exchange.request.method?.name() == "OPTIONS") {
            return chain.filter(exchange)
        }
        val path = exchange.request.uri.path
        if (isPublic(path)) {
            return chain.filter(exchange)
        }

        val authHeader = exchange.request.headers.getFirst("Authorization")
        if (authHeader.isNullOrBlank() || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange.response, "MISSING_TOKEN", "Authorization 헤더가 필요합니다.")
        }

        val token = authHeader.removePrefix("Bearer ").trim()
        return try {
            val claims = parser.parseSignedClaims(token).payload
            val userId = claims.subject ?: return unauthorized(exchange.response, "INVALID_TOKEN", "subject 누락")
            val role = claims["role"] as? String
                ?: return unauthorized(exchange.response, "INVALID_TOKEN", "role claim 누락")

            val mutated = exchange.mutate().request(
                exchange.request.mutate()
                    .header("X-User-Id", userId)
                    .header("X-User-Role", role)
                    .build(),
            ).build()
            chain.filter(mutated)
        } catch (e: JwtException) {
            log.debug("JWT validation failed: {}", e.message)
            unauthorized(exchange.response, "INVALID_TOKEN", "유효하지 않은 토큰입니다.")
        }
    }

    private fun isPublic(path: String): Boolean =
        properties.publicPaths.any { pathMatcher.match(it, path) }

    private fun unauthorized(response: ServerHttpResponse, code: String, message: String): Mono<Void> {
        response.statusCode = HttpStatus.UNAUTHORIZED
        response.headers.contentType = MediaType.APPLICATION_JSON
        val body = mapOf(
            "timestamp" to Instant.now().toString(),
            "status" to HttpStatus.UNAUTHORIZED.value(),
            "code" to code,
            "message" to message,
        )
        val buffer: DataBuffer = response.bufferFactory().wrap(objectMapper.writeValueAsBytes(body))
        return response.writeWith(Mono.just(buffer))
    }
}
