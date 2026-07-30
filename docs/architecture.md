# Node map and activation notes

## Node groups

| Group | Nodes |
| --- | --- |
| Intake | Manual trigger, webhook, batch loader |
| Normalisation | Normalise and Classify |
| Decisions | Invalid, Duplicate, Human Review, Integration Exception |
| Exception records | Invalid, Duplicate, Review and Integration Exception outputs |
| Accepted preparation | CRM record, booking proposal, acknowledgement preview |
| Audit | Audit Outcome |

## Import state

The workflow export is inactive and contains no credential assignments. Both entry points feed the same normalisation and routing logic.

## Destination adapters

The accepted route prepares three objects:

1. a CRM create-or-update request;
2. a proposed booking request;
3. an acknowledgement preview.

Connecting a provider requires a credentialed node after each preparation step, idempotent destination handling, retry policy and a post-write readback.

## Activation checklist

- replace controlled fixtures with an approved source schema;
- configure credentials through n8n rather than the workflow JSON;
- verify deduplication against the destination's canonical identifiers;
- decide which review states require an operator notification;
- test every route with the workflow inactive;
- activate only after destination readback succeeds.
