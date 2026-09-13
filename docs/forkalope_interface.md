---
name: forkalope-interface-design
description: >-
  Design, implement, and review Forkalope interfaces with GitHub-familiar
  information architecture and workflows and a distinct Forkalope visual
  identity. Use when analyzing reference screenshots or flows, creating UI
  mockups, building components, selecting assets, or reviewing interface changes.
  Preserve useful conventions while requiring independently composed screens,
  verified asset permissions, accessible interactions, and truthful documentation.
---

# Forkalope Interface Design

**Product objective: GitHub-familiar IA and workflows, with distinct Forkalope visual identity.**

Here, information architecture (IA) means the organization of user tasks, content, and navigation. Familiarity means that developers understand the available operations and their outcomes. It does not require the same visual composition, ornamental details, or arrangement of every control.

This skill establishes a deliberately conservative project standard. It prioritizes a recognizable Forkalope product over visual similarity to any reference service. Its design requirements are project choices, not statements that the law requires every individual difference.

Apply it to new work and to reviews of existing screens. An earlier mockup, generated image, or design discussion is not approval under this standard.

## 1. Scope and decision rule

Use this skill for dashboards, repository browsers, issues, pull requests, workflows, settings, navigation, menus, popovers, dialogs, onboarding, authentication, and associated product imagery.

**Preserve task meaning. Independently design presentation. Verify permissions. Review the whole experience.**

When familiar behavior and distinctive presentation appear to conflict, preserve the behavior and redesign the surrounding presentation. When uncertainty remains about nonessential visual choices, choose a materially different, coherent design rather than a closer resemblance. Do not introduce confusing names, unnecessary steps, or inaccessible controls simply to look different.

This is design and engineering guidance, not a legal opinion. It does not certify noninfringement, determine another party's rights, or predict a court's conclusion. Do not report legal clearance from a screenshot, a similarity score, a disclaimer, an asset license alone, or completion of this checklist. Escalate unresolved legal questions to qualified counsel.

## 2. Boundaries that inform the work

Keep these issues separate rather than treating them as a single appearance test.

**Function and copyright.** U.S. copyright does not protect ideas, procedures, systems, or methods of operation as such. The Copyright Office distinguishes ordinary webpage layout and functional elements from protectable text, graphics, code, and sufficiently creative selection or arrangement of content. Do not assume that everything visible is protected, or that everything visible is available for unrestricted reuse. [S1][S2]

**Source identity.** A trade-dress infringement analysis involves protectability, including nonfunctionality and distinctiveness, as well as likely confusion about source, affiliation, or sponsorship. Resemblance alone does not establish infringement; a different logo alone does not resolve the analysis. Assess overall presentation without presuming that any particular GitHub screen has established trade-dress protection. [S3][S4]

**Contracts.** GitHub's published terms restrict reuse of its site implementation and visual-design material. Applicable agreements and their interaction with specific permissions require separate consideration. A website owner's terms are not themselves a statement of copyright's statutory scope. Do not assume that independently written code resolves every contractual or visual-content question. [S5]

**Licenses and brands.** The reviewed Primer CSS and Octicons repositories publish MIT licenses. For material covered by those licenses, permitted reuse does not depend on redrawing or recoloring it; preserve required notices. Octicons separately directs users of GitHub logos to GitHub's logo guidelines. A software or icon license does not by itself authorize third-party branding or every possible overall presentation. Verify the specific version and asset used. [S6][S7][S8][S9]

These are U.S.-oriented reference points, not comprehensive clearance. Product-name and logo clearance, patent questions, other agreements, data rights, and releases in other jurisdictions may require additional review. This skill does not establish that those reviews have occurred.

## 3. Start with the actual project

Before designing or editing:

