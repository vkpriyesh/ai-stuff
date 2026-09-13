---
name: satisficer-picker
description: Cuts decision paralysis on purchases and option-comparisons by acting as a satisficer, not a maximizer (Barry Schwartz's distinction from The Paradox of Choice). Use whenever the user is buying something, comparing products/services/tools, stuck between options, or says they're "confused," "overthinking," "can't decide," or is deep in a review/spec rabbit hole. Also trigger on "help me pick," "which one should I get," "too many options," or any open-ended shopping/decision request. Do NOT trigger for purely technical/architecture decisions with no consumer-choice framing (e.g. "which database should I use for this system") unless the user explicitly asks for satisficer mode there too.
---

# Satisficer Picker

## The concept (why this exists)

Schwartz splits decision-makers into two types:
- **Maximizer**: must find the objectively best option. Exhaustively searches, compares, second-guesses, keeps checking after deciding. Ends up less satisfied even when the outcome is objectively better, because of comparison and regret.
- **Satisficer**: sets clear standards, picks the first thing that clears them, stops. Ends up happier with equal or better outcomes because there's no ongoing comparison tax.

Satisficing isn't "settling for mediocre" - a satisficer can have high standards, just not *unbounded* ones. The whole point is: define the bar first, then stop searching the moment something clears it.

This skill is the enforcement mechanism: force the constraints up front, then hard-stop at 3 options. No 10-tab spiral, no "here are 6 more you could also consider."

## Why this isn't just outsourcing the decision

Recent HCI research (Mei, Pang, Lyford, Wang & Reinecke, "Passing the Buck to AI," ACM TOCHI, 2026) found that people with a high "buckpassing" tendency - deferring decisions to avoid the effort or anxiety of making them - are the most likely to seek out AI suggestions, yet spend the *least* time scrutinizing the AI's reasoning. They treat the AI's answer as a decision-anxiety release valve, not a source to verify, which makes them more exposed to bad or hallucinated answers. "Vigilant" decision-makers (thorough info-gathering before deciding) don't necessarily ask AI more often, but when they do, they actually read and check the reasoning.

The risk for this skill specifically: it's easy for "satisficing" to collapse into buckpassing if the user just takes whatever 3 options come back without any visibility into what was actually checked. The fix is structural, not a disclaimer - see step 4c below.

## Workflow

**1. Detect the moment.** The user gives you a product/service/decision they're stuck on, or is mid-spiral comparing things.

**2. Ask hard constraints - not preferences.** Use a structured input tool if available (tappable > typed). 1-3 questions max, covering whatever of these aren't already stated:
- Budget ceiling (hard number, not a vibe)
- Dealbreaker requirements (the 1-2 things that are non-negotiable - if it doesn't have X, it's out, full stop)
- Primary use case / what it needs to be good at (not "everything," the actual job)
- Timeframe if relevant (need it now vs can wait)

Don't ask about nice-to-haves. Nice-to-haves are how satisficers turn into maximizers. If the user already stated constraints in their message, don't re-ask - confirm and move on. Whatever they answer is a hard constraint for the rest of the workflow, not a hint to be reinterpreted - if they say wired, don't drift back toward wireless; if they say commute, don't optimize for a desk setup.

**3. Fact-check live.** Don't answer from memory for anything price/spec/version/availability related - search for current info before naming real products, prices, or specs. This is also part of the vigilance requirement, not just accuracy hygiene.

**4. Filter, don't rank exhaustively.** Find options that clear every hard constraint. Skip anything that fails even one - don't present it "for context."

**4b. A budget is a ceiling, not a target - span it before settling.** Don't default to "cheapest thing that clears the bar." Explicitly check the top third of the stated budget, not just the bottom. If something near the ceiling is a genuine step up on the stated dealbreakers, it belongs in the 3 even if it spends most of the budget. If the category plateaus early and more money buys nothing relevant to the stated use case, that's fine too - but say so in one line instead of silently clustering all 3 options at the bottom of the range.

**4c. Show the check, not just the verdict (the vigilance trace).** Before the final table, add one short line naming what was actually checked - which price band was searched, roughly how many options were considered, whether the category plateaus or spans meaningfully. One line, not a research log. This is the difference between the user trusting the process and the user just trusting the AI - per the research above, that visibility is what keeps this a vigilance tool instead of a buckpassing shortcut.

**5. Output exactly 3.** No more, no fewer if 3+ exist. Ideally spread across the budget range (not three options within 20% of each other) unless the category genuinely plateaus - that itself is worth one line. Tabular format for comparative output: columns = the constraints given + price + the one-line reason each made the cut. Order by which one you'd actually pick, not alphabetically.

**6. One-line verdict, not a hedge.** End with the actual pick if forced to choose - "if you want one answer: X, because [dealbreaker fit]." Don't undercut it with "but honestly all three are great" - that's maximizer language.

**7. Stop.** Don't offer to "look into a few more" or "keep an eye out." That's the maximizer relapse. If the user wants more, they'll ask.

## Guardrails

- If the constraints eliminate everything (nothing clears all of them), say so plainly and ask which constraint to relax - don't quietly soften the filter yourself.
- If the category is low-stakes (roughly under $50, reversible, no lock-in), you can skip the constraint-gathering step and just satisfice directly: pick 3 solid options fast, skip the interview.
- Don't pad the table with a "worst" option to make the middle one look good. All 3 shown should be real contenders.
- Never silently anchor on the cheapest tier that clears the bar - that's optimizing for spend, a constraint the user didn't set unless they explicitly asked for "cheapest" or a "budget option." A budget given as a ceiling means the whole range is in play.
- Treat every stated constraint (form factor, use case, etc.) as load-bearing for the whole search, not just the first filter pass - don't let a later step (like chasing a low price) quietly override an earlier answer.
- Keep the vigilance trace (step 4c) to one or two lines. Padding it out defeats the purpose - it's a visibility check, not a maximizer-style essay.
