# Ticket 7: "It breaks when we set a limit"

**From:** a team adding short answers to their app
**Priority:** normal

> The script works fine on its own. As soon as we pass `--max-tokens` to keep the answers short, every call fails. Is `max_tokens` not supported? Your docs list it.
>
> ```
> python3 ask.py "Summarise the onboarding notes. Keep it brief." --max-tokens 50
> ```
>
> ```
> requests.exceptions.HTTPError: 422 Client Error: Unprocessable Entity for url: http://localhost:8788/v1/chat/completions
> ```

**Their script:** `ask.py` in this folder.

**Your job:** find what the API objected to, and fix their script.

**Done when:** their original command prints an answer, and the script still works without `--max-tokens`.

**Explain it:**

1. What did the API object to, and which part of the error says so?
2. Their JSON was valid, yet the request still failed. What's the difference between `"50"` and `50` in JSON, and where did the wrong one come from?
3. Once it's fixed, what do you expect from `--max-tokens 5000`, and why doesn't the fix make that work?
