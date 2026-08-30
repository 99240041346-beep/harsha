package com.harsha.assistant.cloud

import com.harsha.assistant.BuildConfig
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID
import kotlin.concurrent.thread

class HarshaCloudClient {
    fun sendCommand(command: String, bearerToken: String? = null, callback: (String) -> Unit) {
        thread {
            val result = try {
                val connection = URL(BuildConfig.HARSHA_API_URL).openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.connectTimeout = 10000
                connection.readTimeout = 15000
                connection.setRequestProperty("Content-Type", "application/json")
                bearerToken?.takeIf { it.isNotBlank() }?.let {
                    connection.setRequestProperty("Authorization", "Bearer $it")
                }
                connection.doOutput = true
                val safeCommand = command.replace("\\", "\\\\").replace("\"", "\\\"")
                val deviceId = UUID.randomUUID().toString()
                connection.outputStream.use { it.write("{\"command\":\"$safeCommand\",\"deviceId\":\"$deviceId\"}".toByteArray()) }
                val stream = if (connection.responseCode in 200..299) connection.inputStream else connection.errorStream
                stream?.bufferedReader()?.use { it.readText() } ?: "No response from HARSHA Cloud."
            } catch (e: Exception) {
                "Cloud connection failed: ${e.message ?: "unknown error"}"
            }
            callback(result)
        }
    }
}
