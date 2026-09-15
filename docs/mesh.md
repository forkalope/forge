Yes. After looking at the current `/landscape`, I think there’s a **real omission now that we’ve identified Forkalope Fabric as an important subsystem**.

The page currently compares Forkalope almost entirely against *forges*: GitLab, Forgejo, Gitea, OneDev, SourceHut, Radicle, Tangled, Harness, etc. Its thesis is “self-hosting exists, but the homes are islands.”

I **would not add networking companies to that main comparison table**. They aren't competitors to Forkalope as a forge. Instead I'd add a section below it called something like:

## The infrastructure underneath

With language along these lines:

> Forkalope is not the first system to make machines scattered across clouds and datacenters appear to share one private network. A mature ecosystem of overlay networking projects already tackles node identity, encrypted transport, NAT traversal, routing, policy, and service discovery. Forkalope's difference is what it intends to build on top of that substrate: a distributed Git service whose storage, runners, databases, recovery capacity, and operators can span independent infrastructure.

Then I would cover **six**, but give four of them much more prominence.

### 1. Nebula / Defined Networking — absolutely include

This is probably the **single most relevant precedent** to what we were just discussing.

Nebula explicitly describes itself as a peer-to-peer Layer-3 virtual network that lets hosts communicate across arbitrary cloud providers, datacenters and endpoints. It has host identity, groups, firewall rules, discovery, NAT traversal and relays. Most importantly, it wasn't just designed as a homelab VPN: Slack built it for its own infrastructure, and the Nebula docs say it powered **more than 50,000 Slack production hosts**. ([Nebula][1])

That's almost uncannily close to:

> “We have 3,000 Forkalope machines scattered around 50 hosting providers, but operationally they're one network.”

Defined Networking now commercializes managed Nebula and describes the use case explicitly as connecting systems across “clouds, data centers, offices, and homes.” ([Defined Networking][2])

I'd label it:

**Nebula / Defined Networking — provider-agnostic production overlay**

This one deserves more than an “also on the radar” mention.

---

### 2. Tailscale — absolutely include

Tailscale now markets an explicit **multi-cloud networking** product/use case:

> Bring AWS, GCP, Azure, on-premises and other infrastructure under one encrypted overlay.

It specifically pitches eliminating VPC peering, VPN gateways and provider-specific routing, and creating one encrypted network across all environments. ([Tailscale][3])

That's precisely part of Forkalope Fabric.

Architecturally it also gives you the control-plane/data-plane model we discussed:

```text
coordination
    │
    ├── identity
    ├── addresses
    ├── policy
    └── peer discovery

         ↓

direct encrypted connections
between machines
```

I'd label it:

**Tailscale — managed WireGuard overlay across clouds**

The useful distinction for your page is:

> Tailscale connects infrastructure. Forkalope wants to operate a Git cloud *on* connected infrastructure.

---

### 3. NetBird — absolutely include

NetBird may be the closest reference if Forkalope decides, “we want something conceptually Tailscale-like but open and under our control.”

Their current product explicitly creates a peer-to-peer WireGuard overlay connecting **servers, containers, cloud and remote infrastructure**, including multi-cloud and hybrid-cloud environments. The agent handles addresses, keys, DNS, routes and firewall policy. ([NetBird][4])

That's basically the `forkalope-fabricd` concept from our previous conversation.

I'd label it:

**NetBird — open-source WireGuard control plane**

This one is especially important because someone reading your architecture will inevitably ask:

> “Why didn't you just use NetBird?”

Your landscape should demonstrate that you know it exists.

And that may actually be the correct question for Forkalope: **perhaps we shouldn't initially invent all of `fabricd`.** NetBird could be an implementation/reference while the Forkalope abstraction remains ours.

---

### 4. Cloudflare Mesh — definitely include now

This one is particularly important because it's **new in 2026**, and it almost uses the exact product language we've been talking about.

Cloudflare launched Cloudflare Mesh in April 2026. Every enrolled server/device receives a **private Mesh IP** and can reach other participants privately over TCP, UDP and ICMP. It supports site-to-site networking between data centers and cloud VPCs. ([Cloudflare Docs][5])

Their headline is essentially:

> “Your private network across Region: Earth.”

And their product page describes connecting devices, servers and virtual networks on **one private network**. ([Cloudflare][6])

That's almost exactly your “facade of the Forkalope cloud” idea.

There is an important architectural difference:

```text
Tailscale / NetBird / Nebula

A ────────────── B
    direct P2P
    when possible
```

versus Cloudflare:

```text
A ── Cloudflare global network ── B
```

Cloudflare states that Mesh traffic flows through Cloudflare's network. ([Cloudflare Docs][7])

