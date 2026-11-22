# Ticket 4: "It dies halfway through"

**From:** a reporting team
**Priority:** high, their report is late

> Our batch job worked fine in testing with three rows. With the real file it processes about five rows and then crashes, every time. Is your service unstable?
>
> ```
> python3 batch.py prompts.csv results.csv
> ```
>
> ```
> p01: done
> p02: done
> p03: done
> p04: done
> p05: done
> Traceback (most recent call last):
>   ...
> requests.exceptions.HTTPError: 429 Client Error: Too Many Requests for url: http://localhost:8788/v1/chat/completions
> ```

**Their script:** `batch.py` and `prompts.csv`, in this folder.

**Your job:** find what's happening, and change their script so it finishes the whole file.

**Done when:** their original command finishes every row of `prompts.csv`, and an error other than the rate limit still stops it.

**Explain it:** once it's done, and not before, open `QUESTIONS.md` in this folder.
