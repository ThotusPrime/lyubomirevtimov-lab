# Ticket 2: "It worked last month"

**From:** the owner of a nightly job
**Priority:** normal

> Our nightly job stopped working at the start of October. We haven't touched the code since September. Did you change your URL? The error says Not Found.
>
> ```
> python3 ask.py "What changed in the payout schedule?"
> ```
>
> ```
> requests.exceptions.HTTPError: 404 Client Error: Not Found for url: http://localhost:8788/v1/chat/completions
> ```

**Their script:** `ask.py` in this folder.

**Your job:** find what's really not found, and fix it.

**Done when:** their original command prints an answer, without passing `--model`.

**Explain it:** once it's done, and not before, open `QUESTIONS.md` in this folder.
