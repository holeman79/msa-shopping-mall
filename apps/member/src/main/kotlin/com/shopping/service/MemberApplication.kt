package com.shopping.service

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients
import org.springframework.kafka.annotation.EnableKafka

@SpringBootApplication
@EnableFeignClients
@EnableKafka
class MemberApplication

fun main(args: Array<String>) {
    runApplication<MemberApplication>(*args)
}
