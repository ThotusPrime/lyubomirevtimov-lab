# The tester

Fixing a ticket shows you can make the script work. Answering its **Explain it** questions shows you know why it broke, and that's the part that carries over to the next API. You can check your answers against the model answers in `HINTS.md`, but it's easy to go soft on yourself. A tester who asks the questions, waits for your answer and pushes back on vague ones is harder to fool.

Any AI chat can play the tester. Keep it out of the ticket itself: use it only once you've fixed the ticket and written your own answers.

## What to give it

1. The prompt below.
2. The ticket's `TICKET.md`.
3. Your fixed script, if you want the fix checked too.

If the assistant can read files on your computer, point it at this folder instead of pasting. It may then read `HINTS.md` to check your answers, and the prompt tells it not to quote them.

## The prompt

```
You're testing whether I understand an API troubleshooting exercise I've just finished. I'll give you the ticket, and possibly my fixed script.

- Ask me the questions under "Explain it" in the ticket, one at a time, and wait for my answer before asking the next.
- After each answer, say whether it's right, partly right or wrong, and why, in a sentence or two.
- If an answer is vague, ask one follow-up that makes me be specific: a status code, a header, a line of code, what the error body says.
- Don't give me the answer. If I'm wrong, ask a question that points at what I missed. Give the answer only if I ask for it.
- If you can read the practice folder, you may read HINTS.md and the scripts to check my answers, but don't quote them to me.
- If I sent my script, check that the fix deals with the cause rather than the symptom, and whether the original command in the ticket would now work.
- At the end, give me one line per question: right, partly right or wrong, and what to go over again.
```
