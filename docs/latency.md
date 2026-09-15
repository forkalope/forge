I would **make this a new repo and write it in Go**.

Not `cmd/forkalope`. The thing you’re describing has grown beyond the simulator currently envisioned inside `forge`.

Right now `cmd/forkalope` is extremely clean: it starts a real Forkalope node, creates its real local blob store, and serves the real HTTP application.  I would protect that boundary.

The existing SRE plan already proposes a smaller `cmd/forkalope-sim` inside `forge`, but that simulator has a different job: generate customers/workloads through the real HTTP/Git interfaces, inject a controlled fault, and verify outcomes.

What you're proposing now is closer to:

> **simulate the physical Forkalope cloud itself.**

That's important enough to deserve `forkalope/sim` or `forkalope/simulator`.

## I would divide it like this

```text
forkalope/forge
────────────────────────────
Actual product

forkalope
  real HTTP server
  real Git operations
  real storage
  real node APIs
  real observability

Possibly:
  cmd/forkalope-sim

That small simulator means:
"generate 500 developers doing Git stuff"


forkalope/sim
────────────────────────────
Synthetic Forkalope universe

100 fake physical machines
20 cities
8 hosting providers
realistic links
disk capacities
CPU/load
service roles
Nebula/Fabric topology
hardware failure
provider outage
packet loss
latency
replication lag
runner queues
disk failures
deployments
etc.
```

Those are fundamentally different.

### The crucial architecture

Don't make Forge know:

```go
if simulation {
    return fakeNodes()
}
```

That would poison the production architecture.

Instead define the **real contract** between Forkalope nodes and the Forkalope control plane.

Something like:

```text
Node agent
     │
     ├── register
     ├── heartbeat
     ├── capabilities
     ├── health
     ├── metrics
     ├── storage status
     ├── network peers
     ├── replication state
     └── events
           │
           ▼
     Forkalope control plane
```

A real machine eventually runs:

```text
forkalope-agent
```

and sends that information.

The simulator runs:

```text
100 simulated forkalope-agents
```

which send **the exact same information**.

Then your production UI literally cannot tell the difference.

That is exactly what you want for the flight simulator idea.

---

# One Go process should initially pretend to be all 100 machines

I would **not** start 100 Docker containers.

And definitely don't start 100 VMs.

Have:

```text
forkalope-sim
       │
       ├── node-001
       ├── node-002
       ├── node-003
       ├── ...
       └── node-100
```

Each is just an actor/state machine.

For example:

```go
type Node struct {
    ID       string
    Provider string
    City     string
    Country  string

    Latitude  float64
    Longitude float64

    CPUCores  int
    RAMBytes  uint64
    DiskBytes uint64

    Roles []Role

    CPUUsage    float64
    MemoryUsage uint64
    DiskUsed    uint64

    State NodeState

    Peers []Peer
}
```

You can have:

```text
node-001
OVH
Paris
32 cores
128 GB
12 TB
git-storage
healthy

node-002
Hetzner
Helsinki
16 cores
64 GB
8 TB
runner
healthy

node-003
Vultr
Los Angeles
8 cores
32 GB
2 TB
control-plane
degraded

node-004
community colo
Salt Lake City
24 cores
96 GB
18 TB
replica
healthy
```

That's dirt cheap computationally.

100 nodes is nothing.

You could probably simulate **100,000 logical nodes** this way before the language becomes remotely interesting.

---

# That's also why I'd choose Go, not Rust

For this workload Rust buys you essentially nothing.

This simulator is primarily:

```text
state machines
timers
HTTP
WebSockets
JSON/protobuf
random events
concurrent actors
scenario scheduling
metrics
```

That's Go's sweet spot.

You can write:

```go
for _, node := range world.Nodes {
    go node.Run(ctx)
}
```

and now you have 100 independently behaving machines.

I'm simplifying the synchronization you'll eventually need, but the conceptual fit is almost perfect.

Rust would be attractive if you told me:

> We need to simulate every packet between one million hosts at 20M packets/sec.

That's a different project.

You're saying:

> node 27's disk latency went from 4ms to 900ms, replication is backing up, Amsterdam→Virginia RTT is 93ms, three runners are offline, and OVH just lost a rack.

Go.

Your own architecture document already landed on essentially this distinction: Go for the normal Forkalope server, with Rust reserved as a possible later choice for genuinely performance-sensitive replication/network/storage machinery.

---

# Model the *world*, not just nodes

This is where the separate repo really starts paying off.

I'd have something like:

```text
sim/
├── cmd/
│   └── forkalope-sim/
│       └── main.go
│
├── internal/
│   ├── world/
│   ├── node/
│   ├── network/
│   ├── provider/
│   ├── workload/
│   ├── faults/
│   ├── metrics/
│   └── engine/
│
├── worlds/
│   ├── production-100.yaml
│   ├── production-500.yaml
│   └── tiny.yaml
│
└── scenarios/
    ├── normal.yaml
    ├── hetzner-outage.yaml
    ├── atlantic-packet-loss.yaml
    ├── storage-exhaustion.yaml
    ├── bad-deploy.yaml
    └── runner-stampede.yaml
```

Then `production-100.yaml` can describe your imaginary future network:

```yaml
providers:
  - hetzner
  - ovh
  - vultr
  - leaseweb
  - equinix
  - community

regions:
  - Los Angeles
  - Ashburn
  - Dallas
  - Toronto
  - London
  - Amsterdam
  - Helsinki
  - Frankfurt
  - Singapore
  - Tokyo
  - Sydney

nodes: 100
```

