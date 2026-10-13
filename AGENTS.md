# Agent Guidelines

## Planning and Clarification
- For non-trivial work (3+ steps or architectural decisions), make a concise plan before editing. Include dependencies, acceptance criteria, and verification steps.
- Plan verification as well as implementation. For small changes, use a brief checklist instead of a lengthy plan.
- Ask clarifying questions only when an unresolved ambiguity could materially change the solution; otherwise state reasonable assumptions and proceed.
- If work goes sideways, stop, explain the issue, and re-plan before continuing.
- Write detailed specs only when the task's complexity requires them; keep this file concise.

## Development Workflow
- Code quality: follow existing patterns and keep code modular and reusable (DRY).
- React state: update event-driven state in the event/callback that causes the change. Do not use `useEffect` to mirror or derive state; reserve effects for external synchronization and lifecycle work.
- Build verification: use `npm run build` after project changes for the build required by the playbook. Fix straightforward errors; handle complex failures under Planning and Clarification. If the build cannot run, state why; never claim an unrun check passed.
- Feature documentation: create `docs/overview.md` if missing and keep it current after implementing or updating a feature. Record actual behavior, key files/flows, verified learnings, checks run, and known follow-ups. Update relevant entries rather than duplicating them; do not document unverified assumptions.
- Troubleshooting: after three unsuccessful attempts, consult `docs/learning/` before speculative fixes. When resolving a complex or recurring issue, document its symptom, root cause, and solution in `docs/learning/<topic>.md`.

## Required Skills
For relevant frontend/Next.js work, read and apply:
- `.agents/skills/frontend-design`
- `.agents/skills/next-best-practices`
- `.agents/skills/next-cache-components`
- Use complementary skills as applicable: `react-best-practices`, `tailwind-css-patterns`, `react-hook-form`, `zod`, and `accessibility`.

<!-- BEGIN:playbook-workflow -->
# Workflow (playbook)

The engineer drives; the agent assists. Work stays in one main context, in small reviewable
steps, and nothing ships until the engineer has checked it. Skills live in `.agents/skills/`.

## Stages (use only what a task needs, skip freely)

1. `sketch`: brainstorm before any code. Challenge the idea, offer alternatives. No implementation.
2. `shard`: plan into `docs/overview.md`, `docs/roadmap.md`, and one `docs/spec-<feature>.md` per feature. Never one monolithic PRD.
3. `exec`: implement one task at a time from the roadmap.
4. `testing` (optional): write real test cases for logic worth locking down. Do not drive the UI or judge screenshots.
5. `reflect` (optional): review and prune. Flag duplicates and dead code. Advise, never block.
6. `done`: only on the user's `/done`. Tick the roadmap box and commit everything in one commit.

## Cold start

If `docs/roadmap.md` exists, start every session by reading `docs/overview.md` and
`docs/roadmap.md`. Find the first unchecked `- [ ]`, then open only that spec for detail.
The roadmap wins for order; the spec wins for detail.

## Ground rules

- **Keep tasks small.** One task = one reviewable diff that compiles and does something on its own.
- **Never commit, tick roadmap checkboxes, or start the next task on your own.** Build, hand back a dirty tree with a note on how to verify, then stop.
- **Never push or branch** unless asked.
- **UI is the user's call.** Hand UI changes back to be viewed. Don't pilot a browser and guess from screenshots.
- **Main context beats subagents** for implementation. Use a subagent only for throwaway research or a bounded, self-contained problem.
- **Read only what you need.** Overview plus the one relevant spec. Small files over big ones.
- **Edit, don't rewrite.** Prefer targeted edits over `Write` on existing files.
- **Prune.** Reuse or remove before adding new code.
- **The agent advises, the user decides.** Raise concerns, then follow the user's call.
- **Record decisions** in the spec or `overview.md` so they aren't re-decided. Leave unresolved items under `## Open questions` for the user.
<!-- END:playbook-workflow -->
