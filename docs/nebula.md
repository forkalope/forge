Yes: **Forkalope should use Nebula for the first real implementation of Forkalope Fabric, not build the networking dataplane itself.**

But I would *not* make “Nebula” part of the Forkalope product model. I’d hide it underneath a Forkalope-owned control plane.

### The split I’d use

```text
                  Forkalope
              ┌────────────────┐
              │ Fabric control │   OUR CODE
              │                │
              │ node registry  │
              │ enrollment     │
              │ IP allocation  │
              │ roles          │
              │ policy         │
              │ cert issuance  │
              │ DNS            │
              │ topology       │
              │ health         │
              └───────┬────────┘
                      │
                  configuration
                      │
     ┌────────────────┼────────────────┐
     ↓                ↓                ↓
  server A         server B         server C
     │                │                │
  Nebula           Nebula           Nebula
     ╰════════ encrypted mesh ═════════╯

               NEBULA'S CODE
             encryption/tunnels
             peer discovery
             NAT traversal
             packet transport
             relay fallback
             host firewall
```

That division is really attractive.

Nebula already solves exactly the dangerous, subtle stuff I'd rather Forkalope **not** reinvent: encrypted Layer-3 tunnels, peer authentication, NAT traversal, lighthouse discovery, relaying, routing and host firewalling. It's explicitly designed as a scalable self-hosted overlay and runs as one portable Go executable. ([Nebula][1])

And it's MIT licensed, which gives Forkalope a lot of freedom around integration and modification. ([GitHub][2])

## Why Nebula over NetBird

NetBird is arguably the more finished *product*. It already has:

```text
Management
Signal
Relay
STUN
identity
ACLs
IP allocation
WireGuard peers
admin UI
```

Its architecture is impressively close to the `forkalope-fabric-controller` I described earlier. ([NetBird Docs][3])

But that's precisely why I think it's a slightly worse fit.

If Forkalope uses NetBird wholesale, you end up with:

```text
Forkalope control plane
        ↓
NetBird control plane
        ↓
WireGuard
```

Then you're constantly deciding which system owns:

* machine identity
* enrollment
* roles
* address allocation
* ACLs
* lifecycle
* topology
* health
* relay selection

Those things **should naturally belong to Forkalope**.

Nebula sits lower in the stack. It gives Forkalope a networking engine rather than another infrastructure-management product.

There's also a licensing wrinkle: the NetBird client is BSD-3, but its Management, Signal, Relay and combined server components are AGPLv3. That's not necessarily a problem, but it is another consideration if Forkalope starts modifying or deeply incorporating its server-side control plane. ([GitHub][4])

### Nebula also maps beautifully onto Forkalope concepts

Nebula certificates already contain:

```text
name
IP address
groups
```

and peers use those certificates for mutual authentication. Firewall rules can operate on certificate groups. ([Nebula][5])

So Forkalope could translate:

```text
Forkalope node

id:       node_a81fd2
name:     runner-042
fabric:   fd4f:...:42
roles:
  - runner
region:   lax
```

into a Nebula identity:

```text
name: runner-042
ip:   fd4f:...:42
groups:
  - runner
```

Then:

```text
database allows:
    group api -> tcp/5432

artifact store allows:
    group runner -> tcp/443
```

You immediately have the beginnings of Forkalope security groups.

## There are a few pieces of Nebula I would deliberately NOT use

This is important.

**Don't let Nebula become the architecture.**

For example, Nebula has experimental lighthouse DNS. The project itself warns that it shouldn't be considered a robust DNS solution. ([Nebula][6])

So Forkalope should own DNS:

```text
postgres.service.fk
git-storage-41.node.fk
runner-83.node.fk
```

Similarly, Nebula's certificate blocklist isn't distributed automatically through lighthouses; the docs expect operators to distribute it via configuration-management tooling. ([Nebula][7])

Fine.

**Forkalope is that configuration-management system.**

That's almost ideal.

Nebula says:

> Here's a primitive you need to distribute.

Forkalope says:

> Great. We already know every machine and have an agent on every machine.

Same with CA rotation. Nebula supports graceful configuration reload without dropping existing tunnels, but its docs otherwise assume you'll distribute trust bundles through something like Ansible/Chef/Puppet. ([Nebula][8])

Again:

```text
Ansible
Chef
Puppet
```

gets replaced by:

```text
Forkalope Fabric controller
```

---

# What `forkalope-agent` should actually do

I'd probably not even expose Nebula as a separately configured thing.

Operator does:

```bash
forkalope join fk_enroll_xxxxxxxxx
```

Forkalope does:

```text
1. create local private key
2. enroll Node ID
3. assign Fabric IP
4. determine role(s)
5. issue/sign Nebula certificate
6. obtain CA trust bundle
7. obtain lighthouse list
8. obtain policy
9. write generated Nebula config
10. start Nebula
11. create fk0 interface
12. report Fabric health
```

Then:

```bash
ip addr show fk0
```

might give:

```text
fk0
    inet 10.240.18.91/16
    inet6 fd4f:6b61:6c6f::1891/64
```

Nobody needs to know Nebula exists.

In the Forkalope UI they see:

```text
runner-042

Fabric
──────────────────────────
Address       10.240.18.91
Connectivity  direct
Region        lax
Peers         47
Latency       18 ms
Policy        runner
Health        healthy
```

Not:

```text
Nebula lighthouse configuration
```

That's implementation detail.

