#!/usr/bin/env python3
"""Measure how reliably a skill's description triggers, on Windows.

The skill-creator plugin ships `scripts/run_eval.py` for this, but it drives the
`claude -p` subprocess with `select.select()` on a pipe, which only works on
sockets under Windows and fails with WinError 10093 — every query then scores
0.00 regardless of the description. This is the same measurement without the
streaming reader: run each query to completion, then look at what was called.

Mechanism: write a throwaway command file carrying the description under test
into a scratch project's `.claude/commands/`, so it shows up in the model's
available-skills list, run the raw query through `claude -p` from there, and
count a trigger when the model reaches for it.

The scratch project matters. Run this from the repo and the nested `claude -p`
inherits the repo's CLAUDE.md and its open work, and starts behaving like a
coding agent on this codebase — it explores instead of consulting the skill, and
every query scores 0.00 for reasons that have nothing to do with the
description. A neutral directory leaves the description as the only signal.

    python tools/skill-trigger-eval.py \
        --eval-set skills/<skill>/evals/trigger-eval.json \
        --skill-path skills/<skill> \
        --model claude-opus-5 --runs 3
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


def parse_front_matter(skill_md: Path) -> tuple[str, str]:
    text = skill_md.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not match:
        raise SystemExit(f"{skill_md} has no YAML front matter")
    block = match.group(1)
    name = re.search(r"^name:\s*(.+)$", block, re.M)
    desc = re.search(r"^description:\s*(.*?)(?=\n[a-z_]+:|\Z)", block, re.M | re.S)
    if not name or not desc:
        raise SystemExit(f"{skill_md} front matter needs both name and description")
    value = desc.group(1).strip()
    if value[:1] in {'"', "'"} and value[-1:] == value[:1]:
        value = value[1:-1]
    return name.group(1).strip(), " ".join(value.split())


def run_query(query: str, command_name: str, project_root: Path, model: str, timeout: int) -> str:
    """One of "triggered", "not_triggered", "timeout", "error".

    A timeout is not a non-trigger. Counting it as one lets machine load look
    exactly like a description that fails to match, which is how a clean 1.00
    query turns into 0.00 with nothing about the description having changed.
    Timed-out runs are reported and excluded from the rate.
    """
    cmd = ["claude", "-p", query, "--output-format", "stream-json", "--verbose", "--max-turns", "2"]
    if model:
        cmd += ["--model", model]
    env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}
    try:
        done = subprocess.run(
            cmd, cwd=project_root, env=env, capture_output=True, timeout=timeout,
            shell=(os.name == "nt"),
        )
    except subprocess.TimeoutExpired:
        return "timeout"
    except Exception:
        return "error"

    for line in done.stdout.decode("utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        if event.get("type") != "assistant":
            continue
        for item in event.get("message", {}).get("content", []):
            if item.get("type") != "tool_use":
                continue
            payload = json.dumps(item.get("input", {}))
            if command_name in payload:
                return "triggered"
    return "not_triggered"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--eval-set", required=True)
    ap.add_argument("--skill-path", required=True)
    ap.add_argument("--model", default="claude-opus-5")
    ap.add_argument("--runs", type=int, default=3)
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--timeout", type=int, default=180)
    ap.add_argument("--description", default=None, help="Override the description under test")
    ap.add_argument("--out", default=None, help="Write results JSON here")
    args = ap.parse_args()

    skill_path = Path(args.skill_path).resolve()
    skill_name, description = parse_front_matter(skill_path / "SKILL.md")
    if args.description:
        description = args.description

    scratch = Path(tempfile.mkdtemp(prefix="skill-trigger-eval-"))
    project_root = scratch
    commands_dir = project_root / ".claude" / "commands"
    command_name = f"{skill_name}-trigger-{uuid.uuid4().hex[:8]}"
    command_file = commands_dir / f"{command_name}.md"
    commands_dir.mkdir(parents=True, exist_ok=True)
    indented = "\n  ".join(description.split("\n"))
    command_file.write_text(
        f"---\ndescription: |\n  {indented}\n---\n\n# {skill_name}\n\nThis skill handles: {description}\n",
        encoding="utf-8",
    )

    queries = json.loads(Path(args.eval_set).read_text(encoding="utf-8"))
    jobs = [(item, run) for item in queries for run in range(args.runs)]
    print(f"{len(queries)} queries x {args.runs} runs on {args.model}\n", flush=True)

    try:
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            outcomes = list(pool.map(
                lambda job: run_query(job[0]["query"], command_name, project_root, args.model, args.timeout),
                jobs,
            ))
    finally:
        shutil.rmtree(scratch, ignore_errors=True)

    results, passed, lost = [], 0, 0
    for index, item in enumerate(queries):
        window = outcomes[index * args.runs:(index + 1) * args.runs]
        counted = [o for o in window if o in ("triggered", "not_triggered")]
        lost += len(window) - len(counted)
        if not counted:
            results.append({**item, "trigger_rate": None, "pass": None, "runs_counted": 0})
            print(f"  ????      (chce {int(item['should_trigger'])})  {item['query'][:70]}  [all runs lost]")
            continue
        rate = sum(o == "triggered" for o in counted) / len(counted)
        ok = (rate >= 0.5) == item["should_trigger"]
        passed += ok
        results.append({**item, "trigger_rate": rate, "pass": ok, "runs_counted": len(counted)})
        flag = "" if len(counted) == args.runs else f"  [{args.runs - len(counted)} lost]"
        print(f"  {'ok  ' if ok else 'FAIL'} {rate:.2f} (chce {int(item['should_trigger'])})  {item['query'][:70]}{flag}")

    measured = [r for r in results if r["pass"] is not None]
    accuracy = passed / len(measured) if measured else 0.0
    print(f"\naccuracy: {passed}/{len(measured)} = {accuracy:.0%}"
          + (f"   ({lost} run(s) lost to timeout/error, excluded)" if lost else ""))

    if args.out:
        Path(args.out).parent.mkdir(parents=True, exist_ok=True)
        Path(args.out).write_text(
            json.dumps({"skill": skill_name, "model": args.model, "runs": args.runs,
                        "description": description, "accuracy": accuracy,
                        "runs_lost": lost, "results": results},
                       ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"saved: {args.out}")
    return 0 if accuracy >= 0.8 else 1


if __name__ == "__main__":
    sys.exit(main())
