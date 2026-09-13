---
name: forkalope-interface-design
description: >-
  Design and review Forkalope product interfaces from screenshots, existing
  pages, or workflows. Translate references into a compact, recognizable
  developer-tool UI with truthful states and accessible interactions.
---

# Forkalope Interface Design

Design for the user's task, not for visual similarity to a reference. Preserve useful Git concepts and familiar operation names, while fitting them into Forkalope's own hierarchy, spacing, navigation, and visual system.

## Establish the design

Before proposing or implementing a layout:

1. Inspect the repository instructions, existing screens, components, tokens, assets, routes, and available product data.
2. Identify the page's primary job, key objects, common actions, and required states.
3. Treat screenshots as evidence about content and workflow. Separate required functionality from source-specific styling and composition.
4. State a short visual thesis and interaction thesis. For redesigns, decide what can be removed or consolidated before adding UI.

Use project-owned assets and the installed icon system. Do not copy third-party branding, personal data, prose, or decorative assets. Use deterministic synthetic content for fixture routes.

## Forkalope visual language

Forkalope is a compact, dark developer tool:

- near-black canvas with cool blue-charcoal surfaces;
- coral-orange for identity, focus, and a small number of primary actions;
- semantic green, amber, and red for status;
- readable system typography, restrained borders, and modest radii;
- dense lists, rows, tables, and controls for authenticated product screens.

Avoid brown accent surfaces, orange-on-brown combinations, ornamental gradients, generic card grids, oversized headings, and empty space that separates related information. Prefer typography, alignment, and spacing over additional containers.

Visual independence should come from the assembled page, not renamed Git operations or redrawn ordinary icons. Do not mechanically transfer every horizontal band, sidebar block, or toolbar arrangement from a reference.

## Product composition

Use these as defaults, not a mandatory template:

- Keep the global shell small. Show Forkalope branding, relevant context, search, creation, inbox, and account access when the page needs them. Group infrequent utilities instead of building a long strip of icon-only buttons.
- Put repository identity, visibility, description, and repository-level actions near one another.
- Use horizontal tabs or a vertical section rail according to available space and content density. The current section needs a filled selected state and a visible focus state; an underline alone is insufficient.
- Make the primary workspace dominant. Keep branch selection, file search, Add file, Clone, and similar controls close to the content they affect.
- Keep latest-commit context distinct from file-list column headings.
- Consolidate supplemental metadata into a compact details region. Avoid repeating description, topics, statistics, and releases across multiple visual levels.
- Render menus, filters, and clone controls as triggered overlays, not permanently open screenshot states.

For dashboards and management screens, foreground real work and supported data. Prefer concise `Unavailable`, `Not connected`, `Unknown`, and `Planned` states to invented metrics or fake success.

## Review standard

Check the rendered application, not only the source. Review hierarchy, alignment, density, long and missing values, selected and unavailable states, open overlays, and keyboard focus. Verify responsive behavior around 390, 768, 1280, and 1440 pixels, with no page-wide horizontal scrolling.

Use semantic controls, accessible names, readable contrast, non-color status cues, practical touch targets, Escape dismissal and focus return for overlays, and reduced-motion support where motion exists.