That makes it a very useful comparison because it represents a fundamentally different answer to the same problem.

I'd label it:

**Cloudflare Mesh — provider-independent private network via Cloudflare's backbone**

---

### 5. ZeroTier — include, but secondary

ZeroTier is the older established player.

Its description is almost literally what we're proposing:

> create secure virtual networks connecting devices and infrastructure anywhere

with peer-to-peer networking, identity-based membership, distributed path discovery, and both Layer 2 and Layer 3 networking. ([ZeroTier][8])

It's especially useful historically because it demonstrates that the idea of:

```text
random machines
      ↓
virtual network
      ↓
looks like one LAN/VPC
```

has been around and successfully deployed for years.

I'd put ZeroTier in the section, but not give it as much space as Nebula/Tailscale/NetBird/Cloudflare.

---

### 6. Netmaker — probably “also on the radar”

Netmaker explicitly describes its mesh as a:

> “virtual, distributed LAN”

similar to a VPC, where machines can be anywhere, with WireGuard connections directly between hosts. ([Netmaker][9])

That's very relevant technically.

I wouldn't elevate it to the same importance as the first four, but it clearly belongs in the research.

---

### Headscale: mention in prose, not as another company

Headscale is worth mentioning because it's the open-source implementation of the Tailscale control server. It handles registration, IP allocation, ACLs, DNS, routes, DERP, etc. ([GitHub][10])

But its stated scope is deliberately narrower—personal use or small open-source organizations—so I don't think it needs its own major landscape card. ([GitHub][10])

I'd mention it underneath Tailscale as evidence that the **coordination layer can itself be self-hosted**.

---

## More importantly, this changes one part of the Forkalope story

I wouldn't present these as things Forkalope intends to beat.

I'd present them as **prior art that validates one layer of the architecture**.

Something like:

```text
              FORKALOPE LANDSCAPE

Forge layer
────────────────────────────────────────
GitLab
Forgejo
Gitea
OneDev
Radicle
Tangled
             ↑
             │ Forkalope competes here
             │
          FORKALOPE
             │
             │ builds on this class
             ↓
Infrastructure overlay
────────────────────────────────────────
Nebula / Defined Networking
Tailscale
NetBird
Cloudflare Mesh
ZeroTier
Netmaker
             │
             ↓
Physical underlay
────────────────────────────────────────
Hetzner
OVH
Vultr
Leaseweb
random colo
community hardware
...
```

That picture actually makes Forkalope's thesis **much clearer**.

The existing landscape says, essentially, “here are all the attempts at replacing GitHub.”

The expanded landscape says:

> **None of Forkalope's individual ingredients are magical.**
>
> Open Git forges prove the application can be self-hosted.
>
> Tailscale, Nebula, NetBird, Cloudflare Mesh and ZeroTier prove geographically unrelated machines can behave like one private network.
>
> Distributed systems prove data can be replicated.
>
> **Forkalope's bet is assembling those ideas into a Git hosting cloud that doesn't require one company to own all the machines.**

That is a stronger and more intellectually honest argument than implying Forkalope invented global overlay networking.

And **Nebula deserves special attention**. Knowing now that Slack ran its production overlay across 50,000+ hosts, I would study Nebula's architecture before we write much Forkalope Fabric code. It is much closer to your actual problem than I appreciated in the previous answer. ([Nebula][1])

[1]: https://nebula.defined.net/docs/?utm_source=chatgpt.com "Introduction to Nebula | Nebula Docs"
[2]: https://www.defined.net/?utm_source=chatgpt.com "Defined Networking"
[3]: https://tailscale.com/use-cases/multi-cloud-networking?utm_source=chatgpt.com "No-Hassle Multi-Cloud Networking (Start for Free) | Tailscale"
[4]: https://netbird.io/connect?utm_source=chatgpt.com "NetBird - Zero-Configuration Private Network"
[5]: https://developers.cloudflare.com/changelog/post/2026-04-14-cloudflare-mesh/?utm_source=chatgpt.com "Introducing Cloudflare Mesh · Changelog"
[6]: https://www.cloudflare.com/products/mesh/?utm_source=chatgpt.com "Mesh"
[7]: https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-mesh/?utm_source=chatgpt.com "Cloudflare Mesh - Private networking · Cloudflare One docs"
[8]: https://www.zerotier.com/one/?utm_source=chatgpt.com "ZeroTier | ZeroTier One"
[9]: https://www.netmaker.io/features/mesh?utm_source=chatgpt.com "Mesh VPN | Peer to Peer Distributed Networks"
[10]: https://github.com/juanfont/headscale/blob/main/docs/index.md?utm_source=chatgpt.com "headscale/docs/index.md at main · juanfont/headscale · GitHub"

