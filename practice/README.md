# Practice: troubleshooting an API

A crash course in troubleshooting an HTTP API, from the terminal and from code. The lab (`lab.lyubomirevtimov.com`) is the API. It works like an OpenAI-compatible inference API, the kind behind most AI features, and its failures are the real ones: authentication, unknown models, content types, rate limits, timeouts, billing and streaming. This folder is the other side: two small Python tools, and eight tickets where someone's script has stopped working.

By the end you'll be able to:

- call an API with curl, and read the status, headers and body of what comes back
- get the real error out of a script that hides it
- tell whether a problem is in the request, the traffic, the account or the protocol
- explain what went wrong and why, not only fix it

The skills carry over to any HTTP API. You need a terminal, Python 3 and curl, and no knowledge of this API beforehand: its documentation is at https://lab.lyubomirevtimov.com/. The commands are written for macOS and Linux. On Windows, use WSL and they work as written.

## How it works

Each ticket is a report from someone whose script fails: their command, their error, and usually their guess at the cause. The guess is often wrong, so treat it as a lead, not a fact. You reproduce the problem, find the cause, fix their script, and then answer a few questions that check you understood it rather than patched it.

**Work with AI assistants switched off while you solve a ticket.** Reading the error yourself is the skill this course teaches, and an assistant would do that step for you. Built-in help (`--help`, `man`, Python's `help()`) is allowed, and learning to use it is part of the point. Once you've answered a ticket's questions, an AI assistant is welcome back as your tester: `TESTER.md` has a prompt that makes it question you without giving the answers away.

## 1. Set up (about 10 minutes)

From this folder:

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Check it worked: `which python3` should point inside `.venv`. A new terminal window starts without the venv, so activate it again there. If a script says `ModuleNotFoundError: No module named 'requests'`, this is why.

## 2. Exercise 0: get your key into the shell

Your keys are in `.env` in this folder (it stays out of Git): `LAB_API_KEY` for your own account, and `LAB_TRIAL_KEY` for one of the tickets. The tools read `LAB_API_KEY` from the environment. Getting it there is the first exercise. Hint 0 in `HINTS.md` if you're stuck.

## 3. The happy path

See what working looks like before anything breaks.

```
python3 ask.py "The payout run closes on the third. Late approvals move to the next month."
python3 ask.py "Same text. Second sentence." --model lab/large
python3 batch.py prompts.csv results.csv
```

The batch takes about half a minute and pauses once or twice with "rate limited, waiting 10s". That's it working: it hits the limit, waits as the API says, and carries on.

Then make the same calls with curl, written from memory: list the models, then send one chat completion. Reference at the end of hint 0. Open https://lab.lyubomirevtimov.com/ in a browser for the API's documentation page.

## 4. The tickets

Do 1 to 6 in order. 7 and 8 are bonuses. Most take 15 to 30 minutes, the first ones longer.

| Layer | What you look at | Tickets |
|---|---|---|
| The request | What the script sends: its headers, its body, the names in it | 1, 2, 3 |
| Traffic and time | How often it sends, and how long it waits | 4, 5 |
| The account | What the key is allowed to do | 6 |
| The protocol | Responses and libraries that don't work the way the script expects | 7, 8 |

For each one:

1. Read `TICKET.md`. If you like working against the clock, set a 10-minute timer before you allow yourself the hints.
2. Reproduce it: run their command and get their error.
3. Say each step out loud, or write it down, as if explaining it to a colleague. It's how you notice the step you skipped.
4. Fix it in a copy (`cp ask.py ask_fixed.py`), so the original stays broken for next time. Git ignores the copies.
5. Check it against the ticket's **Done when** line.
6. Answer the questions under **Explain it** in writing, before you look at anything. Then compare with the model answers at the end of that ticket's hints, or have the tester in `TESTER.md` question you.
7. Note it in your log: `cp LOG.template.md LOG.md` once, then a row for each ticket. Git ignores `LOG.md`.

Tickets 5 to 8 don't have their questions yet. For those, write down the cause and the fix in two or three lines, as if explaining them to whoever reported it.

Open `HINTS.md` only after five minutes stuck, one level at a time.

## The method

1. **Reproduce:** run exactly what they ran.
2. **Read the error:** start at the last line of the traceback, then go up to the first line in *their* file.
3. **Get the real response:** status code, headers and body, with `print(response.status_code, response.text)` or the same request in curl.
4. **One hypothesis, one check:** change one thing, run again.
5. **Fix and confirm:** run their original command and see it work.

## The short list

What you'd otherwise look up. Type each one at least once before you start the tickets.

- **curl:** `-i` (status and headers), `-v` (everything, including what you sent), `-H "Name: value"` (a header), `-d '...'` (a body, which makes it a POST), `-X GET` (force a method), `-N` (don't buffer, for streams), `-s` (no progress bar)
- **Reading JSON:** `| python3 -m json.tool`
- **Timing:** `time <command>`
- **Environment:** `echo $VAR`, `export VAR=value`, `env | grep LAB`, `VAR=value command` (for one command only)
- **Python setup:** `python3 -m venv .venv`, `source .venv/bin/activate`, `pip install -r requirements.txt`, `which python3`
- **Files:** `cat`, `less` (`/word` searches, `q` quits), `grep -n word file`, `head`, `tail`
- **Inside a script:** `os.environ.get("KEY")`, `print(repr(x))` (shows hidden spaces and `None`), `response.status_code`, `response.headers`, `response.text`, `response.json()`
- **Inspecting:** `python3 -i script.py` (stay in Python after a crash), `help(thing)`, `dir(thing)`
- **Built-in help:** `curl --help all | grep -i header`, `man curl` then `/word`, `python3 -m pydoc requests.post`
