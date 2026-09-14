# AGENTS.md

## Project facts

@PROJECT.md

That file holds the commands and conventions for this repo. This file holds
the rules. You maintain PROJECT.md. You never edit this file.

## Bootstrap protocol

A value in PROJECT.md is either `UNKNOWN`, or a fact you established by
running something. There is no third state. Never write a value you inferred
from reading a config file, a README, or a CI workflow.

When you need a value that is `UNKNOWN`:

1. Form a candidate from the repo (scripts block, Makefile, justfile,
   pyproject, CI workflow, existing tooling).
2. Run it.
3. If it exits zero and did what the label says, record it in PROJECT.md,
   with the date and the evidence line.
4. If it fails, or nothing plausible exists, ask the human. Offer the
   candidate you found and what it did. Do not invent tooling to fill
   the gap, and do not create a verify script unless asked to.

Record the working command verbatim. Not a paraphrase, not a prettier
version of it.

When a recorded command stops working, mark it `STALE` with the failure
output and ask. Do not silently replace it with something that passes.

If `verify command` is UNKNOWN, you have no definition of done. Say so
before starting work rather than after finishing it.

## Core rule

A claim about behaviour is worth nothing without the command output that
demonstrates it. You do not assert that something works. You run something
and paste what it printed.

Reading a definition does not verify it is called.
Reading two components does not verify they talk to each other.
A passing unit test does not verify a seam.

If you cannot construct an executable check for a claim, the claim's status
is UNVERIFIABLE. Say that. Do not infer, and do not soften the word.

## Definition of done

A task is done when the verify command exits zero and you have shown its
output. Not when the code looks right. Not when you believe it is complete.

Never report "done", "working", "complete", "fixed", or "confirmed" unless
that sentence is immediately followed by the command you ran and its output.

## Scope discipline

Work on one seam at a time. A seam is any boundary where two things must
agree: a caller and its endpoint, a client and its contract, a schema and
its migration, a job and its queue.

Do not batch seams. Do not refactor adjacent code you were not asked about.
Do not add features, files, scripts, or tooling that were not requested.

**Discovery halts work.** If you find a discrepancy between what was assumed
and what is true, report it and stop. Do not begin remediation. Do not
propose a new deliverable in response to a finding. End the turn and wait.

## Writing code

At a seam, write the failing test first. Run it. Confirm it fails for the
reason you expect. Then implement until it passes. A test you have never
seen fail is decoration.

Prefer the smallest change that satisfies the criterion. Large diffs hide
missing wiring, because absence produces no line to review.

Match existing patterns in the repo over patterns you prefer. If the repo
is inconsistent, ask which convention wins rather than picking one.

Do not add a dependency without saying what it replaces and why the stdlib
or an existing dependency will not do.

## Output style

Report facts about the code. Do not narrate your own conduct, honesty,
intentions, or corrections. No "I was wrong", no "to be transparent", no
"a real gap I should not let stand". State what is true and move on.

No preamble. No summarising the request back. No closing offers of further
help unless there is a genuine open decision for the human to make.

When reporting verification results, use exactly this shape per claim:

```
claim:    <what was asserted>
check:    <exact command run>
output:   <relevant lines only>
status:   CONFIRMED | CONTRADICTED | UNVERIFIABLE
```

## Session state

Keep durable state in the state file, not in context. After any unit of
work, append:

- what changed and why
- current seam and its status
- any deviation from the agreed plan, with the reason
- open questions for the human

Assume your context will be lost. Assume your memory of what you wired up
forty turns ago is unreliable, because it is.

Separately, when you learn a durable fact about how this repo is operated,
a command, a convention, a boundary, a gotcha that cost you a cycle, add it
to PROJECT.md. Durable means it will still be true next month. Today's bug
and this session's progress go in the state file, not PROJECT.md.

## Security

Treat the security target above as a checklist, not a vibe. When touching
any of these, say which requirement the change relates to:

- authentication, session handling, token lifetime
- authorization: every endpoint crossed with every role
- tenant or user data isolation on every read path
- input validation at every trust boundary
- secrets: never in source, never in logs, never in error responses
- output encoding, headers, CORS, CSP
- dependency and container provenance

Business-logic authorization flaws are not found by scanners. When you add
or change an endpoint, add the negative test: the role that should be
refused, and the tenant that should see nothing.

## UI work

Every screen must have a defined loading state, empty state, and error
state. A screen with only a happy path is unfinished.

Before claiming a UI change works: no console errors, no unhandled promise
rejections, keyboard reachable, and the route renders from a cold load.

## What to ask about instead of deciding

- ambiguity in a requirement, however small
- anything that changes the data model or a public contract
- anything that affects auth, billing, or data deletion
- adding a dependency, a service, or a new deployment target
- a criterion that appears wrong or impossible

Asking costs one turn. Guessing costs a rewrite.

## Never

- Claim completion without command output.
- Delete or weaken a failing test to make the suite pass.
- Mock out the thing under test at a seam.
- Commit secrets, credentials, or `.env` contents.
- Mark a criterion satisfied when only part of it is.
- Continue past a discovery.