1. Read applicable repository instructions, existing components, design tokens, brand assets, dependency licenses, and relevant feature specifications. Use the actual checkout or connected source, not remembered file contents.
2. Identify the screen, intended users, supported capabilities, and required states. Separate confirmed behavior from assumptions.
3. Confirm that supplied screenshots are available and readable. Request missing states when necessary; do not invent what an unseen screen contains.
4. Find the approved Forkalope shell and component baseline. Reuse it when it meets this skill. If it does not, propose a shared-system correction instead of accumulating page-specific exceptions.
5. Identify applicable restrictions on the reference material. Do not bypass authentication, confidentiality requirements, access controls, or other restrictions to collect it.

Use screenshots to understand tasks, information relationships, and usability problems. They are not specifications for the dimensions, artwork, wording, or composition of Forkalope's implementation.

Do not commit reference screenshots containing private organization names, personal data, credentials, unreleased features, or confidential information. Public redistribution of third-party screenshots also needs an appropriate basis; access to an image is not itself permission to republish it. Reference notes can identify an authorized source and observation date without embedding the image.

## 4. Required screenshot-to-interface workflow

### A. Extract a neutral functional brief

Before producing a mockup or component, write a compact brief containing:

- **Task and actor:** what the user is trying to accomplish, with what permissions.
- **Data:** information needed to make a decision, excluding incidental reference content.
- **Behavior:** entry point, user actions, validation, resulting state, and recovery paths.
- **States:** default, open, selected, loading, empty, error, success, disabled, and permission-restricted states that matter.
- **Uncertainty:** behavior not established by the supplied evidence or product specification.

Describe an author filter as “choose one or more authors and update the results,” not as a collection of coordinates and border measurements. Describe repository access as “select a supported transport and copy a valid clone address.”

Do not infer API compatibility, keyboard behavior, backend capabilities, or selection semantics from a still image. Confirm them through authorized observation, documentation, tests, or the product specification.

### B. Classify the reference elements

| Category | Examples | Required treatment |
| --- | --- | --- |
| Task or protocol | Browse files, compare branches, copy an SSH address | Preserve supported semantics; implement through authorized code and specifications. |
| Familiar convention | Search, account access, status indicators, repository terminology | Retain where useful; choose organization and presentation for Forkalope. |
| Expressive presentation | Page composition, decorative artwork, distinctive combinations of styling, original explanatory copy | Design independently or establish appropriate permission before reuse. |
| Licensed component or asset | A specific icon package or component library | Verify source, version, scope, notices, and any brand exceptions. |
| Provider identity or incidental content | Product logos, branded service names, avatars, promotional copy, sample customer activity | Do not adopt as Forkalope identity; use approved branding and authorized or fictional content. |

This classification is a design aid, not a legal determination. Flag uncertain items rather than automatically classifying them as functional or licensed.

### C. Compose the Forkalope screen

Develop the screen from the functional brief and Forkalope's design system. If no approved page pattern exists, consider more than one substantially different composition and select the clearest one.

Differentiate the application shell, navigation treatment, information hierarchy, component styling, and content presentation as a coordinated system. Do not make branding and accent color the only significant differences.

Keep equivalent operations understandable and reasonably discoverable. Exact menu order and control location are not acceptance criteria. Retain a useful conventional position when justified, but determine the rest of the screen from Forkalope's requirements rather than matching a reference control by control.

### D. Implement and inspect every important state

Implement with original code and verified dependencies. Render the real interface at the supported viewport sizes. Inspect open menus, focused controls, selected rows, loading results, and error states as well as the default view.

Compare against Forkalope's approved baseline for consistency. Compare against reference services only to identify unresolved resemblance or missed functional requirements, not to optimize visual correspondence.

### E. Review and report

Complete the review in Sections 10–12. Record actual sources, design decisions, tests, and unresolved questions. Do not turn a design recommendation into a legal conclusion.

## 5. Forkalope visual system

The following is the default direction when a reviewed project design system does not already exist. These choices provide a concrete independent starting point; none is a legal threshold.

### Application shell and navigation

Use a visible **Forkalope name and approved antler mark** in the application shell. Identify the actual hosting node or operator where relevant. Keep that distinction clear on self-hosted deployments, login screens, and permission requests.

