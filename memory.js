function sequenceId(prefix, records) {
  const maximum = records.reduce((max, record) => {
    const match = String(record.id || "").match(/-(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}-${String(maximum + 1).padStart(6, "0")}`;
}

export function timestamp() {
  return new Date().toISOString();
}

export function captureEvent(state, input, source = "user", channel = "console") {
  const event = {
    id: sequenceId("E", state.eventLedger),
    at: timestamp(),
    source,
    channel,
    input: String(input),
    privacy: "private",
    verificationClass: "verified",
    seedCandidateId: null
  };
  state.eventLedger.push(event);
  return event;
}

export function shouldBecomeSeedCandidate(input, intent = "unknown") {
  const text = String(input).trim();
  if (text.length < 18) return false;
  if (["capture_seed", "capture_note", "show_state", "show_brains", "show_rights",
       "show_seasons", "show_events", "show_candidates", "show_seeds",
       "winter_audit", "export", "clear_screen", "always", "help"].includes(intent)) {
    return false;
  }
  return /\b(idea|want|need|goal|build|improve|could|should|maybe|pattern|project|create|remember|protect|change)\b/i.test(text)
    || intent === "unknown";
}

export function captureSeedCandidate(state, text, eventId) {
  const candidate = {
    id: sequenceId("SC", state.seedCandidates),
    title: String(text).slice(0, 90),
    description: String(text),
    createdAt: timestamp(),
    updatedAt: timestamp(),
    sourceEventId: eventId,
    stage: "captured",
    status: "observed",
    verificationClass: "proposed",
    evidence: [],
    stewardApproval: false
  };
  state.seedCandidates.push(candidate);
  const event = state.eventLedger.find(item => item.id === eventId);
  if (event) event.seedCandidateId = candidate.id;
  return candidate;
}

export function captureSeed(state, text, eventId = null) {
  const seed = {
    id: sequenceId("S", state.seeds),
    title: String(text).slice(0, 90),
    description: String(text),
    createdAt: timestamp(),
    updatedAt: timestamp(),
    sourceEventId: eventId,
    maturityStage: "seed",
    status: "active",
    verificationClass: "proposed",
    evidence: [],
    promotionHistory: [],
    stewardApproval: false
  };
  state.seeds.push(seed);
  return seed;
}

export function captureNote(state, text, eventId = null) {
  const note = {
    id: sequenceId("N", state.notes),
    text: String(text),
    createdAt: timestamp(),
    sourceEventId: eventId,
    verificationClass: "verified"
  };
  state.notes.push(note);
  return note;
}

export function searchLocal(state, query) {
  const q = String(query).trim().toLowerCase();
  if (!q) return [];
  const results = [];

  for (const seed of state.seeds) {
    if (`${seed.title} ${seed.description}`.toLowerCase().includes(q)) {
      results.push({ type: `Seed ${seed.id}`, text: seed.description });
    }
  }

  for (const candidate of state.seedCandidates) {
    if (`${candidate.title} ${candidate.description}`.toLowerCase().includes(q)) {
      results.push({ type: `Candidate ${candidate.id}`, text: candidate.description });
    }
  }

  for (const note of state.notes) {
    if (note.text.toLowerCase().includes(q)) {
      results.push({ type: `Note ${note.id}`, text: note.text });
    }
  }

  for (const event of state.eventLedger.slice(-100)) {
    if (event.input.toLowerCase().includes(q)) {
      results.push({ type: `Event ${event.id}`, text: event.input });
    }
  }

  const workshop = [
    state.workshop.state,
    state.workshop.priority,
    state.workshop.nextFaithfulStone
  ].join(" ");

  if (workshop.toLowerCase().includes(q)) {
    results.push({ type: "Workshop", text: workshop });
  }

  return results.slice(0, 15);
}
