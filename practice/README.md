# Practice: troubleshooting an API

A crash course in troubleshooting an HTTP API, from the terminal and from code. The lab (`lab.lyubomirevtimov.com`) is the API. It works like an OpenAI-compatible inference API, the kind behind most AI features, and its failures are the real ones: authentication, unknown models, content types, rate limits, timeouts, billing and streaming. This folder is the other side: two small Python tools, and eight tickets where someone's script has stopped working.

By the end you'll be able to:

- call an API with curl, and read the status, headers and body of what comes back
- get the real error out of a script that hides it
- tell whether a problem is in the request, the traffic, the account or the protocol
- explain what went wrong and why, not only fix it

The skills carry over to any HTTP API. You need a terminal, Git, Node.js 24 (the exact version is in `.nvmrc`, and nvm or fnm will install it), Python 3 and curl, and no knowledge of this API beforehand. The commands are written for macOS and Linux. On Windows, use WSL and they work as written.

## How it works

Each ticket is a report from someone whose script fails: their command, their error, and usually their guess at the cause. The guess is often wrong, so treat it as a lead, not a fact. You reproduce the problem, find the cause, fix their script, and then check that you can answer a few questions about it, which show whether you understood it or only patched it. Your work often answers them already, and then there's nothing left to answer.

**Work with AI assistants switched off while you solve a ticket.** Reading the error yourself is the skill this course teaches, and an assistant would do that step for you. Built-in help (`--help`, `man`, Python's `help()`) is allowed, and learning to use it is part of the point. Once you've fixed a ticket, an AI assistant is welcome back as your tester: `TESTER.md` has a prompt that makes it look over your work and question you only on what your work doesn't already show, without giving the answers away.

## 1. Get your own lab running (about 10 minutes)

You run the lab yourself, on your own computer, with keys only you have. From wherever you keep projects:

```
git clone https://github.com/ThotusPrime/lyubomirevtimov-lab.git
cd lyubomirevtimov-lab
npm ci
npm run setup
npm run dev
```

`npm run setup` makes two keys and writes them to two files Git ignores: `.dev.vars` for the lab and `practice/.env` for you. It never overwrites them, so running it again is safe. `npm run dev` starts the lab on http://localhost:8788 and keeps running: leave that terminal open, because the lab's log appears there, and open a second terminal for everything else. Open http://localhost:8788/ in a browser for the API's documentation.

## 2. Set up Python

In the second terminal, from the `practice` folder:

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Check it worked: `which python3` should point inside `.venv`. A new terminal window starts without the venv, so activate it again there. If a script says `ModuleNotFoundError: No module named 'requests'`, this is why.

On a Mac, with the Python that comes with macOS, every script prints two lines of `NotOpenSSLWarning` before anything else. It's harmless: Apple builds that Python against LibreSSL instead of OpenSSL, and `urllib3`, the library `requests` uses underneath, warns about it every time it loads. It's a warning, not the error, and telling the two apart is the first habit this course builds. A Python from python.org or Homebrew doesn't print it.

## 3. Exercise 0: get your keys into the shell

Your keys are in `.env` in this folder: `LAB_API_KEY` for your own account, `LAB_TRIAL_KEY` for one of the tickets, and `LAB_BASE_URL`, which sends the tools to your own lab. The tools read them from the environment. Getting them there is the first exercise. Hint 0 in `HINTS.md` if you're stuck.

## 4. The happy path

See what working looks like before anything breaks.

```
python3 ask.py "The payout run closes on the third. Late approvals move to the next month."
python3 ask.py "Same text. Second sentence." --model lab/large
python3 batch.py prompts.csv results.csv
```

The batch takes about half a minute and pauses once or twice with "rate limited, waiting 10s". That's it working: it hits the limit, waits as the API says, and carries on.

Then make the same calls with curl, written from memory: list the models, then send one chat completion. Reference at the end of hint 0, and the API's documentation at http://localhost:8788/.

Before the tickets, read `CONCEPTS.md`: what a request and a response are made of, status codes, the headers worth knowing, JSON and environment variables.

## 5. The tickets

Do 1 to 8 in order. 9 and 10 are bonuses. Most take 15 to 30 minutes, the first ones longer.

| Layer | What you look at | Tickets |
|---|---|---|
| The request | What the script sends: its headers, its body, the names and values in it | 1, 2, 3, 7 |
| Traffic and time | How often it sends, and how long it waits | 4, 5 |
| The account | What the key is allowed to do | 6 |
| The server's side | What the API's own log knows that the response didn't say | 8, and the usage exercise |
| The protocol | Responses and libraries that don't work the way the script expects | 9, 10 (bonus) |

For each one:

1. Read `TICKET.md`. If you like working against the clock, set a 10-minute timer before you allow yourself the hints.
2. Reproduce it: run their command and get their error.
3. Say each step out loud, or write it down, as if explaining it to a colleague. It's how you notice the step you skipped.
4. Fix it in a copy (`cp ask.py ask_fixed.py`), so the original stays broken for next time. Git ignores the copies.
5. Check it against the ticket's **Done when** line.
6. Check yourself against the questions under **Explain it**. Your notes from the work often answer some of them already, so tick those off. Write answers only for the ones your work doesn't cover, and do that before you look at anything. Then compare with the model answers at the end of that ticket's hints, or give your work to the tester in `TESTER.md`, which questions you only on what's left. If nothing's left, the ticket is done.
7. Note it in your log: `cp LOG.template.md LOG.md` once, then a row for each ticket. Git ignores `LOG.md`.

Open `HINTS.md` only after five minutes stuck, one level at a time.

## 6. The usage exercise

`../exercises/token-usage/` has no broken script. It has a log of 300 requests and a question about who's using the most tokens, and you write the script that answers it. Do it after ticket 8. It works the same way: a **Done when** line, **Explain it** questions, and hints at the end of `HINTS.md`.

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
