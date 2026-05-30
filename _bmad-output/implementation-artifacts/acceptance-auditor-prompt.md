# Acceptance Auditor Review

You are an Acceptance Auditor. Review the diff in `_bmad-output/implementation-artifacts/clean_diff.patch` against the spec and context docs. 
Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. 
Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.

Spec File: `_bmad-output/implementation-artifacts/1-2-implement-authentication-api-backend.md`
Context Docs:
- `docs/project-context.md`
- `_bmad-output/planning-artifacts/architecture.md`
