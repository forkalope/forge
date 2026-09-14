# Forkalope product and SRE training plan

## Decision

Forkalope should be built as two products on one foundation:

1. A useful, Git-compatible forge that can run as one boring node.
2. A repeatable training environment that makes that node behave like a
   production service under realistic load, failure, and recovery pressure.

The first milestone should be an **observable single-node forge slice**, not a
large collection of GitHub-shaped screens and not federation. It should let a
student install Forkalope, create an account and repository, clone and push
with normal Git, observe the system, deliberately break it, and restore it.

That slice gives us a real product, a real operational surface, and a small
enough system that junior SREs can understand end to end.

## Review of the new web homepage

The new React homepage is a good product direction for an authenticated forge
workspace:

- The dark blue-charcoal surfaces, coral action color, compact rows, and
  responsive sidebar establish a recognizable Forkalope language.
- The hierarchy is sensible: repository rail, workspace search, recent
  activity, node status, and product notes.
- The node panel already points toward the important Forkalope distinction:
  this is not only a code UI; it is also an operating node.
- The unavailable state is honest when the Go API is not running. That is much
  better than showing invented green health metrics.
- The mobile layout collapses the navigation and keeps the main actions usable
  at 390px. The desktop layout is appropriately dense rather than becoming a
  marketing page.

The important limitation is product truth, not visual polish. The page is
currently a convincing shell around fixture data:

- repositories and activity are constants in `web/src/App.tsx`;
- repository selection only shows a toast;
- create, inbox, account, issues, branches, and settings actions mostly say
  that a future milestone is planned;
- the activity overflow buttons have no action;
- the quick-action chevrons imply menus even though the controls are only
  buttons;
- health is the only meaningful API-backed value, and the API currently
  reports only process/blob-store status.

This is acceptable for a shell prototype. It should not become the product's
long-term shape. The homepage should be the first integration consumer of the
real API, with explicit `loading`, `empty`, `error`, `permission-denied`, and
`unavailable` states. A user should be able to tell the difference between:

```text
No repositories yet       empty
The node cannot be reached unavailable
The node is healthy        ready
The feature is not shipped planned
```

The next UI pass should therefore remove or simplify controls that do not yet
have a meaningful action, or make their planned state explicit in the control
itself. It should not add more dashboard content to compensate for the lack of
backend data.

## Product principles

### Build the smallest complete forge loop

The first useful loop is:

```text
install node
  -> create user and repository
  -> git clone
  -> edit and git push
  -> browse the resulting files and commit
  -> inspect health, logs, and storage
  -> back up and restore
```

This is more valuable than implementing isolated issue, star, notification,
and settings screens. Every feature added after this loop should have a clear
storage model, permission model, API contract, and operational story.

### Keep the initial authority model simple

The existing architecture notes are right to start with a modular Go
monolith, PostgreSQL for mutable metadata, normal Git repositories for source
control, and content-addressed storage for immutable blobs.

Do not make arbitrary community nodes part of write consensus. A repository
needs one explicit current home. Replicas can follow asynchronously and be
eligible for promotion only when their capabilities and freshness are known.

The future node classes should remain distinct:

- **Community node:** mirror, experimentation, or training; never required for
  production availability.
- **Anchor node:** meets published storage, backup, monitoring, update, and
  availability requirements; eligible for recovery workflows.
- **Core node:** Forkalope-operated or professionally managed primary service.

The simulator must be able to model all three without pretending they have the
same trust or reliability.

## Recommended build order

### Milestone 0: operating foundation

Build this before adding many user-facing features:

- configuration with an explicit data directory, database URL, node ID, and
  environment name;
- structured JSON request logs with request ID, route, status, duration, and
  bytes where applicable;
- separate liveness and readiness checks;
- a small metrics surface for request rate, error rate, latency, storage
  capacity, Git operation duration, queue depth, and backup/restore results;
- migration command and a first PostgreSQL schema migration;
- graceful shutdown and bounded request/body limits;
- a documented local backup and restore procedure;
- a deterministic seed/demo mode that can be reset without touching a real
  installation.

Exit criteria: a student can run the node locally, identify whether it is
alive, ready, accepting work, or degraded, and explain what the logs and
metrics mean.

