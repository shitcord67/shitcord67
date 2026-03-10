package com.shitcord67.legacy;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Base64;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

@CapacitorPlugin(
    name = "LegacyFilesystem",
    permissions = {
        @Permission(strings = { Manifest.permission.READ_EXTERNAL_STORAGE }, alias = LegacyFilesystemPlugin.PERMISSION_READ),
        @Permission(strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE }, alias = LegacyFilesystemPlugin.PERMISSION_WRITE)
    }
)
public class LegacyFilesystemPlugin extends Plugin {
    static final String PERMISSION_READ = "read";
    static final String PERMISSION_WRITE = "write";

    @PluginMethod
    public void getPermissions(PluginCall call) {
        JSObject result = new JSObject();
        String read = hasReadPermission() ? "granted" : "denied";
        String write = hasWritePermission() ? "granted" : "denied";
        result.put("read", read);
        result.put("write", write);
        result.put("publicStorage", "granted".equals(read) ? "granted" : write);
        call.resolve(result);
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        getPermissions(call);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            JSObject result = new JSObject();
            result.put("read", "granted");
            result.put("write", "granted");
            result.put("publicStorage", "granted");
            call.resolve(result);
            return;
        }

        JSArray permissions = call.getArray("permissions");
        boolean requestRead = true;
        boolean requestWrite = true;
        if (permissions != null) {
            requestRead = false;
            requestWrite = false;
            for (int i = 0; i < permissions.length(); i += 1) {
                String value = permissions.getString(i);
                if ("read".equals(value)) {
                    requestRead = true;
                }
                if ("write".equals(value)) {
                    requestWrite = true;
                }
            }
        }

        if (requestRead && requestWrite) {
            requestAllPermissions(call, "permissionCallback");
        } else if (requestWrite) {
            requestPermissionForAlias(PERMISSION_WRITE, call, "permissionCallback");
        } else if (requestRead) {
            requestPermissionForAlias(PERMISSION_READ, call, "permissionCallback");
        } else {
            String read = hasReadPermission() ? "granted" : "denied";
            String write = hasWritePermission() ? "granted" : "denied";
            JSObject result = new JSObject();
            result.put("read", read);
            result.put("write", write);
            result.put("publicStorage", "granted".equals(read) ? "granted" : write);
            call.resolve(result);
        }
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        JSObject result = new JSObject();
        String read = hasReadPermission() ? "granted" : "denied";
        String write = hasWritePermission() ? "granted" : "denied";
        result.put("read", read);
        result.put("write", write);
        result.put("publicStorage", "granted".equals(read) ? "granted" : write);
        call.resolve(result);
    }

    @PluginMethod
    public void writeFile(PluginCall call) {
        String path = call.getString("path");
        String data = call.getString("data");
        String encoding = call.getString("encoding", "utf8");
        if (path == null) {
            call.reject("Missing path");
            return;
        }
        if (data == null) {
            call.reject("Missing data");
            return;
        }

        File target = resolvePath(path);
        if (target == null) {
            call.reject("Invalid path");
            return;
        }

        try {
            File parent = target.getParentFile();
            if (parent != null && !parent.exists() && !parent.mkdirs()) {
                call.reject("Failed to create parent directory");
                return;
            }
            byte[] payload = toBytes(data, encoding);
            FileOutputStream output = new FileOutputStream(target, false);
            output.write(payload);
            output.flush();
            output.close();
            JSObject result = new JSObject();
            result.put("uri", target.toURI().toString());
            call.resolve(result);
        } catch (IOException ex) {
            call.reject("Failed to write file", ex);
        }
    }

    @PluginMethod
    public void readFile(PluginCall call) {
        String path = call.getString("path");
        String encoding = call.getString("encoding", "utf8");
        if (path == null) {
            call.reject("Missing path");
            return;
        }

        File target = resolvePath(path);
        if (target == null || !target.exists()) {
            call.reject("File not found");
            return;
        }

        try {
            FileInputStream input = new FileInputStream(target);
            byte[] buffer = new byte[(int) target.length()];
            int read = input.read(buffer);
            input.close();
            if (read < 0) {
                call.reject("Failed to read file");
                return;
            }
            JSObject result = new JSObject();
            result.put("data", fromBytes(buffer, encoding));
            call.resolve(result);
        } catch (IOException ex) {
            call.reject("Failed to read file", ex);
        }
    }

    @PluginMethod
    public void deleteFile(PluginCall call) {
        String path = call.getString("path");
        if (path == null) {
            call.reject("Missing path");
            return;
        }
        File target = resolvePath(path);
        if (target == null || !target.exists()) {
            call.reject("File not found");
            return;
        }
        if (!target.delete()) {
            call.reject("Failed to delete file");
            return;
        }
        call.resolve(new JSObject());
    }

    @PluginMethod
    public void mkdir(PluginCall call) {
        String path = call.getString("path");
        if (path == null) {
            call.reject("Missing path");
            return;
        }
        File target = resolvePath(path);
        if (target == null) {
            call.reject("Invalid path");
            return;
        }
        if (target.exists()) {
            call.resolve(new JSObject());
            return;
        }
        if (!target.mkdirs()) {
            call.reject("Failed to create directory");
            return;
        }
        call.resolve(new JSObject());
    }

    @PluginMethod
    public void stat(PluginCall call) {
        String path = call.getString("path");
        if (path == null) {
            call.reject("Missing path");
            return;
        }
        File target = resolvePath(path);
        if (target == null || !target.exists()) {
            call.reject("File not found");
            return;
        }
        JSObject result = new JSObject();
        result.put("size", target.length());
        result.put("mtime", target.lastModified());
        result.put("type", target.isDirectory() ? "directory" : "file");
        call.resolve(result);
    }

    private boolean hasReadPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return true;
        }
        Context context = getContext();
        return ContextCompat.checkSelfPermission(context, Manifest.permission.READ_EXTERNAL_STORAGE)
            == PackageManager.PERMISSION_GRANTED;
    }

    private boolean hasWritePermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return true;
        }
        Context context = getContext();
        return ContextCompat.checkSelfPermission(context, Manifest.permission.WRITE_EXTERNAL_STORAGE)
            == PackageManager.PERMISSION_GRANTED;
    }

    private File resolvePath(String path) {
        File file = new File(path);
        if (file.isAbsolute()) {
            return file;
        }
        return new File(getContext().getFilesDir(), path);
    }

    private byte[] toBytes(String data, String encoding) {
        if ("base64".equalsIgnoreCase(encoding)) {
            return Base64.decode(data, Base64.DEFAULT);
        }
        return data.getBytes();
    }

    private String fromBytes(byte[] data, String encoding) {
        if ("base64".equalsIgnoreCase(encoding)) {
            return Base64.encodeToString(data, Base64.NO_WRAP);
        }
        return new String(data);
    }
}
