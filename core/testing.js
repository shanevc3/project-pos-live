import { timestamp } from "./memory.js";

export const PRIVATE_TEST_CHECKLIST = Object.freeze([
  "App opens.",
  "Typed command works.",
  "Touch command works.",
  "State displays.",
  "Seed saves.",
  "Event Ledger records input.",
  "Seed survives refresh.",
  "Recovery export downloads.",
  "Voice recognition works or reports an honest fallback.",
  "Spoken response works or reports an honest fallback.",
  "Privacy shield hides content.",
  "Winter audit completes.",
  "Workshop session opens and closes.",
  "Session capsule downloads.",
  "Diagnostics display.",
  "Import verification works in a later controlled test."
]);

function nextRunId(runs) {
  return `TEST-${String(runs.length + 1).padStart(4, "0")}`;
}

export function startPrivateTest(state) {
  if (state.testing.activeRun) {
    return { started: false, run: state.testing.activeRun, reason: "A private test is already active." };
  }

  const run = {
    id: nextRunId(state.testing.runs),
    startedAt: timestamp(),
    completedAt: null,
    status: "active",
    results: PRIVATE_TEST_CHECKLIST.map((label, index) => ({
      step: index + 1,
      label,
      status: "pending",
      notes: ""
    }))
  };

  state.testing.activeRun = run;
  return { started: true, run };
}

export function recordTestResult(state, stepNumber, status, notes = "") {
  const run = state.testing.activeRun;
  if (!run) return { recorded: false, reason: "No private test is active." };

  const result = run.results.find(item => item.step === Number(stepNumber));
  if (!result) return { recorded: false, reason: "That test step does not exist." };

  if (!["pass", "fail", "skip"].includes(status)) {
    return { recorded: false, reason: "Test status must be pass, fail, or skip." };
  }

  result.status = status;
  result.notes = String(notes || "");
  result.updatedAt = timestamp();

  const remaining = run.results.filter(item => item.status === "pending").length;
  if (remaining === 0) {
    run.status = run.results.some(item => item.status === "fail") ? "completed_with_failures" : "completed";
    run.completedAt = timestamp();
    state.testing.runs.push(run);
    state.testing.activeRun = null;
  }

  return { recorded: true, result, remaining };
}

export function currentTestRun(state) {
  return state.testing.activeRun || state.testing.runs.at(-1) || null;
}

export function testReportMarkdown(run) {
  if (!run) return "# Project P.O.S. — Private Test Report\n\nNo test run exists.\n";

  const lines = [
    "# Project P.O.S. — Private Test Report",
    "",
    `**Test ID:** ${run.id}`,
    `**Started:** ${run.startedAt}`,
    `**Completed:** ${run.completedAt || "Not completed"}`,
    `**Status:** ${run.status}`,
    "",
    "## Results",
    ""
  ];

  for (const result of run.results) {
    lines.push(`- **${result.step}. ${result.label}** — ${result.status}${result.notes ? ` — ${result.notes}` : ""}`);
  }

  return `${lines.join("\n")}\n`;
}
