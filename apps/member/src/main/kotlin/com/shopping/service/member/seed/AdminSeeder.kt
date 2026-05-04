package com.shopping.service.member.seed

import com.shopping.service.member.config.AdminSeedProperties
import com.shopping.service.member.domain.Member
import com.shopping.service.member.domain.MemberRole
import com.shopping.service.member.domain.MemberStatus
import com.shopping.service.member.domain.SellerApprovalStatus
import com.shopping.service.member.repository.MemberRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class AdminSeeder(
    private val memberRepository: MemberRepository,
    private val passwordEncoder: PasswordEncoder,
    private val properties: AdminSeedProperties,
) : ApplicationRunner {

    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional
    override fun run(args: ApplicationArguments?) {
        if (memberRepository.existsByRole(MemberRole.ADMIN)) {
            return
        }
        val admin = Member(
            email = properties.email,
            passwordHash = passwordEncoder.encode(properties.password),
            name = properties.name,
            phone = null,
            role = MemberRole.ADMIN,
            status = MemberStatus.ACTIVE,
            sellerApprovalStatus = SellerApprovalStatus.NOT_APPLICABLE,
        )
        memberRepository.save(admin)
        log.warn("Seeded ADMIN account: email={} (change password immediately in non-dev envs)", properties.email)
    }
}
