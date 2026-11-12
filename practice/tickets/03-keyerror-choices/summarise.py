#!/usr/bin/env python3
"""Summarise a text file with the lab.

Usage:
    python3 summarise.py notes.txt
"""

import json
import os
import sys

import requests

BASE_URL = os.environ.get("LAB_BASE_URL", "https://lab.lyubomirevtimov.com/v1")


def main():
    if len(sys.argv) != 2:
        sys.exit("Usage: python3 summarise.py <file>")

    with open(sys.argv[1], encoding="utf-8") as f:
        text = f.read()

    payload = {
        "model": "lab/small",
        "messages": [
            {"role": "system", "content": "Summarise the user's text in one sentence."},
            {"role": "user", "content": text},
        ],
    }

    response = requests.post(
        f"{BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {os.environ['LAB_API_KEY']}"},
        data=json.dumps(payload),
        timeout=30,
    )
    result = response.json()
    print(result["choices"][0]["message"]["content"])


if __name__ == "__main__":
    main()
