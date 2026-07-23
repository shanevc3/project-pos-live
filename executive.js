export function normalizeCommand(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/^axiom[\s,:-]*/i, "")
    .replace(/[.!?]+$/g, "");
}

export function applyAlias(command, aliases = {}) {
  const normalized = normalizeCommand(command);
  const entries = Object.entries(aliases).sort(([a], [b]) => b.length - a.length);
  for (const [spoken, canonical] of entries) {
    if (normalized === spoken || normalized.startsWith(`${spoken} `)) {
      return normalized.replace(spoken, canonical);
    }
  }
  return normalized;
}

export function classifyCommand(command) {
  const teach = command.match(/^when i say (.+?),? i mean (.+)$/i);
  const seed = command.match(/^(?:capture|preserve|add) (?:a )?seed(?: called)?\s+(.+)$/i);
  const note = command.match(/^(?:remember|record note|capture note)\s+(.+)$/i);
  const localSearch = command.match(/^(?:search|find)(?: the)? (?:archive|records|database)(?: for)?\s+(.+)$/i);
  const webSearch = command.match(/^(?:search|look up|find)(?: the)? web(?: for)?\s+(.+)$/i);
  const project = command.match(/^(?:create|add) project\s+(.+)$/i);
  const goal = command.match(/^(?:set|add|create) goal\s+(.+)$/i);
  const stone = command.match(/^set (?:the )?next (?:faithful )?stone(?: to)?\s+(.+)$/i);
  const proposal = command.match(/^propose change\s+(.+)$/i);
  const approve = command.match(/^approve proposal\s+(prop-\d+)$/i);
  const reject = command.match(/^reject proposal\s+(prop-\d+)$/i);
  const openSession = command.match(/^open (?:workshop )?session(?: called)?\s+(.+)$/i);
  const testResult = command.match(/^test (pass|fail|skip)\s+(\d+)(?:\s+(.+))?$/i);

  if (/^(hello|hi|hey)(?: axiom)?$/.test(command)) return { intent: "greeting" };
  if (/^(good morning|good afternoon|good evening)(?: axiom)?$/.test(command)) return { intent: "greeting" };
  if (/^(help|commands|what can you do)$/.test(command)) return { intent: "help" };
  if (/^(show|open) (?:the )?(?:project )?state$/.test(command)) return { intent: "show_state" };
  if (/^(show|open) (?:the )?(?:focus|goals|projects)$/.test(command)) return { intent: "show_focus" };
  if (/^(show|open) (?:the )?(?:brains|four brains)$/.test(command)) return { intent: "show_brains" };
  if (/^(show|open) (?:the )?(?:rights|rights charter|constitution)$/.test(command)) return { intent: "show_rights" };
  if (/^(show|open) (?:the )?(?:seasons|forest seasons|living forest)$/.test(command)) return { intent: "show_seasons" };
  if (/^(show|open) (?:the )?(?:event ledger|events)$/.test(command)) return { intent: "show_events" };
  if (/^(show|open) (?:the )?(?:seed candidates|candidates)$/.test(command)) return { intent: "show_candidates" };
  if (/^(show|open) (?:the )?(?:seed vault|seeds)$/.test(command)) return { intent: "show_seeds" };
  if (/^(show|open) (?:the )?(?:system status|diagnostics)$/.test(command)) return { intent: "system_status" };
  if (/^(show|open) (?:the )?(?:backup status|backup health)$/.test(command)) return { intent: "backup_status" };
  if (/^(show|open) (?:the )?(?:proposals|change proposals)$/.test(command)) return { intent: "show_proposals" };
  if (/^(show|open) (?:the )?(?:current session|session)$/.test(command)) return { intent: "show_session" };
  if (/^(show|open) (?:the )?(?:test checklist)$/.test(command)) return { intent: "show_test_checklist" };
  if (/^(show|open) (?:the )?(?:test report)$/.test(command)) return { intent: "show_test_report" };
  if (/^start (?:the )?(?:private )?test$/.test(command)) return { intent: "start_test" };
  if (/^export test report$/.test(command)) return { intent: "export_test_report" };
  if (/^close (?:workshop )?session$/.test(command)) return { intent: "close_session" };
  if (/^(run|perform|start) (?:the )?(?:winter audit|maintenance audit|audit)$/.test(command)) return { intent: "winter_audit" };
  if (/^request persistent storage$/.test(command)) return { intent: "persistent_storage" };
  if (/^(privacy shield|privacy mode|hide screen)$/.test(command)) return { intent: "privacy_shield" };
  if (/^(resume display|show screen|leave privacy mode)$/.test(command)) return { intent: "resume_display" };
  if (/^voice (on|off)$/.test(command)) return { intent: "voice_setting", value: command.endsWith("on") };
  if (/^reduce motion (on|off)$/.test(command)) return { intent: "motion_setting", value: command.endsWith("on") };
  if (/^text size (large|normal)$/.test(command)) return { intent: "text_setting", value: command.endsWith("large") ? "large" : "normal" };
  if (/^(archive|undo) last capture$/.test(command)) return { intent: "archive_last_capture" };

  if (project) return { intent: "create_project", payload: project[1].trim() };
  if (goal) return { intent: "create_goal", payload: goal[1].trim() };
  if (stone) return { intent: "set_next_stone", payload: stone[1].trim() };
  if (proposal) return { intent: "propose_change", payload: proposal[1].trim() };
  if (approve) return { intent: "approve_proposal", proposalId: approve[1].toUpperCase() };
  if (reject) return { intent: "reject_proposal", proposalId: reject[1].toUpperCase() };
  if (openSession) return { intent: "open_session", payload: openSession[1].trim() };
  if (testResult) return {
    intent: "record_test_result",
    status: testResult[1].toLowerCase(),
    step: Number(testResult[2]),
    notes: testResult[3] || ""
  };
  if (seed) return { intent: "capture_seed", payload: seed[1].trim() };
  if (note) return { intent: "capture_note", payload: note[1].trim() };
  if (localSearch) return { intent: "local_search", payload: localSearch[1].trim() };
  if (webSearch) return { intent: "web_search", payload: webSearch[1].trim() };
  if (teach) return { intent: "teach_alias", spoken: normalizeCommand(teach[1]), canonical: normalizeCommand(teach[2]) };
  if (/^(export|download) (?:the )?(?:recovery|backup|state)$/.test(command)) return { intent: "export" };
  if (/^(clear|clear screen|reset screen)$/.test(command)) return { intent: "clear_screen" };
  if (/^(always)$/.test(command)) return { intent: "always" };
  return { intent: "unknown", payload: command };
}

export function nextHealthyFaithfulStep(state) {
  return state.workshop.nextFaithfulStone || "Observe the current state and name one concrete next action.";
}
