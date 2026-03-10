package com.shitcord67.legacy;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.util.Base64;

import androidx.activity.result.ActivityResult;
import androidx.core.content.ContextCompat;
import androidx.documentfile.provider.DocumentFile;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.util.StringUtil;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

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
    private static final String PREFS_NAME = "legacy_filesystem";
    private static final String PREFS_DOCUMENTS_TREE = "documents_tree_uri";

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
    public void selectDocumentsDirectory(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);
        startActivityForResult(call, intent, "documentsTreeCallback");
    }

    @ActivityCallback
    private void documentsTreeCallback(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }
        if (result.getResultCode() != Activity.RESULT_OK) {
            call.reject("Documents directory selection cancelled");
            return;
        }
        Intent data = result.getData();
        if (data == null || data.getData() == null) {
            call.reject("No documents directory selected");
            return;
        }
        Uri uri = data.getData();
        try {
            final int takeFlags = data.getFlags()
                & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            getContext().getContentResolver().takePersistableUriPermission(uri, takeFlags);
            saveDocumentsTreeUri(uri);
            JSObject resultObj = new JSObject();
            resultObj.put("uri", uri.toString());
            call.resolve(resultObj);
        } catch (Exception ex) {
            call.reject("Failed to persist documents directory access", ex);
        }
    }

    @PluginMethod
    public void getDocumentsDirectoryStatus(PluginCall call) {
        boolean available = getDocumentsTreeUri() != null;
        JSObject result = new JSObject();
        result.put("available", available);
        call.resolve(result);
    }

    @PluginMethod
    public void writeFile(PluginCall call) {
        String path = call.getString("path");
        String data = call.getString("data");
        String encoding = call.getString("encoding", "utf8");
        String directory = call.getString("directory");
        if (path == null) {
            call.reject("Missing path");
            return;
        }
        if (data == null) {
            call.reject("Missing data");
            return;
        }

        if (isDocumentsDirectory(directory)) {
            writeDocumentsFile(call, path, data, encoding);
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
        String directory = call.getString("directory");
        if (path == null) {
            call.reject("Missing path");
            return;
        }

        if (isDocumentsDirectory(directory)) {
            readDocumentsFile(call, path, encoding);
            return;
        }

        File target = resolvePath(path);
        if (target == null || !target.exists()) {
            call.reject("File not found");
            return;
        }

        try {
            FileInputStream input = new FileInputStream(target);
            byte[] buffer = readAllBytes(input);
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
        String directory = call.getString("directory");
        if (path == null) {
            call.reject("Missing path");
            return;
        }
        if (isDocumentsDirectory(directory)) {
            deleteDocumentsFile(call, path);
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
        String directory = call.getString("directory");
        if (path == null) {
            call.reject("Missing path");
            return;
        }
        if (isDocumentsDirectory(directory)) {
            mkdirDocuments(call, path);
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
        String directory = call.getString("directory");
        if (path == null) {
            call.reject("Missing path");
            return;
        }
        if (isDocumentsDirectory(directory)) {
            statDocuments(call, path);
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

    private boolean isDocumentsDirectory(String directory) {
        if (directory == null) return false;
        return "DOCUMENTS".equalsIgnoreCase(directory);
    }

    private Uri getDocumentsTreeUri() {
        String raw = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(PREFS_DOCUMENTS_TREE, null);
        if (StringUtil.isNullOrEmpty(raw)) {
            return null;
        }
        return Uri.parse(raw);
    }

    private void saveDocumentsTreeUri(Uri uri) {
        getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(PREFS_DOCUMENTS_TREE, uri.toString())
            .apply();
    }

    private List<String> splitPath(String path) {
        List<String> parts = new ArrayList<>();
        if (path == null) {
            return parts;
        }
        for (String chunk : path.split("/")) {
            if (!StringUtil.isNullOrEmpty(chunk)) {
                parts.add(chunk);
            }
        }
        return parts;
    }

    private DocumentFile ensureDocumentsDir(String path) {
        Uri treeUri = getDocumentsTreeUri();
        if (treeUri == null) {
            return null;
        }
        DocumentFile root = DocumentFile.fromTreeUri(getContext(), treeUri);
        if (root == null) {
            return null;
        }
        List<String> parts = splitPath(path);
        DocumentFile current = root;
        for (String part : parts) {
            DocumentFile next = current.findFile(part);
            if (next == null) {
                next = current.createDirectory(part);
            }
            if (next == null) {
                return null;
            }
            current = next;
        }
        return current;
    }

    private DocumentFile resolveDocumentsFile(String path) {
        Uri treeUri = getDocumentsTreeUri();
        if (treeUri == null) {
            return null;
        }
        DocumentFile root = DocumentFile.fromTreeUri(getContext(), treeUri);
        if (root == null) {
            return null;
        }
        List<String> parts = splitPath(path);
        DocumentFile current = root;
        for (int i = 0; i < parts.size(); i += 1) {
            String part = parts.get(i);
            DocumentFile next = current.findFile(part);
            if (next == null) {
                return null;
            }
            current = next;
        }
        return current;
    }

    private void writeDocumentsFile(PluginCall call, String path, String data, String encoding) {
        Uri treeUri = getDocumentsTreeUri();
        if (treeUri == null) {
            call.reject("Documents directory access not granted");
            return;
        }
        List<String> parts = splitPath(path);
        if (parts.isEmpty()) {
            call.reject("Invalid path");
            return;
        }
        String filename = parts.remove(parts.size() - 1);
        DocumentFile parent = parts.isEmpty() ? DocumentFile.fromTreeUri(getContext(), treeUri)
            : ensureDocumentsDir(joinParts(parts));
        if (parent == null) {
            call.reject("Failed to resolve Documents directory");
            return;
        }
        DocumentFile target = parent.findFile(filename);
        if (target == null) {
            target = parent.createFile("application/json", filename);
        }
        if (target == null) {
            call.reject("Failed to create file in Documents");
            return;
        }
        try {
            byte[] payload = toBytes(data, encoding);
            OutputStream output = getContext().getContentResolver().openOutputStream(target.getUri(), "wt");
            if (output == null) {
                call.reject("Failed to open file for writing");
                return;
            }
            output.write(payload);
            output.flush();
            output.close();
            JSObject result = new JSObject();
            result.put("uri", target.getUri().toString());
            call.resolve(result);
        } catch (IOException ex) {
            call.reject("Failed to write Documents file", ex);
        }
    }

    private void readDocumentsFile(PluginCall call, String path, String encoding) {
        DocumentFile target = resolveDocumentsFile(path);
        if (target == null || !target.exists()) {
            call.reject("File not found");
            return;
        }
        try {
            InputStream input = getContext().getContentResolver().openInputStream(target.getUri());
            if (input == null) {
                call.reject("Failed to open file");
                return;
            }
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
            call.reject("Failed to read Documents file", ex);
        }
    }

    private void deleteDocumentsFile(PluginCall call, String path) {
        DocumentFile target = resolveDocumentsFile(path);
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

    private void mkdirDocuments(PluginCall call, String path) {
        DocumentFile target = ensureDocumentsDir(path);
        if (target == null) {
            call.reject("Failed to create Documents directory");
            return;
        }
        call.resolve(new JSObject());
    }

    private void statDocuments(PluginCall call, String path) {
        DocumentFile target = resolveDocumentsFile(path);
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

    private String joinParts(List<String> parts) {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < parts.size(); i += 1) {
            if (i > 0) {
                builder.append('/');
            }
            builder.append(parts.get(i));
        }
        return builder.toString();
    }

    private byte[] readAllBytes(InputStream input) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int read;
        while ((read = input.read(buffer)) != -1) {
            output.write(buffer, 0, read);
        }
        input.close();
        return output.toByteArray();
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
