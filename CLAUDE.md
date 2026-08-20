# MSE Playlist LIVEBOX

## Claude Code Project Context

This file describes the architecture, terminology, operational flow, and coding rules for this project.

Before modifying code:

1. Read this file.
2. Inspect the actual current source code.
3. Search for existing functions before creating new ones.
4. Trace the relevant data flow.
5. Make the smallest necessary change.
6. Preserve working Vizrt/MSE broadcast behavior.

The **current repository source code is the final source of truth**.

If this document and the current code differ, do not silently rewrite the application to match this document. Inspect the implementation and report the discrepancy first.

---

# 1. Project Purpose

MSE Playlist LIVEBOX is a local desktop broadcast control application integrating:

* Vizrt Media Sequencer (MSE)
* Viz Engine
* LIVEBOX HTML layouts
* Vizrt Execution Logic / Director
* External REST API messages

Primary functions include:

* Browse MSE playlists
* Browse playlist elements
* Select MSE elements
* Preview LIVEBOX layouts
* Display current On Air layout
* Edit/remove boxes from Preview
* Reorder LIVEBOX inputs
* Send commands to Viz Engine
* TAKE elements through MSE
* CLEANUP playlists
* Receive external messages through REST API
* Update Preview from external messages
* Monitor MSE connection
* Monitor Viz Engine connection
* Configure MSE / Engine connection settings

This is an **operator/broadcast application**.

Reliability, low latency, and predictable behavior are more important than architectural elegance.

---

# 2. Technology

Frontend:

```text
HTML
CSS
Vanilla JavaScript
```

Backend:

```text
Node.js
Express
```

Communication mechanisms include:

```text
MSE REST API
HTTP REST POST
Viz Engine TCP
Server-Sent Events (SSE)
WebSocket where currently implemented
```

Do NOT introduce new frameworks such as:

* React
* Vue
* Angular
* frontend build systems
* unnecessary npm dependencies

unless explicitly requested.

Do not migrate existing JavaScript to TypeScript unless explicitly requested.

---

# 3. Repository

Repository:

```text
https://github.com/dedychristian-deploy/mseplaylistlivebox
```

The repository currently contains components including:

```text
mseplaylistlivebox/
├── .vscode/
├── executionlogic/
├── html_files/
├── mseservice/
├── node_modules/
├── services/
├── rtmp/
├── typescript_1/
├── vbs/
├── config.json
├── mse-config.json
├── package.json
├── payloads.xml
├── server.js
└── ...
```

Always inspect the current repository because this structure can evolve.

General responsibility:

```text
server.js
    Main Express server and application integration

mseservice/
    MSE REST implementation and routes

services/
    Backend services including Viz Engine command communication

html_files/
    Frontend UI and LIVEBOX HTML resources

executionlogic/
    Vizrt Execution Logic related resources
```

Do not move responsibilities between modules without a specific reason.

---

# 4. Main Server

The current application server is configured to run on:

```text
9090
```

Verify this against the current source before changing server behavior.

Configuration is stored in:

```text
config.json
```

Connection configuration includes values conceptually similar to:

```json
{
  "mse": {
    "host": "127.0.0.1",
    "port": 8580,
    "profile": "default"
  },
  "engine": {
    "host": "127.0.0.1",
    "port": 6100
  }
}
```

Always inspect the actual current configuration.

Do not duplicate configuration values as hardcoded constants throughout the project.

---

# 5. MSE Architecture

Default local development MSE:

```text
Host: 127.0.0.1
Port: 8580
```

MSE implementation is separated from the main server.

Important files include:

```text
mseservice/mse.js
mseservice/routes.js
```

MSE routes are mounted under `/api`.

Conceptually:

```javascript
app.use("/api", mseRoutes);
```

Before modifying MSE behavior:

1. Inspect `server.js`.
2. Inspect `mseservice/routes.js`.
3. Inspect `mseservice/mse.js`.
4. Find the frontend caller.
5. Trace the entire request.
6. Preserve existing API contracts unless explicitly requested otherwise.

Do NOT duplicate MSE REST requests in frontend JavaScript if the backend already provides the operation.

---

# 6. MSE Profile

The MSE profile is configurable.

Conceptually:

```text
config.mse.profile
```

Do not blindly hardcode:

```text
default
```

when implementing new MSE operations.

Use the existing configuration mechanism.

---

