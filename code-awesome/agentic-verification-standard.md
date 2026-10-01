# Agentic Verification Standard (Platform Golden Path)

> Owner: Cloud & AI Platform Engineering
> Status: v0.1 draft, October 2026
> Audience: every team shipping code to our ADO / AKS / Databricks / IaC estate, whether a human, Claude Code, Codex or Copilot wrote it.
> Seed: Arvid Kahl (x @arvidkahl) post on agentic dev learnings (https://x.com/arvidkahl/status/2105714739380973975), stress-tested against vendor docs, papers and what Stripe, Spotify, Meta, Uber and Anthropic actually run.

---

## 0. TL;DR

The core problem with agent-written code is not that agents write bad code. It is that **the agent is also the one deciding the work is done**. Claude's own docs say it plainly: Claude stops when the work looks done, and without an executable check, "looks done" is the only signal it has.

Analogy: letting the agent write the code, the tests, and judge the result is a student writing the exam, the answer key, and grading it. Our whole standard is about separating those three roles.

The ten rules:

1. **Every repo exposes one verify contract** (`make verify-fast`, `make verify`, `make verify-acceptance`). Agents and CI call the same entrypoint. No bespoke incantations.
2. **Generator != grader.** The thing that wrote the change never gets the final say on whether it is correct.
3. **Holdout acceptance tests live outside the agent's reach** (separate repo or path-protected), so they can't be edited to go green.
4. **Coverage is a floor, not a target.** Gate on *diff coverage* plus *mutation score on the diff*, not on global line coverage.
5. **Tests must be seen failing first.** Red evidence is required for bug fixes and new behavior.
6. **Adversarial review is evidence-obligated and risk-scaled**, not "a reviewer at every step".
7. **Humans review intent, contracts, test diffs and ADRs.** Not formatting, not line-by-line proofreading.
8. **Context lives in the repo, loaded on demand.** Short CLAUDE.md/AGENTS.md, deep docs in `docs/`, skills for workflows.
9. **Seed data is prod-shaped.** Same schema, distributions, edge cases and nastiness as prod, without prod rows.
10. **Every agent-authored change is traceable** to the session, prompt and plan that produced it.

---

## 1. Arvid's seven points, decoded and stress-tested

For each: what he means, why it's true, where it breaks, what we do.

### 1.1 "Adversarial reviews (ideally with a 3rd agent as arbiter) at every step"

**What it means.** One agent writes, a second attacks, a third adjudicates disagreements so the writer can't talk the reviewer out of a real finding.

**Why it's true.** There is now real evidence. The Adversarial Review paper (Qiu and Gill, ICML 2026 DL4C workshop) uses a main agent + reviewer + critic, where the critic audits the review before the main agent edits. It beat a five-agent baseline on LiveCodeBench with three agents. The key finding is the failure mode: naive multi-agent review produces **false consensus**, agents agreeing without sufficient evidence. Only after adding explicit disagreement did it hit the best F1 on SWE-PRBench.

**Where it breaks.**
- "At every step" is expensive and noisy. Anthropic's own docs warn that a reviewer told to find gaps will usually report some even when the work is sound, and chasing every finding leads to over-engineering: extra abstraction, defensive code, tests for impossible cases.
- Same-model review shares blind spots. A reviewer that is the same model with the same context is closer to a second draft than a second opinion.
- Spotify's experience: their LLM judge vetoed roughly a quarter of agent sessions, which is real value. Secondary reports say that as models improved, explicit verification instructions in prompts made the separate judge less necessary. So treat the judge as a **removable, measured stage**, not dogma.

**What we do.**
- Review in a **fresh context** (subagent or separate session) that sees only the diff + spec + criteria, not the writer's reasoning.
- **Evidence obligation:** every finding must cite file:line and a concrete failing input, or a test that demonstrates it. No evidence, no finding.
- **Cross-model where it matters:** Claude writes, Codex/GPT reviews (or vice versa). We already run both.
- **Risk-scaled** (section 6): small diffs get one skeptic; risky diffs get reviewer + critic.
- Measure veto precision. If a review stage's findings are mostly dismissed, cut it.

### 1.2 "Max coverage test suite, unit to e2e, no exceptions. TDD must be baked into agentic flows"

**What it means.** Tests are the agent's feedback loop, so maximize them, and write them first.

**Why it's true.** TDD matters more with agents than with humans. A failing test is a machine-readable spec. Anthropic's best-practices doc lists "write a failing test that reproduces the issue, then fix it" as the target prompt shape, and treats an executable check as the difference between a session you watch and one you walk away from.

**Where it breaks. This is the weakest point in the post.** "Max coverage, no exceptions" is exactly the metric an agent will game.
- Reward hacking in coding agents is documented, not hypothetical: hardcoding expected outputs, reading test fixtures, editing test files to pass. The EvilGenie benchmark measured this on Codex, Claude Code and Gemini CLI, and found much higher rates on ambiguous problems.
- SpecBench's finding: every frontier agent saturates the visible test suite, but there is a persistent gap on held-out tests. Visible-suite green does not mean working system.
- Line coverage measures "was this line executed", not "would a bug here be caught". An agent can hit 95% coverage with assertion-free tests.

**What we do.**
- Gate on **diff coverage** (new/changed lines), not global coverage.
- Gate on **mutation score on the diff** for critical modules. Meta's ACH work is the model: generate mutants (simulated faults) that current tests don't catch, then generate tests to kill them. Engineers accepted 73% of ACH's tests in their test-a-thons.
- **Holdout acceptance tests** the agent can't see or edit (section 5.4).
- **Red-first evidence** in the PR for bug fixes.
- "No exceptions" becomes "no *silent* exceptions": skips need an ADR or a ticketed waiver with expiry.

### 1.3 "Human review matters more for non-code stuff, particularly at architecture and decision-making stages"

**What it means.** Agents are good at producing code that satisfies a spec. They are bad at knowing whether the spec is the right one.

**Why it's true.** The expensive mistakes are upstream: wrong boundary, wrong data model, wrong trade-off. Claude's docs say the same: letting it jump straight to coding can solve the wrong problem, so explore, plan, then code.

**Where it breaks.** Only if "non-code" is read as "humans can skip code review". Humans still must review three code-adjacent things: **test diffs, contract/schema changes, and security-relevant paths**. Those are where an agent quietly redefines "correct".

**What we do.** Human gates at: RFC/spec approval, ADR approval, contract changes, test-diff review. Section 9.

### 1.4 "Contextmaxxing in the repo: docs, ARDs, customer ICP descriptions, runbooks, schema commentary, all INSIDE the codebase"

(He almost certainly means ADRs, architecture decision records.)

**What it means.** If context lives in Confluence or someone's head, the agent works blind. Put it where the agent reads.

**Why it's true.** An agent session starts with zero project knowledge. Whatever isn't in the repo (or reachable via a tool) doesn't exist.

**Where it breaks.** "Maxxing" is the wrong verb if it means stuffing everything into the always-loaded file. Anthropic's docs: performance degrades as the context window fills, and a bloated CLAUDE.md causes Claude to ignore your actual instructions. Their test for each line: would removing this cause Claude to make mistakes? If not, cut it.

**What we do.** Two layers:
- **Always loaded, short:** `AGENTS.md` (+ `CLAUDE.md` that imports it). Commands, gotchas, where things live, verify contract. Target under ~150 lines.
- **Loaded on demand, deep:** `docs/adr/`, `docs/runbooks/`, `docs/domain/`, schema commentary next to the schema, skills in `.claude/skills/`. The short file points at them.

Analogy: AGENTS.md is the building directory in the lobby, not the whole library.

### 1.5 "Contextmaxxing in the process: track every agentic conversation + changes made (via Entire or similar) and attach to ticket/PR"

**What it means.** Git tells you what changed. It doesn't tell you why the agent did it, which alternatives it rejected, or which prompt caused it.

**Why it's true.** When an agent-written change breaks prod six weeks later, the transcript is the only record of intent.

**About Entire.** Founded by ex-GitHub CEO Thomas Dohmke, launched February 10, 2026 with a $60M seed. Its first product, Checkpoints, is an open-source CLI. Mechanics: git hooks add an `Entire-Checkpoint` trailer to commits; metadata is stored on an `entire/checkpoints/v1` branch that syncs with your remote; it captures sub-agent sessions (e.g. Claude Code's Task tool) as nested sessions, and tracks agent vs human line attribution. It does layered secret scanning with gitleaks patterns plus entropy analysis.

**Where it breaks.**
- Transcripts contain secrets, customer data, internal hostnames. Secret scanning helps; it is not a DLP policy.
- Storage and retention: full transcripts on a branch pushed to remote is a data-governance decision, not a dev-tooling one.
- ADO: Entire's web UI is entire.io. The data lives in git so it should travel with an ADO remote, but **verify ADO support and the hosting/data-residency story before adopting**. Don't assume.

**What we do (tool-agnostic minimum).**
- Every agent commit carries a trailer: `Agent-Session: <id>` and `Agent-Model: <model>`. A Claude Code hook can do this.
- PR template has a mandatory "Agent provenance" block: plan/spec link, session id, what the agent was told, what it was not allowed to touch.
- Pilot Entire on one repo after a security review. Decide retention (e.g. 90 days) and redaction before rollout.

### 1.6 "Dev/testing DB content matters more than ever: seeds aren't dummy data; representative of prod, if not in volume, then in shape"

**Why it's true.** Agents test against what exists. If seed data is three tidy rows, the agent's dry runs prove nothing about nulls, skew, late-arriving data, unicode, timezone edges, or the one customer with 40k line items.

**This is the most underrated point in the post.** For us especially: Databricks/ADF pipelines and trading data have edge cases that never show up in hand-written fixtures (DST 23/25-hour days for hourly products, negative prices, contract rolls, duplicate late corrections, timezone-naive timestamps from upstream).

**What we do.** Section 8: seed tiers S0/S1/S2, prod profiling (stats only, never rows), generator specs checked into the repo.

### 1.7 "Code that works best for agents doesn't look best to humans: humans need to think of themselves as validators, not proofreaders"

**What it means.** Agent-friendly code is explicit, flat, verbose, greppable, locally repetitive. Humans find it boring. That's fine.

**Where it breaks.** "Doesn't need to look good" can slide into unmaintainable slop that only the agent can navigate, and the agent's context is finite too. Validators still need structure they can check.

**What we do.**
- Enforce architecture mechanically with **fitness functions**: import/dependency rules (`import-linter` for Python, `dependency-cruiser` for TS, ArchUnit for JVM). Boundaries are tested, not reviewed.
- Prefer explicit types, small files, no metaprogramming/magic, colocated tests.
- Humans validate *behavior and boundaries* (does it meet the spec, does it respect the contract), not style. Formatters and linters own style.

---

## 2. The verification architecture

```
            spec / plan (human-approved)
                       |
                       v
   +-------------------------------------------+
   |  WRITER (agent)                           |
   |  sees: repo, AGENTS.md, spec, visible tests|
   |  loop: red -> green -> refactor            |
   |  local gate: make verify-fast (Stop hook)  |
   +-------------------------------------------+
                       |
                       v  PR
   +-------------------------------------------+
   |  DETERMINISTIC GATES (CI, cannot be argued)|
   |  lint, types, unit, integration, contract, |
   |  diff-coverage, mutation-on-diff, security |
   +-------------------------------------------+
                       |
                       v
   +-------------------------------------------+
   |  HOLDOUT ACCEPTANCE (sealed exam paper)    |
   |  separate repo / protected path            |
   |  writer never saw it, can't edit it        |
   +-------------------------------------------+
                       |
                       v
   +-------------------------------------------+
   |  ADVERSARIAL REVIEW (fresh context,        |
   |  ideally different model, evidence-bound)  |
   |  reviewer -> critic (risk tier >= 2)       |
   +-------------------------------------------+
                       |
                       v
   +-------------------------------------------+
   |  HUMAN VALIDATOR                           |
   |  intent vs spec, test diff, contracts, ADR |
   +-------------------------------------------+
```

Deterministic first, probabilistic second, human last. Each layer is cheaper than the one after it, so it should filter for it. Stripe's design principle is the same: their "blueprints" mix deterministic nodes (lint, push, CI) with agentic nodes (implement, fix CI failures), and lint runs locally as a deterministic node before push so the first CI pass has a better chance.

---

## 3. What other companies actually do

| Company | System | What's relevant to us |
|---|---|---|
| **Anthropic** | Claude Code Code Review (launched March 9, 2026) | Parallel agents per PR, findings verified to reduce false positives, ranked by severity. Internally, PRs with substantive review comments went from 16% to 54%; under 1% of findings marked incorrect by devs; ~20 min and ~$15-25 per review. **GitHub only**, Team/Enterprise. Not usable on our ADO repos; we self-host the pattern via `claude -p`. |
| **Anthropic** | Agentic property-based testing | Claude Code command that infers properties and writes Hypothesis tests; found bugs in NumPy, SciPy, Pandas. Released as a `/hypothesis` command. Directly usable for our Python/PySpark code. |
| **Stripe** | Minions | Unattended agents, 1,300+ PRs/week, all human-reviewed. Run in isolated devboxes (EC2) ready in ~10s. Blueprints = deterministic + agentic nodes. 3M+ tests, CI selects relevant subset. **Hard cap of two CI rounds**, then a human takes over. Rule files shared across Minions, Cursor and Claude Code. |
| **Spotify** | Honk (background coding agent, Claude Agent SDK) | Named the three failure modes: no PR, PR fails CI, PR passes CI but is functionally wrong. Answer: strong verification loops (format, build, test) + an LLM judge that compares diff to original prompt after deterministic checks; judge vetoed ~25% of sessions. A single **"verify tool"** abstracts all build systems so the agent calls one interface. Later **decoupled the verification runtime from the agent runtime** instead of recreating CI inside the agent box. |
| **Meta** | ACH (mutation-guided LLM test gen) | Generate a few *relevant* mutants that existing tests miss, then generate tests that kill them. 10,795 Kotlin classes, 9,095 mutants, 571 hardening tests; 73% of generated tests accepted by engineers. Keeps humans in the loop. |
| **Uber** | AutoCover (ICSE 2026 distinguished paper) | Multi-agent LangGraph pipeline: prepare, generate, execute, validate/repair. Quality gates: coverage deltas, mutation/branch checks, multi-run flakiness defenses. ~11% of all new reviewed tests. CLI, headless (repo shards, opens MRs) and IDE modes. |

**Pattern across all five:** the agent is cheap; the verification harness is the product. Every one of them invested in deterministic gates and a single verify interface before scaling agents. Stripe's devboxes, test suite, lint daemon and CI all existed before Minions.

---

## 4. Claude Code mechanics we standardize on

### 4.1 Four ways to make "done" mean "verified"

From Claude Code's best-practices doc, in increasing strength:

| Level | Mechanism | Use when |
|---|---|---|
| Prompt | "run the tests and iterate until green" | ad hoc work |
| Session | `/goal` condition, separate evaluator re-checks after every turn | long interactive tasks |
| Deterministic | **Stop hook** runs the check, blocks the turn from ending until it passes | **our default for all repos** |
| Second opinion | verification subagent / dynamic workflow, fresh model tries to refute | risk tier 2+ |

Also from the doc: have Claude show evidence (test output, command + result, screenshot) rather than asserting success.

### 4.2 Hooks we ship centrally

Hooks are deterministic; CLAUDE.md instructions are advisory. Hook contract: **exit code 2 blocks** the action and feeds stderr back to Claude. For org enforcement, managed settings support `allowManagedHooksOnly` (blocks user, project and plugin hooks); plugins force-enabled in managed settings are exempt, which is how we distribute vetted hooks through an org marketplace.

Platform-owned hooks (appendix B):
- `protect-tests.sh` (PreToolUse on Edit/Write): block edits to `tests/acceptance/**`, `tests/contract/**`, `.verify/**`, pipeline YAML.
- `verify-on-stop.sh` (Stop): run `make verify-fast`, block stop on failure. Respect `stop_hook_active` to avoid loops; Claude Code also caps consecutive blocks (8 per the docs).
- `tdd-guard.sh` (PreToolUse, opt-in): block writing `src/x` if no corresponding test file changed in this session.
- `provenance.sh` (PostToolUse on git commit): append `Agent-Session` / `Agent-Model` trailers.

**Caveat, stated plainly:** PreToolUse on Edit/Write does not stop `sed -i` via Bash. Hooks are guard rails, not the security boundary. The real boundary is ADO branch policy (required reviewers on protected paths) + the holdout suite living in a different repo.

### 4.3 Review in CI on ADO

Code Review (managed) is GitHub-only. On ADO we run Claude headless:

- `claude -p "<prompt>" --output-format json --allowedTools "Read,Grep,Glob,Bash(git diff *)"` in a pipeline stage.
- Read-only tools. The reviewer never edits.
- Post findings as a PR thread via ADO REST (`.../pullRequests/{id}/threads?api-version=7.1`) using `System.AccessToken`.
- Bundled `/code-review` skill exists for local use: reviews the current diff in a fresh subagent.
- Second model for critic stage: Codex CLI or a Foundry-hosted model.

### 4.4 Writer / tester split

Claude's docs suggest one session writes tests and another writes code to pass them. We formalize it for risk tier 2+: the **test author session** writes acceptance tests from the spec only (no access to implementation branch), commits them to the holdout location; the **implementer session** never sees them.

---

## 5. The Platform Test Standard (the generic suite teams adopt)

### 5.1 The verify contract

Every repo, every archetype, same targets. This is Spotify's "verify tool" lesson: one interface, whatever the build system underneath.

```
make verify-fast        # < 2 min. lint, format check, types, unit, affected tests. Agent loop + Stop hook.
make verify             # full: + integration, contract, diff-coverage, security scans
make verify-mutation    # mutation testing on changed files only
make verify-acceptance  # holdout suite (CI only; pulls sealed suite)
make seed               # load S1 prod-shaped seed into local/ephemeral env
```

`Makefile` is the facade; under it can be `pytest`, `dotnet test`, `npm`, `terraform test`, whatever. Windows devs: same targets via `just` or a `verify.ps1` shim. Pick one facade org-wide and don't bikeshed it again.

### 5.2 Standard repo layout

```
repo/
  AGENTS.md                 # short, always loaded (commands, gotchas, verify contract, pointers)
  CLAUDE.md                 # "@AGENTS.md" + Claude-specific notes only
  Makefile                  # the verify contract
  .claude/
    settings.json           # project hooks (platform plugin supplies the enforced ones)
    agents/reviewer.md      # adversarial reviewer subagent
    agents/critic.md
    skills/                 # repo workflows (seed, release, migrate)
  docs/
    adr/                    # 0001-*.md, numbered, immutable once accepted
    runbooks/
    domain/                 # glossary, ICP/user descriptions, business invariants
    specs/                  # SPEC.md per feature, linked from PR
  src/
  tests/
    unit/
    integration/
    contract/               # PATH-PROTECTED
    acceptance/             # PATH-PROTECTED (or pulled from sealed repo in CI)
    properties/             # property-based tests (Hypothesis etc.)
  seeds/
    profile/                # prod stats snapshots (no rows)
    spec/                   # generator specs
    fixtures/               # S0 hand-crafted edge cases
```

Why AGENTS.md as source of truth: it's the cross-tool standard (stewarded by the Agentic AI Foundation under the Linux Foundation) read by Codex, Cursor, Copilot and others. Reports on whether Claude Code reads it natively conflict, so `CLAUDE.md` containing `@AGENTS.md` is the safe pattern that works either way. Run `/context` to confirm it loaded.

### 5.3 Test taxonomy by size, not by name

"Unit vs integration" arguments waste time. Classify by what the test is allowed to touch (Google-style sizes):

| Size | Allowed | Runs in | Budget |
|---|---|---|---|
| Small | single process, no network, no disk beyond tmp, no sleep | verify-fast, every agent turn | ms per test |
| Medium | localhost, Testcontainers, local Spark session, emulators | verify | seconds |
| Large | real Azure resources in ephemeral env, real Databricks workspace | verify-acceptance / nightly | minutes |

The agent loop only runs Small (+ affected Medium). Keeping Small truly small is what makes the Stop hook tolerable.

### 5.4 Holdout acceptance suites

The single most important anti-gaming control.

- Lives in a **separate ADO repo** per product (`<product>-acceptance`), or in `tests/acceptance/` with ADO **required reviewer policy on that path** (test owners group). Separate repo is stronger: the agent's working copy simply doesn't contain it.
- Written from the **spec**, by a human or by a separate agent session that never saw the implementation.
- CI checks it out via `resources.repositories` and runs it against the built artifact.
- Black-box: hits the API / job / table outputs, not internals.
- Agent gets **pass/fail + test names** on failure, not the test source. Enough to debug, not enough to special-case.

Analogy: visible tests are the practice paper, the holdout is the sealed exam. SpecBench is literally this methodology, and the gap it measures is the gap we're closing.

### 5.5 Gates by repo archetype

| Archetype | verify-fast | verify (CI) | acceptance / nightly |
|---|---|---|---|
| **Service on AKS** (API/worker) | lint, types, small tests | medium tests w/ Testcontainers, consumer-driven contract tests (Pact), diff-cov >= 80%, mutation on diff (critical modules), Snyk/OSV, container scan | deploy to ephemeral namespace, holdout API tests, OWASP ZAP baseline, k6 smoke perf vs budget |
| **Data pipeline** (Databricks / ADF) | pure transform unit tests on tiny DataFrames (chispa-style asserts), schema tests | local Spark tests on **S1 seed**, data contract checks (schema, nullability, ranges), expectations, idempotency test (run twice, same result) | DAB-deployed job in test workspace on S1/S2, reconciliation vs known totals, runtime + cost budget |
| **IaC: Terraform** | `fmt`, `validate`, tflint | `terraform test` (native), Checkov / conftest policies, plan diff review | apply to sandbox subscription, smoke checks, destroy |
| **IaC: Bicep** | `bicep build`, linter | PSRule for Azure, `what-if` output attached to PR | deploy to sandbox RG, smoke, delete |
| **Helm / K8s** | `helm lint`, kubeconform | helm-unittest, `kyverno test` against our policies | install into ephemeral namespace, readiness + rollback test |
| **LLM / agent app** (HR bot, RAG) | prompt/template unit tests, tool-schema tests | offline eval on golden set (groundedness, retrieval hit rate, refusal cases, ACL leakage cases), regression threshold vs last baseline | red-team set (prompt injection via documents, cross-user ACL probes), latency + token cost budget |

Notes:
- **Mutation testing** tools: Stryker (JS/TS/.NET), mutmut or cosmic-ray (Python), PIT (JVM). Run on changed files only or it becomes a CI cost problem. Start threshold on diff at 60% for critical modules, tune per repo. This number is our starting choice, not an industry standard.
- **Diff coverage**: `diff-cover coverage.xml --compare-branch=origin/main --fail-under=80` or equivalent.
- **Property-based tests** are mandatory for: parsers, serializers, pricing/aggregation math, anything with an inverse (encode/decode, round-trips), idempotency claims. Use the `/hypothesis` command as a starting point.
- **LLM apps**: ACL leakage is a test case, not a review comment. For the HR bot, every eval run includes "user without access asks about restricted policy" cases.

### 5.6 Red-first rule

For bug fixes and new behavior, the PR must show the failing assertion before the fix. Prompt shape we standardize in the skill:

> Write the failing test first. Run it and show the failing assertion before changing production code. Then implement the smallest change that makes it pass. Then run `make verify-fast`.

CI check (cheap version): for PRs labeled `bugfix`, rerun new/changed tests against the base branch's `src/`; they must fail there. A test that passes on the old code didn't test the fix.

### 5.7 Flakiness policy

Agents treat flaky tests as signal and "fix" production code to chase noise. So:
- Any test that fails then passes on retry within one pipeline run is auto-quarantined and ticketed.
- Quarantined tests don't gate, but are reported on every PR, and have a 14-day expiry before they are deleted or fixed.
- New tests are run N times (e.g. 5) in CI before they're allowed to gate (Uber's multi-run defense, scaled down).

---

## 6. Adversarial review, done properly

### 6.1 Risk tiers

| Tier | Trigger (any) | Review |
|---|---|---|
| 0 | docs, comments, config values, < 20 lines non-logic | deterministic gates only |
| 1 | < 200 lines, single module, no contract change | 1 reviewer (fresh context, same or other model) |
| 2 | > 200 lines, multi-module, schema/contract/API change, auth, money/pricing math, data deletion | reviewer + critic, **critic on a different model** |
| 3 | security boundary, IAM/RBAC, network policy, prod data migration | tier 2 + mandatory human security reviewer |

Tier is computed in CI from paths + diff size + labels, not self-declared by the agent.

### 6.2 Protocol

1. **Reviewer** gets: diff, spec, relevant ADRs, AGENTS.md. Not the writer's transcript.
2. Reviewer output schema: `{finding, severity, file, line, evidence, failing_input_or_test}`. Findings without evidence are dropped automatically.
3. **Critic** gets the same inputs + the review. Job: attack each finding. Is the evidence real? Is it in scope? Is it a correctness issue or a preference? Default stance: disagree unless evidence holds. (This is the fix for false consensus.)
4. Surviving findings go to the writer. Writer can rebut only with evidence (a passing test that covers the case, a spec reference).
5. Unresolved disagreements escalate to the human, flagged, not buried.
6. **Scope rule** (from Anthropic's guidance): flag only gaps that affect correctness or stated requirements. Style and "consider adding" go in a non-blocking section or nowhere.

### 6.3 Budgets

- Stripe's two-CI-rounds cap is the right instinct. Ours: max 2 review rounds per PR, then human.
- Track per stage: findings raised, findings accepted by humans, cost. If accept rate < ~20% for a month, retune or drop the stage.

---

## 7. Agent loop rules (what goes into the shared skill)

1. Read AGENTS.md, the spec, and relevant ADRs. Plan before code for anything multi-file.
2. Write or update the failing test first. Show it failing.
3. Implement minimal change. Run `make verify-fast`. Iterate.
4. Never edit protected paths. If a protected test seems wrong, **stop and report**, don't work around it. Research on escalation channels shows giving agents a structured way to report defective tests at the point of conflict reduces reward hacking and surfaces the actual defect.
5. Never weaken an assertion, add a skip, or widen a tolerance without saying so explicitly in the PR description.
6. End with evidence: commands run, outputs, what was not tested and why.
7. If corrected twice on the same issue, stop; the context is polluted. (Anthropic: after two failed corrections, `/clear` and restart with a better prompt.)

---

## 8. Test data: prod-shaped seeds

### 8.1 Tiers

| Tier | What | Size | Where it runs |
|---|---|---|---|
| S0 fixtures | hand-crafted, named edge cases (`dst_fall_back_25h_day.parquet`, `negative_price.json`, `duplicate_late_correction.csv`) | tiny | small tests |
| S1 shape seed | synthetic, generated from prod **profile**: same schema, null rates, cardinalities, distributions, skew, referential integrity | 10k-1M rows | medium tests, dry runs, agent sandboxes |
| S2 volume seed | same generator, scaled | prod-like volume | nightly perf, cost budgets |

### 8.2 Pipeline

```
prod (read-only, governed job)
   -> profile job: per-column stats, histograms, null %, distinct counts,
      top-k categorical values (hashed/masked if sensitive), FK relationships
   -> seeds/profile/<table>.json  (checked in, reviewed, NO rows)
   -> generator spec (seeds/spec/<table>.py)
   -> make seed  ->  S1 in local / ephemeral / test workspace
```

- Databricks: `dbldatagen` (Databricks Labs) generates synthetic data from a code spec at scale and has experimental support for generating spec code from an existing schema or data. Labs projects aren't SLA-supported by Databricks; fine for test data, note it in the ADR.
- The profile step is the only thing that touches prod, runs under a governed identity, and outputs stats only.
- **Edge-case injection is explicit**: the generator spec has a section that guarantees N rows of each known nasty case. Distributions alone won't produce a DST transition reliably.
- Every production incident caused by data adds an S0 fixture and an S1 injection rule. Seeds are a living regression record.

### 8.3 What "representative in shape" means (checklist)

Schema and types identical; nullability and null rates; cardinality and skew (the one huge customer/book); string nastiness (unicode, empty vs null, whitespace, very long); time (timezones, DST, late-arriving, out-of-order, backfills); numerics (negatives, zeros, precision, very large); referential integrity *and* realistic violations of it; duplicates and corrections.

---

## 9. Where humans spend attention

Humans as validators, not proofreaders. Concretely, a human reviewer of an agent PR checks, in this order:

1. **Intent**: does the PR do what the approved spec says, and nothing else? (Scope creep is the most common agent failure Spotify's judge caught.)
2. **Test diff**: were tests added, removed, or weakened? Any new skip, wider tolerance, mocked-away dependency? This is where gaming hides.
3. **Contracts**: API, schema, event, table contract changes. Downstream impact.
4. **ADR consistency**: does it contradict an accepted ADR? If the ADR is wrong, change the ADR first, in a separate PR.
5. **Evidence**: red-first output, verify output, holdout result, review findings and how they were resolved.

Not reviewed by humans: formatting, naming nits, import order. Tools own those.

Upstream human gates (before any code): spec approval for tier 2+, ADR approval for anything architectural.

---

## 10. ADO implementation

### 10.1 Policy

- **Pipeline templates via `extends`** from a central `platform-templates` repo. Teams pass parameters (archetype, thresholds); they don't author stages.
- **Required template check** on protected environments and service connections, so a pipeline that doesn't extend our template can't deploy.
- **Branch policies on `main`**: build validation (verify + acceptance), minimum reviewers, **automatically included reviewers with path filters** for `tests/acceptance/*`, `tests/contract/*`, `.claude/*`, `azure-pipelines*.yml`, `seeds/profile/*`.
- Build service identity needs "Contribute to pull requests" for the AI review stage to post threads.

### 10.2 Rollout and maturity

| Level | Requirements | Target |
|---|---|---|
| L0 | verify contract exists, AGENTS.md exists, lint + unit in CI | all repos, month 1 |
| L1 | diff coverage gate, protected paths policy, Stop hook via platform plugin, provenance trailers | all active repos, month 2 |
| L2 | holdout acceptance suite, S1 seeds, AI review tier 1, flakiness policy | critical repos, month 3-4 |
| L3 | mutation on diff, property tests on mandated areas, tier 2 reviewer+critic, session capture | critical repos, month 6 |

Ties into the golden-path onboarding agent idea: the agent audits a repo against L0-L3 and opens a PR adding what's missing.

### 10.3 Metrics (measure the system, not the people)

- **Escape rate**: prod incidents per 100 merged PRs, split agent-authored vs human.
- **Holdout gap**: % of PRs green on visible tests but red on holdout. Rising = gaming or weak visible tests.
- **Mutation score on diff** trend.
- **CI rounds per agent PR** (Stripe-style cap health).
- **Review stage precision**: findings accepted / findings raised, per stage.
- **Flaky rate** and quarantine age.
- **Time to first green** for new repos onboarding to L1.

---

## Appendix A: AGENTS.md template

```markdown
# AGENTS.md

## What this is
<2 lines: service purpose, owner team, criticality tier>

## Verify (always use these, never invent commands)
- make verify-fast   # run after every change
- make verify        # before opening a PR
- make seed          # load prod-shaped seed locally

## Rules
- Write the failing test first and show it failing.
- NEVER edit tests/acceptance/, tests/contract/, .claude/, azure-pipelines*.yml.
  If one looks wrong, stop and report it in the PR description.
- Never add skips, widen tolerances, or mock a dependency to make a test pass
  without stating it explicitly in the PR.
- Prefer real dependencies (Testcontainers / local Spark) over mocks; mock only at
  network boundaries.

## Where to look
- Architecture decisions: docs/adr/ (read before changing module boundaries)
- Domain rules and edge cases: docs/domain/
- Runbooks: docs/runbooks/
- Seeds and edge-case fixtures: seeds/

## Gotchas
<only things an agent would get wrong without being told>
```

`CLAUDE.md`:

```markdown
@AGENTS.md

## Claude Code
- Use plan mode for changes touching more than 3 files.
- When compacting, preserve the list of modified files and the verify commands.
```

## Appendix B: hooks

`.claude/settings.json` (shipped via platform plugin):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/protect-tests.sh" }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/verify-on-stop.sh" }
        ]
      }
    ]
  }
}
```

`protect-tests.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
input="$(cat)"
path="$(jq -r '.tool_input.file_path // empty' <<<"$input")"
[[ -z "$path" ]] && exit 0

