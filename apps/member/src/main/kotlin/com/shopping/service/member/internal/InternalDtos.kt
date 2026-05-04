package com.shopping.service.member.internal

import com.shopping.context.SellerApprovalStatus as ContextSellerApprovalStatus
import com.shopping.context.UserRole
import com.shopping.context.UserStatus
import com.shopping.service.member.context.MemberContextMapper.toContext
import com.shopping.service.member.domain.Member
import java.time.Instant

data class MemberInternalView(
    val id: Long,
    val email: String,
    val passwordHash: String,
    val name: String,
    val phone: String?,
    val role: UserRole,
    val status: UserStatus,
    val sellerApprovalStatus: ContextSellerApprovalStatus,
    val joinedAt: Instant,
) {
    companion object {
        fun from(member: Member): MemberInternalView = MemberInternalView(
            id = requireNotNull(member.id),
            email = member.email,
            passwordHash = member.passwordHash,
            name = member.name,
            phone = member.phone,
            role = member.role.toContext(),
            status = member.status.toContext(),
            sellerApprovalStatus = member.sellerApprovalStatus.toContext(),
            joinedAt = member.joinedAt,
        )
    }
}

data class MemberInternalCreateRequest(
    val email: String,
    val passwordHash: String,
    val name: String,
    val phone: String?,
    val role: UserRole,
)
