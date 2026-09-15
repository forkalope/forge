# Fabric communication and discovery

Forklift is served by a Forge node. The browser should only need to reach that
node; it should not probe every machine in the fabric or depend on a separate
dashboard service. The serving node exposes its current, eventually consistent
membership view at `GET /api/v1/fabric/nodes`.

## Layer ownership

| Layer | Responsibility |
| --- | --- |
| Nebula | Encrypted node-to-node IP transport, tunnel peer discovery, NAT traversal, relay fallback, and network policy enforcement. |
| Forkalope Fabric | Node identity, enrollment, roles, capabilities, service addresses, health observations, replica freshness, and write authority. |
| Forklift | Read the local node's operational view and make uncertainty and freshness visible. |

Nebula knowing how to send a packet to a host does not mean that host is a
healthy Forge node, owns a repository, or may accept writes. Those are
Forkalope facts and must remain separate.

## Current lab protocol

The three-node lab uses periodic HTTP anti-entropy over Containerlab's private
management network:

1. A node starts with its own identity and one configured bootstrap peer.
2. Every two seconds it pulls that peer's membership snapshot.
3. It keeps the newest observation for each node and learns additional peer
   API addresses transitively.
4. A self-observation is refreshed only by the node that owns that identity.
5. An observation older than 15 seconds is shown as `unavailable`; it is not
   immediately deleted, so an operator can still see which node disappeared.

This is a deliberately small integration slice. It proves that any Forge node
can serve the UI and reconstruct the three-node view without a separate
control-plane web service. It also produces honest failure behavior for the
Containerlab exercise.

The lab endpoint is read-only but unauthenticated. It must remain confined to
the disposable lab until enrollment identity and transport authentication are
implemented.

## Production evolution

The production protocol should retain the same API semantics while replacing
the lab's full peer polling with a bounded gossip implementation:

- authenticate every message with the enrolled node identity;
- reject records from another fabric and records a node is not authorized to
  advertise;
- use incarnation numbers plus monotonic local receipt times rather than
  trusting remote wall clocks for failure decisions;
- exchange a small random peer sample per round and cap message size;
- distinguish suspect, unavailable, left, and revoked nodes;
- advertise typed capabilities separately from transient health;
- persist enrollment and revocation in the control plane, while keeping
  liveness eventually consistent;
- expose convergence age and observation source so Forklift can communicate
  uncertainty honestly.

SWIM-style failure detection is a reasonable next step once the lab grows
beyond a handful of nodes. It is not required to prove this first three-node
path, and introducing a memberlist dependency now would obscure the boundary
between Nebula transport and Forkalope application membership.

Membership must never grant write authority. Repository home, replica
freshness, and promotion state need explicit records and split-brain
prevention before Forklift offers recovery actions.
