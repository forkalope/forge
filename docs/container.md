Yes — and this changes my previous recommendation in an important way.

**A Go program with 100 `Node` structs cannot really test Nebula.** It can simulate what we *think* Nebula would do, but it won't exercise real TUN interfaces, UDP discovery, lighthouse behavior, peer handshakes, NAT traversal, routing, packet loss, MTU problems, or recovery.

For that layer, we should use existing network-emulation technology.

## The strongest candidate: Containerlab

Containerlab is remarkably close to what we need. You describe nodes and links in YAML; it launches real Linux containers and wires them together as a network. Crucially, it supports real link impairments: **delay, jitter, packet loss, bandwidth limits, and corruption** using Linux `netem`. ([Containerlab][1])

And this is the killer feature for Nebula: Containerlab can give a container `/dev/net/tun` and `NET_ADMIN`. ([Containerlab][2])

So we can run **actual Nebula**:

```text
                 FAKE INTERNET UNDERLAY
       145ms                          91ms
  0.2% loss                       0.01% loss
       │                               │
       ▼                               ▼

┌────────────────┐              ┌────────────────┐
│ fake LA server │              │ fake Amsterdam │
│ REAL Linux net │              │ REAL Linux net │
│ REAL Nebula    │              │ REAL Nebula    │
│ REAL fk-agent  │              │ REAL fk-agent  │
└───────┬────────┘              └────────┬───────┘
        │                                │
        ╰════════ REAL NEBULA ═══════════╯
                 encrypted tunnel
```

Nebula believes these are two real machines.

As far as Nebula is concerned:

```text
LA machine:
  public-ish underlay IP
  tun device
  UDP socket
  Nebula cert

Amsterdam machine:
  public-ish underlay IP
  tun device
  UDP socket
  Nebula cert
```

And the packets genuinely experience the injected latency/loss.

Nebula itself is designed to run on anything from a handful of hosts to tens of thousands, so 100 nodes is exactly the sort of topology worth exercising. ([GitHub][3])

## We could build an actual fake Internet

Instead of putting all 100 containers on one Docker bridge, I'd go further:

```text
                         Internet
                    ┌────────┴────────┐
                    │                 │
                 US transit       EU transit
                 /       \         /       \
              LAX        IAD     LON       FRA
             /   \       / \     / \       / \
         Hetzner OVH  Vultr ... ... ... Hetzner
            │
      ┌─────┼─────┐
      n17   n32   n61
```

The links could have characteristics such as:

```text
LAX → IAD
delay:     34ms
jitter:     3ms
loss:       .02%
bandwidth:  2Gbps

LAX → AMS
delay:     72ms each direction
jitter:     6ms
loss:       .08%
bandwidth:  800Mbps
```

Then we're not saying to Nebula:

> pretend Amsterdam is 150ms away.

We're making the actual packets take that long.

Containerlab explicitly supports ordinary Linux containers as topology nodes, and those can run any applications we put in them. ([Containerlab][4])

---

# There's another serious candidate: CORE

CORE, the **Common Open Research Emulator**, is even more explicitly designed for this exact problem.

It creates lightweight virtual machines/network namespaces and lets you run **real, unmodified applications and protocols** inside an emulated network. It was originally developed by Boeing/NRL and supports running the emulation across multiple physical hosts. ([GitHub][5])

It has:

* bandwidth
* delay
* packet loss
* duplication
* network namespaces
* Docker nodes
* physical nodes
* distributed emulation
* GUI topology editing

([Core Emulator][6])

CORE is basically saying:

> Draw 100 computers and a network between them, then run real software inside those computers.

That's extremely relevant.

### CORE versus Containerlab

For Forkalope, I'd start with **Containerlab**.

Containerlab feels more like something we'd want in our repo:

```yaml
name: forkalope-world

topology:
  nodes:

    lax-01:
      kind: linux
      image: forkalope/lab-node

    lax-02:
      kind: linux
      image: forkalope/lab-node

    ams-01:
      kind: linux
      image: forkalope/lab-node

    lighthouse-01:
      kind: linux
      image: forkalope/lab-node
```

It's code-first, YAML-defined and highly automatable.

