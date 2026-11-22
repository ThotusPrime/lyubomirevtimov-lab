# Ticket 5: "The large model is down"

**From:** a research team
**Priority:** high

> `lab/small` works, `lab/large` never does. It's been like this all day. Is the large model down?
>
> ```
> python3 ask.py "Explain the refund rules. Keep it short." --model lab/large
> ```
>
> ```
> requests.exceptions.ReadTimeout: HTTPConnectionPool(host='localhost', port=8788): Read timed out. (read timeout=5)
> ```

**Their script:** `ask.py` in this folder.

**Your job:** prove whether the model is up, find the cause, and fix it in a way that doesn't make every request wait forever.

**Done when:** their original command prints an answer from `lab/large`, and the script still gives up on a request that takes far too long.

**Explain it:** once it's done, and not before, open `QUESTIONS.md` in this folder.
