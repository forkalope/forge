I would **not** use Apple’s new `container` tool for each fake Forkalope machine.

For this particular workload, the most efficient architecture on one Apple-silicon MacBook Pro is:

```text
macOS
│
└── ONE ARM64 Linux VM
    │
    ├── Containerlab
    ├── Docker/containerd
    │
    ├── node-001 container
    ├── node-002 container
    ├── node-003 container
    ├── ...
    └── node-100 container
```

All 100 fake servers share **one Linux kernel**. That is exactly what you want.

Containerlab's current macOS documentation recommends essentially this setup: create an ARM64 Linux VM with **OrbStack**, then install Containerlab inside that VM. Containerlab needs Linux-specific networking APIs such as netlink and network namespaces, which macOS itself doesn't provide. ([Containerlab][1])

### Why not Apple's `container`?

Apple's `container` is very cool, but its default architecture is almost the *opposite* of what we want.

Each:

```bash
container run ...
```

gets its **own lightweight Linux VM**. Apple's docs currently default each one to **1 GB RAM and 4 CPUs**. ([GitHub][2])

So conceptually:

```text
Apple container

Mac
├── VM → node-001
├── VM → node-002
├── VM → node-003
├── VM → node-004
...
└── VM → node-100
```

That's excellent for strong container isolation.

It's lousy for:

> “Give me 100 tiny fake Linux servers as cheaply as possible.”

Apple is working toward multiple containers sharing one VM—the underlying Containerization framework already has an experimental `LinuxPod` concept—but as of late August 2026 that shared-machine functionality still wasn't exposed normally by the `container` CLI. ([GitHub][3])

So I would **not build Forkalope's simulator around that yet**.

---

## OrbStack is the boring correct answer right now

I'd use:

```text
MacBook Pro
│
│ Apple Virtualization.framework
│
└── OrbStack Ubuntu ARM64 VM
        │
        ├── Docker
        └── Containerlab
              │
              ├── 100 ARM64 Linux containers
              │
              ├── network namespaces
              │
              ├── veth interfaces
              │
              ├── netem
              │
              └── REAL Nebula
```

OrbStack itself uses Apple's virtualization stack efficiently, but there's only **one big Linux VM** from our perspective.

Inside Linux, traditional containers are cheap because they're processes + namespaces rather than VMs.

That's exactly the scaling characteristic we need.

And Containerlab's maintainers explicitly call OrbStack their recommended macOS choice for performance/UX. ([Containerlab][4])

---

# Make the fake node image extremely tiny

Don't put Ubuntu in every node.

I'd probably build something like:

```dockerfile
FROM alpine
COPY nebula /usr/local/bin/nebula
COPY forkalope-agent /usr/local/bin/forkalope-agent
COPY entrypoint /entrypoint
ENTRYPOINT ["/entrypoint"]
```

Or eventually even `scratch`/distroless if we don't need utilities.

Each node needs basically:

```text
Linux namespace
Nebula
Forkalope agent
iproute2 / debugging tools
tiny amount of state
```

Not:

```text
systemd
ssh server
apt
Python
cron
desktop packages
```

Then 100 machines become surprisingly cheap.

---

## Use ARM64 everywhere

This matters a lot.

Your MacBook is Apple silicon, so build:

```text
nebula          linux/arm64
forkalope-agent linux/arm64
sim image       linux/arm64
```

Do **not** emulate x86 servers merely because your eventual Hetzner boxes might be x86.

Containerlab specifically warns that x86 network images on Apple silicon incur Rosetta/QEMU overhead, while native ARM64 images are much more practical. ([Containerlab][4])

Your test is:

> Does Nebula/Forkalope behave correctly over this topology?

not:

> Can we emulate an Intel CPU?

Architecture shouldn't matter for this test.

---

# The laptop probably can handle 100 nodes

Especially if they're idle most of the time.

Roughly, I'd expect the dominant resource usage to be:

```text
one Linux VM
Docker/containerd
100 × Nebula
100 × forkalope-agent
some routing/netem processes
actual Forge services
```

Not 100 complete operating systems.

