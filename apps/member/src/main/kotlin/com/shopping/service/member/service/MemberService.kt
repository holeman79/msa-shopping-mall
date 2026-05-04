package com.shopping.service.member.service

import com.shopping.service.member.api.MemberResponse
import com.shopping.service.member.repository.MemberRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

class DuplicateEmailException(email: String) : RuntimeException("이미 가입된 이메일입니다: $email")
class MemberNotFoundException(id: Long) : RuntimeException("회원을 찾을 수 없습니다: $id")

@Service
class MemberService(private val memberRepository: MemberRepository) {

    @Transactional(readOnly = true)
    fun findById(id: Long): MemberResponse {
        val member = memberRepository.findById(id).orElseThrow { MemberNotFoundException(id) }
        return MemberResponse.from(member)
    }

    @Transactional(readOnly = true)
    fun findAll(): List<MemberResponse> =
        memberRepository.findAll().map(MemberResponse::from)
}