Use a compact global header with workspace context, a labeled search entry, a labeled **Create** control, notifications, and account access. Do not reproduce a reference service's complete sequence of unlabeled utility buttons. Put infrequent commands in an accessible command menu.

On desktop, prefer a **labeled repository navigation rail** with task groups such as development, collaboration, and administration instead of the full reference tab-strip composition. Group only features that exist. On smaller screens, provide an accessible navigation drawer without hiding the current repository or page title.

Use a clear page-heading band containing the task title, relevant summary, and primary action. Keep global controls, repository controls, and page-specific filters visually distinct. Avoid stacked toolbars that duplicate the same operation.

### Color, type, and geometry

Use a warm charcoal foundation, restrained coral-orange identity accents, clear typography, and mostly flat surfaces. Avoid decorative antlers on ordinary controls, textures, glow, and ornamental gradients. Brand distinction must not come at the expense of readability.

An initial token set may use:

```css
:root {
  --fl-canvas: #151412;
  --fl-surface: #1e1c19;
  --fl-surface-raised: #27241f;
  --fl-border: #4a433b;
  --fl-text: #f4f1eb;
  --fl-text-muted: #b6afa3;
  --fl-accent: #f17b47;
  --fl-on-accent: #241208;
  --fl-link: #ffaf87;
  --fl-focus: #84cdd2;
  --fl-success: #7ccb94;
  --fl-warning: #e2bd63;
  --fl-danger: #f38d87;
  --fl-radius-control: 6px;
  --fl-radius-panel: 12px;
  --fl-space-unit: 4px;
  --fl-font-ui: system-ui, sans-serif;
  --fl-font-code: ui-monospace, monospace;
}
```

These tokens are proposed design inputs, not a complete theme or an accessibility certification. Verify actual foreground/background pairs, borders, focus indicators, disabled states, and both themes. Do not use the decorative border color as the sole control boundary where stronger contrast is needed.

Use a deliberate, documented type hierarchy. Use monospace for code, identifiers, and commands rather than all navigation. Size controls for reading and interaction, not to reproduce a reference measurement. Provide density choices only when the product needs them.

### Components and iconography

Use one coherent, approved icon family. Original icons or a verified permissively licensed non-brand set are acceptable. Ordinary licensed Octicons are not automatically prohibited, but adopting them does not waive the overall differentiation requirements. Never extract an uncertain asset from a rendered page and assume that a related public package licenses it.

Keep familiar symbols meaningful: search remains a magnifying glass; deletion does not become a playful mascot; status meanings remain consistent. Use text labels for ambiguous actions. Do not add antler ornamentation as a substitute for designing the surrounding interface.

Define shared implementations for buttons, navigation items, badges, row selection, inputs, menus, popovers, and dialogs. Apply a consistent Forkalope hierarchy rather than individually restyling each reference control. Selected navigation should use a clear filled treatment and text emphasis; focus must remain separately visible.

Use semantic status colors and text. Reserve red for errors or destructive actions; do not make ordinary branding look like a failure. Use borders sparingly and avoid placing every item inside a decorative card.

## 6. Screen-specific directions

These are starting patterns, not claims that other arrangements are legally prohibited.

### Dashboard

Organize the page around the user's current work: recent repositories, review requests, and activity. Display node or storage information when it is relevant to that user's role. Do not copy a reference provider's promotional feed, assistant composer, or changelog presentation.

Only show operational metrics supported by real data. Define percentages and time windows. Do not label a service healthy merely because the mockup contains a green indicator.

### Repository browser

Keep file navigation, branches, tags, commits, and repository metadata understandable. Use the navigation rail and a repository heading summary. Prefer a collapsible details section or sheet for extended metadata rather than mechanically reproducing the reference's file-table-and-sidebar composition.

Group repository actions by purpose. An independently composed **Clone** panel can contain a transport selector, address field, copy control, setup guidance, and archive-download action. Separate development workspaces from clone transports. Do not add desktop-app or assistant links unless those integrations actually exist.

Use correct clone addresses for the selected repository and hosting node. Do not assume every self-hosted deployment uses the central Forkalope hostname.

### Create menu

