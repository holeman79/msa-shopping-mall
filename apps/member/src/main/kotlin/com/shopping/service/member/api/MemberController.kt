package com.shopping.service.member.api

import com.shopping.service.member.service.MemberService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/members")
class MemberController(private val memberService: MemberService) {

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    fun signup(@Valid @RequestBody request: SignupRequest): MemberResponse =
        memberService.signup(request)

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): LoginResponse =
        memberService.login(request)

    @GetMapping("/me")
    fun me(@RequestHeader("X-User-Id") userId: Long): MemberResponse =
        memberService.findById(userId)

    @GetMapping
    fun list(): List<MemberResponse> = memberService.findAll()

    @GetMapping("/{id}")
    fun get(@PathVariable id: Long): MemberResponse = memberService.findById(id)
}