But I'd make the generated world deterministic:

```bash
forkalope-sim \
    --world production-100 \
    --seed 4815162342
```

Same seed means same machines, same hardware, same topology.

That's extremely valuable for SRE training.

---

# Network latency shouldn't just be `distance / speedOfLight`

Have a network model.

For example:

```text
LA ↔ LA          1–4 ms
LA ↔ Dallas     30–40 ms
LA ↔ Ashburn    60–75 ms
LA ↔ London    130–150 ms
LA ↔ Amsterdam 140–160 ms
LA ↔ Tokyo      95–120 ms
```

Then add:

```text
jitter
packet loss
bandwidth
congestion
provider peering quality
route changes
relay use
```

So a link becomes something like:

```go
type Link struct {
    RTT        time.Duration
    Jitter     time.Duration
    Loss       float64
    Bandwidth  int64
    ViaRelay   bool
}
```

And you can inject:

```text
2026-09-14 14:31:02
Cogent transit issue

AMS → IAD
RTT: 82ms → 241ms
loss: 0.05% → 7.2%
```

Now suddenly your real Forkalope dashboard starts lighting up.

---

# But use two levels of network simulation

This is an important distinction.

For **most of the fake 100-node world**, don't actually delay packets.

Just calculate:

```text
node 14 → node 81 = 147ms
```

and have the simulated services behave accordingly.

That's fast and deterministic.

But for certain SRE exercises, you will eventually want **actual network behavior**.

Then don't write that yourself either.

On Linux, `tc netem` can inject delay, jitter, packet loss, corruption, duplication, rate limits, and packet reordering. ([man7.org][1])

Toxiproxy can similarly put a real TCP service behind latency, jitter, bandwidth constraints, connection timeouts, and outages; Shopify built it specifically for deterministic resiliency testing. ([GitHub][2])

So you'd have:

```text
LEVEL 1

100 simulated nodes
Go event model

fast
cheap
always running
drives production UI


LEVEL 2

selected real components
+
Toxiproxy / tc netem

actual Git
actual Postgres
actual network impairment

used for serious exercises
```

That's much better than attempting to write a packet simulator.

---

# Eventually make the simulator hybrid

This is the really powerful part.

Suppose your simulated cloud has:

```text
100 nodes
```

At first:

```text
100 simulated
0 real
```

Later:

```text
97 simulated
3 real
```

Later:

```text
80 simulated
20 real
```

Eventually production:

```text
0 simulated
100 real
```

**Nothing about the operations UI changes.**

That's the architecture I'd aim for.

A record might explicitly know:

```text
node-048
kind=simulated
```

but that field isn't normally shown to students.

Both simulated and real nodes implement:

```text
NodeAgent protocol
```

That protocol becomes an extremely important Forkalope interface.

---

# It also lets you simulate whole-provider events properly

Rather than writing:

```go
node42.Down = true
node43.Down = true
node44.Down = true
```

you could model:

```text
Provider
   └── Datacenter
        └── Rack
             └── Node
```

So:

```text
OVH
 ├── BHS
 ├── RBX
 └── SBG
      ├── rack-12
      │    ├── node-17
      │    ├── node-26
      │    └── node-49
      │
      └── rack-14
```

Then:

```bash
sim fault rack-power-loss ovh/sbg/rack-12
```

causes three nodes to disappear.

Or:

```bash
sim fault provider-network ovh/sbg
```

leaves machines running but unreachable externally.

Or:

```bash
sim fault transatlantic-congestion
```

produces a weird partial failure rather than a clean red/green outage.

Those are exactly the kinds of things that will make the SRE simulator feel convincing.

---

## There's one thing I'd change in your existing SRE document

It currently recommends:

```text
cmd/forkalope-sim/
internal/sim/
sim/scenarios/
```

inside Forge.

I **would keep that recommendation for the small workload generator**, but rename/conceptually distinguish it:

```text
forge/cmd/forkalope-load
```

or:

```text
forge/cmd/forkalope-workload
```

Its job:

> “Pretend to be GitHub users.”

Then:

```text
forkalope/sim
```

job:

> **“Pretend to be the Forkalope cloud.”**

That separation is exceptionally clean.

So the end-state mental model becomes:

```text
                    ┌──────────────────────┐
                    │    forkalope/sim     │
                    │                      │
                    │ pretend servers      │
                    │ providers            │
                    │ geography            │
                    │ network              │
                    │ hardware/failures    │
                    └──────────┬───────────┘
                               │
                      real node protocol
                               │
                               ▼
┌────────────────┐      ┌───────────────┐
│ forge workload │ ───► │ Forkalope     │
│ generator      │      │ control plane │
│                │      │ + UI          │
│ fake humans    │      └───────────────┘
└────────────────┘
```

**Go for both. Separate repos for the cloud simulator and Forge. Same contracts as production. No `if mock` branches in the real product.**

That gives you a path where the simulator you build this month can remain useful even when Forkalope really does have 100 physical machines.

[1]: https://man7.org/linux/man-pages/man8/tc-netem.8.html?utm_source=chatgpt.com "tc-netem(8) - Linux manual page"
[2]: https://github.com/shopify/toxiproxy?utm_source=chatgpt.com "GitHub - Shopify/toxiproxy: :alarm_clock: A TCP proxy to simulate network and system conditions for chaos and resiliency testing · GitHub"

