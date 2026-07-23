import { rightsSummary, constitutionalGuard } from "./core/constitution.js";
import { loadState, saveState, migrateState, resetLocalState } from "./core/state.js";
import {
  captureEvent, captureSeedCandidate, captureSeed, captureNote,
  shouldBecomeSeedCandidate, searchLocal
} from "./core/memory.js";
import {
  SEASONS, requestAction, runWinterAudit,
  createChangeProposal, decideProposal
} from "./core/governance.js";
import {
  normalizeCommand, applyAlias, classifyCommand, nextHealthyFaithfulStep
} from "./core/executive.js";
import {
  createProject, createGoal, setNextStone, focusSummary
} from "./core/focus.js";
import {
  openWorkshopSession, closeWorkshopSession
} from "./core/sessions.js";
import {
  PRIVATE_TEST_CHECKLIST, startPrivateTest, recordTestResult,
  currentTestRun, testReportMarkdown
} from "./core/testing.js";
import {
  createRecoveryBundle, verifyRecoveryBundle, backupHealth
} from "./core/recovery.js";
import {
  collectBrowserDiagnostics, requestPersistentStorage
} from "./core/diagnostics.js";

const els = {
  console: document.getElementById("console"),
  voiceButton: document.getElementById("voiceButton"),
  status: document.getElementById("status"),
  response: document.getElementById("response"),
  results: document.getElementById("results"),
  form: document.getElementById("commandForm"),
  input: document.getElementById("commandInput"),
  menuButton: document.getElementById("menuButton"),
  controls: document.getElementById("controls"),
  importInput: document.getElementById("importInput"),
  eraseButton: document.getElementById("eraseButton"),
  privacyShield: document.getElementById("privacyShield"),
  resumeButton: document.getElementById("resumeButton")
};

let state = loadState();
let recognition = null;
let isListening = false;

function timestamp() {
  return new Date().toISOString();
}

function recordHistory(input, intent, outcome, eventId) {
  state.history.push({ at: timestamp(), input, intent, outcome, eventId });
  if (state.history.length > 300) state.history = state.history.slice(-300);
  saveState(state);
}

function setStatus(message, listening = false) {
  els.status.textContent = message;
  els.voiceButton.classList.toggle("listening", listening);
}

function applyAccessibility() {
  document.documentElement.classList.toggle("reduce-motion", state.accessibility.reduceMotion);
  document.documentElement.classList.toggle("text-large", state.accessibility.textScale === "large");
}

function applyPrivacyShield() {
  els.privacyShield.classList.toggle("hidden", !state.privacy.displayShield);
}

