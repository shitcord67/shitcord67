# Offline Documentation Mirror

Attempted on 2026-03-04 to mirror:
- Android docs (`developer.android.com`)
- Capacitor Android docs (`capacitorjs.com/docs/android`)
- Chromium developer docs (`developer.chrome.com/docs`)
- Electron docs (`electronjs.org/docs/latest`)

Result in this environment: DNS/network resolution failed inside the sandbox, so a full local mirror could not be downloaded.

Use this command in a network-enabled environment to fetch/update:

```bash
bash scripts/download-offline-docs.sh
```

Primary official entrypoints:
- https://developer.android.com/guide
- https://capacitorjs.com/docs/android
- https://developer.chrome.com/docs/
- https://www.electronjs.org/docs/latest/
