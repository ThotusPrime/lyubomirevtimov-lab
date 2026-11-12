# Ticket 4: "It dies halfway through"

**From:** an e-commerce startup in Lisbon, on the pay-as-you-go plan
**Priority:** high, their reporting is late

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
> requests.exceptions.HTTPError: 429 Client Error: Too Many Requests for url: https://lab.lyubomirevtimov.com/v1/chat/completions
> ```

**Their script:** `batch.py` and `prompts.csv`, in this folder.

**Your job:** explain what's happening, change their script so it finishes the whole file, and tell them what the API told them that their script ignored.
