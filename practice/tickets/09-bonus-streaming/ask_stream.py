#!/usr/bin/env python3
"""Ask the lab one question, with streaming switched on so answers start sooner.

Usage:
    python3 ask_stream.py "Your question or text"
"""

import argparse
import os
import sys

import requests

BASE_URL = os.environ.get("LAB_BASE_URL", "http://localhost:8788/v1")


def main():
    parser = argparse.ArgumentParser(description="Ask the lab one question.")
    parser.add_argument("prompt", help="what to send to the model")
    parser.add_argument("--model", default="lab/small")
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
            "stream": True,
        },
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()
    print(data["choices"][0]["message"]["content"])


if __name__ == "__main__":
    main()
