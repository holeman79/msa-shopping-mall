package com.shopping.service.member.security

import com.shopping.service.member.config.JwtProperties
import com.shopping.service.member.domain.MemberRole
import io.jsonwebtoken.Jwts
import org.springframework.stereotype.Component
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Date
import javax.crypto.SecretKey
import javax.crypto.spec.SecretKeySpec

@Component
class JwtIssuer(private val properties: JwtProperties) {

    private val key: SecretKey = SecretKeySpec(properties.secret.toByteArray(), "HmacSHA256")

    fun issue(memberId: Long, email: String, role: MemberRole): IssuedToken {
        val now = Instant.now()
        val expiresAt = now.plus(properties.expirationHours, ChronoUnit.HOURS)
        val token = Jwts.builder()
            .issuer(properties.issuer)
            .subject(memberId.toString())
            .claim("email", email)
            .claim("role", role.name)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiresAt))
            .signWith(key, Jwts.SIG.HS256)
            .compact()
        return IssuedToken(token = token, expiresAt = expiresAt)
    }
}

data class IssuedToken(
    val token: String,
    val expiresAt: Instant,
)
