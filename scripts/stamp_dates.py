#!/usr/bin/env python3
"""Stamps blog post dates with their git commit timestamp in America/Los_Angeles.

Replaces any date-only frontmatter value (YYYY-MM-DD) with the file's first
git commit timestamp, converted to PST/PDT. Run before `npm run build`.
Source files in the repo are not affected — changes are ephemeral.
"""
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

LA = ZoneInfo("America/Los_Angeles")
DATE_ONLY = re.compile(r"^date: (\d{4}-\d{2}-\d{2})$", re.MULTILINE)


def first_commit_timestamp(path: Path):
    # --diff-filter=A finds the commit that first Added this file
    result = subprocess.run(
        ["git", "log", "--follow", "--diff-filter=A", "--format=%aI", "--", str(path)],
        capture_output=True,
        text=True,
    )
    commits = [c for c in result.stdout.strip().split("\n") if c]
    stamp = commits[-1] if commits else ""
    if not stamp:
        # fallback: most recent commit touching this file
        result = subprocess.run(
            ["git", "log", "-1", "--format=%aI", "--", str(path)],
            capture_output=True,
            text=True,
        )
        stamp = result.stdout.strip()
    return stamp or None


def to_la_iso(stamp: str) -> str:
    dt = datetime.fromisoformat(stamp).astimezone(LA)
    offset = dt.strftime("%z")  # e.g. -0800 or -0700
    offset_colon = f"{offset[:3]}:{offset[3:]}"  # -08:00 or -07:00
    return dt.strftime("%Y-%m-%dT%H:%M:%S") + offset_colon


for md in sorted(Path("src/content/blog").glob("*.md")):
    content = md.read_text()
    if not DATE_ONLY.search(content):
        continue  # already has a full datetime or no date field — skip
    stamp = first_commit_timestamp(md)
    if not stamp:
        print(f"warning: no git history for {md.name}, skipping", file=sys.stderr)
        continue
    iso = to_la_iso(stamp)
    md.write_text(DATE_ONLY.sub(f"date: {iso}", content))
    print(f"stamped {md.name}: {iso}")
