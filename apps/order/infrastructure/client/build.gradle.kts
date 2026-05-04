plugins {
    kotlin("jvm")
    kotlin("plugin.spring")
    id("io.spring.dependency-management")
}

dependencies {
    implementation(project(":apps:order:domain"))
    implementation("org.springframework.cloud:spring-cloud-starter-openfeign")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
}
