#!/usr/bin/env python3
"""Ask the lab one question and print the answer and what it cost.

Usage:
    python3 ask.py "Your question or text"
    python3 ask.py "Your text" --model lab/large --max-tokens 100
"""

import argparse
import os
import sys

import requests

BASE_URL = os.environ.get("LAB_BASE_URL", "https://lab.lyubomirevtimov.com/v1")


def main():
    parser = argparse.ArgumentParser(description="Ask the lab one question.")
    parser.add_argument("prompt", help="what to send to the model")
    parser.add_argument("--model", default="lab/legacy-chat")
    parser.add_argument("--max-tokens", type=int, default=200)
    args = parser.parse_args()

    api_key = os.environ.get("LAB_API_KEY")
    if not api_key:
        sys.exit("LAB_API_KEY is not set in this shell.")

    response = requests.post(
        f"{BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "model": args.model,
            "messages": [{"role": "user", "content": args.prompt}],
            "max_tokens": args.max_tokens,
        },
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()

    print(data["choices"][0]["message"]["content"])
    usage = data["usage"]
    print(f"\n{usage['total_tokens']} tokens, ${usage['estimated_cost']:.8f}", file=sys.stderr)


if __name__ == "__main__":
    main()
