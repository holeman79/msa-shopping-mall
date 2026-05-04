package com.shopping.service.auth.api

import com.shopping.context.UserContext
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.Instant

enum class SignupRole { CUSTOMER, SELLER }

data class SignupRequest(
    @field:Email @field:NotBlank
    val email: String,

    @field:NotBlank @field:Size(min = 8, max = 64)
    val password: String,

    @field:NotBlank @field:Size(max = 50)
    val name: String,

    @field:Pattern(regexp = "^01[016789]-?\\d{3,4}-?\\d{4}$", message = "올바른 휴대폰 번호 형식이 아닙니다.")
    val phone: String?,

    val role: SignupRole,
)

data class LoginRequest(
    @field:Email @field:NotBlank val email: String,
    @field:NotBlank val password: String,
)

data class AuthenticationResponse(
    val token: String,
    val expiresAt: Instant,
    val refreshToken: String,
    val refreshExpiresAt: Instant,
    val member: UserContext,
)

data class RefreshRequest(
    @field:NotBlank val refreshToken: String,
)

data class LogoutRequest(
    @field:NotBlank val refreshToken: String,
)
