[**Download the Forkalope SKILL.md**](sandbox:/mnt/data/forkalope-interface-design/SKILL.md)

The file is self-contained, with YAML front matter, concrete agent instructions, a completion checklist, and linked legal and licensing references.

**This version is substantially more conservative than the mockups above.** It requires agents to develop a distinct application shell, navigation treatment, information hierarchy, and shared component system—not merely change colors, logos, or icons.

It includes three main layers:

* **A screenshot-to-implementation workflow:** extract a neutral functional brief, distinguish confirmed behavior from assumptions, classify reusable conventions versus expressive material, and design from Forkalope’s own system.
* **Concrete design directions:** an independent navigation structure, proposed design tokens, and specific patterns for repository pages, clone panels, create menus, pull requests, author filters, workflows, dashboards, and authentication screens.
* **Verification and review:** asset provenance, license notices, truthful integration labels, accessibility testing, whole-experience review, and a legal-review requirement before public launch.

### Two corrections to the earlier guidance

**Licensed ordinary icons do not automatically need redrawing.** The skill permits appropriately licensed Primer/Octicons material with the required notices, while treating GitHub logos and branding separately. Distinctiveness must come from the coordinated interface—not unnecessary alteration of every familiar symbol. 

**Standard operations should retain accurate names.** In particular, it explicitly prevents replacing “Fork” with “Mirror” merely for differentiation, because those operations have different semantics. ([GitHub Docs][1])

I also corrected my earlier emphasis on changing internal wording. The document requires **accurate descriptions of references, licensed reuse, original contributions, and actual reviews**. It does not retrospectively certify the existing mockups or instruct an agent to change historical records.

Suggested repository location:

```text
skills/forkalope-interface-design/SKILL.md
```

**The file governs a genuine design process; it does not promise a judicial outcome.** It requires review of the actual screens, assets, and applicable agreements before public launch rather than treating the phrase “distinct Forkalope visual identity” as legal clearance.

[1]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-forks "Forks - GitHub Docs"


**[Download SKILL.md — Forkalope React UI](sandbox:/mnt/data/forkalope-react-ui/SKILL.md)**

Place it in your repository at:

```text
.agents/skills/forkalope-react-ui/SKILL.md
```

Codex discovers repository skills in `.agents/skills`, and you can invoke this one by name. ([OpenAI Developers][1])

Then give Codex the screenshots and this prompt:

```text
$forkalope-react-ui

Implement the requested Forkalope pages in the existing React application.

Use the attached screenshots to understand the user tasks, information
architecture, and interactions. Apply the skill's Forkalope design system
and independent presentation requirements rather than reproducing the
screenshots' styling.

Inspect the existing repository first. Implement actual JavaScript/JSX,
shared components, styles, routes, and working interactions.

Include the requested open dropdown and clone-panel states as real
interactive behavior—not permanently visible elements.

Preserve accurate Git terminology and supported functionality. Do not
invent backend capabilities or companion products.

Run the available build, lint, and interaction tests. Inspect the actual
pages in a browser at desktop and mobile sizes. Report any missing
integrations or checks you could not perform.

Deliver source-code changes, not generated mockup images.
```

The file includes **concrete CSS tokens, component responsibilities, page-by-page behavior, menu and focus handling, filtering and URL state, license checks, and acceptance tests**. It covers the dashboard, repository/file view, clone panel, Create menu, Actions/workflows, and pull requests with the author filter.

It also corrects an earlier overstatement: **licensed ordinary Octicons and Primer components do not automatically need to be redrawn.** Their MIT licenses permit reuse subject to the license conditions; that is separate from assessing the finished product’s branding and overall presentation. 

**The skill does not claim that the earlier mockups—or compliance with the file—constitute legal clearance.** It requires actual independent design, accurate source records, and appropriate review rather than promises about what a judge would decide.

[1]: https://developers.openai.com/codex/skills/ "Build skills | ChatGPT Learn"

