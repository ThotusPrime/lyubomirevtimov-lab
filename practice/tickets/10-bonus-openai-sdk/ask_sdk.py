#!/usr/bin/env python3
"""Ask the lab one question through the OpenAI Python SDK.

The lab speaks the same API as OpenAI, so the SDK only needs a different
base_url, as the lab's documentation says.

Usage:
    python3 ask_sdk.py "Your question or text"
"""

import os
import sys

from openai import OpenAI

client = OpenAI(base_url=os.environ.get("LAB_BASE_URL", "https://lab.lyubomirevtimov.com/v1"))


def main():
    if len(sys.argv) != 2:
        sys.exit('Usage: python3 ask_sdk.py "your question"')

    completion = client.chat.completions.create(
        model="lab/small",
        messages=[{"role": "user", "content": sys.argv[1]}],
    )
    print(completion.choices[0].message.content)


if __name__ == "__main__":
    main()
