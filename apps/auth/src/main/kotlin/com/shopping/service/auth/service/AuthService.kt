package com.shopping.service.auth.service

import com.shopping.context.UserRole
import com.shopping.context.UserStatus
import com.shopping.service.auth.api.AuthenticationResponse
import com.shopping.service.auth.api.LoginRequest
import com.shopping.service.auth.api.SignupRequest
import com.shopping.service.auth.api.SignupRole
import com.shopping.service.auth.client.MemberInternalCreateRequest
import com.shopping.service.auth.client.MemberInternalView
import com.shopping.service.auth.client.MemberServiceClient
import com.shopping.service.auth.context.UserContextCache
import com.shopping.service.auth.security.JwtIssuer
import com.shopping.service.auth.security.RefreshTokenStore
import feign.FeignException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

class DuplicateEmailException(email: String) : RuntimeException("이미 가입된 이메일입니다: $email")
class InvalidCredentialsException : RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.")
class InactiveMemberException(status: UserStatus) :
    RuntimeException("로그인할 수 없는 회원 상태입니다: $status")

@Service
class AuthService(
    private val memberServiceClient: MemberServiceClient,
    private val passwordEncoder: PasswordEncoder,
    private val jwtIssuer: JwtIssuer,
    private val refreshTokenStore: RefreshTokenStore,
    private val userContextCache: UserContextCache,
) {

    fun signup(request: SignupRequest): AuthenticationResponse {
        if (existsByEmail(request.email)) {
            throw DuplicateEmailException(request.email)
        }
        val created = memberServiceClient.create(
            MemberInternalCreateRequest(
                email = request.email,
                passwordHash = passwordEncoder.encode(request.password),
                name = request.name,
                phone = request.phone,
                role = request.role.toUserRole(),
            ),
        )
        return authenticate(created)
    }

    fun login(request: LoginRequest): AuthenticationResponse {
        val member = findByEmailOrNull(request.email) ?: throw InvalidCredentialsException()

        if (!passwordEncoder.matches(request.password, member.passwordHash)) {
            throw InvalidCredentialsException()
        }
        if (member.status != UserStatus.ACTIVE) {
            throw InactiveMemberException(member.status)
        }
        return authenticate(member)
    }

    /**
     * Token rotation: 기존 refresh를 즉시 폐기하고 새 access + 새 refresh를 발급.
     */
    fun refresh(refreshToken: String): AuthenticationResponse {
        val record = refreshTokenStore.consume(refreshToken)
        val member = memberServiceClient.findById(record.memberId)
        if (member.status != UserStatus.ACTIVE) {
            throw InactiveMemberException(member.status)
        }
        return authenticate(member)
    }

    fun logout(refreshToken: String) {
        // 토큰을 가지고 있으면 그 안의 memberId로 캐시도 비우면 좋겠지만,
        // 토큰이 이미 만료되었거나 잘못됐어도 멱등하게 동작해야 하므로 단순 폐기만.
        refreshTokenStore.revoke(refreshToken)
    }

    private fun authenticate(member: MemberInternalView): AuthenticationResponse {
        val context = member.toContext()
        userContextCache.put(context)
        val access = jwtIssuer.issue(memberId = member.id, email = member.email, role = member.role)
        val refresh = refreshTokenStore.issue(member.id)
        return AuthenticationResponse(
            token = access.token,
            expiresAt = access.expiresAt,
            refreshToken = refresh.token,
            refreshExpiresAt = refresh.expiresAt,
            member = context,
        )
    }

    private fun existsByEmail(email: String): Boolean = findByEmailOrNull(email) != null

    private fun findByEmailOrNull(email: String): MemberInternalView? = try {
        memberServiceClient.findByEmail(email)
    } catch (e: FeignException.NotFound) {
        null
    }

    private fun SignupRole.toUserRole(): UserRole = when (this) {
        SignupRole.CUSTOMER -> UserRole.CUSTOMER
        SignupRole.SELLER -> UserRole.SELLER
    }
}
