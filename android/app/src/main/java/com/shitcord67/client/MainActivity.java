package com.shitcord67.client;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.shitcord67.droidvendorssuck.DroidVendorsSuckPlugin;

import java.util.Locale;

public class MainActivity extends BridgeActivity {
    private Insets lastInsets = Insets.NONE;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(DroidVendorsSuckPlugin.class);
        super.onCreate(savedInstanceState);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams params = getWindow().getAttributes();
            // Keep content out of cutout/notch zones on all edges.
            params.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_NEVER;
            getWindow().setAttributes(params);
        }

        View root = findViewById(android.R.id.content);
        if (root == null) return;
        ViewCompat.setOnApplyWindowInsetsListener(root, (view, insets) -> {
            publishInsetsToWeb(insets);
            return insets;
        });
        root.post(() -> ViewCompat.requestApplyInsets(root));
        Bridge bridge = getBridge();
        if (bridge != null && bridge.getWebView() != null) {
            ViewCompat.setOnApplyWindowInsetsListener(bridge.getWebView(), (view, insets) -> {
                publishInsetsToWeb(insets);
                return insets;
            });
            bridge.getWebView().post(() -> ViewCompat.requestApplyInsets(bridge.getWebView()));
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        View root = findViewById(android.R.id.content);
        if (root != null) {
            root.post(() -> ViewCompat.requestApplyInsets(root));
        }
        Bridge bridge = getBridge();
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().post(() -> ViewCompat.requestApplyInsets(bridge.getWebView()));
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (!hasFocus) return;
        View root = findViewById(android.R.id.content);
        if (root != null) {
            ViewCompat.requestApplyInsets(root);
        }
        Bridge bridge = getBridge();
        if (bridge != null && bridge.getWebView() != null) {
            ViewCompat.requestApplyInsets(bridge.getWebView());
        }
    }

    private void publishInsetsToWeb(WindowInsetsCompat insetsCompat) {
        if (insetsCompat == null) return;
        final int insetMask = WindowInsetsCompat.Type.systemBars()
            | WindowInsetsCompat.Type.displayCutout()
            | WindowInsetsCompat.Type.systemGestures()
            | WindowInsetsCompat.Type.tappableElement();
        Insets visibleInsets = insetsCompat.getInsets(insetMask);
        Insets stableInsets = insetsCompat.getInsetsIgnoringVisibility(insetMask);
        int left = Math.max(visibleInsets.left, stableInsets.left);
        int top = Math.max(visibleInsets.top, stableInsets.top);
        int right = Math.max(visibleInsets.right, stableInsets.right);
        int bottom = Math.max(visibleInsets.bottom, stableInsets.bottom);
        Insets mergedInsets = Insets.of(left, top, right, bottom);
        if (mergedInsets.equals(lastInsets)) return;
        lastInsets = mergedInsets;

        Bridge bridge = getBridge();
        if (bridge == null || bridge.getWebView() == null) return;
        String script = String.format(
            Locale.US,
            "(function(){window.__shitcord67AndroidInsets={top:%d,right:%d,bottom:%d,left:%d};window.dispatchEvent(new Event('shitcord67:android-insets'));})();",
            mergedInsets.top,
            mergedInsets.right,
            mergedInsets.bottom,
            mergedInsets.left
        );
        bridge.getWebView().post(() -> bridge.getWebView().evaluateJavascript(script, null));
    }
}
