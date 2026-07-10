package com.example.app;

import com.getcapacitor.BridgeActivity;
import android.widget.Toast;
import android.os.SystemClock;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {

    private long backPressedTime = 0;

    @Override
    public void onBackPressed() {
        WebView webView = bridge.getWebView();

        // Если в WebView есть история – возвращаемся на предыдущую страницу
        if (webView.canGoBack()) {
            webView.goBack();
            return;
        }

        // Если истории нет – обрабатываем двойное нажатие для выхода
        long currentTime = SystemClock.elapsedRealtime();
        if (backPressedTime + 2000 > currentTime) {
            super.onBackPressed(); // закрываем приложение
        } else {
            Toast.makeText(this, "Нажмите ещё раз для выхода", Toast.LENGTH_SHORT).show();
            backPressedTime = currentTime;
        }
    }
}