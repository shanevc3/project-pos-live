function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = sortValue(value[key]);
      return result;
    }, {});
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(sortValue(value));
}

export async function sha256Text(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createRecoveryBundle(state) {
  const payload = JSON.parse(JSON.stringify(state));
  const hash = await sha256Text(canonicalJson(payload));

  return {
    format: "project-pos-recovery-bundle",
    formatVersion: "1.0",
    appVersion: state.system.appVersion,
    exportedAt: new Date().toISOString(),
    payload,
    integrity: {
      algorithm: "SHA-256",
      payloadHash: hash,
      note: "Integrity detects accidental change. It is not encryption or identity proof."
    }
  };
}

export async function verifyRecoveryBundle(bundle) {
  if (!bundle || bundle.format !== "project-pos-recovery-bundle" || !bundle.payload) {
    return { valid: false, legacy: true, reason: "Legacy raw state or unrecognized bundle." };
  }

  const actual = await sha256Text(canonicalJson(bundle.payload));
  return {
    valid: actual === bundle.integrity?.payloadHash,
    legacy: false,
    expected: bundle.integrity?.payloadHash || null,
    actual
  };
}

export function backupHealth(state, now = new Date()) {
  const last = state.backup.lastExportAt ? new Date(state.backup.lastExportAt) : null;
  const reminderDays = Number(state.backup.reminderDays) || 7;

  if (!last || Number.isNaN(last.getTime())) {
    return {
      healthy: false,
      due: true,
      message: "No recovery export has been recorded."
    };
  }

  const elapsedDays = Math.floor((now.getTime() - last.getTime()) / 86400000);
  return {
    healthy: elapsedDays < reminderDays,
    due: elapsedDays >= reminderDays,
    elapsedDays,
    message: elapsedDays >= reminderDays
      ? `The latest recovery export is ${elapsedDays} days old.`
      : `The latest recovery export is ${elapsedDays} days old.`
  };
}