CORE interests me more for interactive networking research and its visual GUI.

---

# There's even a third category: Shadow

This one is fascinating.

Shadow's tagline is essentially:

> **real applications, simulated networks**

It can execute real Linux application binaries while putting them inside a discrete-event simulated network, with configurable topology, bandwidth, latency and packet loss. It can scale to **thousands of processes**, and simulations can be deterministic. ([Shadow Network Simulator][7])

You can describe:

```yaml
network:
  ...
hosts:
  lax1:
    ...
  ams1:
    ...
```

and the applications think they're performing real network I/O while Shadow controls the simulated network. ([Shadow Network Simulator][8])

This could be extraordinary later for testing Forkalope's distributed application protocols.

However, I **wouldn't start there for Nebula**. Shadow implements/intercepts networking system calls itself and documents that not every Linux API is supported. ([Shadow Network Simulator][9])

Nebula's use of TUN devices and low-level networking makes real Linux namespaces/containers a much safer match.

So:

```text
Nebula testing          → Containerlab
Forkalope protocol at
10,000-node scale       → maybe Shadow someday
```

---

# Therefore I'd change what `forkalope/sim` means

Don't write:

```text
forkalope/sim

our homegrown network simulator
our packet delay implementation
our virtual hosts
our fake sockets
our fake network
```

That would be reinventing decades of networking research.

Instead:

```text
forkalope/sim

Forkalope-specific world generator
        │
        ├── providers
        ├── cities
        ├── machines
        ├── roles
        ├── workloads
        ├── failures
        └── scenarios
                │
                ▼
          Containerlab
                │
        ┌───────┴────────┐
        │                │
    Linux node       Linux node
    real Nebula      real Nebula
    real agent       real agent
```

That's a much better project.

We build **the world definition**, not the network emulator.

---

## So our Go code might generate this

We could have:

```yaml
world: global-100
seed: 4815162342

providers:
  hetzner:
    reliability: 0.9995

  ovh:
    reliability: 0.9994

  vultr:
    reliability: 0.9993

locations:
  lax:
    lat: 33.94
    lon: -118.40

  ashburn:
    lat: 39.04
    lon: -77.49

  amsterdam:
    lat: 52.37
    lon: 4.90

  helsinki:
    lat: 60.17
    lon: 24.94

nodes:
  - count: 18
    provider: hetzner
    location: helsinki

  - count: 12
    provider: ovh
    location: london

  - count: 8
    provider: vultr
    location: lax
```

Our Go program:

```text
world.yaml
    ↓
forkalope-sim
    ↓
generate
    ├── containerlab topology
    ├── IP addressing
    ├── Nebula CA/certs
    ├── Nebula configs
    ├── lighthouse configs
    ├── netem settings
    ├── Forkalope node configs
    └── scenario metadata
```

Then:

```bash
forkalope-sim up global-100
```

could internally deploy Containerlab.

That's an appropriate thing for us to build.

---

# And then we can test Nebula properly

For example:

### Lighthouse death

```text
kill lighthouse-01
```

Does an existing:

```text
LAX ↔ AMS
```

Nebula connection remain alive?

Do new peers find each other?

What happens when lighthouse-02 takes over?

### Transatlantic degradation

Change:

```text
70ms / 0.1%
```

to:

```text
180ms / 8%
```

Containerlab can modify link impairment while the lab is running. ([Containerlab][10])

Now measure:

```text
replication lag
Git fetch duration
runner artifact upload
Nebula handshakes
reconnections
control-plane heartbeats
```

### Total provider isolation

```text
OVH Amsterdam
          X
      Internet
```

Watch 13 nodes disappear simultaneously.

### Relay testing

Break direct peer connectivity while leaving a relay reachable.

Then verify:

```text
before:
LAX ───────── AMS
     direct

after:
LAX ── relay ── AMS
```

using **real Nebula packets**.

### NAT

Put a group of fake machines behind fake NAT.

Then see whether Nebula performs the peer discovery/NAT behavior we expect rather than trusting our own simulator to tell us that it would.

That's enormously more valuable.

---

# We should still have the lightweight Go simulation

