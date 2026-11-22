# Ticket 3: "Your API returns broken responses"

**From:** a data team
**Priority:** normal

> Your response is missing the `choices` field, so our code crashes. Is the API changing its format? We followed the example in your docs.
>
> ```
> python3 summarise.py notes.txt
> ```
>
> ```
>   File "summarise.py", line 39, in main
>     print(result["choices"][0]["message"]["content"])
> KeyError: 'choices'
> ```

**Their script:** `summarise.py` and the file it reads, `notes.txt`, both in this folder.

**Your job:** find out what the API actually sent back and why, and fix the script.

**Done when:** their original command prints a summary of `notes.txt`, and a failed call would now print the API's error instead of a `KeyError`.

**Explain it:**

1. What did the API send back, and why did that crash the script on `choices`?
2. In `requests`, what's the difference between `data=` and `json=`, and why does the server care?
