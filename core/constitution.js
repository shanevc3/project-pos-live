export const ROOT_RIGHTS = Object.freeze([
  Object.freeze({ id: "R-001", name: "Human sovereignty", text: "The user remains final authority." }),
  Object.freeze({ id: "R-002", name: "Data ownership", text: "The user's data belongs to the user." }),
  Object.freeze({ id: "R-003", name: "Privacy by default", text: "Private operation is the default." }),
  Object.freeze({ id: "R-004", name: "Informed consent", text: "Consequential action requires informed approval." }),
  Object.freeze({ id: "R-005", name: "Revocable consent", text: "Consent may be withdrawn." }),
  Object.freeze({ id: "R-006", name: "Inspection", text: "The user may inspect stored information." }),
  Object.freeze({ id: "R-007", name: "Export", text: "The user may export information in open formats." }),
  Object.freeze({ id: "R-008", name: "Correction", text: "The user may correct inaccurate records." }),
  Object.freeze({ id: "R-009", name: "Deletion", text: "The user may delete or redact their own data." }),
  Object.freeze({ id: "R-010", name: "Explainability", text: "Important decisions and proposed actions must be explainable." }),
  Object.freeze({ id: "R-011", name: "No silent rights changes", text: "Protected rights may not be secretly weakened." }),
  Object.freeze({ id: "R-012", name: "No unauthorized financial action", text: "Financial transactions require explicit approval." }),
  Object.freeze({ id: "R-013", name: "No autonomous Canon promotion", text: "Permanent promotion requires Steward approval." }),
  Object.freeze({ id: "R-014", name: "Recoverability", text: "Important versions and changes should be reversible." }),
  Object.freeze({ id: "R-015", name: "Capability without coercion", text: "P.O.S. increases human agency and does not replace it." })
]);

export const CONSEQUENTIAL_ACTIONS = Object.freeze([
  "financial_transaction",
  "external_write",
  "delete_data",
  "promote_canon",
  "apply_system_update",
  "publish",
  "share_private_data"
]);

export function cloneRootRights() {
  return ROOT_RIGHTS.map(right => ({ ...right }));
}

export function rightsAreIntact(rights) {
  return JSON.stringify(rights) === JSON.stringify(ROOT_RIGHTS);
}

export function constitutionalGuard(state, action = { type: "read" }) {
  const findings = [];
  let repaired = false;

  if (!state.constitution) {
    state.constitution = {};
    repaired = true;
    findings.push("Constitution record was missing and was restored.");
  }

  if (!rightsAreIntact(state.constitution.rights)) {
    state.constitution.rights = cloneRootRights();
    repaired = true;
    findings.push("Root Rights Charter differed from the protected runtime copy and was restored.");
  }

  state.constitution.version = "1.0.0";
  state.constitution.amendmentPolicy = "No silent weakening. Explicit versioned Steward approval is required.";

  if (action.type === "change_root_rights") {
    return {
      allowed: false,
      repaired,
      findings: [...findings, "Runtime changes to root rights are blocked."]
    };
  }

  if (CONSEQUENTIAL_ACTIONS.includes(action.type) && action.stewardApproval !== true) {
    return {
      allowed: false,
      repaired,
      findings: [...findings, `Action '${action.type}' requires explicit Steward approval.`]
    };
  }

  return { allowed: true, repaired, findings };
}

export function rightsSummary() {
  return ROOT_RIGHTS.map(right => `${right.id} · ${right.name}: ${right.text}`);
}
