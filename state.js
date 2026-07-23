import { cloneRootRights, constitutionalGuard } from "./constitution.js";

export const STORAGE_KEY = "project-pos-axiom-console-v0.1.0";

export const DEFAULT_STATE = Object.freeze({
  schemaVersion: "0.2.0",
  project: "Project P.O.S.",
  user: { name: "Shane", role: "Steward" },
  system: {
    appVersion: "0.7.4",
    releaseChannel: "open-door-rc1",
    firstInstalledAt: null,
    lastOpenedAt: null
  },
  workshop: {
    state: "Open — Private Testing",
    priority: "Deploy Open Door through GitHub Pages and complete the first live iPhone test.",
    nextFaithfulStone: "Open the GitHub Pages URL, enter one command, refresh, and confirm local persistence."
  },
  focus: {
    projects: [],
    goals: [],
    nextStoneHistory: []
  },
  sessions: {
    active: null,
    archive: []
  },
  testing: {
    activeRun: null,
    runs: []
  },
  backup: {
    lastExportAt: null,
    exportCount: 0,
    reminderDays: 7
  },
  diagnostics: {
    lastCheckAt: null,
    lastReport: null,
    errors: []
  },
  privacy: {
    displayShield: false
  },
  accessibility: {
    reduceMotion: false,
    textScale: "normal"
  },
  brains: {
    constitution: { purpose: "Protect rights, privacy, agency, consent, and data ownership.", authority: "veto" },
    governance: { purpose: "Manage rules, audits, maintenance, change control, and consent gates.", authority: "gate" },
    memory: { purpose: "Preserve identified, timestamped, provenance-aware records.", authority: "record" },
    executive: { purpose: "Coordinate permitted outputs and identify the next healthy faithful step.", authority: "speak_last" }
  },
  constitution: {
    version: "1.0.0",
    rights: [],
    amendmentPolicy: "No silent weakening. Explicit versioned Steward approval is required."
  },
  governance: {
    season: "Spring",
    consequentialActionsRequireApproval: true,
    auditHistory: [],
    proposals: []
  },
  memory: {
    preservationRule: "Original records are not silently rewritten.",
    eventLedgerVersion: "1.0"
  },
  executive: {
    governingQuestion: "What is the healthier path?",
    finalOutputRule: "Speak last, never outrank Constitution or Governance."
  },
  canonVocabulary: [
    "Axiom", "Steward", "Workshop", "Seed Vault", "Canon", "Lantern",
    "Empty Chair", "Forest", "Cathedral", "Reality", "Time",
    "healthier path", "faithful stone", "Always"
  ],
  seeds: [],
  seedCandidates: [],
  notes: [],
  eventLedger: [],
  aliases: {},
  history: [],
  maintenance: {
    lastAuditAt: null,
    lastAuditHealthy: null,
    findings: []
  },
  settings: {
    voiceOutput: true,
    voiceRate: 0.88,
    voicePitch: 0.9,
    webSearchEngine: "duckduckgo"
  }
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeDefaults(defaultValue, suppliedValue) {
  if (Array.isArray(defaultValue)) {
    return Array.isArray(suppliedValue) ? suppliedValue : clone(defaultValue);
  }

  if (defaultValue && typeof defaultValue === "object") {
    const supplied = suppliedValue && typeof suppliedValue === "object" ? suppliedValue : {};
    const result = {};
    for (const key of Object.keys(defaultValue)) {
      result[key] = mergeDefaults(defaultValue[key], supplied[key]);
    }
    for (const key of Object.keys(supplied)) {
      if (!(key in result)) result[key] = supplied[key];
    }
    return result;
  }

  return suppliedValue === undefined ? defaultValue : suppliedValue;
}

export function migrateState(rawState) {
  const migrated = mergeDefaults(clone(DEFAULT_STATE), rawState || {});
  migrated.schemaVersion = "0.2.0";
  migrated.system.appVersion = "0.7.4";
  migrated.system.releaseChannel = "open-door-rc1";
  migrated.system.firstInstalledAt ||= new Date().toISOString();
  migrated.system.lastOpenedAt = new Date().toISOString();
  migrated.constitution.rights = cloneRootRights();
  constitutionalGuard(migrated, { type: "read" });
  return migrated;
}

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return migrateState(saved ? JSON.parse(saved) : null);
  } catch (error) {
    console.error("State load failed:", error);
    return migrateState(null);
  }
}

export function saveState(state) {
  const guard = constitutionalGuard(state, { type: "read" });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return guard;
}

export function resetLocalState() {
  localStorage.removeItem(STORAGE_KEY);
  return migrateState(null);
}