---

# Run multiple lighthouses

I'd start with at least three:

```text
               fk-lighthouse-us-west
                        │
                        │
 server ────────────────┼──────────────── server
                        │
            ┌───────────┴───────────┐
            ↓                       ↓
   fk-lighthouse-us-east     fk-lighthouse-eu
```

Nebula supports multiple lighthouses, and ordinary nodes report/query through them. The fixed public address requirement is limited mostly to these bootstrap/discovery nodes. ([Nebula][9])

That's a tiny amount of conventional infrastructure to bootstrap a giant weird Forkalope network.

And if a lighthouse disappears, **it isn't forwarding normal traffic anyway**. Existing peer-to-peer tunnels don't suddenly route through the lighthouse.

Exactly the failure semantics we want.

---

# I'd reject the other options for specific reasons

| Option           | Forkalope                                                         |
| ---------------- | ----------------------------------------------------------------- |
| **Nebula**       | **Yes — my pick**                                                 |
| NetBird          | Excellent, but owns too much of our control-plane problem         |
| Tailscale        | Excellent technology, wrong dependency for an independent cloud   |
| Headscale        | Interesting reference, not my production foundation               |
| Cloudflare Mesh  | Fundamentally contrary to Forkalope's provider-independence story |
| ZeroTier         | Capable, but Nebula is a cleaner infrastructure primitive here    |
| Raw WireGuard    | Too primitive; we'd immediately start rebuilding Nebula/Tailscale |
| Build everything | **Absolutely not yet**                                            |

Tailscale itself explicitly describes Headscale as community-maintained and aimed at self-hosting/infrastructure-sovereignty use cases, while distinguishing its own proprietary coordination service as the supported production service. ([Tailscale][10])

And Tailscale's DERP architecture is excellent prior art for a future Forkalope relay network, but there's no reason to bind Forkalope's core infrastructure to Tailscale's SaaS control plane. ([Tailscale][11])

---

# Most importantly: don't fork Nebula yet

I'd consume upstream Nebula.

Something like:

```text
forkalope-agent
    │
    ├── forkalope node agent
    │
    ├── generated config
    │
    └── nebula binary
```

Pin a known version. Test upgrades. Contribute fixes upstream.

Only fork if Forkalope discovers something fundamental that upstream can't accommodate.

Otherwise you're signing yourself up to maintain a security-sensitive networking implementation forever for no reason.

### And preserve an escape hatch

Internally, don't have code saying:

```go
nebulaIP
nebulaGroup
nebulaPeer
```

Have:

```go
FabricAddress
NodeRole
FabricPeer
NetworkPolicy
```

With something conceptually like:

```text
FabricDriver
    └── NebulaDriver
```

Then three years from now:

```text
FabricDriver
    ├── NebulaDriver
    └── NativeDriver
```

can exist.

If Forkalope becomes enormous and we eventually discover:

> Nebula's architecture can't efficiently support 200,000 machines / our routing topology / our failure model.

**That** is the time to consider building the networking dataplane.

Not now.

## There's a useful strategic distinction

I would absolutely say:

> **Forkalope Fabric is built by Forkalope.**

Even though it uses Nebula underneath.

In exactly the same sense that:

```text
GitHub Actions uses containers
Kubernetes uses Linux networking
Cloudflare uses BoringSSL
```

doesn't make their products someone else's.

The innovative Forkalope part isn't:

> we encrypted an IP packet.

It's:

> **we can take a bare machine in Helsinki, another in someone's Utah datacenter, six servers at OVH, fifty at Hetzner, and a donated rack in LA; enroll them; assign identity, storage, compute and policy; and make all of them behave operationally as one Git cloud.**

Nebula is an excellent engine for the bottom 20% of that problem. **Forkalope should spend its engineering effort on the other 80%.**

[1]: https://nebula.defined.net/docs/?utm_source=chatgpt.com "Introduction to Nebula | Nebula Docs"
[2]: https://github.com/slackhq/nebula/blob/master/LICENSE?utm_source=chatgpt.com "nebula/LICENSE at master · slackhq/nebula · GitHub"
[3]: https://docs.netbird.io/about-netbird/how-netbird-works?utm_source=chatgpt.com "How NetBird Works - NetBird Docs"
[4]: https://github.com/netbirdio/netbird/blob/main/LICENSE?utm_source=chatgpt.com "netbird/LICENSE at main · netbirdio/netbird · GitHub"
[5]: https://nebula.defined.net/docs/guides/quick-start/?utm_source=chatgpt.com "Quick start | Nebula Docs"
[6]: https://nebula.defined.net/docs/guides/using-lighthouse-dns/?utm_source=chatgpt.com "Using Lighthouse DNS with Nebula | Nebula Docs"
[7]: https://nebula.defined.net/docs/config/pki/?utm_source=chatgpt.com "pki | Nebula Docs"
[8]: https://nebula.defined.net/docs/guides/rotating-certificate-authority/?utm_source=chatgpt.com "Rotating a certificate authority | Nebula Docs"
[9]: https://nebula.defined.net/docs/guides/host-discovery/?utm_source=chatgpt.com "How hosts find each other | Nebula Docs"
[10]: https://tailscale.com/opensource?utm_source=chatgpt.com "Open source at Tailscale · Tailscale"
[11]: https://tailscale.com/docs/reference/derp-servers?utm_source=chatgpt.com "DERP servers · Tailscale Docs"

