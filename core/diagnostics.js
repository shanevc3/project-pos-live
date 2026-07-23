export function summarizeCapabilities(capabilities) {
  const checks = [
    ["Secure context", capabilities.secureContext],
    ["Local storage", capabilities.localStorage],
    ["Speech recognition", capabilities.speechRecognition],
    ["Speech synthesis", capabilities.speechSynthesis],
    ["Service worker", capabilities.serviceWorker],
    ["Persistent storage API", capabilities.storageApi],
    ["Online", capabilities.online]
  ];

  const failures = checks.filter(([, value]) => value === false).map(([name]) => name);

  return {
    healthy: failures.length === 0,
    failures,
    checks: checks.map(([name, supported]) => ({ name, supported }))
  };
}

function testLocalStorage() {
  try {
    const key = "__project_pos_diagnostic__";
    localStorage.setItem(key, "ok");
    const result = localStorage.getItem(key) === "ok";
    localStorage.removeItem(key);
    return result;
  } catch {
    return false;
  }
}

export async function collectBrowserDiagnostics() {
  let storageEstimate = null;
  let persistent = null;

  if (navigator.storage?.estimate) {
    try {
      storageEstimate = await navigator.storage.estimate();
    } catch {
      storageEstimate = null;
    }
  }

  if (navigator.storage?.persisted) {
    try {
      persistent = await navigator.storage.persisted();
    } catch {
      persistent = null;
    }
  }

  const capabilities = {
    secureContext: Boolean(window.isSecureContext),
    localStorage: testLocalStorage(),
    speechRecognition: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    speechSynthesis: "speechSynthesis" in window,
    serviceWorker: "serviceWorker" in navigator,
    storageApi: Boolean(navigator.storage),
    online: navigator.onLine,
    standalone: Boolean(window.matchMedia("(display-mode: standalone)").matches || navigator.standalone),
    language: navigator.language || null,
    userAgent: navigator.userAgent,
    storageEstimate,
    persistent
  };

  return {
    at: new Date().toISOString(),
    capabilities,
    summary: summarizeCapabilities(capabilities)
  };
}

export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) {
    return { supported: false, granted: false, reason: "Persistent storage API is unavailable." };
  }

  try {
    const granted = await navigator.storage.persist();
    return {
      supported: true,
      granted,
      reason: granted
        ? "The browser granted persistent storage."
        : "The browser did not grant persistent storage."
    };
  } catch (error) {
    return { supported: true, granted: false, reason: error.message };
  }
}
