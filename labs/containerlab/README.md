# Forkalope Containerlab labs

This directory starts with three native ARM64 Alpine Linux nodes running in
the Ubuntu ARM64 VM managed by OrbStack. The first lab proves the Containerlab
and Linux networking path with three point-to-point IP links; it does not
yet start Nebula or any Forkalope service.

Containerlab runs inside Linux because it needs Linux networking primitives
such as network namespaces, veth links, and netlink. On macOS, the supported
shape is one ARM64 Linux VM with Docker and Containerlab inside it.

## Prerequisites

The lab host is the Ubuntu VM named `ubuntu` in OrbStack. Containerlab and
Docker must be installed in that VM, and the VM's Docker daemon must be
running. Keep the repository somewhere under the macOS `/Users` directory so
OrbStack exposes it at the same absolute path inside the VM.

The lab commands below intentionally use `-u root`. Containerlab creates
privileged links and namespaces, so this avoids hiding a Docker-group or
sudoers requirement while the lab is still being developed. The lab is
disposable; do not use this topology as a security boundary for untrusted
students.

## Fresh Mac setup

Install [OrbStack](https://orbstack.dev/) first. Then run these commands from
the repository root. The Ubuntu 24.04 VM is the conservative reproducible
baseline; the current development VM is Ubuntu 26.04.1 ARM64 and also works.

```bash
orbctl create -a arm64 ubuntu:24.04 ubuntu
orbctl start ubuntu

orb -m ubuntu -u root sh -lc \
  'apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io curl ca-certificates'
orb -m ubuntu -u root systemctl enable --now docker

# Pin this while reproducing the lab. Change deliberately when upgrading.
orb -m ubuntu -u root sh -lc \
  'bash -c "$(curl -fsSL https://get.containerlab.dev)" -- -v 0.79.0'
```

If the VM already exists, use `orbctl list` and `orbctl start ubuntu`, then
skip the `create` command. Verify the VM-local tools before deploying:

```bash
orb -m ubuntu -u root sh -lc \
  'docker info --format "{{.ServerVersion}} {{.Architecture}}" && containerlab version'
```

The macOS `docker` command and the VM-local `docker` command can refer to
different daemons. Use the `orb -m ubuntu ...` form for this lab.

## Deploy

Set the topology path once so this README works for another macOS username:

```bash
REPO_ROOT="$(pwd)"
TOPOLOGY="$REPO_ROOT/labs/containerlab/forkalope-3.clab.yml"

orb -m ubuntu -u root containerlab deploy -t "$TOPOLOGY"
```

Keep this shell open for the remaining commands, or re-run the two variable
assignments in a new terminal.

Inspect the lab:

```bash
orb -m ubuntu -u root containerlab inspect -t "$TOPOLOGY"
```

Check the interfaces and peer-to-peer links:

```bash
orb -m ubuntu -u root containerlab exec -t "$TOPOLOGY" --cmd 'ip addr show'

orb -m ubuntu -u root docker exec clab-forkalope-3-node-001 \
  ping -c 3 -W 1 10.240.0.2
orb -m ubuntu -u root docker exec clab-forkalope-3-node-002 \
  ping -c 3 -W 1 10.240.0.6
orb -m ubuntu -u root docker exec clab-forkalope-3-node-003 \
  ping -c 3 -W 1 10.240.0.10
```

Expected data-link addresses are:

| Link | Endpoint A | Endpoint B |
| --- | --- | --- |
| 1 | node-001 `eth1` / `10.240.0.1` | node-002 `eth1` / `10.240.0.2` |
| 2 | node-002 `eth2` / `10.240.0.5` | node-003 `eth1` / `10.240.0.6` |
| 3 | node-003 `eth2` / `10.240.0.9` | node-001 `eth2` / `10.240.0.10` |

## Troubleshooting

Check the VM, Docker daemon, and lab containers independently:

```bash
orbctl list
orb -m ubuntu -u root systemctl status docker --no-pager
orb -m ubuntu -u root docker ps
orb -m ubuntu -u root containerlab inspect -t "$TOPOLOGY"
```

If the VM-local Docker daemon is unavailable, start it with
`orb -m ubuntu -u root systemctl start docker`. If the topology definition
changed and the generated lab state is stale, use `--reconfigure`; it destroys
and recreates only this named lab:

```bash
orb -m ubuntu -u root containerlab deploy \
  --reconfigure -t "$TOPOLOGY"
```

Containerlab writes generated inventories and state under
`labs/containerlab/clab-forkalope-3/`. That directory is intentionally
ignored by Git. The topology YAML and this README are the source of truth.

Remove the disposable lab when finished:

```bash
orb -m ubuntu -u root containerlab destroy -t "$TOPOLOGY"
```

## Reproducibility record

The first successful run was on 2026-09-14 with:

- Apple Silicon macOS host
- OrbStack Ubuntu `26.04.1` ARM64 VM named `ubuntu`
- Docker `29.1.3` inside the VM
- Containerlab `0.79.0`
- Alpine `3.22` node image

The next step is to add a pinned Nebula binary, disposable CA/certificate
generation, and a management/lighthouse role only after these three nodes
deploy and pass the link checks.

## Bootstrap script plan

When this setup is scripted, keep the responsibilities explicit:

1. Check that the host is Apple Silicon and that OrbStack is installed.
2. Create or start the named Ubuntu VM without replacing an existing VM.
3. Check Docker and Containerlab versions inside that VM; install only when
   missing, using pinned versions.
4. Check that the repository path is visible inside the VM.
5. Run `containerlab deploy`, `inspect`, and the smoke tests for an explicit
   topology path.
6. Make cleanup accept only the known lab topology/name; never delete a broad
   directory as part of reset.

A likely future layout is:

```text
scripts/
  bootstrap-containerlab-macos.sh  # host + Ubuntu VM prerequisites
  lab-3.sh                          # deploy, inspect, test, destroy
```

Until then, this README is the manual bootstrap contract.
