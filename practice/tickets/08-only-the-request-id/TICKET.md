# Ticket 8: "All we have is the request id"

**From:** the owner of a nightly digest job
**Priority:** normal

> Our digest runs every night on a server and summarises every document in a folder. Every night it skips the same one, and the job's log only says this:
>
> ```
> supplier-handbook.txt: failed, request id req_3f9c2a71b04e8d65c1a9e0f2
> ```
>
> The other documents are fine. We can't tell what went wrong from that line. Can you look the request up on your side?
>
> ```
> python3 digest.py docs/
> ```

**Their script:** `digest.py` and the folder it reads, `docs/`, both in this folder.

**This one needs your own lab running** (`npm run dev`, see the course README), because you'll read its log: every request the lab answers prints one JSON line in that terminal. Run their command, take the request id it prints, and find that request in the log, the way the API's provider would.

**Your job:** find out from the log what happened to that request, then fix their script so every document gets a summary.

**Done when:** their original command prints a summary for every file in `docs/`, and a failed request would now print the API's error message next to its request id.

**Explain it:**

1. What did the lab's log say about the failed request that the job's own output didn't?
2. What is a model's context length, and why can the same document fail on one model and work on another?
