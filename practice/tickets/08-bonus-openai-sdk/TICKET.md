# Bonus ticket 8: "We switched from OpenAI and nothing works"

**From:** a team moving over from OpenAI
**Priority:** high, the move is due this week

> We're moving from OpenAI to you. Your docs say the API is compatible, so we only changed the base_url. Now it fails before it even sends anything. We do have a key; it's in LAB_API_KEY.
>
> ```
> python3 ask_sdk.py "Hello."
> ```
>
> ```
> openai.OpenAIError: Missing credentials. Please pass an `api_key`, ... or set the `OPENAI_API_KEY` ... environment variable.
> ```

**Their script:** `ask_sdk.py` in this folder. It needs the `openai` package, which is in `requirements.txt`.

**Your job:** make it work, and find the one other thing a team moving from OpenAI usually trips over. (If you have an `OPENAI_API_KEY` of your own set in your shell, you'll see a different error from theirs. Work out why that is too.)
