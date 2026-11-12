#!/usr/bin/env python3
"""Send every prompt in a CSV file to the lab and save the answers.

The input file needs two columns, id and prompt. The output file gets
id, answer, tokens and cost for each row.

Usage:
    python3 batch.py prompts.csv results.csv
    python3 batch.py prompts.csv results.csv --model lab/large
"""

import argparse
import csv
import os
import sys
import time

import requests

BASE_URL = os.environ.get("LAB_BASE_URL", "https://lab.lyubomirevtimov.com/v1")
MAX_RETRIES = 5


def ask(session, model, prompt):
    """Send one prompt. Waits and tries again when the rate limit is hit."""
    for attempt in range(1, MAX_RETRIES + 1):
        response = session.post(
            f"{BASE_URL}/chat/completions",
            json={"model": model, "messages": [{"role": "user", "content": prompt}]},
            timeout=30,
        )
        if response.status_code == 429:
            wait = int(response.headers.get("Retry-After", "10"))
            print(f"  rate limited, waiting {wait}s (attempt {attempt} of {MAX_RETRIES})", file=sys.stderr)
            time.sleep(wait)
            continue
        response.raise_for_status()
        return response.json()
    raise RuntimeError(f"still rate limited after {MAX_RETRIES} attempts")


def main():
    parser = argparse.ArgumentParser(description="Run a CSV of prompts through the lab.")
    parser.add_argument("input", help="CSV file with id and prompt columns")
    parser.add_argument("output", help="where to write the results")
    parser.add_argument("--model", default="lab/small")
    args = parser.parse_args()

    api_key = os.environ.get("LAB_API_KEY")
    if not api_key:
        sys.exit("LAB_API_KEY is not set in this shell.")

    session = requests.Session()
    session.headers["Authorization"] = f"Bearer {api_key}"

    with open(args.input, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    total_cost = 0.0
    with open(args.output, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "answer", "tokens", "cost_usd"])
        for row in rows:
            data = ask(session, args.model, row["prompt"])
            usage = data["usage"]
            writer.writerow([row["id"], data["choices"][0]["message"]["content"], usage["total_tokens"], usage["estimated_cost"]])
            total_cost += usage["estimated_cost"]
            print(f"{row['id']}: done")

    print(f"\n{len(rows)} prompts, ${total_cost:.8f} in total. Results in {args.output}")


if __name__ == "__main__":
    main()
