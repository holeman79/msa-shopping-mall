rootProject.name = "msa-shopping-mall"

include(
    "infra:gateway",
    "infra:discovery",
    "infra:config",
    "apps:member",
    "apps:product",
    "apps:payment",
    "apps:cart",
    "apps:order:boot",
    "apps:order:domain",
    "apps:order:application",
    "apps:order:infrastructure:db",
    "apps:order:infrastructure:client",
)
