package com.harsha.assistant.ai

data class HarshaAction(
    val type: Type,
    val value: String? = null,
    val requiresConfirmation: Boolean = false
) {
    enum class Type { OPEN_APP, OPEN_SETTINGS, GO_HOME, WEB_SEARCH, SPEAK, NONE }
}
