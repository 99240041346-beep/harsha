package com.harsha.assistant.commands

import android.content.Context
import android.content.Intent
import android.net.Uri

data class CommandResult(val success: Boolean, val message: String)

class CommandRouter(private val context: Context) {
    fun execute(raw: String): CommandResult {
        val command = raw.trim().lowercase()
        if (command.isBlank()) return CommandResult(false, "I didn't hear a command.")
        return when {
            command.contains("open youtube") -> openPackage("com.google.android.youtube", "YouTube")
            command.contains("open chrome") -> openPackage("com.android.chrome", "Chrome")
            command.contains("open settings") -> { context.startActivity(Intent(android.provider.Settings.ACTION_SETTINGS).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }); CommandResult(true, "Opening Settings.") }
            command == "home" || command == "go home" -> { context.startActivity(Intent(Intent.ACTION_MAIN).apply { addCategory(Intent.CATEGORY_HOME); addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }); CommandResult(true, "Going home.") }
            command.startsWith("search web for ") -> { val query = raw.substringAfter("search web for ").trim(); if (query.isBlank()) CommandResult(false, "Tell me what to search for.") else { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/search?q=${Uri.encode(query)}")).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }); CommandResult(true, "Searching for $query.") } }
            else -> CommandResult(false, "I understood \"$raw\". AI tool execution will be enabled in the next stage.")
        }
    }
    private fun openPackage(pkg: String, name: String): CommandResult {
        val intent = context.packageManager.getLaunchIntentForPackage(pkg) ?: return CommandResult(false, "$name is not installed.")
        context.startActivity(intent.apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }); return CommandResult(true, "Opening $name.")
    }
}
