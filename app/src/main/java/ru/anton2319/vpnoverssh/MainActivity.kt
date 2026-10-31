package ru.anton2319.vpnoverssh

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.VpnService
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Native WebView loading bundled web UI assets
        webView = WebView(this).apply {
            setBackgroundColor(Color.parseColor("#060e09"))
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                cacheMode = WebSettings.LOAD_DEFAULT
            }

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                    return false
                }
            }

            webChromeClient = WebChromeClient()

            // Native Javascript Bridge for Android integration
            addJavascriptInterface(AndroidBridge(this@MainActivity), "AndroidBridge")
            loadUrl("file:///android_asset/web/index.html")
        }

        setContentView(webView)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    class AndroidBridge(private val activity: MainActivity) {
        @JavascriptInterface
        fun requestVpnPermission() {
            val intent = VpnService.prepare(activity)
            if (intent != null) {
                activity.startActivityForResult(intent, 0)
            } else {
                Toast.makeText(activity, "VPN Permission Granted", Toast.LENGTH_SHORT).show()
            }
        }

        @JavascriptInterface
        fun showToast(message: String) {
            Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
        }

        @JavascriptInterface
        fun triggerHaptic(durationMs: Long) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = activity.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator?.vibrate(
                    VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else {
                @Suppress("DEPRECATION")
                val vibrator = activity.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                vibrator?.vibrate(durationMs)
            }
        }
    }
}
