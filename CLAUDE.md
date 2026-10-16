# CLAUDE.md — raylib-zig-web

@AGENTS.md

The project brief, decisions, plan and rules are in [AGENTS.md](AGENTS.md)
(imported above). This file adds what is specific to Claude Code sessions.

## Two repos, two sets of rules

Phase W (the port's web target) is done in
`/home/rajesh/lab/ai-port/raylib-zig`. When working there, that repo's
`CLAUDE.md` governs: its gates, its token log (`tokens.txt`), its
`handoff.md`. Record work in the repo where it happened. Site work (phases S
and D) is recorded here.

## Token tracking (required)

[tokens.txt](tokens.txt) records **actual** per-prompt token usage (input +
cache creation + cache read + output, with real start and end times), parsed
from this project's Claude Code transcript by
[tools/token_usage.py](tools/token_usage.py):

```bash
python3 tools/token_usage.py          # human-readable table
python3 tools/token_usage.py --tsv    # rows for tokens.txt
```

It reads the newest `*.jsonl` in
`/home/rajesh/.claude/projects/-home-rajesh-lab-ai-port-raylib-zig-web/`.

**At every pause or stop**, before handing back control:

1. Note the wall-clock start and end of the work since the last record.
2. Run `python3 tools/token_usage.py --tsv` and append the new rows to
   `tokens.txt`, with a one-line note of what landed. Record the current turn
   as `(in progress)`; its full cost is only countable at the next record.
3. Include subagent usage (as reported by the Agent tool) on a comment line.

## handoff.md (required after every run)

At the end of every run, overwrite `handoff.md` at the repo root. A new
session must be able to resume from it alone:

1. **State right now**: last commit, gate results, what is uncommitted.
2. **What this run did**: a few bullets.
3. **Next step**: the first action on resume, then the short ordered list.
4. **Open issues**: anything half-done or surprising (fold durable lessons
   into AGENTS.md "Gotchas").

## Working practice

- Before writing a page, read `rajesh-writing-style.md` (path in AGENTS.md).
- Verify a claim about raylib-zig in its repo before putting it on a page;
  numbers there change as the port moves.
- Parallel agents get their own git worktree and `--cache-dir`, and every
  merge is verified serially (the gates run on the merged result) before it
  is committed.
- Ask before anything outward-facing: creating the GitHub repo, pushing,
  enabling Pages, buying or pointing a domain.
