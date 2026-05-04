package com.shopping.service.member.api

import com.shopping.service.member.domain.Member
import com.shopping.service.member.domain.MemberRole
import com.shopping.service.member.domain.MemberStatus
import com.shopping.service.member.domain.SellerApprovalStatus
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

data class LoginResponse(
    val token: String,
    val expiresAt: Instant,
    val member: MemberResponse,
)

data class MemberResponse(
    val id: Long,
    val email: String,
    val name: String,
    val phone: String?,
    val role: MemberRole,
    val status: MemberStatus,
    val sellerApprovalStatus: SellerApprovalStatus,
    val joinedAt: Instant,
) {
    companion object {
        fun from(member: Member): MemberResponse = MemberResponse(
            id = requireNotNull(member.id) { "persisted member must have id" },
            email = member.email,
            name = member.name,
            phone = member.phone,
            role = member.role,
            status = member.status,
            sellerApprovalStatus = member.sellerApprovalStatus,
            joinedAt = member.joinedAt,
        )
    }
}
