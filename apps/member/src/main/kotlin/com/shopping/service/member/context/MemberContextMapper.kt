package com.shopping.service.member.context

import com.shopping.context.SellerApprovalStatus as ContextSellerApprovalStatus
import com.shopping.context.UserRole
import com.shopping.context.UserStatus
import com.shopping.service.member.domain.MemberRole
import com.shopping.service.member.domain.MemberStatus
import com.shopping.service.member.domain.SellerApprovalStatus

object MemberContextMapper {

    fun MemberRole.toContext(): UserRole = when (this) {
        MemberRole.CUSTOMER -> UserRole.CUSTOMER
        MemberRole.SELLER -> UserRole.SELLER
        MemberRole.ADMIN -> UserRole.ADMIN
    }

    fun MemberStatus.toContext(): UserStatus = when (this) {
        MemberStatus.ACTIVE -> UserStatus.ACTIVE
        MemberStatus.DORMANT -> UserStatus.DORMANT
        MemberStatus.WITHDRAWN -> UserStatus.WITHDRAWN
    }

    fun SellerApprovalStatus.toContext(): ContextSellerApprovalStatus = when (this) {
        SellerApprovalStatus.NOT_APPLICABLE -> ContextSellerApprovalStatus.NOT_APPLICABLE
        SellerApprovalStatus.PENDING -> ContextSellerApprovalStatus.PENDING
        SellerApprovalStatus.APPROVED -> ContextSellerApprovalStatus.APPROVED
        SellerApprovalStatus.REJECTED -> ContextSellerApprovalStatus.REJECTED
    }

    fun UserRole.toDomain(): MemberRole = when (this) {
        UserRole.CUSTOMER -> MemberRole.CUSTOMER
        UserRole.SELLER -> MemberRole.SELLER
        UserRole.ADMIN -> MemberRole.ADMIN
    }
}
