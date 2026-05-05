package com.shopping.service.auth.oauth.kakao

import com.shopping.service.auth.api.AuthenticationResponse
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

data class KakaoLoginRequest(
    @field:NotBlank val code: String,
)

data class KakaoAuthorizeUrlResponse(
    val url: String,
)

@RestController
@RequestMapping("/api/auth/oauth/kakao")
class KakaoAuthController(private val kakaoAuthService: KakaoAuthService) {

    @GetMapping("/authorize-url")
    fun authorizeUrl(@RequestParam(required = false) state: String?): KakaoAuthorizeUrlResponse =
        KakaoAuthorizeUrlResponse(url = kakaoAuthService.authorizeUrl(state))

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: KakaoLoginRequest): AuthenticationResponse =
        kakaoAuthService.loginWithCode(request.code)
}
