package com.shopping.service.member.api

import com.shopping.context.AuthUser
import com.shopping.context.UserContext
import com.shopping.service.member.service.MemberService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/members")
class MemberController(private val memberService: MemberService) {

    @GetMapping("/me")
    fun me(@AuthUser user: UserContext): UserContext = user

    @GetMapping
    fun list(): List<MemberResponse> = memberService.findAll()

    @GetMapping("/{id}")
    fun get(@PathVariable id: Long): MemberResponse = memberService.findById(id)
}
