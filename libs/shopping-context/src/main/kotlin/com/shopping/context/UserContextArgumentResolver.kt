package com.shopping.context

import org.springframework.core.MethodParameter
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer

class MissingUserContextException :
    RuntimeException("$USER_CONTEXT_HEADER header is missing — gateway must inject this for authenticated requests.")

class UserContextArgumentResolver(private val codec: UserContextCodec) : HandlerMethodArgumentResolver {

    override fun supportsParameter(parameter: MethodParameter): Boolean =
        parameter.hasParameterAnnotation(AuthUser::class.java) &&
            parameter.parameterType == UserContext::class.java

    override fun resolveArgument(
        parameter: MethodParameter,
        mavContainer: ModelAndViewContainer?,
        webRequest: NativeWebRequest,
        binderFactory: WebDataBinderFactory?,
    ): UserContext {
        val header = webRequest.getHeader(USER_CONTEXT_HEADER)
            ?: throw MissingUserContextException()
        return codec.decode(header)
    }
}