I wouldn't throw away that idea entirely.

I'd have **two fidelity levels**:

```text
LEVEL 1 — logical simulation
────────────────────────────

100 / 1,000 / 100,000 fake nodes
Go structs
fake metrics
fake telemetry
fast scenarios

Purpose:
UI development
SRE dashboards
scenario authoring
huge fleet visualization


LEVEL 2 — network emulation
────────────────────────────

10 / 50 / 100 real Linux containers
real Nebula
real Forkalope agent
real UDP
real TUN
real Git traffic
real netem latency/loss

Purpose:
correctness
integration testing
network failures
distributed-system behavior
SRE advanced labs
```

And later perhaps:

```text
LEVEL 3

some actual physical servers
+
Containerlab/emulated nodes
```

CORE explicitly supports connecting emulated environments to physical networks, and Containerlab has mechanisms for extending labs onto external bridges and even across multiple hosts. ([Naval Research Laboratory][11])

So we can get hardware-in-the-loop eventually.

---

## This is unusually good prior art for Forkalope

I would **not build a network emulator**.

I would spend perhaps a day or two prototyping this first:

```text
5 Containerlab Linux nodes

US West:
  node-a
  node-b

US East:
  node-c

Europe:
  node-d

Lighthouse:
  lighthouse-1

All 5 run real Nebula.
```

Set:

```text
west↔east    70ms
west↔europe 145ms
east↔europe 80ms
```

Then verify:

```bash
node-a$ ping <Nebula-IP-of-node-d>
```

actually shows roughly the expected RTT over the **real Nebula tunnel**.

Next inject 5% packet loss.

Then kill the lighthouse.

If that works the way I expect, I'd stop researching generic simulators and make **Containerlab the initial underlay for Forkalope's simulated world**.

One practical note for your Mac Studio: Containerlab's labs ultimately need Linux networking APIs. Their current macOS guidance is to run it inside an ARM64 Linux VM—OrbStack is their recommended route, though they also mention Docker Desktop and Colima. ([Containerlab][12])

So the architecture I'd settle on now is:

```text
forkalope/forge
    real product

forkalope/sim
    Go
    world/scenario model
    Containerlab generator/controller
             │
             ▼
       Containerlab
       Linux + netem
             │
             ▼
    real Nebula + real agents
```

That is much stronger than us writing our own fake networking, and it gives the flight-school simulator something particularly valuable: **the dashboards can be synthetic, but the network failures underneath them can be completely real.**

[1]: https://containerlab.dev/?utm_source=chatgpt.com "containerlab"
[2]: https://containerlab.dev/manual/nodes/?utm_source=chatgpt.com "Nodes - containerlab"
[3]: https://github.com/slackhq/nebula?utm_source=chatgpt.com "GitHub - slackhq/nebula: A scalable overlay networking tool with a focus on performance, simplicity and security · GitHub"
[4]: https://containerlab.dev/manual/kinds/linux/?utm_source=chatgpt.com "Linux container - containerlab"
[5]: https://github.com/coreemu/core?utm_source=chatgpt.com "GitHub - coreemu/core: Common Open Research Emulator · GitHub"
[6]: https://coreemu.github.io/core/nodetypes.html?utm_source=chatgpt.com "Overview - CORE Documentation"
[7]: https://shadow.github.io/?utm_source=chatgpt.com "The Shadow Network Simulator"
[8]: https://shadow.github.io/docs/guide/shadow_config_spec.html?utm_source=chatgpt.com "Shadow Config Specification - The Shadow Simulator"
[9]: https://shadow.github.io/docs/guide/?utm_source=chatgpt.com "The Shadow Simulator - The Shadow Simulator"
[10]: https://containerlab.dev/cmd/tools/netem/set/?utm_source=chatgpt.com "Setting link impairments - containerlab"
[11]: https://www.nrl.navy.mil/Our-Work/Areas-of-Research/Information-Technology/NCS/CORE/demo1/?utm_source=chatgpt.com "Common Open Research Emulator (CORE)"
[12]: https://containerlab.dev/macos/?utm_source=chatgpt.com "Containerlab on macOS - containerlab"

