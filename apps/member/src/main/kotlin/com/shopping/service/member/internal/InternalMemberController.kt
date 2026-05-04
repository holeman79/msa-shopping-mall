package com.shopping.service.member.internal

import com.shopping.service.member.context.MemberContextMapper.toDomain
import com.shopping.service.member.domain.Member
import com.shopping.service.member.domain.MemberStatus
import com.shopping.service.member.domain.SellerApprovalStatus
import com.shopping.service.member.repository.MemberRepository
import com.shopping.service.member.service.DuplicateEmailException
import com.shopping.service.member.service.MemberNotFoundException
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

// Reachable only via Eureka-discovered service-to-service Feign calls.
// Gateway routes only /api/{slash}{slash} so /internal/{slash}{slash} is not exposed externally.
@RestController
@RequestMapping("/internal/members")
class InternalMemberController(private val memberRepository: MemberRepository) {

    @GetMapping("/by-email/{email}")
    @Transactional(readOnly = true)
    fun findByEmail(@PathVariable email: String): MemberInternalView {
        val member = memberRepository.findByEmail(email)
            ?: throw MemberByEmailNotFoundException(email)
        return MemberInternalView.from(member)
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    fun findById(@PathVariable id: Long): MemberInternalView {
        val member = memberRepository.findById(id).orElseThrow { MemberNotFoundException(id) }
        return MemberInternalView.from(member)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    fun create(@RequestBody request: MemberInternalCreateRequest): MemberInternalView {
        if (memberRepository.existsByEmail(request.email)) {
            throw DuplicateEmailException(request.email)
        }
        val role = request.role.toDomain()
        val member = Member(
            email = request.email,
            passwordHash = request.passwordHash,
            name = request.name,
            phone = request.phone,
            role = role,
            status = MemberStatus.ACTIVE,
            sellerApprovalStatus = if (role == com.shopping.service.member.domain.MemberRole.SELLER) {
                SellerApprovalStatus.APPROVED
            } else {
                SellerApprovalStatus.NOT_APPLICABLE
            },
        )
        return MemberInternalView.from(memberRepository.save(member))
    }
}

class MemberByEmailNotFoundException(email: String) :
    RuntimeException("이메일에 해당하는 회원이 없습니다: $email")
