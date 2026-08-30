package com.harsha.assistant

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import com.harsha.assistant.commands.CommandRouter
import java.util.Locale

class MainActivity : Activity(), TextToSpeech.OnInitListener {
    private lateinit var speechRecognizer: SpeechRecognizer
    private lateinit var tts: TextToSpeech
    private lateinit var router: CommandRouter
    private lateinit var status: TextView
    private lateinit var response: TextView
    private lateinit var commandInput: EditText

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        status = findViewById(R.id.status)
        response = findViewById(R.id.response)
        commandInput = findViewById(R.id.commandInput)
        router = CommandRouter(this)
        tts = TextToSpeech(this, this)
        findViewById<Button>(R.id.speakButton).setOnClickListener { startListening() }
        findViewById<Button>(R.id.executeButton).setOnClickListener { executeCommand(commandInput.text.toString()) }
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), 100)
    }

    private fun startListening() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) { status.text = "Speech recognition unavailable."; return }
        if (!::speechRecognizer.isInitialized) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
            speechRecognizer.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) { status.text = "Listening…" }
                override fun onBeginningOfSpeech() { status.text = "Listening…" }
                override fun onEndOfSpeech() { status.text = "Processing…" }
                override fun onError(error: Int) { status.text = "Speech error. Try again." }
                override fun onResults(results: Bundle?) {
                    val text = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull().orEmpty()
                    commandInput.setText(text); executeCommand(text)
                }
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onRmsChanged(rmsdB: Float) {}
            })
        }
        speechRecognizer.startListening(Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak to HARSHA")
        })
    }

    private fun executeCommand(command: String) {
        val result = router.execute(command)
        response.text = result.message
        status.text = if (result.success) "Done" else "Needs attention"
        if (::tts.isInitialized) tts.speak(result.message, TextToSpeech.QUEUE_FLUSH, null, "harsha-response")
    }

    override fun onInit(statusCode: Int) { if (statusCode == TextToSpeech.SUCCESS) tts.language = Locale.getDefault() }
    override fun onDestroy() { if (::speechRecognizer.isInitialized) speechRecognizer.destroy(); if (::tts.isInitialized) tts.shutdown(); super.onDestroy() }
}
