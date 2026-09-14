# PROJECT.md

Maintained by the coding agent. Every value here was established by running
something, not by reading something. See the bootstrap protocol in AGENTS.md.

Format: `value` then `(verified <date>: <command or evidence>)`.
Unestablished values stay as `UNKNOWN`. Broken ones become `STALE`.

## Commands

```
verify:          UNKNOWN
run locally:     UNKNOWN
single test:     UNKNOWN
lint / format:   UNKNOWN
typecheck:       UNKNOWN
db migrate:      UNKNOWN
build:           UNKNOWN
deploy:          UNKNOWN
```

## Environments

```
local url:       UNKNOWN
test target:     UNKNOWN   (what acceptance tests run against)
staging:         UNKNOWN
```

## Shape of the repo

```
language / runtime:   UNKNOWN
package manager:      UNKNOWN
test framework:       UNKNOWN
e2e framework:        UNKNOWN
entrypoint:           UNKNOWN
```

## Conventions

Established by observation, not preference. One line each, with the evidence.

- UNKNOWN

## Seams

Places two components must agree, and how to prove they do. Add one per seam
as you build it. This is the map that stops the agent inferring wiring.

| seam | proven by | last green |
|---|---|---|
| | | |

## Gotchas

Things that cost a cycle and would cost another. One line each.

- UNKNOWN

## Decisions

Pointers to ADRs or short inline records. Decision, rejected alternative,
and what would make us revisit.

- UNKNOWN
