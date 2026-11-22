# Ticket 1: "The key is right, we checked"

**From:** a team that has just started using the API
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

**Their script:** `ask.py` in this folder. Run it with your own key, as they would with theirs.

**Your job:** find the cause and fix their script.

**Done when:** their original command prints an answer, with your key and no other changes to your shell.

**Explain it:**

1. Why did the API refuse a key that was correct?
2. Suppose they fix the scheme but one character of the key is wrong. What status and error do you expect, and how would you tell the two failures apart?
