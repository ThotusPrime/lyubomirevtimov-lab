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

**Explain it:** once it's done, and not before, open `QUESTIONS.md` in this folder.
