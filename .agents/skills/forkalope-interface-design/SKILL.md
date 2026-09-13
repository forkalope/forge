---
name: forkalope-interface-design
description: >-
  Design and review Forkalope interfaces from screenshots or product
  workflows. Preserve Git-hosting conventions while requiring a distinct
  Forkalope composition, verified assets, truthful capabilities, and
  accessible states.
---

# Forkalope Interface Design

Forkalope should feel familiar to developers without reading as another provider's themed installation. Preserve task meaning and useful vocabulary; independently compose the shell, hierarchy, grouping, and content presentation.

This is product design and engineering guidance, not legal clearance. Visual difference, a new logo, a license, or completion of this checklist does not establish non-infringement. Escalate unresolved rights, terms, branding, or affiliation questions to qualified counsel.

## Before implementation

1. Read repository instructions, existing components, tokens, assets, package licenses, routes, and supported backend capabilities.
2. Build a neutral functional brief: user goal, entities, entry point, interactions, results, important states, permissions, and unresolved assumptions.
3. Classify reference details as functional conventions, expressive presentation, or third-party material. Preserve supported operations; independently design presentation; verify or replace third-party content.
4. Use synthetic fixture content for test pages. Do not copy personal names, avatars, branded prose, logos, or deployed site assets from a reference.

## Forkalope composition rules

Use a compact developer-tool system: near-black or warm charcoal canvas, flat blue-charcoal surfaces, readable system typography, restrained coral-orange identity accents, and semantic green/amber/red status colors. Use borders and panels only when they clarify grouping. Ordinary licensed icons may remain; identity comes from the assembled system, not icon redrawing.

For repository pages, use this distinct relationship between regions:

- **Global header:** Forkalope wordmark, repository context, labeled search, labeled Create, labeled Inbox, account access, and at most one compact secondary utility menu. Do not reproduce an uninterrupted row of outlined icon-only utilities.
- **Repository context:** Put owner/repository, visibility, a short description, and repository-level actions together in one contextual masthead. The user should know which repository they are in before scanning its sections.
- **Repository navigation:** Place familiar sections below the context. Use a filled selected state with text emphasis and an independent focus ring. An orange underline alone is not the selected treatment.
- **Working area:** Make the file browser the primary workspace. Keep branch/ref selection, file search, Add file, and Clone close to the files, but do not copy a competitor's exact toolbar geometry.
- **File organization:** Separate latest-commit context from the file-list header. Use clear columns or a distinct summary block. Keep description/topics in the contextual header where possible.
- **Supplemental details:** Use one labeled Repository details/About region for remaining metadata. Do not mechanically recreate an About → statistics → Releases stack when a compact details section communicates the same information.
- **Overlays:** Clone, Create, and filters are real triggered overlays with bounded, independently composed panels. Do not ship screenshot states as permanently open.

For dashboards and other product surfaces, prioritize actual work and supported data over marketing copy, assistant composers, promotional feeds, or fabricated metrics. “Unknown,” “Not connected,” and “Planned” are valid states.

## Accessibility and review

Use semantic HTML. Buttons perform actions; links navigate. Every input has a visible or screen-reader label, icon buttons have accessible names, focus is visible, and status meaning is not conveyed by color alone. Use the correct menu, disclosure, combobox, dialog, or tab pattern. Support Escape and focus return for overlays, 44px touch targets where practical, mobile reflow without page-wide scrolling, and reduced motion.

Inspect default, loading, error, empty, no-match, selected, open-overlay, and responsive states in the actual application. Review the whole composition at approximately 1440px, 1024px, and 390px widths. Record actual assets/dependencies, tests, browser evidence, and unresolved release-review items separately from engineering completion.

Do not claim legal approval, guaranteed non-infringement, or unverified backend support.
