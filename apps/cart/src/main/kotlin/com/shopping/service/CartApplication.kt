package com.shopping.service

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients
import org.springframework.kafka.annotation.EnableKafka

@SpringBootApplication
@EnableFeignClients
@EnableKafka
class CartApplication

fun main(args: Array<String>) {
    runApplication<CartApplication>(*args)
}
