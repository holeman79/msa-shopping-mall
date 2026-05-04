package com.shopping.service.auth.api

import com.shopping.service.auth.service.DuplicateEmailException
import com.shopping.service.auth.service.InactiveMemberException
import com.shopping.service.auth.service.InvalidCredentialsException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.Instant

data class ErrorResponse(
    val timestamp: Instant,
    val status: Int,
    val code: String,
    val message: String,
    val details: Map<String, String>? = null,
)

@RestControllerAdvice
class AuthExceptionHandler {

    @ExceptionHandler(DuplicateEmailException::class)
    fun handleDuplicateEmail(e: DuplicateEmailException) =
        error(HttpStatus.CONFLICT, "DUPLICATE_EMAIL", e.message)

    @ExceptionHandler(InvalidCredentialsException::class)
    fun handleInvalidCredentials(e: InvalidCredentialsException) =
        error(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", e.message)

    @ExceptionHandler(InactiveMemberException::class)
    fun handleInactive(e: InactiveMemberException) =
        error(HttpStatus.FORBIDDEN, "INACTIVE_MEMBER", e.message)

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(e: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val details = e.bindingResult.fieldErrors.associate { it.field to (it.defaultMessage ?: "invalid") }
        val body = ErrorResponse(
            timestamp = Instant.now(),
            status = HttpStatus.BAD_REQUEST.value(),
            code = "VALIDATION_FAILED",
            message = "요청 값이 올바르지 않습니다.",
            details = details,
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body)
    }

    private fun error(status: HttpStatus, code: String, message: String?): ResponseEntity<ErrorResponse> {
        val body = ErrorResponse(
            timestamp = Instant.now(),
            status = status.value(),
            code = code,
            message = message ?: status.reasonPhrase,
        )
        return ResponseEntity.status(status).body(body)
    }
}