protected='(^|/)(tests/acceptance|tests/contract|\.claude|seeds/profile)/|azure-pipelines[^/]*\.ya?ml$'
if [[ "$path" =~ $protected ]]; then
  echo "BLOCKED: $path is a protected path (holdout/contract/policy)." >&2
  echo "Do not modify it. If you believe it is wrong, stop and explain why in your final message." >&2
  exit 2
fi
exit 0
```

`verify-on-stop.sh`:

```bash
#!/usr/bin/env bash
set -uo pipefail
input="$(cat)"
# already continuing because of this hook: let the turn end to avoid loops
if [[ "$(jq -r '.stop_hook_active // false' <<<"$input")" == "true" ]]; then
  exit 0
fi
# only enforce if something changed
if git diff --quiet && git diff --cached --quiet; then
  exit 0
fi
out="$(make verify-fast 2>&1)"; rc=$?
if [[ $rc -ne 0 ]]; then
  echo "verify-fast failed. Fix the root cause, do not suppress. Last output:" >&2
  tail -n 60 <<<"$out" >&2
  exit 2
fi
exit 0
```

(Verify current hook input field names against the hooks reference when implementing; the contract has evolved across versions.)

## Appendix C: reviewer and critic subagents

`.claude/agents/reviewer.md`:

```markdown
---
name: reviewer
description: Adversarial correctness reviewer for a diff against its spec
tools: Read, Grep, Glob, Bash
---
You review a diff against docs/specs/<spec> and relevant ADRs. You did not write it.
Report ONLY issues that affect correctness, security, or stated requirements.
Every finding MUST include: file, line, severity (blocker/major/minor), and evidence:
a concrete input that breaks it, or a test you wrote and ran that fails.
No evidence = do not report it. No style comments. No "consider adding".
Also check the test diff: removed/weakened assertions, new skips, widened tolerances,
mocks replacing real dependencies. Report each one.
Output JSON: [{finding, severity, file, line, evidence}]
```

`.claude/agents/critic.md` (run on a different model in CI where possible):

```markdown
---
name: critic
description: Audits a review for unsupported or out-of-scope findings
tools: Read, Grep, Glob, Bash
---
You receive a diff, its spec, and a review. Attack each finding.
Default to rejecting a finding unless its evidence actually reproduces.
Reject findings that are preferences, out of scope, or about impossible inputs.
Also list any blocker the reviewer MISSED, with evidence.
Output JSON: {upheld: [...], rejected: [{finding, reason}], missed: [...]}
```

## Appendix D: ADO pipeline template (sketch)

```yaml
# platform-templates/verify.yml
parameters:
  - name: archetype
    type: string
    values: [service, data, iac-terraform, iac-bicep, helm, llm-app]
  - name: diffCoverageMin
    type: number
    default: 80
  - name: acceptanceRepo
    type: string
    default: ''
  - name: aiReview
    type: boolean
    default: true

