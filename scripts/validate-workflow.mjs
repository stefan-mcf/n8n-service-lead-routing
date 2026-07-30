import { readFile } from "node:fs/promises";

const workflow = JSON.parse(await readFile("workflow/workflow.json", "utf8"));
const input = JSON.parse(await readFile("fixtures/input.json", "utf8"));
const expected = JSON.parse(await readFile("fixtures/expected-output.json", "utf8"));

const requiredNodes = [
  "Receive Service Lead",
  "Normalize and Classify",
  "Invalid Lead?",
  "Duplicate Lead?",
  "Human Review?",
  "Integration Exception?",
  "Prepare CRM Record",
  "Propose Booking",
  "Prepare Acknowledgement",
  "Audit Outcome",
];

const nodeNames = new Set(workflow.nodes.map((node) => node.name));
const missingNodes = requiredNodes.filter((name) => !nodeNames.has(name));
const outcomes = new Set(expected.outcomes.map((entry) => entry.outcome));
const requiredOutcomes = new Set([
  "accepted",
  "duplicate",
  "invalid",
  "human_review",
  "integration_exception",
]);

if (workflow.active !== false) throw new Error("workflow must remain inactive");
if (workflow.nodes.length !== 16) throw new Error(`expected 16 nodes, found ${workflow.nodes.length}`);
if (missingNodes.length) throw new Error(`missing nodes: ${missingNodes.join(", ")}`);
if (input.leads.length !== 5) throw new Error(`expected 5 input records, found ${input.leads.length}`);
if (expected.outcomes.length !== 5) throw new Error(`expected 5 outcomes, found ${expected.outcomes.length}`);
if ([...requiredOutcomes].some((name) => !outcomes.has(name))) {
  throw new Error("expected outcome set is incomplete");
}
if (expected.summary.external_actions_performed !== 0) {
  throw new Error("controlled workflow must not report external actions");
}

console.log("PASS: 16 nodes, 5 routes, inactive workflow, zero external actions");
