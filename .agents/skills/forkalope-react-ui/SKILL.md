---
name: forkalope-react-ui
description: >-
  Implement and refine Forkalope React/TypeScript product pages from
  screenshots or workflows using the existing app, design system, real
  interactions, truthful capabilities, and responsive browser verification.
---

# Forkalope React UI

Build working product UI in the existing React application. A screenshot supplies content and workflow clues; it is not a pixel specification or a reason to copy the source page's full composition.

## Inspect before editing

- Read repository instructions, manifests, routes, nearby components, styling conventions, API adapters, and relevant tests.
- Preserve unrelated changes and reuse existing components and tokens before adding abstractions or dependencies.
- Follow this project's React and TypeScript conventions. New components should use TypeScript and TSX; do not convert typed code to JavaScript.
- Confirm which data and operations are real. For test-only routes, use deterministic fixture data and make unavailable capabilities explicit.
- Use the existing Forkalope logo and installed icon package. Record provenance only when introducing a new asset or dependency.

## Build the page

Keep authenticated product pages compact and utilitarian. Favor readable rows, lists, tables, and forms over hero treatments, decorative cards, or marketing copy.

Forkalope's default palette is a near-black canvas, cool blue-charcoal surfaces, coral-orange identity and primary actions, and semantic status colors. Avoid brown accent surfaces and decorative effects that do not clarify the interface.

For repository pages:

- keep repository identity and repository-level actions together;
- choose a horizontal section bar or vertical section rail based on fit rather than copying the reference;
- use a filled selected state with a separate keyboard focus treatment;
- make the file browser the primary workspace and keep its controls nearby;
- separate latest-commit context from file-list headings;
- keep secondary metadata in one compact details region when possible.

Do not stack full-width bands merely because a reference does. Preserve familiar terms such as Code, Issues, Pull requests, Watch, Fork, Clone, HTTPS, and SSH when they are accurate.

## React and interaction rules

- Keep components focused and state ownership clear. Separate transient overlay state from server or fixture data.
- Use semantic links for navigation and buttons for actions. Do not use dead `#` links or navigate to routes that do not exist.
- Do not visually activate an unavailable section while leaving the old content in place. Omit it, disable it with an explanation, or keep the current section active and provide concise feedback.
- Give inputs accessible labels and icon-only controls accessible names. Preserve visible keyboard focus.
- Menus and popovers need real triggers, `aria-expanded` and an appropriate `aria-haspopup`, Escape dismissal, outside-interaction dismissal, and viewport-safe placement.
- Keep clone transport and displayed/copy values synchronized. Announce copy success only after success and provide a selectable fallback after failure.
- Keep mobile controls usable without shrinking text or allowing page-wide horizontal overflow. Let dense tables reduce columns or scroll within their own region.

## Validate

Run the relevant build, typecheck, lint, and tests that exist in the repository. Browser-check the direct route at approximately 390x844, 768x1024, 1280x800, and 1440x900 when the change affects layout.

Exercise the states changed by the task: default, selected, unavailable, open and dismissed overlays, keyboard Escape, narrow content, long values, and empty/error/loading states when relevant. Report actual verification results and any remaining backend limitation without presenting planned behavior as implemented.
