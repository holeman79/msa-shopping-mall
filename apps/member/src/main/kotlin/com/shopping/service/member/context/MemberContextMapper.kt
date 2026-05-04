package com.shopping.service.member.context

import com.shopping.context.SellerApprovalStatus as ContextSellerApprovalStatus
import com.shopping.context.UserContext
import com.shopping.context.UserRole
import com.shopping.context.UserStatus
import com.shopping.service.member.domain.Member
import com.shopping.service.member.domain.MemberRole
import com.shopping.service.member.domain.MemberStatus
import com.shopping.service.member.domain.SellerApprovalStatus

object MemberContextMapper {

    fun toContext(member: Member): UserContext = UserContext(
        id = requireNotNull(member.id) { "persisted member must have id" },
        email = member.email,
        name = member.name,
        phone = member.phone,
        role = member.role.toContext(),
        status = member.status.toContext(),
        sellerApprovalStatus = member.sellerApprovalStatus.toContext(),
        joinedAt = member.joinedAt,
    )

    private fun MemberRole.toContext(): UserRole = when (this) {
        MemberRole.CUSTOMER -> UserRole.CUSTOMER
        MemberRole.SELLER -> UserRole.SELLER
        MemberRole.ADMIN -> UserRole.ADMIN
    }

    private fun MemberStatus.toContext(): UserStatus = when (this) {
        MemberStatus.ACTIVE -> UserStatus.ACTIVE
        MemberStatus.DORMANT -> UserStatus.DORMANT
        MemberStatus.WITHDRAWN -> UserStatus.WITHDRAWN
    }

    private fun SellerApprovalStatus.toContext(): ContextSellerApprovalStatus = when (this) {
        SellerApprovalStatus.NOT_APPLICABLE -> ContextSellerApprovalStatus.NOT_APPLICABLE
        SellerApprovalStatus.PENDING -> ContextSellerApprovalStatus.PENDING
        SellerApprovalStatus.APPROVED -> ContextSellerApprovalStatus.APPROVED
        SellerApprovalStatus.REJECTED -> ContextSellerApprovalStatus.REJECTED
    }
}
