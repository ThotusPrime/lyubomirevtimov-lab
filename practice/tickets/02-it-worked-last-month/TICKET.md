# Ticket 2: "It worked last month"

**From:** a legal-tech startup in Amsterdam
**Priority:** normal

> Our nightly job stopped working at the start of October. We haven't touched the code since September. Did you change your URL? The error says Not Found.
>
> ```
> python3 ask.py "What changed in the payout schedule?"
> ```
>
> ```
> requests.exceptions.HTTPError: 404 Client Error: Not Found for url: https://lab.lyubomirevtimov.com/v1/chat/completions
> ```

**Their script:** `ask.py` in this folder.

**Your job:** find what's really not found, fix it, and tell them how they could have caught it themselves.