### Milestone 1: real single-node Git forge

Implement only the core path first:

- users, sessions, organizations/workspaces, and repository metadata;
- repository create/list/show APIs;
- bare Git repository creation on local disk;
- Git smart HTTP clone/fetch/push, with authentication and authorization;
- repository browse APIs for tree, file, commit, and branch views;
- audit events for repository creation, permission changes, clone, fetch, and
  push;
- homepage data loaded from the API: current user, repositories, recent
  activity, and node status.

Prefer Git's existing protocol and tooling over inventing a new transport. SSH
can follow HTTP once the authorization and repository lifecycle are correct.

Exit criteria: a fresh installation can complete the smallest complete forge
loop, and the homepage no longer needs fixture repositories to demonstrate it.

### Milestone 2: collaboration and background work

Add the mutable features that make a forge more than Git hosting:

- issues and comments;
- pull requests backed by Git refs;
- reviews and merge state;
- notifications/inbox;
- webhooks;
- a durable background-job table and worker loop;
- basic artifact/package metadata and upload/download through the blob store.

Every background operation needs visible state such as queued, running,
succeeded, failed, or cancelled. This is the first point at which queue age,
retry behavior, idempotency, and stuck work become meaningful SRE exercises.

Exit criteria: a student can trace a pull request or webhook from HTTP request
through database state, job execution, Git/blob changes, and user-visible
result.

### Milestone 3: training simulator

Build the simulator as a separate executable or package, for example:

```text
cmd/forkalope-sim/
internal/sim/
sim/scenarios/
```

It should use the same public HTTP and Git interfaces as a human or CI client.
It may have a clearly separate administrative seed/reset API, but ordinary
workload traffic must pass through real authentication, permissions, Git
handlers, database writes, blob writes, and workers.

The simulator should provide:

- synthetic companies, teams, users, repositories, branches, issues, pull
  requests, packages, and CI-like jobs;
- scale factors so one laptop can run a small lab and a larger environment can
  model thousands of repositories;
- a baseline workload and burst workload;
- traffic mixes for browsing, clone/fetch, push, issue/PR activity, webhook
  delivery, artifact transfer, and background maintenance;
- deterministic seeds and scenario IDs so an incident can be replayed;
- rate limits, concurrency controls, and a clean stop signal;
- scenario assertions for errors, latency, queue age, data loss, and recovery;
- event records that explain what the simulator intended to do and what the
  forge actually returned.

The simulator should not be a second fake frontend. Its value is that it makes
the real product observable at a scale and cadence that a student can safely
operate.

### Milestone 4: replication and recovery

Only after the local loop and simulator are useful, add peer capabilities:

- repository and blob manifests with hashes, sizes, and timestamps;
- authenticated peer registration and capability advertisement;
- asynchronous transfer and verification;
- replica freshness and lag reporting;
- backup verification and restore drills;
- an explicit, manually initiated promotion workflow;
- conflict prevention while a replica is promoted.

Start with repository Git data plus essential recovery metadata. Issues, pull
requests, permissions, secrets, packages, and audit history need deliberate
replication semantics; they should not be implied by copying a Git directory.

Exit criteria: a student can distinguish a normal node failure, a stale
replica, an incomplete restore, and a successful recovery. Automatic global
failover is not required for this milestone.

## Simulator scenarios for the first class

The initial class does not need real businesses. It needs believable operating
pressure with safe boundaries. Use synthetic tenants with stable names and
documented characteristics, for example:

| Scenario | Shape | What it teaches |
| --- | --- | --- |
| `small-team` | 8 users, 20 repos, light pushes and issue traffic | install, logs, basic triage |
| `growing-company` | 80 users, 250 repos, frequent fetches, PRs, and webhooks | capacity, queue behavior, noisy neighbors |
| `enterprise-burst` | 500 users, 2,000 repos, scheduled clone/fetch and artifact bursts | rate limits, database and disk pressure |
| `release-day` | normal baseline plus a synchronized push and package publish | backpressure, retries, incident command |
| `node-loss` | primary process or host becomes unavailable | backup, replica freshness, restore and promotion |

The numbers should be scale factors, not hard-coded promises. The same scenario
must be runnable at `0.1x` on a laptop and at larger factors in a lab cluster.