# 7. Viz Engine Architecture

Default local development Viz Engine:

```text
Host: 127.0.0.1
TCP Port: 6100
```

Viz Engine command handling is implemented through backend service code.

Important file:

```text
services/command.js
```

The expected architecture is:

```text
Frontend
   │
   ▼
Node Backend
   │
   ▼
services/command.js
   │
   │ TCP
   ▼
Viz Engine
```

Do not implement a second TCP connection system when the existing service can be reused.

Do not communicate with TCP directly from browser JavaScript.

---

# 8. Connection Health

The application monitors:

```text
MSE
ENGINE
```

MSE connectivity can be checked using HTTP.

Viz Engine connectivity can be checked using TCP.

Existing backend state may use an object such as:

```text
connectionStatus
```

Always inspect the current health-check implementation.

UI connection indicators must reflect actual backend status.

Do not fake connection status in the frontend.

---

# 9. Settings

The application supports settings for connections such as:

```text
MSE Host
MSE Port
MSE Profile

Engine Host
Engine Port
```

Reuse the existing configuration mechanism.

Do not scatter addresses or ports as new hardcoded values throughout the application.

Changing Settings UI must not silently change the backend configuration contract.

---

# 10. CRITICAL: Incoming External Message

External messages coming into this application arrive through an:

```text
HTTP REST API POST
```

The external sender can be Vizrt Execution Logic / Director or another system using the same REST contract.

The incoming message does **NOT** originate from:

```text
SSE
WebSocket
Frontend JavaScript
```

The Node.js backend is the receiver.

---

# 11. Incoming REST Endpoint

Incoming external messages are sent to:

```text
POST /preview
```

Conceptual request:

```http
POST /preview
Content-Type: application/xml
```

Example payload:

```xml
<payload>
    <field name="setBoxes">
        <value>0</value>
    </field>
    <field name="elementId">
        <value>external/pilotdb/elements/4920</value>
    </field>
</payload>
```

The backend receives and parses this payload.

---

# 12. Incoming Message Flow

The correct communication flow is:

```text
Vizrt Execution Logic / Director
              │
              │
              │ HTTP REST API
              │ POST /preview
              │
              ▼
       Node.js Backend
              │
              │
              │ Parse incoming payload
              │
              ▼
       Extract Payload
              │
        ┌─────┴─────┐
        ▼           ▼
    setBoxes     elementId
        │           │
        └─────┬─────┘
              │
              ▼
      Application State
              │
              │
              │ SSE
              │ /preview-events
              │
              ▼
         Frontend UI
              │
              ▼
           Preview
```

This distinction is critical.

---

# 13. REST vs SSE

There are two separate communication mechanisms.

## External System → Backend

Uses:

```text
HTTP REST API POST
```

Endpoint:

```text
POST /preview
```

This is the **incoming message transport**.

## Backend → Frontend

Uses:

```text
Server-Sent Events (SSE)
```

Endpoint:

```text
/preview-events
```

This distributes information already received by the backend to connected frontend clients.

Therefore:

```text
REST POST = incoming external message

SSE = backend → frontend notification/update
```

Do NOT describe SSE as the original source of the external message.

Do NOT replace the REST POST receiver with WebSocket or SSE unless explicitly requested.

---

# 14. Incoming Payload

Typical incoming payload:

```xml
<payload>
    <field name="setBoxes">
        <value>0</value>
    </field>
    <field name="elementId">
        <value>external/pilotdb/elements/4920</value>
    </field>
</payload>
```

Important fields:

```text
setBoxes
elementId
```

---

# 15. setBoxes

Example:

```xml
<field name="setBoxes">
    <value>0</value>
</field>
```

`setBoxes` identifies the LIVEBOX layout/configuration according to the existing application mapping.

IMPORTANT:

Do not assume:

```text
setBoxes = visible number of boxes
```

The numeric value may represent an index/type.

Inspect the existing mapping code before changing its meaning.

---

# 16. elementId

Example:

```xml
<field name="elementId">
    <value>external/pilotdb/elements/4920</value>
</field>
```

`elementId` is an **MSE element path/string**.

Correct representation:

```text
external/pilotdb/elements/4920
```

Do NOT automatically convert it into:

```text
4920
```

Do NOT do:

```javascript
parseInt(elementId)
```

Do NOT strip:

```text
external/pilotdb/elements/
```

