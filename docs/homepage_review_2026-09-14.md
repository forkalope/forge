# Homepage review snapshot — September 14, 2026

This is a dated review of the React homepage in `web/` at the time of the
initial SRE-training plan. It is intentionally separate from the long-lived
training specification so later UI changes do not make the curriculum stale.

## What works

The new homepage is a strong direction for an authenticated forge workspace:

- dark blue-charcoal surfaces, coral actions, compact rows, and responsive
  navigation establish a recognizable Forkalope language;
- repository rail, workspace search, recent activity, node status, and product
  notes create a sensible hierarchy;
- the node panel communicates that Forkalope is both a code product and an
  operating node;
- the unavailable-node state is honest when the Go API is not running;
- the layout remains dense and usable on desktop and collapses appropriately at
  mobile width.

## Product risks to resolve through integration

The page is currently a convincing shell around fixture data rather than a
working forge surface:

- repositories and activity are constants in `web/src/App.tsx`;
- repository selection only shows a toast;
- create, inbox, account, issues, branches, and settings actions mostly report
  that a future milestone is planned;
- activity overflow buttons have no action;
- quick-action chevrons imply menus even though the controls are only buttons;
- health is the only meaningful API-backed value, and the API reports only
  process/blob-store metadata.

This is appropriate for a shell prototype. The next UI milestone should make
the homepage the first API consumer: current user, repositories, activity, and
node status should load from the forge and expose explicit loading, empty,
error, permission-denied, and unavailable states.

The UI should distinguish these states rather than flattening them into a
single green or gray indicator:

```text
No repositories yet       empty
The node cannot be reached unavailable
The node is healthy        ready
The feature is not shipped planned
```

The visual direction does not need more dashboard content. It needs truthful
data and controls whose affordances match their behavior.
