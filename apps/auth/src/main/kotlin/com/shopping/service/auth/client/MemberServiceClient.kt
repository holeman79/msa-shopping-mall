package com.shopping.service.auth.client

import com.shopping.context.AuthProvider
import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam

@FeignClient(name = "member-service")
interface MemberServiceClient {

    @GetMapping("/internal/members/by-email/{email}")
    fun findByEmail(@PathVariable email: String): MemberInternalView

    @GetMapping("/internal/members/by-provider")
    fun findByProvider(
        @RequestParam provider: AuthProvider,
        @RequestParam providerId: String,
    ): MemberInternalView

    @GetMapping("/internal/members/{id}")
    fun findById(@PathVariable id: Long): MemberInternalView

    @PostMapping("/internal/members")
    fun create(@RequestBody request: MemberInternalCreateRequest): MemberInternalView
}
