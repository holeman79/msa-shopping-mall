package com.shopping.context

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.boot.autoconfigure.AutoConfiguration
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass
import org.springframework.context.annotation.Bean
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@AutoConfiguration
@ConditionalOnClass(WebMvcConfigurer::class)
class UserContextAutoConfiguration {

    @Bean
    fun userContextCodec(objectMapper: ObjectMapper): UserContextCodec = UserContextCodec(objectMapper)

    @Bean
    fun userContextWebMvcConfigurer(codec: UserContextCodec): WebMvcConfigurer = object : WebMvcConfigurer {
        override fun addArgumentResolvers(resolvers: MutableList<org.springframework.web.method.support.HandlerMethodArgumentResolver>) {
            resolvers.add(UserContextArgumentResolver(codec))
        }
    }
}