Fault injection should be explicit and reversible. The first fault library
should cover:

- API process restart and abrupt termination;
- worker crash and repeated job failure;
- database latency, connection exhaustion, and read-only mode;
- disk pressure and blob-store write failure;
- slow or unavailable Git subprocesses;
- network delay, dropped requests, and peer partition;
- stale or incomplete replica;
- bad configuration or bad deployment with rollback.

Do not begin with chaotic random faults. Students learn faster when each
scenario has a hypothesis, a known blast radius, expected signals, and a
recovery runbook.

## SRE student curriculum mapped to the product

### Lab 1: install and explain the system

Students deploy one node, create a repository, make a push, and draw the
request path across the Go process, PostgreSQL, Git storage, and blob storage.
They verify readiness and identify which data is mutable versus immutable.

### Lab 2: observe before changing

Students use request IDs, structured logs, metrics, and health endpoints to
answer: is the problem the API, database, Git subprocess, disk, or worker
queue? The exercise should include a healthy-but-unavailable dependency so
they do not rely on one green status indicator.

### Lab 3: capacity and backpressure

Run `growing-company` and `enterprise-burst` at increasing scale. Students
identify saturation, choose a safe limit, protect interactive Git operations,
and explain the tradeoff between rejecting work and exhausting the node.

### Lab 4: incident response

Inject one fault at a time. Require a timeline, impact statement, hypothesis,
mitigation, verification, and follow-up. The simulator should score evidence
and recovery behavior, not just whether the process eventually becomes green.

### Lab 5: backup, restore, and data integrity

Students restore a node into a new data directory, verify blob hashes, check
repository integrity with normal Git tooling, and compare expected versus
actual RPO/RTO. A successful HTTP health check is not sufficient evidence of a
successful restore.

### Lab 6: degraded service and recovery partner

Students inspect replica lag, stop the primary, decide whether a replica is
fresh enough to promote, and communicate what is unavailable during recovery.
The initial exercise should be manual and explicit; it should not hide the
authority transition behind a magic automatic failover button.

## SLOs and evidence

The training environment should make these measurable from the beginning:

- successful API request rate by route and tenant;
- p50/p95/p99 latency for interactive and background operations;
- Git clone/fetch/push success rate and duration;
- queue depth, oldest job age, retry count, and dead-letter count;
- database connections, query latency, and transaction failures;
- disk/blob usage, write failures, and integrity-check failures;
- replica freshness, transfer throughput, and verification failures;
- backup completion, restore duration, RPO, and RTO;
- impact scope: affected tenants, repositories, and operation types.

Students should receive dashboards and runbooks that are generated from these
real signals. Avoid synthetic “everything is healthy” dashboards whose values
are unrelated to the workload.

## First implementation sprint

The next coherent slice should be:

1. Add configuration, node identity, structured request logging, request IDs,
   liveness/readiness semantics, and a small metrics contract.
2. Add the first PostgreSQL migration for users, workspaces, repositories,
   sessions, and audit events.
3. Implement repository creation and listing, plus local bare-repository
   lifecycle management.
4. Define authenticated Git HTTP clone/fetch/push boundaries and test them with
   real Git commands.
5. Replace the homepage's repository and activity constants with API-backed
   loading, empty, and error states.
6. Add a tiny `small-team` simulator scenario that creates synthetic data and
   performs the same repository operations through HTTP/Git.
7. Write the first runbook: “node unavailable during a push,” including the
   exact logs, metrics, commands, and recovery evidence a student should
   collect.

This order gives us a usable Forge core and the first SRE lesson at the same
time. It also establishes the interfaces that later issues, pull requests,
Actions, packages, replication, and larger simulation scenarios must respect.

## Explicit non-goals for now

- a GitHub feature checklist;
- microservices, Kubernetes, or multi-master consensus;
- making every community node production-critical;
- automatic federation before data ownership and promotion semantics are clear;
- claiming better uptime than GitHub;
- a simulator that bypasses the product's real APIs;
- fake metrics or fake customer data presented as production state.

The durable Forkalope advantage is not that its first node never fails. It is
that the system is understandable, observable, recoverable, and eventually
able to continue from an independently operated home when one node fails.
