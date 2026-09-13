---
name: forkalope-react-ui
description: Implement real Forkalope React/TypeScript pages from screenshots and workflows with an independently composed shell, accessible interactions, truthful capabilities, and browser-tested states.
---

# Forkalope React UI

Implement working pages in the existing React application. A screenshot is a reference for tasks and relationships, not a pixel specification or a reason to rasterize the page.

## Inspect first

- Read repository instructions, package manifests, lockfiles, routes, existing components, styles, API adapters, and tests.
- Preserve unrelated work and use the existing Vite/React/TypeScript setup. New React UI should use TypeScript and TSX; JavaScript/JSX is acceptable only when integrating with an existing untyped surface.
- Identify real backend support. Do not invent successful API data, permissions, clone endpoints, workflows, companion products, or third-party integrations. Use explicit deterministic fixture adapters for test-only pages and label unavailable capabilities honestly.
- Use the approved Forkalope logo and the installed licensed icon family. Record new dependency/asset provenance and required notices.

## Shared layout baseline

Use a small set of shared tokens and composed components rather than page-specific chrome. Forkalope's default is near-black canvas, blue-charcoal surfaces, coral-orange actions/identity, readable system typography, restrained borders, and semantic status colors.

The global header should contain Forkalope branding, repository context where relevant, labeled search, labeled Create, labeled Inbox, and account access. Put infrequent utilities in a labeled menu; avoid a long sequence of icon-only outlined buttons.

Repository pages must follow this hierarchy:

1. Repository context masthead: owner/repository, visibility, description, and repo actions together.
2. Repository sections: familiar Code, Issues, Pull requests, Actions, and other supported sections below the context, with a filled selected state.
3. Working toolbar and file browser: branch/ref, file search, Add file, Clone, commit context, and readable rows.
4. A compact Repository details region for description/topics/metadata not needed in the masthead.

Do not reproduce the source page's complete sequence of global header → navigation → title/action strip → toolbar → commit-card/file-table → About/statistics stack. Reorganize those same tasks into the hierarchy above. Keep familiar terminology such as Fork, Watch, Clone, HTTPS, SSH, Code, Issues, and Pull requests when accurate; do not rename operations merely to look different.

## React implementation

Prefer small composed components with focused responsibilities. Use stable keys, one coherent state model, semantic links/buttons, and existing routing conventions. Do not leave placeholder `#` links. Keep transient overlay state separate from server-authoritative data. Render repository text as text and use the reviewed Markdown pipeline for rich content.

For menus and popovers: use real triggers with `aria-expanded`/`aria-haspopup`, close on Escape and deliberate outside interaction, close unrelated peer overlays, and keep panels within the viewport. For Clone: keep transport selection and displayed/copy value synchronized, report copy success only after the clipboard succeeds, and provide a selectable fallback on failure. Use a non-modal panel on desktop and a bounded mobile presentation unless a true modal is required.

For unsupported controls, either omit them or make their unavailable state explicit and actionable. Never hide a permission or capability decision in styling alone.

## Validation

Run the repository's build, lint, and relevant tests. Browser-test direct routes and important states at desktop, intermediate, and 390px mobile widths. Exercise search/filtering, overlay opening/dismissal, keyboard Escape, transport switching, copy success/failure, long content, no-match, loading, error, and no horizontal overflow where relevant. Report implemented behavior, exact commands/results, browser evidence, asset provenance, and unresolved backend or release-review items separately. Do not claim legal clearance.
