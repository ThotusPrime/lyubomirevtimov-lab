# Bonus ticket 9: "Streaming broke our script"

**From:** a team building a chatbot
**Priority:** normal

> We turned on streaming because your docs say answers start sooner. Now the script crashes on every call. Turning it off again fixes it, but we want streaming.
>
> ```
> python3 ask_stream.py "Hi there. How are you?"
> ```
>
> ```
> requests.exceptions.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
> ```

**Their script:** `ask_stream.py` in this folder.

**Your job:** see what a streamed response actually looks like, explain why their code can't read it, and either make it read the stream or explain what it would need to do.

**Done when:** their original command prints the answer as it arrives, a few words at a time, instead of crashing.

**Explain it:**

1. Why does `response.json()` fail on a streamed response?
2. What does the stream actually look like, and how does the client know it has finished?
3. The body already says `"stream": true`. Why does the script also need `stream=True` in its call to `requests`?
