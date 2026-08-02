import { readFile } from "node:fs/promises";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const [workflow, qaWorkflow, tableSchema, input, expected] = await Promise.all([
  readJson("workflow/workflow.json"),
  readJson("workflow/qa-workflow.json"),
  readJson("workflow/data-table-schema.json"),
  readJson("fixtures/input.json"),
  readJson("fixtures/expected-output.json"),
]);

const requiredMainNodes = [
  "Request a Service Quote",
  "Normalize Intake",
  "Valid enquiry?",
  "Existing Enquiry?",
  "New Enquiry?",
  "Human Review?",
  "Review Service Enquiry",
  "Integration Hold?",
  "Prepare Controlled Handoff",
  "Store Enquiry Outcome",
];

const requiredQaNodes = [
  "Start QA Review",
  "Load Five Scenarios",
  "Normalize and Classify",
  "Invalid?",
  "Duplicate?",
  "Human Review?",
  "Integration Hold?",
  "Store Five Outcomes",
];

const requiredOutcomes = new Set([
  "accepted",
  "duplicate",
  "invalid",
  "human_review",
  "integration_exception",
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateWorkflow(candidate, expectedName, expectedNodeCount, requiredNodes) {
  const nodeNames = new Set(candidate.nodes.map((node) => node.name));
  const missingNodes = requiredNodes.filter((name) => !nodeNames.has(name));
  const credentialedNodes = candidate.nodes.filter(
    (node) => node.credentials && Object.keys(node.credentials).length > 0,
  );
  const externalNodes = candidate.nodes.filter(
    (node) => !node.type.startsWith("n8n-nodes-base."),
  );

  assert(candidate.name === expectedName, `expected workflow name ${expectedName}`);
  assert(candidate.active === false, `${expectedName} must remain inactive`);
  assert(
    candidate.nodes.length === expectedNodeCount,
    `${expectedName}: expected ${expectedNodeCount} nodes, found ${candidate.nodes.length}`,
  );
  assert(missingNodes.length === 0, `${expectedName}: missing nodes: ${missingNodes.join(", ")}`);
  assert(credentialedNodes.length === 0, `${expectedName}: credentials must not be committed`);
  assert(externalNodes.length === 0, `${expectedName}: external provider nodes are not allowed`);
}

validateWorkflow(workflow, "Service Lead Intake and Routing", 20, requiredMainNodes);
validateWorkflow(qaWorkflow, "Service Lead Routing QA", 15, requiredQaNodes);

assert(tableSchema.name === "Service Enquiry Register", "unexpected Data Table name");
assert(tableSchema.columns.length === 10, "expected 10 Data Table columns");
assert(input.leads.length === 5, `expected 5 input records, found ${input.leads.length}`);
assert(expected.outcomes.length === 5, `expected 5 outcomes, found ${expected.outcomes.length}`);

const outcomes = new Set(expected.outcomes.map((entry) => entry.outcome));
assert(
  [...requiredOutcomes].every((name) => outcomes.has(name)),
  "expected outcome set is incomplete",
);
assert(
  expected.outcomes.every((entry) => entry.external_actions_performed === false),
  "every controlled outcome must report zero external actions",
);
assert(
  expected.summary.external_actions_performed === 0,
  "controlled workflow must not report external actions",
);

console.log(
  "PASS: inactive 20-node main workflow, inactive 15-node QA workflow, five routes, zero credentials, zero external actions",
);
