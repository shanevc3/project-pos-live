import { constitutionalGuard, rightsAreIntact } from "./constitution.js";
import { timestamp } from "./memory.js";

export const SEASONS = Object.freeze([
  { name: "Spring", purpose: "Capture events, ideas, goals, corrections, and questions." },
  { name: "Summer", purpose: "Cultivate seeds with evidence, relationships, tests, and practice." },
  { name: "Autumn", purpose: "Harvest proven value into tools, decisions, Canon candidates, or architecture." },
  { name: "Winter", purpose: "Repair structure, integrity, indexes, relationships, backups, and stale material." }
]);

function allRecords(state) {
  return [
    ...state.eventLedger,
    ...state.seeds,
    ...state.seedCandidates,
    ...state.notes,
    ...state.focus.projects,
    ...state.focus.goals,
    ...state.governance.proposals
  ];
}

function nextProposalId(records) {
  return `PROP-${String(records.length + 1).padStart(4, "0")}`;
}

export function requestAction(state, action) {
  return constitutionalGuard(state, action);
}

export function createChangeProposal(state, description, eventId = null) {
  const proposal = {
    id: nextProposalId(state.governance.proposals),
    description: String(description).trim(),
    status: "proposed",
    createdAt: timestamp(),
    decidedAt: null,
    sourceEventId: eventId,
    stewardDecision: null
  };
  state.governance.proposals.push(proposal);
  return proposal;
}

export function decideProposal(state, proposalId, decision) {
  const proposal = state.governance.proposals.find(item => item.id.toLowerCase() === String(proposalId).toLowerCase());
  if (!proposal) return { decided: false, reason: "Proposal not found." };
  if (!["approved", "rejected"].includes(decision)) {
    return { decided: false, reason: "Decision must be approved or rejected." };
  }

  proposal.status = decision;
  proposal.decidedAt = timestamp();
  proposal.stewardDecision = decision;
  return { decided: true, proposal };
}

export function runWinterAudit(state) {
  const findings = [];
  const requiredArrays = [
    "eventLedger", "seeds", "seedCandidates", "notes", "history"
  ];

  for (const key of requiredArrays) {
    if (!Array.isArray(state[key])) findings.push(`${key} is not a valid record collection.`);
  }

  const ids = allRecords(state).map(record => record.id).filter(Boolean);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) {
    findings.push(`Duplicate record IDs: ${[...new Set(duplicates)].join(", ")}`);
  }

  if (!rightsAreIntact(state.constitution?.rights)) {
    findings.push("Root Rights Charter does not match the protected runtime copy.");
  }

  for (const event of state.eventLedger) {
    if (!event.id || !event.at || event.input === undefined) {
      findings.push("At least one Event Ledger record is missing required fields.");
      break;
    }
  }

  for (const seed of state.seeds) {
    if (!seed.id || !seed.description || !seed.maturityStage || !seed.status) {
      findings.push("At least one Seed record is missing required fields.");
      break;
    }
  }

  if (state.eventLedger.length > 5000) {
    findings.push("Event Ledger exceeds 5,000 local records. Export and indexed-storage migration should be considered.");
  }

  if (state.seedCandidates.filter(item => item.status === "observed").length > 100) {
    findings.push("More than 100 Seed Candidates await review.");
  }

  if (!state.backup.lastExportAt) {
    findings.push("No recovery export has been recorded.");
  }

  if (state.diagnostics.errors.length > 0) {
    findings.push(`${state.diagnostics.errors.length} browser errors are preserved for review.`);
  }

  if (state.sessions.active) {
    findings.push("A Workshop session remains open.");
  }

  const constitutional = constitutionalGuard(state, { type: "read" });
  findings.push(...constitutional.findings);

  const audit = {
    id: `AUDIT-${String(state.governance.auditHistory.length + 1).padStart(4, "0")}`,
    at: timestamp(),
    season: "Winter",
    healthy: findings.length === 0,
    findings,
    recommendations: findings.length
      ? [
          "Review findings before approving consequential updates.",
          "Export a recovery backup before repair."
        ]
      : [
          "No structural fault was detected.",
          "Continue normal preservation and testing."
        ]
  };

  state.governance.season = "Winter";
  state.governance.auditHistory.push(audit);
  state.maintenance.lastAuditAt = audit.at;
  state.maintenance.lastAuditHealthy = audit.healthy;
  state.maintenance.findings = findings;

  return audit;
}