unless a specific existing downstream MSE function explicitly requires a numeric ID.

Preserve the complete element path through the normal application data flow.

---

# 17. Meaning of "Incoming Message"

When the user refers to:

```text
incoming message
incoming payload
external message
Execution Logic message
Director message
POST message
message coming
message received
```

assume this means:

```text
External HTTP REST POST received by the Node.js backend
```

unless the user explicitly says otherwise.

It does NOT mean an SSE message arriving from the backend to the browser.

---

# 18. External Selection

An MSE element can be selected through more than one path.

Manual selection:

```text
MSE
 │
 ▼
Playlist
 │
 ▼
Elements
 │
 ▼
User clicks element
 │
 ▼
Selected Element
```

External selection:

```text
Execution Logic / Director
 │
 │ REST POST
 ▼
/preview
 │
 ▼
Node Backend
 │
 ▼
elementId
 │
 │ SSE
 ▼
Frontend
 │
 ▼
Selected Element / Preview
```

External selection is a first-class application workflow.

Do not assume selected elements always originate from a frontend click.

---

# 19. LIVEBOX Layout Data

Preview layout state is conceptually represented by:

```javascript
currentLayoutData
```

Typical conceptual structure:

```json
{
  "boxType": 3,
  "boxTypeName": "4BOX",
  "boxOrder": [
    {
      "box": "BOX_01",
      "input": 0
    },
    {
      "box": "BOX_02",
      "input": 2
    },
    {
      "box": "BOX_03",
      "input": 3
    }
  ]
}
```

Inspect the current implementation before relying on exact property names.

---

# 20. CRITICAL: BOX and INPUT Are Different

Never confuse:

```text
box
```

with:

```text
input
```

## box

`box` represents the LIVEBOX position/container.

Examples:

```text
BOX_01
BOX_02
BOX_03
BOX_04
```

## input

`input` represents the input/container index associated with the content.

Examples:

```text
0
1
2
3
```

This is valid:

```json
{
  "box": "BOX_01",
  "input": 3
}
```

Therefore never assume:

```text
BOX_01 = input 0
BOX_02 = input 1
BOX_03 = input 2
```

The BOX position and input index are independent concepts.

This distinction is critical for LIVEBOX reordering.

---

# 21. Preview State

The currently selected/prepared layout is conceptually stored as:

```javascript
currentLayoutData
```

Preview represents what the operator is preparing.

Preview can be changed without changing what is currently On Air.

---

# 22. On Air State

The currently taken layout is conceptually stored as:

```javascript
onAirLayoutData
```

On Air represents what has actually been taken.

After a successful TAKE, Preview state may be copied to On Air using the current implementation.

Do not make On Air state change merely because Preview was edited.

---

# 23. Preview vs On Air

Operational distinction:

```text
PREVIEW
    Selected/prepared/edited state

ON AIR
    State actually taken to output
```

These must remain separate.

Preview editing must not silently modify On Air.

On Air Preview should generally remain non-interactive.

---

# 24. Layout Editing

The operator can delete/remove boxes from the Preview layout.

Existing code may use state such as:

```javascript
layoutEdited = true;
```

Editing can affect action button availability.

Before changing delete/reorder behavior, inspect existing:

```text
deleteBox
layout state handling
action button handling
TAKE logic
SEND TO VIZ logic
```

Do not simplify this state machine without tracing the entire workflow.

---

# 25. Input Index Preservation

Example initial layout:

```json
[
  { "box": "BOX_01", "input": 0 },
  { "box": "BOX_02", "input": 1 },
  { "box": "BOX_03", "input": 2 },
  { "box": "BOX_04", "input": 3 }
]
```

After removing one input, data may become:

```json
[
  { "box": "BOX_01", "input": 0 },
  { "box": "BOX_02", "input": 2 },
  { "box": "BOX_03", "input": 3 }
]
```

The original input indices are meaningful.

Do not automatically convert the remaining inputs into:

```text
0
1
2
```

unless the existing application logic explicitly requires it.

---

# 26. Viz Reorder

LIVEBOX reorder uses the Viz scene script:

```text
set_index
```

Command format:

```text
MAIN_SCENE*TREE*$SCRIPT*SCRIPT INVOKE set_index {boxType} {boxName} {targetIndex}
```

Example:

```text
MAIN_SCENE*TREE*$SCRIPT*SCRIPT INVOKE set_index 3 BOX_01 0
```

