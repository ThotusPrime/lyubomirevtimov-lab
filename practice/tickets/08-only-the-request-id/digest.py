#!/usr/bin/env python3
"""Summarise every text file in a folder, one request per file.

It runs every night on a server. A file that fails is logged with its
request id and skipped, so one bad file doesn't stop the rest.

Usage:
    python3 digest.py docs/
"""

import os
import sys
from pathlib import Path

import requests

BASE_URL = os.environ.get("LAB_BASE_URL", "http://localhost:8788/v1")
MODEL = "lab/small"


def summarise(session, text):
    return session.post(
        f"{BASE_URL}/chat/completions",
        json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": "Summarise the document in one sentence."},
                {"role": "user", "content": text},
            ],
        },
        timeout=30,
    )


def main():
    if len(sys.argv) != 2:
        sys.exit("Usage: python3 digest.py <folder>")

    api_key = os.environ.get("LAB_API_KEY")
    if not api_key:
        sys.exit("LAB_API_KEY is not set in this shell.")

    session = requests.Session()
    session.headers["Authorization"] = f"Bearer {api_key}"

    for path in sorted(Path(sys.argv[1]).glob("*.txt")):
        response = summarise(session, path.read_text())
        if response.status_code != 200:
            print(f"{path.name}: failed, request id {response.headers.get('x-request-id')}")
            continue
        summary = response.json()["choices"][0]["message"]["content"]
        print(f"{path.name}: {summary}")


if __name__ == "__main__":
    main()
