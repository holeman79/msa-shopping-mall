package com.shopping.service.member.repository

import com.shopping.service.member.domain.Member
import com.shopping.service.member.domain.MemberRole
import org.springframework.data.jpa.repository.JpaRepository

interface MemberRepository : JpaRepository<Member, Long> {
    fun findByEmail(email: String): Member?
    fun existsByEmail(email: String): Boolean
    fun existsByRole(role: MemberRole): Boolean
}
