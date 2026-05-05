package com.shopping.service.auth.client

import com.shopping.context.AuthProvider
import com.shopping.context.SellerApprovalStatus
import com.shopping.context.UserContext
import com.shopping.context.UserRole
import com.shopping.context.UserStatus
import java.time.Instant

data class MemberInternalView(
    val id: Long,
    val email: String,
    val passwordHash: String,
    val name: String,
    val phone: String?,
    val role: UserRole,
    val status: UserStatus,
    val sellerApprovalStatus: SellerApprovalStatus,
    val provider: AuthProvider,
    val providerId: String?,
    val joinedAt: Instant,
) {
    fun toContext(): UserContext = UserContext(
        id = id,
        email = email,
        name = name,
        phone = phone,
        role = role,
        status = status,
        sellerApprovalStatus = sellerApprovalStatus,
        joinedAt = joinedAt,
    )
}

data class MemberInternalCreateRequest(
    val email: String,
    val passwordHash: String,
    val name: String,
    val phone: String?,
    val role: UserRole,
    val provider: AuthProvider = AuthProvider.LOCAL,
    val providerId: String? = null,
)
