import assert from "node:assert/strict";
import { canonicalizeNaturalLanguage, classifyCommand, normalizeCommand } from "../core/executive.js";

const cases = [
  ["Hello Axiom", "greeting"],
  ["Axiom, hello!", "greeting"],
  ["Could you please show me the system status?", "system_status"],
  ["What's the project state?", "show_state"],
  ["What should I do next?", "show_next_step"],
  ["Please show me my rights", "show_rights"],
  ["Would you show me the four brains?", "show_brains"],
  ["I would like you to make a project called Orchard", "create_project"],
  ["Please remember that deployment is iPhone-only", "capture_note"],
  ["Set my next step to verify the live site", "set_next_stone"]
];

for (const [input, expectedIntent] of cases) {
  const result = classifyCommand(input);
  assert.equal(result.intent, expectedIntent, `${input} resolved to ${result.intent}`);
}

assert.equal(normalizeCommand("  Axiom, Hello!!! "), "hello");
assert.equal(canonicalizeNaturalLanguage("Could you please show me the system status?"), "show system status");
assert.equal(classifyCommand("I would like you to make a project called Orchard").payload, "Orchard".toLowerCase());
assert.equal(classifyCommand("Please remember that deployment is iPhone-only").payload, "deployment is iphone-only");

console.log("EP-003 natural-language intent tests passed.");
