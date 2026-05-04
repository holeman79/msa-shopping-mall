package com.shopping.service.member.service

import com.shopping.service.member.api.LoginRequest
import com.shopping.service.member.api.LoginResponse
import com.shopping.service.member.api.MemberResponse
import com.shopping.service.member.api.SignupRequest
import com.shopping.service.member.api.SignupRole
import com.shopping.service.member.domain.Member
import com.shopping.service.member.domain.MemberRole
import com.shopping.service.member.domain.MemberStatus
import com.shopping.service.member.domain.SellerApprovalStatus
import com.shopping.service.member.repository.MemberRepository
import com.shopping.service.member.security.JwtIssuer
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

class DuplicateEmailException(email: String) : RuntimeException("이미 가입된 이메일입니다: $email")
class InvalidCredentialsException : RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.")
class MemberNotFoundException(id: Long) : RuntimeException("회원을 찾을 수 없습니다: $id")
class InactiveMemberException(status: MemberStatus) :
    RuntimeException("로그인할 수 없는 회원 상태입니다: $status")

@Service
class MemberService(
    private val memberRepository: MemberRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtIssuer: JwtIssuer,
) {

    @Transactional
    fun signup(request: SignupRequest): MemberResponse {
        if (memberRepository.existsByEmail(request.email)) {
            throw DuplicateEmailException(request.email)
        }
        val member = Member(
            email = request.email,
            passwordHash = passwordEncoder.encode(request.password),
            name = request.name,
            phone = request.phone,
            role = request.role.toDomain(),
            status = MemberStatus.ACTIVE,
            sellerApprovalStatus = if (request.role == SignupRole.SELLER) {
                SellerApprovalStatus.APPROVED
            } else {
                SellerApprovalStatus.NOT_APPLICABLE
            },
        )
        return MemberResponse.from(memberRepository.save(member))
    }

    @Transactional(readOnly = true)
    fun login(request: LoginRequest): LoginResponse {
        val member = memberRepository.findByEmail(request.email)
            ?: throw InvalidCredentialsException()

        if (!passwordEncoder.matches(request.password, member.passwordHash)) {
            throw InvalidCredentialsException()
        }
        if (member.status != MemberStatus.ACTIVE) {
            throw InactiveMemberException(member.status)
        }

        val issued = jwtIssuer.issue(
            memberId = requireNotNull(member.id),
            email = member.email,
            role = member.role,
        )
        return LoginResponse(
            token = issued.token,
            expiresAt = issued.expiresAt,
            member = MemberResponse.from(member),
        )
    }

    @Transactional(readOnly = true)
    fun findById(id: Long): MemberResponse {
        val member = memberRepository.findById(id).orElseThrow { MemberNotFoundException(id) }
        return MemberResponse.from(member)
    }

    @Transactional(readOnly = true)
    fun findAll(): List<MemberResponse> =
        memberRepository.findAll().map(MemberResponse::from)

    private fun SignupRole.toDomain(): MemberRole = when (this) {
        SignupRole.CUSTOMER -> MemberRole.CUSTOMER
        SignupRole.SELLER -> MemberRole.SELLER
    }
}
