import { timestamp } from "./memory.js";

function nextId(prefix, records) {
  const max = records.reduce((current, record) => {
    const match = String(record.id || "").match(/-(\d+)$/);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}

export function createProject(state, name, eventId = null) {
  const project = {
    id: nextId("P", state.focus.projects),
    name: String(name).trim(),
    status: "active",
    createdAt: timestamp(),
    updatedAt: timestamp(),
    sourceEventId: eventId
  };
  state.focus.projects.push(project);
  return project;
}

export function createGoal(state, text, eventId = null) {
  const goal = {
    id: nextId("G", state.focus.goals),
    text: String(text).trim(),
    status: "active",
    createdAt: timestamp(),
    updatedAt: timestamp(),
    sourceEventId: eventId
  };
  state.focus.goals.push(goal);
  return goal;
}

export function setNextStone(state, text, eventId = null) {
  const previous = state.workshop.nextFaithfulStone;
  const record = {
    id: nextId("STONE", state.focus.nextStoneHistory),
    previous,
    next: String(text).trim(),
    changedAt: timestamp(),
    sourceEventId: eventId
  };
  state.focus.nextStoneHistory.push(record);
  state.workshop.nextFaithfulStone = record.next;
  return record;
}

export function focusSummary(state) {
  return {
    projects: state.focus.projects.filter(item => item.status === "active"),
    goals: state.focus.goals.filter(item => item.status === "active"),
    nextFaithfulStone: state.workshop.nextFaithfulStone
  };
}