Conceptually, commands can be generated from layout data like:

```javascript
for (const item of currentLayoutData.boxOrder) {
    const command =
        `MAIN_SCENE*TREE*$SCRIPT*SCRIPT INVOKE set_index ` +
        `${currentLayoutData.boxType} ${item.box} ${item.input}`;
}
```

Always inspect the current implementation first.

Never reverse:

```text
item.box
item.input
```

---

# 27. Viz Scene Contract

The Viz scene contains the parent container:

```text
UPDATEBOX
```

The scene script uses a structure conceptually similar to:

```text
scene.findContainer("UPDATEBOX").getChildContainerByIndex(boxType)
```

It then locates a named container such as:

```text
BOX_01
```

and moves that container to the requested local index.

The application must respect this Viz scene-side contract.

Do not casually change the command syntax.

---

# 28. SEND TO VIZ

SEND TO VIZ is a Viz Engine operation.

Conceptually:

```text
Preview Layout
      │
      ▼
Generate reorder commands
      │
      ▼
Backend
      │
      ▼
Viz Engine TCP :6100
      │
      ▼
set_index
```

SEND TO VIZ is NOT the same operation as MSE TAKE.

Do not interchange them.

---

# 29. TAKE

TAKE is an MSE playout operation.

Conceptually:

```text
Selected MSE Element
       │
       ▼
      TAKE
       │
       ▼
Frontend API call
       │
       ▼
Backend MSE route
       │
       ▼
MSE Profile Command
       │
       ▼
     On Air
```

Preserve the complete selected element path.

Example:

```text
external/pilotdb/elements/4920
```

Do not convert it to only `4920` unless the existing MSE operation specifically requires that.

---

# 30. CLEANUP

CLEANUP is an MSE playlist/show operation.

CLEANUP does NOT mean deleting the playlist.

Before modifying CLEANUP:

1. Find the existing implementation.
2. Determine how selected playlist is represented.
3. Determine the configured MSE profile.
4. Preserve the HTTP method.
5. Preserve headers.
6. Preserve request body.
7. Preserve existing MSE semantics.

---

# 31. LIVEBOX HTML Files

Frontend and LIVEBOX resources are located under:

```text
html_files/
```

Do not assume a `/layouts` directory exists.

Inspect the current path construction before modifying layout loading.

Do not move or rename LIVEBOX HTML files without searching for every reference.

---

# 32. Known Layout Identifiers

Known layout identifiers include:

```text
1BOX
2BOX
2BOX_BIG_SMALL
3BOX
3BOX_SP
4BOX
5BOX
6BOX
7BOX
7BOX_CENTER
8BOX
9BOX
10BOX
12BOX
1BOX_SP
1BOX_SP_V
2BOX_SP_V
3BOX_SP_V
4BOX_SP_V
```

These names can be application identifiers.

Do not rename them for readability without explicit instruction.

---

# 33. Layout Communication

LIVEBOX HTML/iframe resources may receive layout data through browser communication such as:

```javascript
postMessage()
```

Before changing layout HTML:

* inspect the existing message format;
* preserve BOX identifiers;
* preserve input identifiers;
* preserve delete interaction;
* preserve layout state;
* preserve Preview behavior.

Visual changes must not break data communication.

---

# 34. Layout Animation

LIVEBOX HTML files may contain short entrance/tween animations.

Animation is presentation-only.

Animations must:

* remain short;
* not delay rendering;
* not delay broadcast actions;
* not change box mapping;
* not change final geometry;
* not interfere with delete interaction;
* not affect Viz commands;
* not affect MSE behavior.

Do not introduce animation frameworks.

---

# 35. Main UI

The operator interface contains areas including:

```text
Playlists
Elements
Preview
On Air Preview
Controls
Connection Status
Settings
Search
```

This is primarily a desktop broadcast control application.

Desktop operator usability takes priority over mobile responsiveness.

---

# 36. UI Design Direction

Prefer:

* compact controls;
* dense information;
* clear visual hierarchy;
* dark broadcast-style interface;
* strong readability;
* obvious selection;
* obvious Preview / On Air distinction;
* consistent spacing;
* predictable button placement;
* minimal wasted space.

Avoid:

* huge SaaS cards;
* excessive padding;
* excessive rounded corners;
* excessive whitespace;
* decorative effects;
* unnecessary gradients;
* mobile-first redesigns;
* anything that reduces operator information density.