Use an explicitly labeled **Create** entry point. Include only supported operations. Determine grouping and order from task frequency and relationships; do not mechanically inherit every item and divider from a reference.

Familiar labels such as **New repository**, **New issue**, **New pull request**, and **Import repository** may remain when accurate. A product-specific branded service should not become a Forkalope feature name merely because it appeared in the reference.

### Pull requests

Use saved views or view chips, a clear result summary, and a dedicated filter area above a readable results list. Separate filter controls from list-column headings where that improves clarity. Present state, author, branch, review status, and discussion counts according to Forkalope's hierarchy.

An author picker should have clear search and selection behavior, accessible result rows, and a visible way to clear the selection. Choose single- or multiple-selection behavior from the product requirement, not an assumption about the screenshot. Use approved popover styling, not a page-specific reconstruction.

### Workflows and runs

Use a workflow selector or saved views within the Forkalope shell, followed by a results table with explicit columns or a well-structured compact list. Keep status, workflow name, branch, trigger, duration, and execution time scannable. Expose runners and caches through consistent administration navigation.

Run details should distinguish jobs, steps, logs, and artifacts. Do not reproduce a provider-specific diagram, branded illustration, or promotional panel. Compatibility with a workflow format, marketplace package, or API is a separate implementation and licensing question; appearance proves none of it.

### Settings and identity-sensitive screens

Group settings around the object being configured and explain destructive actions plainly. Login, account linking, imports, billing, and permission dialogs must prominently identify Forkalope and any actual third-party service involved.

Do not invent an organizational single-sign-on banner, affiliation indicator, or approval badge. Use independent layouts and truthful permission explanations for these screens.

## 7. Preserve semantics and respect third-party names

Do not rename ordinary operations solely to increase visual difference. **Code**, **Issues**, **Pull requests**, **Branches**, **Tags**, **Clone**, **Fork**, **Watch**, **Star**, **HTTPS**, and **SSH** are useful vocabulary when they accurately describe the feature.

In particular, do not substitute **Mirror** for **Fork** unless the operation really is mirroring. Repository forking and Git mirroring have different semantics. Likewise, a notification subscription should not be relabeled as a social-follow feature without a corresponding product decision. [S11][S12]

Write Forkalope-specific instructions, empty states, onboarding copy, and errors. Retain short conventional labels where useful; do not reproduce distinctive prose blocks or decorative content from a reference.

Do not use GitHub product names, logos, mascots, or product icons to identify Forkalope's own features. Necessary, accurate references to real integrations or migration sources are different: **Import from GitHub** can truthfully identify the source when that operation exists. Verify applicable permissions and guidelines, keep the other provider's identity subordinate to Forkalope's, and avoid implying endorsement. Do not silently rename a real third-party integration to suggest Forkalope created it. [S9]

Where appropriate, use an accurate statement such as “Forkalope is an independent Git hosting platform and is not affiliated with GitHub.” Such a statement supplements clear presentation; it does not replace it or supply missing rights.

## 8. Asset, code, and generated-output provenance

Obtain reusable dependencies and assets from verified upstream releases or repositories. Record the exact version or commit, relevant license, notice obligations, and any exclusions. Review fonts, illustrations, animations, and sample content as well as source code and icons.

Do not copy a service's deployed HTML, CSS, JavaScript bundles, SVGs, or artwork without an established permission basis. Publicly released packages are separate inputs; verify their scope rather than assuming the live service is covered. Preserve the applicable notices in source and distributions, including shipped bundles where required. Do not remove attribution or rename copied code to obscure its origin.

A compact inventory should contain:

| Asset or dependency | Source and version | Permission basis | Notice location | Modifications or restrictions |
| --- | --- | --- | --- | --- |
| Actual asset/package name | Verified upstream URL and version/commit | Verified license or permission | Actual included notice path | Actual changes and any brand exclusions |

Replace placeholders with facts. A missing permission basis blocks inclusion of the affected asset. It does not block unrelated work that can proceed with verified inputs.

