package com.example.app;

import com.getcapacitor.BridgeActivity;
import android.widget.Toast;
import android.os.SystemClock;
import android.webkit.WebView;
import android.os.Build;
import android.os.Bundle; // <- ДОБАВИТЬ ЭТОТ ИМПОРТ
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.View;

public class MainActivity extends BridgeActivity {

    private long backPressedTime = 0;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Настройка прозрачных системных баров
        setupSystemBars();
    }

    private void setupSystemBars() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+ (API 30+)
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                // Показываем системные бары
                controller.show(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                // Поведение - прозрачные бары
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            // Android 4.4 - 10 (API 19-29)
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR // убираем, если хотим темный статус бар
            );
        }
    }

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