---

# 37. CRITICAL: UI-Only Requests

If the user requests a UI change, modify presentation only unless behavior changes are explicitly requested.

Do NOT automatically modify:

```text
MSE logic
Viz Engine logic
REST endpoints
incoming POST parsing
SSE
TCP
WebSocket
TAKE
CLEANUP
SEND TO VIZ
Preview state
On Air state
layout data model
configuration format
```

Prefer CSS-only modifications whenever possible.

If HTML structure must change, preserve every element referenced by JavaScript.

---

# 38. DOM Safety

Before deleting or renaming any DOM element:

1. Search its ID.
2. Search its class.
3. Search JavaScript references.
4. Search event listeners.
5. Search CSS selectors.
6. Search layout communication code.

Do not assume an element is unused because its purpose is not visually obvious.

---

# 39. Search

Playlist and Element search/filter controls should preferably filter existing loaded data where practical.

Do not redesign backend APIs just to implement a simple frontend filter unless necessary.

---

# 40. Machine-Specific Paths

The application may contain machine-specific drive paths such as:

```text
K:
B:/Flowics
```

This project can be used on different PCs.

A path missing on one machine does NOT automatically mean the application architecture is wrong.

Before changing file mappings:

* inspect the existing purpose;
* identify whether the path belongs to office infrastructure;
* avoid breaking the office configuration;
* prefer configuration if a change is necessary.

Do not silently replace office paths because they are unavailable on a home PC.

---

# 41. Performance

This is a broadcast control application.

Operator actions should remain responsive.

Avoid introducing:

```text
arbitrary setTimeout()
artificial loading delays
unnecessary sequential requests
extra fetch layers
unnecessary proxies
heavy frontend dependencies
```

Do not add delay to Viz Engine commands unless explicitly required by the protocol/workflow.

---

# 42. REST Contracts

When the user provides an exact REST contract including:

```text
URL
HTTP method
headers
Content-Type
body
payload
```

treat it as authoritative unless it conflicts with verified current source behavior.

Do not replace it with a different architecture merely because another approach is more conventional.

---

# 43. Error Handling

Operational errors should be useful.

Distinguish failures such as:

```text
MSE disconnected
Engine disconnected
MSE REST request failed
Viz command failed
Invalid external REST payload
Element not found
Invalid configuration
```

Do not hide useful operational errors behind generic messages.

Do not expose credentials or sensitive data.

---

# 44. External Payload Parsing

When parsing incoming REST XML:

* tolerate normal XML whitespace;
* validate required fields;
* treat `elementId` as a string;
* preserve the complete MSE path;
* do not assume the element number is fixed;
* do not assume `elementId` is numeric.

Example valid values can vary:

```text
external/pilotdb/elements/4920
external/pilotdb/elements/98
external/pilotdb/elements/1234
```

The path structure is meaningful.

---

# 45. Overall Architecture

Main operator flow:

```text
                 MSE
                  │
                  │ playlists/elements
                  ▼
          ┌───────────────┐
          │   Frontend    │
          │               │
          │    Preview    │
          │    On Air     │
          └───────┬───────┘
                  │
           ┌──────┴───────┐
           │              │
          TAKE       SEND TO VIZ
           │              │
           ▼              ▼
          MSE         Viz Engine
                       TCP 6100
```

External incoming flow:

```text
Execution Logic / Director
          │
          │ HTTP REST POST
          ▼
     POST /preview
          │
          ▼
    Node.js Backend
          │
          │ Parse XML
          ▼
 setBoxes + elementId
          │
          │ SSE
          ▼
   /preview-events
          │
          ▼
      Frontend
          │
          ▼
       Preview
```

Keep these communication paths conceptually separate.

---

# 46. Before Editing Frontend

When asked to modify frontend/UI:

1. Locate the actual frontend file.
2. Read its HTML.
3. Read the relevant CSS.
4. Identify JavaScript controlling the area.
5. Search referenced IDs/classes.
6. Make the smallest presentation change.
7. Verify Preview still works.
8. Verify On Air still works.
9. Verify action buttons still work.
10. Verify incoming REST → SSE updates still display correctly.

Do not redesign based only on screenshots without inspecting the current code.

---

# 47. Before Editing Backend

When asked to modify backend behavior:

