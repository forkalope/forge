# Franchises and federation

Forkalope is designed to support independently operated franchises. A
franchise is an autonomous control domain with its own inventory, enrollment
authority, students, labs, machines, and PostgreSQL control database.

The first Containerlab exercise models this with one Ubuntu VM and three Forge
nodes. The two-franchise exercise uses two independent Ubuntu VMs, each with
three nodes. They are deliberately separate clusters until both franchises
approve a federation contract.

## Authority boundary

| Responsibility | Authority |
| --- | --- |
| Admit a machine | Its franchise |
| Issue node certificates | Its franchise |
| Operate students and labs | Its franchise |
| Approve a federation link | Both participating franchises |

Membership gossip is local to a franchise. It must not turn a remote machine
advertisement into an official local node. Cross-franchise communication is a
separate, bilateral operation with explicit scope.

## Federation exercise

Run from the Forkestra repository:

```bash
bash scripts/bootstrap-federation.sh
bash scripts/deploy-lab.sh --all --reconfigure
```

Then verify the two local views independently:

```bash
curl http://localhost:8080/api/v1/fabric/nodes
curl http://localhost:8180/api/v1/fabric/nodes
```

The expected result is three nodes in each response, with different cluster
and node identities. Neither response should contain the other franchise's
nodes.

The lab now exercises that contract through the Networking view in Forklift:

1. On Franchise 1, click **Send proposal**. The peer receives the signed
   proposal and both sides display the contract ID and peer fingerprint.
2. On Franchise 2, review the eight-step checklist and click **Approve proposal**.
3. On Franchise 1, click **Approve proposal**. The approval is sent back and
   the first gateway probe runs automatically.
4. On Franchise 2, click **Probe gateway**. Both views should finish with a
   green `active` contract and a reachable gateway step.

The checklist is backed by these API operations:

- `GET /api/v1/federation/status` — local identity, peer, contract, and steps.
- `POST /api/v1/federation/propose` — create and deliver a signed proposal.
- `POST /api/v1/federation/approve` — record local approval and deliver it.
- `POST /api/v1/federation/probe` — verify the bilateral gateway.

The current lab persists the contract and Ed25519 identity under each node's
`-data-dir`. This is intentionally a file-backed exercise; a production
franchise will store the same records in its own PostgreSQL database and use
an authenticated overlay (for example, Nebula/mTLS) for transport.

The protocol's authority boundary is:

1. Franchise 1 publishes its signed identity and gateway proposal.
2. Franchise 2 verifies it and signs an accepted scope.
3. Franchise 1 records the acceptance in its local control database.
4. Franchise 2 records the acceptance in its local control database.
5. Only then do federation gateways exchange authenticated traffic.

The contract should specify allowed services, address prefixes, expiration,
revocation, and whether the relationship permits observation, mirroring,
training capacity, or production traffic. A federation relationship must not
grant remote write authority by default.
