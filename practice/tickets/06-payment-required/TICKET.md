# Ticket 6: "Payment required?"

**From:** a two-person startup in Sofia, signed up last week
**Priority:** normal

> We were testing yesterday and everything worked. Today every request fails with this. We haven't changed anything.
>
> ```
> python3 ask.py "Hi."
> ```
>
> ```
> requests.exceptions.HTTPError: 402 Client Error: Payment Required for url: https://lab.lyubomirevtimov.com/v1/chat/completions
> ```

**Their script:** `ask.py` in this folder. Their key is `LAB_TRIAL_KEY` in your `.env`. Run the script with their key instead of yours, without changing your own `LAB_API_KEY` for the rest of the session.

**Your job:** find out what's wrong. This one may not be a code problem. Write the reply you'd send them.
