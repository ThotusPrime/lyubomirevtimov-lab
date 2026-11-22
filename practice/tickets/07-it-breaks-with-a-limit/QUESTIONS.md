# Explain it: ticket 7, "It breaks when we set a limit"

Open this once the ticket is done: its **Done when** line passes. Check yourself against these before you look at anything else, and tick off the ones your work already answers.

1. What did the API object to, and which part of the error says so?
2. Their JSON was valid, yet the request still failed. What's the difference between `"50"` and `50` in JSON, and where did the wrong one come from?
3. Once it's fixed, what do you expect from `--max-tokens 5000`, and why doesn't the fix make that work?

The model answers are at the end of this ticket's section in `practice/HINTS.md`.
