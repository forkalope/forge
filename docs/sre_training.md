# Forkalope product and SRE training plan

## Decision

Forkalope should be built as two products on one foundation:

1. A useful, Git-compatible forge that can run as one boring node.
2. A repeatable training environment that makes that node behave like a
   production service under realistic load, failure, and recovery pressure.

The first release should be an **observable single-node forge plus one
complete, safely deliverable SRE lesson**. It should let a student install
Forkalope, create an account and repository, clone and push with normal Git,
observe the system, investigate one controlled failure, restore service, and
prove what data survived.

That is the first sellable training experience. It gives us a real product, a
real operational surface, and a small enough system that junior SREs can
understand end to end. It does not require a nearly complete GitHub
alternative.

The build rule is:

> Build forge features when they unlock an essential Git workflow or a
> specific scheduled lesson. Do not make the school wait for a feature merely
> because GitHub has it.

The dated visual review is kept separately in
[homepage_review_2026-09-14.md](./homepage_review_2026-09-14.md).

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

## Approved build order

This is the authoritative sequence for the first release. Collaboration
features are intentionally moved after the first complete lesson and pilot.

| Stage | Deliverable | Completion test |
| --- | --- | --- |
| **1. Working Git core** | Minimal authentication, repository lifecycle, real clone/fetch/push, basic browsing, truthful logs and status | A fresh installation completes the ordinary Git workflow without fixtures. |
| **2. First complete lesson** | Tiny workload driver, one controlled fault, recovery checks, student briefing, instructor guide, reset | Someone other than the author can complete the exercise with documented support. |
| **3. Small training pilot** | A few distinct exercises, reviewed work, an unfamiliar assessment, one preventive improvement | Learning and feedback can be delivered sustainably. |
| **4. Expand from evidence** | Selected background jobs, collaboration features, and harder workloads | Each addition supports a concrete product need or scheduled lesson. |
| **5. Recovery network** | Replication, freshness checks, explicit write authority, and promotion drills | Recovery preserves the stated data and authority guarantees. |

## Stage 0: operating foundation

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

The current `apiHealth` handler is an early acceptance-test target. It
unconditionally returns `"status": "ok"` and `"blob_store": "ready"` without
checking storage readiness. Operational status must reflect evidence: a
running process is liveness, while a usable service is readiness. If a
required dependency or write capability fails, readiness and the affected
operation must show that limitation.

Exit criteria: a student can run the node, identify whether it is alive, ready,
accepting work, or degraded, and explain what the logs and metrics mean.

## Stage 1: real single-node Git forge

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

## Stage 2: first complete training lesson

Bring the simulator forward as soon as the Git core works. The first simulator
should be small and boring:

- create a synthetic company, users, and repositories through a separate
  validated seed/reset path;
- perform normal repository operations through the public HTTP and Git
  interfaces;
- record attempted pushes, acknowledged pushes, and outcomes that were
  uncertain because a connection failed;
- inject one explicit, reversible fault;
- collect scenario events, logs, metrics, and recovery assertions;
- stop workloads, gather evidence, and reset only the assigned lab instance.

The first lesson should be **Pushes are failing**:

> A synthetic customer can browse existing repositories, but new pushes are
> failing. Determine the affected operations, communicate the current impact,
> restore writes safely, and verify repository integrity.

The student submits an incident timeline, diagnosis evidence, changes made,
verification results, and one prevention recommendation.

The instructor guide must define:

- starting state and synthetic customer context;
- injected fault and intended blast radius;
- expected signals and known-good baseline;
- valid recovery approaches and unsafe actions;
- hints and escalation path;
- reset procedure and data-retention expectations;
- objective outcome checks and a reasoning/communication rubric.

Separate guided practice from assessment. Practice can provide the runbook and
substantial help. Assessment should vary the circumstances so students must
transfer principles rather than memorize commands.

The first lesson passes only when the student demonstrates safe diagnosis,
appropriate communication, successful recovery, and independently verifiable
data integrity. A passing result applies to these training environments; it
does not authorize customer production access. Define a retake policy before
enrollment.

## Lab Safety Contract

No destructive exercise runs until these boundaries are implemented and
documented:

| Question | First-version contract |
| --- | --- |
| Where can faults run? | Only in explicitly provisioned, disposable training environments. |
| What can students access? | Their assigned environment, synthetic data, and lab-only credentials. |
| What can disk-full fill? | A size-limited training volume, never an arbitrary host filesystem. |
| What happens when the forge dies? | A separate lab controller remains available to stop workload, collect evidence, and reset. |
| What can reset delete? | Only resources belonging to a validated lab instance; never an arbitrary directory or endpoint. |

Simulated customer traffic should use ordinary product interfaces. Fault
injection, workload control, evidence collection, and emergency cleanup need a
separate administrative path so an outage cannot disable the mechanism needed
to end the exercise.