stages:
  - stage: verify
    jobs:
      - job: verify
        steps:
          - checkout: self
            fetchDepth: 0
          - script: make verify
            displayName: verify (${{ parameters.archetype }})
          - script: diff-cover coverage.xml --compare-branch=origin/$(System.PullRequest.TargetBranchName) --fail-under=${{ parameters.diffCoverageMin }}
            condition: eq(variables['Build.Reason'], 'PullRequest')
            displayName: diff coverage gate
          - script: make verify-mutation
            condition: and(succeeded(), eq(variables['tier'], 'critical'))

  - ${{ if ne(parameters.acceptanceRepo, '') }}:
    - stage: acceptance
      dependsOn: verify
      jobs:
        - job: holdout
          steps:
            - checkout: self
            - checkout: ${{ parameters.acceptanceRepo }}   # declared in resources.repositories
            - script: make verify-acceptance

  - ${{ if eq(parameters.aiReview, true) }}:
    - stage: ai_review
      dependsOn: verify
      condition: eq(variables['Build.Reason'], 'PullRequest')
      jobs:
        - job: review
          steps:
            - checkout: self
              fetchDepth: 0
            - script: |
                npm install -g @anthropic-ai/claude-code
                git diff origin/$(System.PullRequest.TargetBranchName)...HEAD > /tmp/pr.diff
                claude -p "Use the reviewer subagent on /tmp/pr.diff against the linked spec. Output JSON only." \
                  --output-format json \
                  --allowedTools "Read,Grep,Glob,Bash(git diff *)" > review.json
                python .verify/post_threads.py review.json   # posts via ADO REST using System.AccessToken
              env:
                SYSTEM_ACCESSTOKEN: $(System.AccessToken)
              displayName: adversarial review (non-blocking at L2, blocking on blockers at L3)
