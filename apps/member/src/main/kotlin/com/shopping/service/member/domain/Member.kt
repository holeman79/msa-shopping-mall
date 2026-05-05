package com.shopping.service.member.domain

import com.shopping.context.AuthProvider
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "members")
class Member(
    @Column(nullable = false, unique = true, length = 320)
    var email: String,

    @Column(name = "password_hash", nullable = false, length = 100)
    var passwordHash: String,

    @Column(nullable = false, length = 50)
    var name: String,

    @Column(length = 30)
    var phone: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var role: MemberRole,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: MemberStatus = MemberStatus.ACTIVE,

    @Enumerated(EnumType.STRING)
    @Column(name = "seller_approval_status", nullable = false, length = 20)
    var sellerApprovalStatus: SellerApprovalStatus = SellerApprovalStatus.NOT_APPLICABLE,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var provider: AuthProvider = AuthProvider.LOCAL,

    /** Kakao user id, Google sub 등 OAuth 발급 ID. LOCAL은 null. */
    @Column(name = "provider_id", length = 100)
    var providerId: String? = null,

    @Column(name = "joined_at", nullable = false)
    var joinedAt: Instant = Instant.now(),

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
)