function speak(text) {
  if (!state.settings.voiceOutput || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = Number(state.settings.voiceRate) || 0.88;
  utterance.pitch = Number(state.settings.voicePitch) || 0.9;
  utterance.volume = 0.9;

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(voice =>
    /^en/i.test(voice.lang) &&
    /samantha|daniel|alex|serena|ava/i.test(voice.name)
  ) || voices.find(voice => /^en/i.test(voice.lang));

  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

function respond(text, shouldSpeak = true) {
  els.response.textContent = text;
  if (shouldSpeak) speak(text);
}

function clearResults() {
  els.results.innerHTML = "";
}

function addResult(label, text) {
  const item = document.createElement("article");
  item.className = "result";
  const small = document.createElement("small");
  small.textContent = label;
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  item.append(small, paragraph);
  els.results.appendChild(item);
}

function downloadText(filename, text, type = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportRecovery() {
  const bundle = await createRecoveryBundle(state);
  state.backup.lastExportAt = bundle.exportedAt;
  state.backup.exportCount += 1;
  saveState(state);
  downloadText(
    `project-pos-recovery-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(bundle, null, 2),
    "application/json"
  );
  return bundle;
}

function openWebSearch(query) {
  const encoded = encodeURIComponent(query);
  const url = state.settings.webSearchEngine === "google"
    ? `https://www.google.com/search?q=${encoded}`
    : `https://duckduckgo.com/?q=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function showHelp() {
  const commands = [
    ["Orientation", "show state"],
    ["Focus", "show focus"],
    ["Project", "create project [name]"],
    ["Goal", "set goal [text]"],
    ["Next stone", "set next stone [text]"],
    ["Session", "open session [title] / close session"],
    ["Private test", "start private test"],
    ["Test result", "test pass 1 / test fail 9 [notes]"],
    ["Diagnostics", "show system status"],
    ["Architecture", "show brains"],
    ["Rights", "show rights"],
    ["Memory", "show event ledger"],
    ["Seed", "capture seed [idea]"],
    ["Proposal", "propose change [description]"],
    ["Maintenance", "run winter audit"],
    ["Privacy", "privacy shield"],
    ["Backup", "export recovery"],
    ["Adaptation", "when I say [phrase], I mean [command]"]
  ];
  commands.forEach(([label, text]) => addResult(label, text));
  respond("These are the current command patterns.", false);
}

function showFocus() {
  const focus = focusSummary(state);
  addResult("Next faithful stone", focus.nextFaithfulStone);
  focus.projects.forEach(project => addResult(`${project.id} · Project`, project.name));
  focus.goals.forEach(goal => addResult(`${goal.id} · Goal`, goal.text));
  respond("The current focus is visible.", false);
}

function showTestChecklist() {
  const run = currentTestRun(state);
  const results = run?.results || PRIVATE_TEST_CHECKLIST.map((label, index) => ({
    step: index + 1,
    label,
    status: "not started",
    notes: ""
  }));
  results.forEach(result => {
    addResult(`${result.step} · ${result.status}`, `${result.label}${result.notes ? ` — ${result.notes}` : ""}`);
  });
  respond(run ? `Test ${run.id} is ${run.status}.` : "No private test has started.", false);
}

function archiveLastCapture() {
  const candidates = [
    ...state.seeds.map(item => ({ type: "Seed", item, date: item.createdAt })),
    ...state.seedCandidates.map(item => ({ type: "Candidate", item, date: item.createdAt })),
    ...state.notes.map(item => ({ type: "Note", item, date: item.createdAt }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const latest = candidates[0];
  if (!latest) return null;

  latest.item.status = "archived";
  latest.item.archivedAt = timestamp();
  latest.item.archiveReason = "Steward requested archive of last capture.";
  return latest;
}

function preserveBrowserError(kind, message, detail = "") {
  state.diagnostics.errors.push({
    id: `ERR-${String(state.diagnostics.errors.length + 1).padStart(4, "0")}`,
    at: timestamp(),
    kind,
    message: String(message || "Unknown error"),
    detail: String(detail || "").slice(0, 2000)
  });
  if (state.diagnostics.errors.length > 100) {
    state.diagnostics.errors = state.diagnostics.errors.slice(-100);
  }
  saveState(state);
}

async function processCommand(rawInput) {
  const original = rawInput.trim();
  if (!original) return;

  clearResults();
  const event = captureEvent(state, original);
  const command = applyAlias(original, state.aliases);
  const classified = classifyCommand(command);
  const intent = classified.intent;
  let outcome = "";

  try {
    switch (intent) {
      case "greeting":
        addResult(event.id, original);
        respond("Hello. Axiom is ready. Say help to view the current command patterns.");
        outcome = "Greeting acknowledged.";
        break;

      case "help":
        showHelp();
        outcome = "Displayed commands.";
        break;

      case "show_state":
        addResult("Workshop state", state.workshop.state);
        addResult("Current priority", state.workshop.priority);
        addResult("Next faithful stone", nextHealthyFaithfulStep(state));
        addResult("Version", `${state.system.appVersion} · ${state.system.releaseChannel}`);
        respond("The Workshop is oriented.", false);
        outcome = "Displayed project state.";
        break;

      case "show_focus":
        showFocus();
        outcome = "Displayed focus.";
        break;

      case "create_project": {
        const project = createProject(state, classified.payload, event.id);
        addResult(project.id, project.name);
        respond("Project preserved.");
        outcome = project.id;
        break;
      }

      case "create_goal": {
        const goal = createGoal(state, classified.payload, event.id);
        addResult(goal.id, goal.text);
        respond("Goal preserved.");
        outcome = goal.id;
        break;
      }

      case "set_next_stone": {
        const stone = setNextStone(state, classified.payload, event.id);
        addResult(stone.id, stone.next);
        respond("The next faithful stone is set.");
        outcome = stone.id;
        break;
      }

      case "show_brains":
        Object.entries(state.brains).forEach(([name, brain]) => {
          addResult(`${name[0].toUpperCase()}${name.slice(1)} Brain · ${brain.authority}`, brain.purpose);
        });
        respond("The four brains are aligned under constitutional authority.", false);
        outcome = "Displayed four brains.";
        break;

      case "show_rights":
        rightsSummary().forEach(line => {
          const [label, ...rest] = line.split(": ");
          addResult(label, rest.join(": "));
        });
        respond("The Root Rights Charter is active.", false);
        outcome = "Displayed root rights.";
        break;

      case "show_seasons":
        SEASONS.forEach(season => addResult(season.name, season.purpose));
        respond(`The current governance season is ${state.governance.season}.`, false);
        outcome = "Displayed seasons.";
        break;

      case "show_events":
        state.eventLedger.slice(-15).reverse().forEach(item => {
          addResult(`${item.id} · ${new Date(item.at).toLocaleString()}`, item.input);
        });
        respond(`${state.eventLedger.length} events are preserved.`, false);
        outcome = `Displayed ${state.eventLedger.length} events.`;
        break;

      case "show_candidates":
        if (!state.seedCandidates.length) {
          respond("No Seed Candidates are waiting.");
        } else {
          state.seedCandidates.slice(-15).reverse().forEach(candidate => {
            addResult(`${candidate.id} · ${candidate.status}`, candidate.description);
          });
          respond(`${state.seedCandidates.length} Seed Candidates are preserved.`, false);
        }
        outcome = `Displayed ${state.seedCandidates.length} candidates.`;
        break;

      case "show_seeds":
        if (!state.seeds.length) {
          respond("The Seed Vault is empty.");
        } else {
          state.seeds.slice(-15).reverse().forEach(seed => {
            addResult(`${seed.id} · ${seed.status}`, seed.description);
          });
          respond(`${state.seeds.length} seeds are preserved.`, false);
        }
        outcome = `Displayed ${state.seeds.length} seeds.`;
        break;

      case "system_status": {
        const report = await collectBrowserDiagnostics();
        state.diagnostics.lastCheckAt = report.at;
        state.diagnostics.lastReport = report;
        report.summary.checks.forEach(check => addResult(check.name, check.supported ? "Available" : "Unavailable"));
        addResult("Standalone mode", report.capabilities.standalone ? "Yes" : "No");
        addResult("Persistent storage", report.capabilities.persistent === true ? "Granted" : report.capabilities.persistent === false ? "Not granted" : "Unknown");
        addResult("Preserved errors", String(state.diagnostics.errors.length));
        respond(report.summary.healthy ? "The current environment passed all basic capability checks." : "Some capabilities are unavailable. Fallbacks remain active.", false);
        outcome = report.summary.healthy ? "Diagnostics healthy." : `${report.summary.failures.length} unavailable capabilities.`;
        break;
      }

      case "backup_status": {
        const health = backupHealth(state);
        addResult("Latest export", state.backup.lastExportAt || "Never");
        addResult("Export count", String(state.backup.exportCount));
        addResult("Status", health.message);
        respond(health.due ? "A recovery export is due." : "Backup health is within the current interval.", false);
        outcome = health.message;
        break;
      }

      case "show_proposals":
        if (!state.governance.proposals.length) {
          respond("No change proposals are waiting.");
        } else {
          state.governance.proposals.slice(-15).reverse().forEach(proposal => {
            addResult(`${proposal.id} · ${proposal.status}`, proposal.description);
          });
          respond(`${state.governance.proposals.length} proposals are preserved.`, false);
        }
        outcome = `Displayed ${state.governance.proposals.length} proposals.`;
        break;

      case "propose_change": {
        const proposal = createChangeProposal(state, classified.payload, event.id);
        addResult(proposal.id, proposal.description);
        respond("Change proposal preserved. No update was applied.");
        outcome = proposal.id;
        break;
      }

      case "approve_proposal":
      case "reject_proposal": {
        const decision = intent === "approve_proposal" ? "approved" : "rejected";
        const result = decideProposal(state, classified.proposalId, decision);
        if (!result.decided) {
          respond(result.reason);
          outcome = result.reason;
        } else {
          addResult(result.proposal.id, `${result.proposal.status}: ${result.proposal.description}`);
          respond(`Proposal ${decision}. No code was changed automatically.`);
          outcome = `${result.proposal.id} ${decision}`;
        }
        break;
      }

      case "open_session": {
        const result = openWorkshopSession(state, classified.payload, event.id);
        if (!result.opened) {
          respond(result.reason);
          outcome = result.reason;
        } else {
          addResult(result.session.id, result.session.title);
          respond("The Workshop session is open.");
          outcome = result.session.id;
        }
        break;
      }

      case "close_session": {
        const result = closeWorkshopSession(state, event.id);
        if (!result.closed) {
          respond(result.reason);
          outcome = result.reason;
        } else {
          downloadText(`${result.session.id}-${result.session.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`, result.markdown, "text/markdown;charset=utf-8");
          addResult(result.session.id, result.session.title);
          respond("The Workshop session is closed. A capsule has been prepared.");
          outcome = result.session.id;
        }
        break;
      }

      case "show_session":
        if (state.sessions.active) {
          addResult(state.sessions.active.id, `${state.sessions.active.title} · opened ${state.sessions.active.openedAt}`);
          respond("A Workshop session is open.", false);
        } else {
          const latest = state.sessions.archive.at(-1);
          if (latest) addResult(latest.id, `${latest.title} · closed ${latest.closedAt}`);
          respond(latest ? "No session is open. The latest closed session is shown." : "No Workshop session exists.", false);
        }
        outcome = "Displayed session state.";
        break;

      case "start_test": {
        const result = startPrivateTest(state);
        addResult(result.run.id, result.started ? "Private test started." : result.reason);
        showTestChecklist();
        outcome = result.run.id;
        break;
      }

      case "show_test_checklist":
        showTestChecklist();
        outcome = "Displayed test checklist.";
        break;

      case "record_test_result": {
        const result = recordTestResult(state, classified.step, classified.status, classified.notes);
        if (!result.recorded) {
          respond(result.reason);
          outcome = result.reason;
        } else {
          addResult(`Step ${result.result.step}`, `${result.result.status}: ${result.result.label}`);
          respond(result.remaining === 0 ? "The private test is complete." : `${result.remaining} test steps remain.`);
          outcome = `Step ${result.result.step} ${result.result.status}`;
        }
        break;
      }

      case "show_test_report":
        showTestChecklist();
        outcome = "Displayed test report.";
        break;

      case "export_test_report": {
        const run = currentTestRun(state);
        downloadText(`project-pos-private-test-${run?.id || "none"}.md`, testReportMarkdown(run), "text/markdown;charset=utf-8");
        respond("A private test report has been prepared.");
        outcome = run?.id || "No test";
        break;
      }

      case "winter_audit": {
        const audit = runWinterAudit(state);
        addResult(audit.id, audit.healthy ? "No structural fault detected." : `${audit.findings.length} findings.`);
        audit.findings.forEach((finding, index) => addResult(`Finding ${index + 1}`, finding));
        audit.recommendations.forEach((recommendation, index) => addResult(`Recommendation ${index + 1}`, recommendation));
        respond(audit.healthy ? "Winter found no structural fault." : "Winter found conditions requiring review.", false);
        outcome = audit.healthy ? "Audit healthy." : `${audit.findings.length} findings.`;
        break;
      }

      case "persistent_storage": {
        const result = await requestPersistentStorage();
        addResult("Persistent storage", result.reason);
        respond(result.granted ? "Persistent storage was granted." : "Persistent storage was not granted. Recovery exports remain necessary.", false);
        outcome = result.reason;
        break;
      }

      case "privacy_shield":
        state.privacy.displayShield = true;
        applyPrivacyShield();
        outcome = "Privacy shield enabled.";
        break;

      case "resume_display":
        state.privacy.displayShield = false;
        applyPrivacyShield();
        respond("Display restored.", false);
        outcome = "Display restored.";
        break;

      case "voice_setting":
        state.settings.voiceOutput = classified.value;
        respond(classified.value ? "Voice output enabled." : "Voice output disabled.", classified.value);
        outcome = classified.value ? "Voice on." : "Voice off.";
        break;

      case "motion_setting":
        state.accessibility.reduceMotion = classified.value;
        applyAccessibility();
        respond(classified.value ? "Reduced motion enabled." : "Reduced motion disabled.", false);
        outcome = classified.value ? "Reduce motion on." : "Reduce motion off.";
        break;

      case "text_setting":
        state.accessibility.textScale = classified.value;
        applyAccessibility();
        respond(`Text size set to ${classified.value}.`, false);
        outcome = classified.value;
        break;

      case "archive_last_capture": {
        const latest = archiveLastCapture();
        if (!latest) {
          respond("No captured record is available to archive.");
          outcome = "No capture.";
        } else {
          addResult(`${latest.type} ${latest.item.id}`, "Archived without erasing its history.");
          respond("The latest capture was archived.");
          outcome = latest.item.id;
        }
        break;
      }

      case "capture_seed": {
        const seed = captureSeed(state, classified.payload, event.id);
        addResult(seed.id, seed.description);
        respond("Seed preserved.");
        outcome = seed.id;
        break;
      }

      case "capture_note": {
        const note = captureNote(state, classified.payload, event.id);
        addResult(note.id, note.text);
        respond("The record is preserved.");
        outcome = note.id;
        break;
      }

      case "local_search": {
        const matches = searchLocal(state, classified.payload);
        if (!matches.length) {
          respond("No matching record was found.");
          outcome = "No matches.";
        } else {
          matches.forEach(match => addResult(match.type, match.text));
          respond(`${matches.length} matching records found.`, false);
          outcome = `${matches.length} matches.`;
        }
        break;
      }

      case "web_search":
        respond(`Opening a web search for ${classified.payload}.`);
        openWebSearch(classified.payload);
        outcome = classified.payload;
        break;

      case "teach_alias":
        state.aliases[classified.spoken] = classified.canonical;
        respond(`Understood. ${classified.spoken} now means ${classified.canonical}.`);
        outcome = `${classified.spoken} => ${classified.canonical}`;
        break;

      case "export": {
        const bundle = await exportRecovery();
        respond("An integrity-checked recovery bundle has been prepared.");
        outcome = bundle.integrity.payloadHash;
        break;
      }

      case "clear_screen":
        clearResults();
        respond("Ready.", false);
        outcome = "Screen cleared.";
        break;

      case "always":
        respond("Always.");
        outcome = "Always.";
        break;

      default: {
        if (shouldBecomeSeedCandidate(original, intent)) {
          const candidate = captureSeedCandidate(state, original, event.id);
          addResult(candidate.id, candidate.description);
          respond("The input is preserved. A Seed Candidate has emerged.");
          outcome = candidate.id;
        } else {
          addResult(event.id, original);
          respond("The input is preserved, but I do not yet recognize a command. Say help to view the current patterns.");
          outcome = "Preserved as event.";
        }
      }
    }
  } catch (error) {
    preserveBrowserError("command", error.message, error.stack || "");
    respond("A local error was preserved for diagnosis. No consequential action was completed.", false);
    outcome = `Error: ${error.message}`;
  }

  saveState(state);
  recordHistory(original, intent, outcome, event.id);
  els.input.value = "";
}

function configureRecognition() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    setStatus("Voice unavailable · touch or dictate");
    return null;
  }

  const instance = new Recognition();
  instance.lang = navigator.language || "en-US";
  instance.continuous = false;
  instance.interimResults = true;
  instance.maxAlternatives = 1;

  instance.onstart = () => {
    isListening = true;
    setStatus("Listening", true);
    els.response.textContent = "";
    clearResults();
  };

  instance.onresult = event => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      transcript += event.results[i][0].transcript;
    }
    els.response.textContent = transcript || "Listening";
    const finalResult = event.results[event.results.length - 1];
    if (finalResult?.isFinal) processCommand(transcript);
  };

  instance.onerror = event => {
    const messages = {
      "not-allowed": "Microphone or speech permission was not granted.",
      "service-not-allowed": "Speech recognition is unavailable in this app mode. Open the site in Safari or use touch and dictation.",
      "audio-capture": "No microphone input is available.",
      "no-speech": "No speech was detected.",
      "aborted": "Listening stopped."
    };
    const message = messages[event.error] || `Voice recognition failed: ${event.error}`;
    preserveBrowserError("speech-recognition", message, event.error);
    respond(message, false);
    setStatus("Ready");
  };

  instance.onend = () => {
    isListening = false;
    setStatus("Ready");
  };

  return instance;
}

function toggleListening() {
  if (!recognition) recognition = configureRecognition();
  if (!recognition) {
    els.input.focus();
    respond("Voice recognition is unavailable here. Use touch, typing, or the iPhone keyboard microphone.", false);
    return;
  }

  try {
    if (isListening) recognition.stop();
    else recognition.start();
  } catch (error) {
    preserveBrowserError("speech-state", error.message, error.stack || "");
    setStatus("Ready");
  }
}

els.voiceButton.addEventListener("click", toggleListening);

els.form.addEventListener("submit", event => {
  event.preventDefault();
  processCommand(els.input.value);
});

els.menuButton.addEventListener("click", () => {
  els.controls.classList.toggle("hidden");
});

els.controls.addEventListener("click", event => {
  const button = event.target.closest("[data-command]");
  if (button) processCommand(button.dataset.command);
});

els.resumeButton.addEventListener("click", () => {
  state.privacy.displayShield = false;
  saveState(state);
  applyPrivacyShield();
  respond("Display restored.", false);
});

els.importInput.addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const parsed = JSON.parse(await file.text());
    const verification = await verifyRecoveryBundle(parsed);

    if (!verification.legacy && !verification.valid) {
      throw new Error("Recovery integrity verification failed.");
    }

    state = migrateState(verification.legacy ? parsed : parsed.payload);
    saveState(state);
    applyAccessibility();
    applyPrivacyShield();

    respond(
      verification.legacy
        ? "Legacy recovery state imported. It had no integrity hash."
        : "Recovery bundle verified and imported."
    );
  } catch (error) {
    preserveBrowserError("import", error.message, error.stack || "");
    respond(`Import failed. ${error.message}`, false);
  } finally {
    event.target.value = "";
  }
});

els.eraseButton.addEventListener("click", () => {
  const approval = requestAction(state, { type: "delete_data", stewardApproval: true });
  if (!approval.allowed) {
    respond(approval.findings.join(" "), false);
    return;
  }

  const confirmed = window.prompt("Type ERASE to delete local Project P.O.S. browser data. GitHub and exported files are not affected.");
  if (confirmed !== "ERASE") {
    respond("Local deletion was cancelled.", false);
    return;
  }

  state = resetLocalState();
  applyAccessibility();
  applyPrivacyShield();
  clearResults();
  respond("Local Project P.O.S. data was erased. External artifacts were not changed.");
});

window.addEventListener("error", event => {
  preserveBrowserError("window-error", event.message, `${event.filename || ""}:${event.lineno || 0}:${event.colno || 0}`);
});

window.addEventListener("unhandledrejection", event => {
  preserveBrowserError("unhandled-rejection", event.reason?.message || String(event.reason), event.reason?.stack || "");
});

window.addEventListener("online", () => setStatus("Online"));
window.addEventListener("offline", () => setStatus("Offline · local functions remain"));

window.addEventListener("load", async () => {
  recognition = configureRecognition();
  constitutionalGuard(state, { type: "read" });
  applyAccessibility();
  applyPrivacyShield();
  saveState(state);

  try {
    const report = await collectBrowserDiagnostics();
    state.diagnostics.lastCheckAt = report.at;
    state.diagnostics.lastReport = report;
    saveState(state);
  } catch (error) {
    preserveBrowserError("startup-diagnostic", error.message, error.stack || "");
  }

  setTimeout(() => speak("A quiet pattern has emerged."), 450);
});
