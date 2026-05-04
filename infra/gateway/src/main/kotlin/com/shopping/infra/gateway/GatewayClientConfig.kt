package com.shopping.infra.gateway

import org.springframework.cloud.client.loadbalancer.LoadBalanced
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@Configuration
class GatewayClientConfig {

    @Bean
    @LoadBalanced
    fun loadBalancedWebClientBuilder(): WebClient.Builder = WebClient.builder()

    @Bean
    fun memberServiceWebClient(
        builder: WebClient.Builder,
        properties: UserContextProperties,
    ): WebClient = builder.baseUrl(properties.memberServiceBaseUrl).build()
}
