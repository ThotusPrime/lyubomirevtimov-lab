# Ticket 3: "Your API returns broken responses"

**From:** a data team at a fintech in Warsaw
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

**Your job:** find out what the API actually sent back and why, fix the script, and suggest one change so the next failure explains itself.
