# Ticket 6: "Payment required?"

**From:** two people testing the API, signed up last week
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

**Your job:** find out what's wrong. This one may not be a code problem.

**Done when:** you can show the cause with their key, using their original command and one other request, without changing their script or your own `LAB_API_KEY`.

**Explain it:**

1. Why did it work yesterday and fail today, with no change to the code?
2. How can anyone check this about their own account, without sending a request that costs money?
3. A 401, a 402 and a 429 all refuse the request. What does each one ask the client to do, and which of them can retrying fix?