1. Inspect `server.js`.
2. Determine which subsystem owns the behavior.
3. Inspect `mseservice/` for MSE functionality.
4. Inspect `services/` for Viz/other backend services.
5. Search frontend callers.
6. Preserve existing response contracts where possible.
7. Make the smallest necessary change.

Do not move all logic back into `server.js`.

---

# 48. Before Editing MSE Integration

Inspect at minimum:

```text
server.js
mseservice/routes.js
mseservice/mse.js
config.json
```

Trace:

```text
Frontend
   ↓
Backend API
   ↓
MSE service
   ↓
MSE REST API
```

before making changes.

---

# 49. Before Editing Viz Integration

Inspect at minimum:

```text
server.js
services/command.js
frontend caller
```

Trace:

```text
Frontend
   ↓
Backend
   ↓
Command service
   ↓
Viz Engine TCP
```

before making changes.

---

# 50. Debugging

When fixing a bug:

1. Understand the reported symptom.
2. Reproduce or trace it.
3. Identify the actual responsible code.
4. Fix the smallest affected area.
5. Preserve unrelated working behavior.
6. Test the affected flow.
7. Report what changed.

Do not solve a local bug by replacing an entire working subsystem.

---

# 51. No Unrequested Refactoring

Do not perform unrelated refactoring.

For example, if asked to:

```text
change the TAKE button font
```

do NOT also:

```text
rename TAKE functions
restructure JavaScript
change MSE API functions
change state management
move backend modules
install dependencies
```

If a larger refactor is genuinely necessary, explain why before doing it.

---

# 52. Existing Functions First

Always search for an existing implementation before creating a new one.

This is especially important for:

```text
MSE requests
playlist loading
element loading
element selection
TAKE
CLEANUP
Viz commands
Preview
On Air
layout rendering
delete box
settings
health checks
incoming REST messages
SSE
```

Prefer modifying/reusing existing functions rather than creating duplicate logic.

---

# 53. Git Safety

This project is used across multiple computers.

Typical workflow:

```text
git pull
    ↓
work / test
    ↓
git status
    ↓
git add .
    ↓
git commit
    ↓
git push
```

Before large changes:

```bash
git status
```

Do not automatically run destructive Git commands.

Do NOT automatically:

```bash
git reset --hard
git clean -fd
git commit
git push
```

unless explicitly requested.

Do not overwrite unrelated uncommitted work.

---

# 54. After Making Code Changes

After modifying code, report concisely:

```text
Changed:
- file(s)

What changed:
- short explanation

Application logic changed:
- Yes / No

Test:
- what should be tested
```

Do not provide an unnecessarily long explanation unless requested.

---

# 55. User Specifications

The user understands the intended Vizrt/MSE operational workflow and may provide exact technical specifications.

When the user provides an exact:

```text
MSE endpoint
HTTP method
HTTP headers
payload
Viz Engine command
BOX mapping
input mapping
layout behavior
UI requirement
```

follow it closely.

Do not replace it with another architecture simply because another implementation appears cleaner or more conventional.

If it conflicts with verified current source code, point out the conflict first.

---

# 56. Critical Rules Summary

## Existing source first

Read the current code before modifying it.

## Preserve broadcast logic

Do not casually alter working MSE/Viz functionality.

## Incoming message = REST POST

External incoming messages arrive:

```text
External System
      ↓
HTTP REST POST
      ↓
POST /preview
      ↓
Node Backend
```

## SSE is backend → frontend

SSE does not originate the external message.

```text
Backend
   ↓
SSE /preview-events
   ↓
Frontend
```

## Preserve full elementId

Example:

```text
external/pilotdb/elements/4920
```

Do not reduce it to `4920` unless specifically required.

## BOX != input

BOX position and input index are different concepts.

## Preview != On Air

Editing Preview must not silently change On Air.

## SEND TO VIZ != TAKE

SEND TO VIZ controls Viz Engine layout/reorder behavior.

TAKE performs MSE playout.

## UI request = UI change

Do not modify backend/application logic unless explicitly requested.

## Small targeted changes

Prefer modifying existing working code over rewriting files.

---

# 57. Instruction for Every New Claude Session

When starting work on this repository:

> Read `CLAUDE.md` first. Then inspect the actual source files relevant to the requested task before making changes. Do not rely on CLAUDE.md alone for implementation details. Preserve existing MSE/Viz broadcast behavior unless the task explicitly requires changing it.
