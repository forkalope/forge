# Forkalope Containerlab labs

This directory starts with three native ARM64 Alpine Linux nodes running in
the Ubuntu ARM64 VM managed by OrbStack. The first lab proves the Containerlab
and Linux networking path with three point-to-point IP links; it does not
yet start Nebula or any Forkalope service.

## Prerequisites

The lab host is the Ubuntu VM named `ubuntu` in OrbStack. Containerlab and the
Docker CLI must be installed in that VM, and the VM's Docker daemon must be
running. The repository is visible inside the VM at the same path under
`/Users`.

## Deploy

From the repository root on macOS:

```bash
orb -m ubuntu -u root containerlab deploy \
  -t /Users/aa/forkalope/forge/labs/containerlab/forkalope-3.clab.yml
```

Inspect the lab:

```bash
orb -m ubuntu -u root containerlab inspect \
  -t /Users/aa/forkalope/forge/labs/containerlab/forkalope-3.clab.yml
```

Check the interfaces and peer-to-peer links:

```bash
orb -m ubuntu -u root containerlab exec \
  -t /Users/aa/forkalope/forge/labs/containerlab/forkalope-3.clab.yml \
  --cmd 'ip addr show'

orb -m ubuntu -u root docker exec clab-forkalope-3-node-001 \
  ping -c 3 -W 1 10.240.0.2
orb -m ubuntu -u root docker exec clab-forkalope-3-node-002 \
  ping -c 3 -W 1 10.240.0.6
orb -m ubuntu -u root docker exec clab-forkalope-3-node-003 \
  ping -c 3 -W 1 10.240.0.10
```

Remove the disposable lab when finished:

```bash
orb -m ubuntu -u root containerlab destroy \
  -t /Users/aa/forkalope/forge/labs/containerlab/forkalope-3.clab.yml
```

The next step is to add a pinned Nebula binary, a disposable CA/certificate
generation step, and a fourth management/lighthouse role only after these
three nodes deploy and pass the link checks.
