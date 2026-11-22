# Exercise: the usage spike

**From:** whoever looks after the API bill
**Priority:** normal

> Our token bill jumped on 3 November, and most of it landed between ten and eleven in the morning. Here's the API's request log for that hour. Which users used the most tokens? And is anyone sending more than the API allows?

**Their data:** `requests.jsonl` in this folder: 311 requests on the lab's two models, one JSON object per line, with the user, the model, the status, the token counts and the time each took.

This one has no broken script to fix. You write the script, the way you would to answer a question about an API's traffic.

**Your job:** write `solution.py` in this folder (Git ignores it) that reads the log and prints the three users with the most tokens, prompt and completion together, with their totals. Then look through the log for anything that would make a total wrong.

**Done when:** the script runs over the whole file without crashing, prints the top three with their totals, and you can say why every row it counts as zero should count as zero.

**Explain it:**

1. Some rows have no token counts. Which rows are they, and why is counting them as zero right?
2. Some request ids appear twice. What happened to those requests, and does it change anyone's total?
3. A script that counts only the rows with `status == 200` gets one user wrong. Whose, and why?
4. Which user hits the rate limit most, and is that because they send the most?

The hints are at the end of `practice/HINTS.md`.
