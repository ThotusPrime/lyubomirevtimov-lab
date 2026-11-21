# Bonus ticket 7: "Streaming broke our script"

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