For mockup generation, first supply the functional brief and approved Forkalope identity. A suitable instruction is:

> Design this Forkalope screen from the functional brief and approved design system. Preserve the specified operations and data relationships. Use Forkalope's application shell, independently composed hierarchy, approved assets, and accessible states. Do not adopt another provider's branding, distinctive artwork, or incidental content. Treat unverified capabilities as unresolved requirements.

Generated output must undergo the same review as manually created output. Do not assume an AI-generated icon has verified provenance or that a rendered image proves its implementation is original. Use verified implementation assets and inspect the entire result. Do not treat generated images as legal approvals or implementable specifications without review.

Use fictional fixture data, owned material, or explicitly authorized content for demos. Do not publish real people's avatars, names, activity, or repository descriptions simply because they appeared in a reference screenshot.

## 9. Functional and accessibility verification

Test equivalent user outcomes, not matching screen positions. Verify navigation, input validation, permissions, filter state, URL persistence where supported, empty results, failure recovery, and destructive-action confirmation. Maintain compatible terminology and documented syntax when interoperability requires it; do not claim broader compatibility than has been tested.

Target WCAG 2.2 Level AA for the implemented interface. Check keyboard access, meaningful focus order, visible and unobscured focus, accessible names, text and non-text contrast, target sizes, zoom/reflow, and status announcements. Use semantics appropriate to the actual control: a listbox, menu, disclosure, and modal dialog are not interchangeable. Test focus return and Escape behavior; trap focus only when the interaction is genuinely modal. [S10]

A screenshot cannot verify these properties. Use implementation tests and manual interaction checks. Never trade away accessibility or security for visual distinction.

## 10. Whole-experience review

Review both isolated components and the full product journey. Include the application shell, default screen, open controls, error states, small-screen behavior, and identity-sensitive screens.

Ask:

1. **Identity:** Is the operator and product clearly Forkalope, including where users authenticate or authorize access?
2. **Composition:** Are the shell, hierarchy, navigation, and component system independently resolved, rather than relying on a logo or color substitution?
3. **Function:** Can a developer complete familiar tasks without misleading labels or unnecessary friction?
4. **Permissions:** Is every included asset or dependency supported by a verified permission basis and the required notices?
5. **Truthfulness:** Do screens, documentation, and marketing describe the actual product and integrations?

As a supplemental design exercise, inspect a version with product identifiers temporarily masked. Look for dependence on a reference service's distinctive overall presentation. Also test the actual branded screen and ask neutral questions about who provides the service and whether another company sponsors it.

This exercise is not a validated legal survey or a pass/fail legal test. A user noticing familiar conventions is not the same as believing the service is affiliated. Record unexpected affiliation assumptions accurately and investigate their causes. Do not coach responses, invent findings, or disregard results that contradict the design goal.

There is no percentage, number of altered icons, fixed pixel difference, or minimum count of changed components that establishes legal safety. A design can have many small changes and still fail this project's independent-identity standard. Conversely, a conventional search field or properly licensed icon does not require alteration merely because another product uses it.

## 11. Review gates and escalation

### Before implementation spreads across the product

Have the maintainer review the application shell, shared components, repository browser, pull-request screen, workflow screen, and a representative open panel. Establish a baseline before implementing many dependent screens.

For this project, require a qualified IP/trademark lawyer's review of the proposed baseline before public launch. Provide accurate source and license information, representative screens and states, applicable agreements, and intended branding or compatibility claims. Ask for specific concerns and recommendations, not a guaranteed outcome. Keep legal advice in an appropriately controlled location; do not assume a public repository document is privileged.

### Stop the affected release decision and escalate when

- An asset's license, branding permission, reference-access basis, or relevant agreement is unresolved.
- The design depends on another provider's expressive presentation and no reviewed permission basis exists.
- Users report mistaken affiliation, or authentication and integration screens leave the operator unclear.
- A material change falls outside the reviewed baseline, or a rights holder raises a concern.

Continue unrelated implementation work where possible. An agent must not invent counsel approval, treat silence as approval, or substitute its own legal confidence for a required review. Routine changes within the reviewed system need normal project review, not an assertion that each change received separate legal advice.

