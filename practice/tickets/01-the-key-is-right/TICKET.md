# Ticket 1: "The key is right, we checked"

**From:** a small startup in Berlin, on the pay-as-you-go plan
**Priority:** high, they're blocked

> Hi, we copied our API key straight from the dashboard and checked it twice, character by character. Our script still gets refused every time. Can you check whether our key is active?
>
> We ran:
>
> ```
> python3 ask.py "Summarise our refund policy."
> ```
>
> and got:
>
> ```
> requests.exceptions.HTTPError: 401 Client Error: Unauthorized for url: https://lab.lyubomirevtimov.com/v1/chat/completions
> ```

**Their script:** `ask.py` in this folder. Run it with your own key, as the customer would with theirs.

**Your job:** find the cause, fix their script, and write them a two-line reply.
