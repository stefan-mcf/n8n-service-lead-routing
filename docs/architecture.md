# Node map and activation notes

## Main workflow groups

| Group | Nodes |
| --- | --- |
| Customer intake | Form Trigger and intake normalisation |
| Validation | Required-field and consent checks |
| Duplicate control | Local Data Table lookup and new-record insertion |
| Human review | Review decision, Wait-node form, and recorded review outcome |
| Integration hold | Explicit exception decision and held state |
| Controlled handoff | Destination-shaped preparation only |
| Operator register | Register-row preparation and local Data Table write |

## QA workflow

The separate inactive QA workflow loads five synthetic records, classifies each
one, routes all five controlled outcomes, and writes them to the local Service
Enquiry Register. It contains no form trigger, credentials, or external action
nodes.

## Import state

Both workflow exports are inactive and contain no credential assignments. The
main workflow uses three n8n Data Table nodes. Their table identifiers point to
the isolated proof instance and must be relinked to a table created from
`workflow/data-table-schema.json` after import elsewhere.

## Destination adapters

The accepted route prepares destination-shaped fields for:

1. a CRM create-or-update operation;
2. a proposed booking;
3. an acknowledgement preview.

No CRM, calendar, email, SMS, or webhook destination node is attached.
Connecting a provider requires approved credentials, idempotent destination
handling, retry policy, and a post-write readback.

## Activation checklist

- create and relink the Service Enquiry Register Data Table;
- replace controlled fixtures with an approved source schema;
- configure credentials through n8n rather than workflow JSON;
- verify duplicate rules against canonical destination identifiers;
- decide which review states require an operator notification;
- test every route with both workflows inactive;
- activate only after destination readback succeeds.
