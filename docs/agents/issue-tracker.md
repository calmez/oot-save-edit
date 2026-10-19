# Issue tracker: GitHub

Issues and specs live in GitHub Issues for `calmez/oot-save-edit`. Use the `gh`
CLI for tracker operations. Run commands from this clone; use
`--repo calmez/oot-save-edit` when the target could be ambiguous.

## Conventions

- **Create**: `gh issue create --title "..." --body-file <body-file>`. Write
  multiline bodies to a temporary file and pass it with `--body-file`.
- **Read**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List**:
  `gh issue list --state open --json number,title,body,labels,comments`. Apply
  appropriate `--label` and `--state` filters.
- **Comment**: `gh issue comment <number> --body-file <body-file>`.
- **Label**: `gh issue edit <number> --add-label "..." --remove-label "..."`.
  Use the mapping in `docs/agents/triage-labels.md` for triage roles.
- **Close**: `gh issue close <number>`. Post any explanatory comment first.
- **Sub-issues**: create with `gh issue create --parent <parent> ...`, or attach
  with `gh issue edit <parent> --add-sub-issue <child>` (`gh` 2.94+). If
  unavailable, put `Part of #<parent>` at the top of the child body and add a
  task-list link in the parent.

## Pull requests as a triage surface

**PRs as a request surface: no.**

If enabled later, use `gh pr view`, `gh pr diff`, `gh pr list`, `gh pr comment`,
`gh pr edit`, and `gh pr close` for the corresponding PR operations. Discover
external PRs by excluding authors whose `author_association` is `OWNER`,
`MEMBER`, or `COLLABORATOR`. Explicitly named PRs remain in scope regardless of
author.

GitHub shares one number space across issues and PRs. Resolve a bare `#42` with
`gh pr view 42`, falling back to `gh issue view 42` when it is an issue.

## Skill instructions

When a skill says "publish to the issue tracker", create a GitHub issue. When it
says "fetch the relevant ticket", read the issue using the command above.

## Wayfinding operations

- **Map**: a single issue labelled `wayfinder:map`, containing Notes,
  Decisions-so-far, and Fog.
- **Child ticket**: a sub-issue of the map, labelled `wayfinder:<type>` with
  type `research`, `prototype`, `grilling`, or `task`. Use the task-list
  fallback above when sub-issues are unavailable.
- **Blocking**: use native issue dependencies. Add an edge with
  `gh api --method POST repos/calmez/oot-save-edit/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`.
  Retrieve the blocker's database ID with
  `gh api repos/calmez/oot-save-edit/issues/<number> --jq .id`. Use this
  database ID, rather than the issue number or node ID. If dependencies are
  unavailable, put `Blocked by: #<number>, #<number>` at the top of the child
  body.
- **Frontier**: inspect the map's open children in map order. Pick the first
  unassigned child with no open blockers. Native
  `issue_dependencies_summary.blocked_by` counts open blockers; for the
  fallback, check whether each issue in the `Blocked by` line is closed.
- **Claim**: `gh issue edit <number> --add-assignee @me`, the driving session's
  first write.
- **Resolve**: post the answer using `--body-file`, close the child, and append
  a brief context pointer and link to the map's Decisions-so-far.