For hosted exercises that grant meaningful administrative access, start with a
disposable VM per student or small team. Containers can run inside that VM,
but containerization alone is not the security boundary for privileged
students. The training controller must validate instance identity before any
stop, cleanup, or reset operation.

This does not require a cloud lab platform before the pilot. A small
provisioning script and manually scheduled disposable environments are enough
to validate the first lesson.

## Stage 3: small training pilot

Before paid enrollment, run the proposed exercises with representative testers
who did not design them. Verify that:

- environments start and reset reliably;
- instructions are understandable without author intervention;
- logs, metrics, and feedback are deliverable;
- a changed follow-up exercise reveals whether learning transferred;
- instructor time and infrastructure consumption are sustainable;
- the pinned Forge version is known and reproducible.

An unexpected product bug should be recorded as a lab/platform problem, not
silently counted as student failure. Do not make an automated judge of
engineering judgment a prerequisite to launch. Software can check objective
outcomes while an instructor reviews reasoning, communication, and safety.

## Stage 4: expand from evidence

Add only the features and jobs that unlock a product need or scheduled lesson:

- a durable background-job table and worker loop;
- backup and repository-integrity jobs;
- issues and comments;
- pull requests backed by Git refs;
- reviews and merge state;
- notifications/inbox;
- webhooks;
- basic artifact/package metadata and upload/download.

A single backup or integrity-check job is enough to teach queue age, retries,
idempotency, stuck work, and dead letters. The entire collaboration feature
set is not a prerequisite for meaningful worker exercises.

Every background operation needs visible state such as queued, running,
succeeded, failed, or cancelled. Every added feature needs a storage model,
permission model, API contract, telemetry, and recovery behavior.

## Stage 5: replication and recovery network

Only after the local loop, first lesson, and pilot are useful, add peer
capabilities:

- repository and blob manifests with hashes, sizes, and timestamps;
- authenticated peer registration and capability advertisement;
- asynchronous transfer and verification;
- replica freshness and lag reporting;
- backup verification and restore drills;
- an explicit, manually initiated promotion workflow;
- conflict prevention while a replica is promoted.

Before a replacement accepts writes, the previous primary must be prevented
from accepting competing writes. The later promotion drill should include the
old node returning after the replica was promoted and test what prevents both
nodes from accepting pushes.

Start with repository Git data plus essential recovery metadata. Issues, pull
requests, permissions, secrets, packages, and audit history need deliberate
replication semantics; they should not be implied by copying a Git directory.

Exit criteria: a student can distinguish a normal node failure, a stale
replica, an incomplete restore, and a successful recovery. Automatic global
failover is not required for the pilot.

## Simulator design

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
- baseline, burst, and synchronized release workloads;
- traffic mixes for browsing, clone/fetch, push, issue/PR activity, webhook
  delivery, artifact transfer, and background maintenance;
- deterministic seeds and scenario IDs so an incident can be replayed;
- rate limits, concurrency controls, and a clean stop signal;
- scenario assertions for errors, latency, queue age, data loss, and recovery;
- event records that explain what the simulator intended to do and what the
  forge actually returned.

The simulator should not be a second fake frontend. Its value is making the
real product observable at a scale and cadence that students can safely
operate.

## Initial scenarios

The first class does not need real businesses. It needs believable operating
pressure with safe boundaries. Use synthetic tenants with stable names and
documented characteristics:

| Scenario | Shape | What it teaches |
| --- | --- | --- |
| `small-team` | 8 users, 20 repos, light pushes and issue traffic | install, logs, basic triage |
| `growing-company` | 80 users, 250 repos, frequent fetches, PRs, and webhooks | capacity, queue behavior, noisy neighbors |
| `enterprise-burst` | 500 users, 2,000 repos, scheduled clone/fetch and artifact bursts | rate limits, database and disk pressure |
| `release-day` | normal baseline plus synchronized push and package publish | backpressure, retries, incident command |
| `node-loss` | primary process or host becomes unavailable | backup, replica freshness, restore and promotion |

The numbers are scale factors, not hard-coded promises. The same scenario must
run at `0.1x` on a laptop and larger factors in a lab environment.

Fault injection should be explicit and reversible. The first fault library can
cover API restart, worker crash, database latency, disk pressure, slow Git
subprocesses, network delay, stale replicas, and bad deployment rollback. Do
not begin with random chaos. Each scenario needs a hypothesis, blast radius,
expected signals, recovery runbook, and reset path.

## Reliability exercises and objectives

Telemetry is not an objective by itself. Each lesson should define:

- the important user operation;
- the measurement window;
- what counts as success;
- a target appropriate to the training workload;
- the decision students must make when the target is missed.

These are lab objectives, not public hosting guarantees. Students should use
them to choose between capacity, limits, retries, alerting, and recovery work
under a limited infrastructure budget.

The incident loop is:

```text
diagnose
  -> recover
  -> explain
  -> implement one preventive improvement
  -> rerun the workload
```

The improvement can be a safer configuration, resource limit, alert, recovery
check, or deployment procedure. Students should demonstrate that the rerun
changed the relevant signal or reduced the blast radius.

The training environment should measure:

- successful API request rate by route and tenant;
- p50/p95/p99 latency for interactive and background operations;
- Git clone/fetch/push success rate and duration;
- queue depth, oldest job age, retry count, and dead-letter count;
- database connections, query latency, and transaction failures;
- disk/blob usage, write failures, and integrity-check failures;
- replica freshness, transfer throughput, and verification failures;
- backup completion, restore duration, RPO, and RTO;
- impact scope: affected tenants, repositories, and operation types.

## Recovery verification

Recovery must be judged against an independent record, not only a green
dashboard inside the environment being broken.

The workload driver should record:

- commits it attempted to push;
- pushes acknowledged by the forge;
- pushes with uncertain outcomes because the connection failed;
- expected repository permissions and key metadata;
- the backup or recovery point used by the scenario.

After recovery, it should verify the corresponding repository state and access
rules. This answers whether the data and permissions the exercise promised to
preserve actually survived.

Keep these exercises distinct:

- **Process crash and restart:** verify persistence behavior for acknowledged
  operations and identify uncertain client outcomes.
- **Backup restore:** verify the documented recovery point, explicitly identify
  changes made after the backup, and measure the resulting loss.
- **Replica promotion:** verify write authority, freshness, and split-brain
  prevention before and after the old node returns.

The first backup procedure should be intentionally simple and consistent:
pause all relevant writers, capture the required PostgreSQL metadata, Git
repositories, blob store, configuration, and a manifest, then resume. Restore
into a fresh environment and verify both data and permissions. Sophisticated
online backups can come later; an unambiguous maintenance-window backup is a
better first lesson.

## Student curriculum

### Lab 1: install and explain the system

Students deploy one node, create a repository, make a push, and draw the
request path across the Go process, PostgreSQL, Git storage, and blob storage.
They verify readiness and identify mutable versus immutable data.

### Lab 2: observe before changing

Students use request IDs, structured logs, metrics, and health endpoints to
answer whether a problem is in the API, database, Git subprocess, disk, or
worker queue. The exercise includes a healthy-but-unavailable dependency so
they do not rely on one green indicator.

### Lab 3: capacity and backpressure

Run `growing-company` and `enterprise-burst` at increasing scale. Students
identify saturation, choose a safe limit, protect interactive Git operations,
and explain the tradeoff between rejecting work and exhausting the node.

### Lab 4: incident response

Inject one fault at a time. Require a timeline, impact statement, hypothesis,
mitigation, verification, prevention change, and follow-up. Score evidence and
recovery behavior, not just whether the process eventually becomes green.

### Lab 5: backup, restore, and data integrity

Students restore a node into a new data directory, verify blob hashes, check
repository integrity with normal Git tooling, and compare expected versus
actual RPO/RTO. A successful HTTP health check is not sufficient evidence.

### Lab 6: degraded service and recovery partner

Students inspect replica lag, stop the primary, decide whether a replica is
fresh enough to promote, and communicate what is unavailable during recovery.
The initial exercise is manual and explicit; automatic failover is not needed
to teach the authority transition.

## First implementation sprint

The next coherent slice should be:

1. Add configuration, node identity, structured request logging, request IDs,
   liveness/readiness semantics, and a small metrics contract.
2. Make `apiHealth` truthful about storage/write readiness.
3. Add the first PostgreSQL migration for users, workspaces, repositories,
   sessions, and audit events.
4. Implement repository creation and listing, plus local bare-repository
   lifecycle management.
5. Define authenticated Git HTTP clone/fetch/push boundaries and test them with
   real Git commands.
6. Replace the homepage's repository and activity constants with API-backed
   loading, empty, and error states.
7. Add a tiny `small-team` simulator scenario that creates synthetic data and
   performs the same repository operations through HTTP/Git.
8. Write the first student briefing, instructor guide, reset procedure, and
   runbook: “node unavailable during a push.”

This order gives us a usable Forge core, the first training lesson, and the
evidence needed to choose what to build next.

## Explicit non-goals for now

- a GitHub feature checklist;
- microservices, Kubernetes, or multi-master consensus;
- making every community node production-critical;
- automatic federation before data ownership and promotion semantics are clear;
- claiming better uptime than GitHub;
- a simulator that bypasses the product's real APIs;
- fake metrics or fake customer data presented as production state;
- paid enrollment before an unfamiliar tester can complete and reset the first
  lesson reliably.

The durable Forkalope advantage is not that its first node never fails. It is
that the system is understandable, observable, recoverable, and eventually
able to continue from an independently operated home when one node fails.
