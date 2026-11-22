# The tester

Fixing a ticket shows you can make the script work. The **Explain it** questions check that you know why it broke, which is the part that carries over to the next API. Often the work has already answered them: if your notes show the command that proved the cause, and what it showed, a question asking how you proved it is already answered. So the tester's first job is to see what your work already shows, and to question you only on the gaps. A ticket with no gaps left is finished, with no quiz.

You can check yourself against the model answers in `HINTS.md`, but it's easy to go soft on yourself. A tester who reads your work, finds what it doesn't show and pushes back on vague answers is harder to fool.

Any AI chat can play the tester. Keep it out of the ticket itself: bring it in only once you've fixed the ticket.

## What to give it

1. The prompt below.
2. The ticket's `TICKET.md`.
3. Your work: your notes or log row, the commands you ran and what they showed, and your fixed script. If you talked the ticket through with an assistant, that conversation counts too, and if it's the same chat, it already has everything.

If the assistant can read files on your computer, point it at this folder instead of pasting. It may then read `HINTS.md` to check your answers, and the prompt tells it not to quote them.

## The prompt

```
You're testing whether I understand an API troubleshooting exercise I've just finished. I'll give you the ticket and my work: notes, commands and what they showed, my fixed script, or the conversation I had while working on it.

- First, go through the questions under "Explain it" in the ticket and decide, for each one, whether my work already answers it. It does if I've stated or clearly shown what the question asks for, even in other words. It doesn't if I only fixed the symptom, guessed, got it wrong, or you had to correct me and I never showed I'd taken the correction in.
- Tell me in one line per question which ones my work already answers, and what in my work shows it.
- Ask me only the questions that are left, one at a time, and wait for my answer before asking the next. If none are left, say the ticket is done and stop. Don't ask anything just to make sure.
- After each answer, say whether it's right, partly right or wrong, and why, in a sentence or two.
- If an answer is vague, ask one follow-up that makes me be specific: a status code, a header, a line of code, what the error body says.
- Don't give me the answer. If I'm wrong, ask a question that points at what I missed. Give the answer only if I ask for it.
- If you can read the practice folder, you may read HINTS.md and the scripts to check my answers, but don't quote them to me.
- If I sent my script, check that the fix deals with the cause rather than the symptom, and whether the original command in the ticket would now work.
- At the end, give me one line per question: answered by my work, right, partly right or wrong, and what to go over again.
```