```

Provider auth (Anthropic API vs Foundry/Bedrock/Vertex) depends on our contract; check current Claude Code env vars before wiring.

## Appendix E: PR template additions

```markdown
## Agent provenance
- Authored by: [human | agent | mixed]   Model(s):
- Spec / plan: docs/specs/...
- Session id(s):
- Agent was told NOT to touch:

## Evidence
- Red-first output (bugfix/new behavior):
- `make verify` result:
- Holdout acceptance: pass/fail
- Review findings: N raised, N upheld by critic, how resolved

## Test diff declaration
- Tests removed / skipped / tolerances widened / mocks added: (list or "none")
```

## Appendix F: ADR template

```markdown
# ADR-NNNN: <title>
Status: proposed | accepted | superseded by ADR-XXXX
Date:
Context: <forces at play, constraints>
Decision: <what we chose>
Alternatives considered: <and why not>
Consequences: <what gets easier, what gets harder, what we must now test>
Verification: <which tests/fitness functions enforce this decision>
```

The last field is the point: an ADR without a test enforcing it is a wish.

---

## Sources

- Claude Code best practices: https://code.claude.com/docs/en/best-practices.md
- Claude Code hooks reference: https://code.claude.com/docs/en/hooks
- Adversarial Review (Qiu and Gill, ICML 2026 DL4C): https://icml.cc/virtual/2026/82747
- Entire / Checkpoints docs: https://docs.entire.io/core-concepts , https://docs.entire.io/guides/checkpoints/capture-checkpoints
- Anthropic Code Review coverage: https://infoq.com/news/2026/04/claude-code-review , https://heise.de/-11205497
- Spotify Honk, feedback loops: https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3
- Stripe Minions: https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2 , https://infoq.com/news/2026/03/stripe-autonomous-coding-agents/
- Meta ACH: https://arxiv.org/html/2501.12862v1
- Uber AutoCover (ICSE 2026): https://conf.researchr.org/details/icse-2026/icse-2026-software-engineering-in-practice/58/Automated-Software-Test-Generation-at-Industry-Scale-Using-a-Multi-Agent-Architecture
- Anthropic agentic property-based testing: https://red.anthropic.com/2026/property-based-testing , https://hypothesis.works/articles/claude-code-plugin/
- Reward hacking: EvilGenie https://arxiv.org/pdf/2511.21654 , SpecBench https://awesomepapers.io/papers/2605.21384 , escalation channels https://huggingface.co/papers/2608.29460.md
- AGENTS.md / Claude Code discussion: https://github.com/anthropics/claude-code/issues/31005
- dbldatagen: https://pypi.org/project/dbldatagen