I would aim for a world that consumes perhaps **single-digit GBs of active RAM**, then measure rather than guessing further.

A 24/32/36 GB MacBook Pro should be very comfortable for a 100-node networking lab if the node images stay tiny.

With 16 GB, I'd be more careful about simultaneously running:

```text
100 nodes
Postgres
Forge
browser
Xcode
Codex/ChatGPT tools
```

and perhaps default the lab to 50 real network nodes.

---

# And we don't actually need every simulated server to be "heavy"

Here's another optimization I'd build into `forkalope/sim`.

Have:

```bash
forkalope-sim up global-100
```

create:

```text
100 real network namespaces/containers
100 real Nebula instances
100 real Forkalope agents
```

but only a few machines run heavy roles:

```text
3   PostgreSQL-ish nodes
10  Git storage nodes
10  runners
5   object-storage nodes
3   control-plane nodes

69  tiny nodes
```

Those remaining 69 can just run:

```text
Nebula
agent
health/status responder
```

Maybe 20–40 MB apiece rather than hundreds.

They still behave like physical hosts from the network's perspective.

---

# Even more efficient: network namespaces without Docker

There is technically an even lighter future option:

```text
Linux VM
│
├── namespace node001
├── namespace node002
├── namespace node003
...
└── namespace node100
```

with `ip netns`.

No container runtime at all.

Each namespace gets:

```text
veth
filesystem/config
Nebula process
Forkalope-agent process
```

That would likely be the absolute cheapest approach.

But **I would not start there**.

Containerlab already automates exactly this family of Linux networking work and gives us topology management, links, interfaces, lifecycle, `netem`, etc.

Save custom namespace orchestration for the day when profiling says Docker/containerd overhead matters.

---

# Apple's new tool might still be useful

There's one interesting new development: Apple now has:

```bash
container machine
```

for a **long-lived Linux environment**. ([GitHub][5])

So theoretically we could eventually do:

```text
macOS
  ↓
Apple container machine
  ↓
one Linux VM
  ↓
Docker/containerd
  ↓
Containerlab
  ↓
100 nodes
```

In other words, use Apple's software to provide the **one Linux machine**, not to represent the 100 machines.

That could eventually replace OrbStack.

But today I wouldn't choose it. Containerlab documents and recommends OrbStack; Apple's `container machine` is much newer, while this simulator is already doing unusual low-level networking.

We don't need two experimental variables at once.

## My v1 stack

I'd lock this in:

```text
               MacBook Pro
                    │
           Apple silicon ARM64
                    │
                    ▼
                OrbStack
                    │
             ONE Ubuntu VM
                    │
          ┌─────────┴─────────┐
          │                   │
      Containerlab        Docker
          │
          ▼
 ┌──────────────────────────────┐
 │   Fake Forkalope Internet    │
 │                              │
 │  100 lightweight containers │
 │  100 real Nebula processes  │
 │  100 real Forkalope agents  │
 │                              │
 │  netem latency/loss/jitter   │
 │  fake ISPs/providers         │
 │  fake cities/datacenters     │
 └──────────────────────────────┘
```

That gives you **100 “servers around the world” on one MacBook without actually virtualizing 100 computers.**

And there's another big benefit: the exact same Containerlab setup will run later on a cheap dedicated Linux server **without OrbStack at all**. The Mac-specific piece disappears; everything below it stays unchanged. ([Containerlab][4])

[1]: https://containerlab.dev/macos/ "Containerlab on macOS - containerlab"
[2]: https://github.com/apple/container/blob/main/docs/resource-usage.md?utm_source=chatgpt.com "container/docs/resource-usage.md at main · apple/container · GitHub"
[3]: https://github.com/apple/container/issues/2191?utm_source=chatgpt.com "[Request]: run containers in a pod that shares one machine, and hold containers, pods, and networks in one core plugin · Issue #2191 · apple/container · GitHub"
[4]: https://containerlab.dev/macos/?utm_source=chatgpt.com "Containerlab on macOS - containerlab"
[5]: https://github.com/apple/container/releases?utm_source=chatgpt.com "Releases · apple/container · GitHub"

