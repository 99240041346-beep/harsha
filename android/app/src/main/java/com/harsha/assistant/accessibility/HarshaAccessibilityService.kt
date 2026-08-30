package com.harsha.assistant.accessibility

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class HarshaAccessibilityService : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) { }
    override fun onInterrupt() = Unit
    fun findText(text: String): AccessibilityNodeInfo? = rootInActiveWindow?.findAccessibilityNodeInfosByText(text)?.firstOrNull()
}
