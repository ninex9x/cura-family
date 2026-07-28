package br.com.curafamilia.app;

import android.app.Activity;
import android.content.Intent;
import android.content.IntentSender;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions;
import com.google.mlkit.vision.documentscanner.GmsDocumentScanning;
import com.google.mlkit.vision.documentscanner.GmsDocumentScanningResult;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 81;
    private static final int DOCUMENT_SAVE_REQUEST = 82;
    private static final int DOCUMENT_SCAN_REQUEST = 83;
    private static final String APP_HOST = "app.local";
    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private byte[] pendingDocumentBytes;
    private File pendingDocumentFile;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(250, 249, 247));
        getWindow().setNavigationBarColor(Color.WHITE);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(250, 249, 247));
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!APP_HOST.equals(uri.getHost())) return super.shouldInterceptRequest(view, request);

                String path = uri.getPath();
                if (path == null || path.equals("/")) path = "/index.html";
                if (path.startsWith("/native-documents/")) {
                    return serveNativeDocument(path.substring("/native-documents/".length()));
                }
                path = path.substring(1);
                if (path.contains("..")) return notFoundResponse();

                try {
                    InputStream stream = getAssets().open("www/" + path);
                    Map<String, String> headers = new HashMap<>();
                    headers.put("Cache-Control", "no-store");
                    headers.put("Access-Control-Allow-Origin", "https://" + APP_HOST);
                    return new WebResourceResponse(mimeTypeFor(path), "UTF-8", 200, "OK", headers, stream);
                } catch (IOException error) {
                    return notFoundResponse();
                }
            }
        });
        webView.addJavascriptInterface(new DownloadBridge(), "CuraFamiliaAndroid");
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try {
                    startActivityForResult(params.createIntent(), FILE_CHOOSER_REQUEST);
                } catch (Exception error) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        webView.loadUrl("https://" + APP_HOST + "/index.html");
    }

    private final class DownloadBridge {
        @JavascriptInterface
        public void scanDocument() {
            runOnUiThread(() -> startDocumentScanner());
        }

        @JavascriptInterface
        public void saveStoredDocument(String documentId, String fileName, String mimeType) {
            File source = nativeDocumentFile(documentId);
            if (!source.isFile()) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Documento não encontrado", Toast.LENGTH_LONG).show());
                return;
            }
            runOnUiThread(() -> {
                pendingDocumentBytes = null;
                pendingDocumentFile = source;
                requestDocumentSave(fileName, mimeType);
            });
        }

        @JavascriptInterface
        public void saveDocument(String fileName, String mimeType, String dataUrl) {
            try {
                int separator = dataUrl.indexOf(',');
                if (separator < 0) throw new IllegalArgumentException("Invalid data URL");
                byte[] bytes = Base64.decode(dataUrl.substring(separator + 1), Base64.DEFAULT);
                runOnUiThread(() -> {
                    pendingDocumentBytes = bytes;
                    pendingDocumentFile = null;
                    requestDocumentSave(fileName, mimeType);
                });
            } catch (Exception error) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Não foi possível preparar o documento", Toast.LENGTH_LONG).show());
            }
        }
    }

    private void startDocumentScanner() {
        GmsDocumentScannerOptions options = new GmsDocumentScannerOptions.Builder()
            .setGalleryImportAllowed(false)
            .setResultFormats(GmsDocumentScannerOptions.RESULT_FORMAT_PDF)
            .setScannerMode(GmsDocumentScannerOptions.SCANNER_MODE_FULL)
            .build();

        GmsDocumentScanning.getClient(options)
            .getStartScanIntent(this)
            .addOnSuccessListener(intentSender -> {
                try {
                    startIntentSenderForResult(intentSender, DOCUMENT_SCAN_REQUEST, null, 0, 0, 0);
                } catch (IntentSender.SendIntentException error) {
                    notifyDocumentScanCancelled("Não foi possível abrir o digitalizador");
                }
            })
            .addOnFailureListener(error -> notifyDocumentScanCancelled("O digitalizador não está disponível neste aparelho"));
    }

    private void deliverScannedDocument(GmsDocumentScanningResult scanResult) {
        new Thread(() -> {
            try {
                GmsDocumentScanningResult.Pdf pdf = scanResult.getPdf();
                if (pdf == null) throw new IOException("Scanned PDF unavailable");

                String documentId = UUID.randomUUID().toString();
                File destination = nativeDocumentFile(documentId);
                File directory = destination.getParentFile();
                if (directory == null || (!directory.exists() && !directory.mkdirs())) {
                    throw new IOException("Could not create document directory");
                }
                try (
                    InputStream input = getContentResolver().openInputStream(pdf.getUri());
                    OutputStream output = new FileOutputStream(destination)
                ) {
                    if (input == null) throw new IOException("Scanned PDF unavailable");
                    byte[] buffer = new byte[16_384];
                    int read;
                    while ((read = input.read(buffer)) != -1) output.write(buffer, 0, read);
                }

                String fileName = "documento-digitalizado-" + System.currentTimeMillis() + ".pdf";
                String script = "window.CuraFamiliaReceiveScan && window.CuraFamiliaReceiveScan("
                    + JSONObject.quote(fileName) + ","
                    + JSONObject.quote("application/pdf") + ","
                    + JSONObject.quote(documentId) + ","
                    + destination.length() + ")";
                runOnUiThread(() -> {
                    if (webView != null) webView.evaluateJavascript(script, null);
                });
            } catch (Exception error) {
                notifyDocumentScanCancelled("Não foi possível processar o lote digitalizado");
            }
        }).start();
    }

    private File nativeDocumentFile(String documentId) {
        if (documentId == null || !documentId.matches("[0-9a-fA-F-]{36}")) {
            return new File(getFilesDir(), "invalid-document-id");
        }
        return new File(new File(getFilesDir(), "scanned-documents"), documentId + ".pdf");
    }

    private WebResourceResponse serveNativeDocument(String documentId) {
        File document = nativeDocumentFile(documentId);
        if (!document.isFile()) return notFoundResponse();
        try {
            Map<String, String> headers = new HashMap<>();
            headers.put("Cache-Control", "no-store");
            return new WebResourceResponse("application/pdf", null, 200, "OK", headers, new FileInputStream(document));
        } catch (IOException error) {
            return notFoundResponse();
        }
    }

    private void requestDocumentSave(String fileName, String mimeType) {
        String resolvedMimeType = mimeType == null || mimeType.isEmpty() ? "application/octet-stream" : mimeType.split(";", 2)[0];
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(resolvedMimeType);
        intent.putExtra(Intent.EXTRA_TITLE, fileName);
        startActivityForResult(intent, DOCUMENT_SAVE_REQUEST);
    }

    private void notifyDocumentScanCancelled(String message) {
        String script = "window.CuraFamiliaScanCancelled && window.CuraFamiliaScanCancelled("
            + JSONObject.quote(message == null ? "" : message) + ")";
        runOnUiThread(() -> {
            if (webView != null) webView.evaluateJavascript(script, null);
        });
    }

    private WebResourceResponse notFoundResponse() {
        return new WebResourceResponse(
            "text/plain",
            "UTF-8",
            404,
            "Not Found",
            new HashMap<>(),
            new ByteArrayInputStream(new byte[0])
        );
    }

    private String mimeTypeFor(String path) {
        String lowerPath = path.toLowerCase();
        if (lowerPath.endsWith(".html")) return "text/html";
        if (lowerPath.endsWith(".css")) return "text/css";
        if (lowerPath.endsWith(".js") || lowerPath.endsWith(".mjs")) return "text/javascript";
        if (lowerPath.endsWith(".json")) return "application/json";
        if (lowerPath.endsWith(".woff2")) return "font/woff2";
        if (lowerPath.endsWith(".png")) return "image/png";
        if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) return "image/jpeg";
        if (lowerPath.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == DOCUMENT_SCAN_REQUEST) {
            if (resultCode == RESULT_OK && data != null) {
                GmsDocumentScanningResult scanResult = GmsDocumentScanningResult.fromActivityResultIntent(data);
                if (scanResult != null && scanResult.getPdf() != null) {
                    deliverScannedDocument(scanResult);
                } else {
                    notifyDocumentScanCancelled("Nenhuma página foi digitalizada");
                }
            } else {
                notifyDocumentScanCancelled("");
            }
            return;
        }
        if (requestCode == DOCUMENT_SAVE_REQUEST) {
            if (resultCode == RESULT_OK && data != null && data.getData() != null && (pendingDocumentBytes != null || pendingDocumentFile != null)) {
                try (
                    OutputStream output = getContentResolver().openOutputStream(data.getData());
                    InputStream input = pendingDocumentFile == null ? null : new FileInputStream(pendingDocumentFile)
                ) {
                    if (output == null) throw new IOException("Output unavailable");
                    if (pendingDocumentBytes != null) {
                        output.write(pendingDocumentBytes);
                    } else if (input != null) {
                        byte[] buffer = new byte[16_384];
                        int read;
                        while ((read = input.read(buffer)) != -1) output.write(buffer, 0, read);
                    }
                    Toast.makeText(this, "Documento salvo", Toast.LENGTH_SHORT).show();
                } catch (IOException error) {
                    Toast.makeText(this, "Não foi possível salvar o documento", Toast.LENGTH_LONG).show();
                }
            }
            pendingDocumentBytes = null;
            pendingDocumentFile = null;
            return;
        }
        if (requestCode != FILE_CHOOSER_REQUEST || fileCallback == null) return;
        Uri[] result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
        fileCallback.onReceiveValue(result);
        fileCallback = null;
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