## 12. Required deliverables and completion checklist

For substantial interface work, provide the functional brief, implemented screens or mockups, important interaction states, actual asset/dependency provenance, tests performed, and unresolved issues. Follow existing repository conventions; create a small design note only where needed rather than introducing unnecessary process files.

A design note can use this structure:

```text
Task and supported capabilities:
Reference material actually consulted:
Conventions retained and user benefit:
Forkalope composition and component decisions:
Assets/dependencies and verified permission basis:
States and accessibility checks completed:
Outstanding questions and responsible reviewer:
```

Write accurate, ordinary engineering documentation. Describe reference use, licensed reuse, original contributions, decisions, and test results as they actually occurred. Do not assert that work was independently created in respects where it was not. Do not revise, delete, backdate, or relabel historical records to misrepresent the development process. This skill governs the work; it is not a substitute for that work.

Before marking the design task complete, verify:

- [ ] The implementation follows a neutral functional brief and confirmed capabilities.
- [ ] Forkalope has a distinct application shell, hierarchy, and shared component system.
- [ ] Differentiation remains substantial beyond branding, color, and icon ornamentation.
- [ ] Generic terminology and actual operation semantics remain accurate.
- [ ] Brand assets, integrations, text, fixtures, and operational claims are appropriate and truthful.
- [ ] Included assets and dependencies have verified permission bases and required notices.
- [ ] Relevant default, open, selected, empty, loading, error, and responsive states were inspected.
- [ ] Functional, accessibility, and identity checks were actually performed and reported accurately.
- [ ] The maintainer's baseline review and any required legal review are complete, or explicitly pending.
- [ ] Remaining uncertainty is stated without a claim of legal certification.

Report design-check completion, implementation status, and release-review status separately. An unchecked requirement is not satisfied by changing the wording of the report.

## 13. Reference sources

Source review date: **2026-09-13**. Recheck current terms, guidance, and the exact dependency versions when they affect a decision. These references inform the boundaries above; they do not approve any particular implementation.

- **[S1]** U.S. Copyright Office, *Copyright Law, Chapter 1*, especially 17 U.S.C. § 102(b): https://www.copyright.gov/title17/92chap1.html#102
- **[S2]** U.S. Copyright Office, *Circular 66: Copyright Registration of Websites and Website Content*, especially pages 2–3: https://www.copyright.gov/circs/circ66.pdf
- **[S3]** 15 U.S.C. § 1125(a), statutory text reproduced by Cornell Legal Information Institute: https://www.law.cornell.edu/uscode/text/15/1125
- **[S4]** U.S. Supreme Court, *Wal-Mart Stores, Inc. v. Samara Brothers, Inc.*, 529 U.S. 205 (2000), especially the discussion of distinctiveness, functionality, and confusion: https://www.law.cornell.edu/supct/html/99-150.ZO.html
- **[S5]** GitHub, *Terms of Service*, especially Section G: https://docs.github.com/en/site-policy/github-terms/github-terms-of-service
- **[S6]** Primer CSS, license file; verify the version actually used: https://github.com/primer/css/blob/main/LICENSE
- **[S7]** Octicons, license file; verify the version actually used: https://github.com/primer/octicons/blob/main/LICENSE
- **[S8]** Octicons README, license section and separate logo guidance: https://github.com/primer/octicons#license
- **[S9]** GitHub, *Brand Toolkit: Logo*, legal and permitted-use sections: https://brand.github.com/foundations/logo ; and *Trademark Policy*: https://docs.github.com/en/site-policy/content-removal-policies/github-trademark-policy
- **[S10]** W3C, *Web Content Accessibility Guidelines (WCAG) 2.2*: https://www.w3.org/TR/WCAG22/
- **[S11]** Git, *git-clone*, particularly the `--mirror` option: https://git-scm.com/docs/git-clone
- **[S12]** GitHub Docs, *Forks*: https://docs.github.com/en/pull-requests/reference/forks
