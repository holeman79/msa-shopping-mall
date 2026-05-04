package com.shopping.service.auth.client

import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody

@FeignClient(name = "member-service")
interface MemberServiceClient {

    @GetMapping("/internal/members/by-email/{email}")
    fun findByEmail(@PathVariable email: String): MemberInternalView

    @GetMapping("/internal/members/{id}")
    fun findById(@PathVariable id: Long): MemberInternalView

    @PostMapping("/internal/members")
    fun create(@RequestBody request: MemberInternalCreateRequest): MemberInternalView
}
