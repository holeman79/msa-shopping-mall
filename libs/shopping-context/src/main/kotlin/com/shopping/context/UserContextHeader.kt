package com.shopping.context

import com.fasterxml.jackson.databind.ObjectMapper
import java.util.Base64

const val USER_CONTEXT_HEADER = "X-User-Context"

class UserContextCodec(private val objectMapper: ObjectMapper) {
    private val encoder = Base64.getUrlEncoder().withoutPadding()
    private val decoder = Base64.getUrlDecoder()

    fun encode(context: UserContext): String {
        val json = objectMapper.writeValueAsBytes(context)
        return encoder.encodeToString(json)
    }

    fun decode(headerValue: String): UserContext {
        val json = decoder.decode(headerValue)
        return objectMapper.readValue(json, UserContext::class.java)
    }
}
