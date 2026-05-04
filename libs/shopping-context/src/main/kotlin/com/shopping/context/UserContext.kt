package com.shopping.context

import java.time.Instant

enum class UserRole { CUSTOMER, SELLER, ADMIN }

enum class UserStatus { ACTIVE, DORMANT, WITHDRAWN }

enum class SellerApprovalStatus { NOT_APPLICABLE, PENDING, APPROVED, REJECTED }

data class UserContext(
    val id: Long,
    val email: String,
    val name: String,
    val phone: String?,
    val role: UserRole,
    val status: UserStatus,
    val sellerApprovalStatus: SellerApprovalStatus,
    val joinedAt: Instant,
)
