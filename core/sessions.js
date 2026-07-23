import { timestamp } from "./memory.js";

function nextId(records) {
  const max = records.reduce((current, record) => {
    const match = String(record.id || "").match(/-(\d+)$/);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 0);
  return `SESSION-${String(max + 1).padStart(4, "0")}`;
}

export function openWorkshopSession(state, title, eventId = null) {
  if (state.sessions.active) {
    return { opened: false, reason: "A Workshop session is already open.", session: state.sessions.active };
  }

  const session = {
    id: nextId(state.sessions.archive),
    title: String(title || "Untitled Workshop Session").trim(),
    openedAt: timestamp(),
    closedAt: null,
    openingEventId: eventId,
    closingEventId: null,
    openingCounts: {
      events: state.eventLedger.length,
      seeds: state.seeds.length,
      candidates: state.seedCandidates.length,
      notes: state.notes.length
    },
    closingCounts: null,
    nextFaithfulStone: null
  };

  state.sessions.active = session;
  return { opened: true, session };
}

export function closeWorkshopSession(state, eventId = null) {
  if (!state.sessions.active) {
    return { closed: false, reason: "No Workshop session is open." };
  }

  const session = {
    ...state.sessions.active,
    closedAt: timestamp(),
    closingEventId: eventId,
    closingCounts: {
      events: state.eventLedger.length,
      seeds: state.seeds.length,
      candidates: state.seedCandidates.length,
      notes: state.notes.length
    },
    nextFaithfulStone: state.workshop.nextFaithfulStone
  };

  state.sessions.archive.push(session);
  state.sessions.active = null;

  return {
    closed: true,
    session,
    markdown: sessionMarkdown(session)
  };
}

export function sessionMarkdown(session) {
  const delta = (key) =>
    (session.closingCounts?.[key] || 0) - (session.openingCounts?.[key] || 0);

  return `# Project P.O.S. — Workshop Session Capsule

**Session ID:** ${session.id}
**Title:** ${session.title}
**Opened:** ${session.openedAt}
**Closed:** ${session.closedAt}

## Activity Preserved

- New events: ${delta("events")}
- New seeds: ${delta("seeds")}
- New Seed Candidates: ${delta("candidates")}
- New notes: ${delta("notes")}

## Next Faithful Stone

${session.nextFaithfulStone || "Not named."}

## Integrity Note

This capsule was generated from the local Project P.O.S. state. It is not a transcript.
`;
}
