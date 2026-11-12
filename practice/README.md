# Practice: the customer's side of the lab

The lab (`lab.lyubomirevtimov.com`) plays the inference provider. This folder plays its customers: two small Python tools of the kind a startup would write, and eight tickets where something has gone wrong.

Work with AI assistants switched off, as in the interview. Built-in help (`--help`, `man`, Python's `help()`) is allowed; that's the point.

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

## 4. The tickets (60 to 75 minutes)

Do 1 to 6 in order. 7 and 8 are bonuses if there's time.

For each one:

1. Read `TICKET.md` and set a 10-minute timer.
2. Reproduce it: run their command and get their error.
3. Say each step out loud, as if the interviewer were watching.
4. Fix it in a copy (`cp ask.py ask_fixed.py`), so the original stays broken for next time.
5. Write the reply to the customer in two or three lines. In this job the reply is half the work.

Open `HINTS.md` only after five minutes stuck, one level at a time.

## The method

1. **Reproduce:** run exactly what they ran.
2. **Read the error:** start at the last line of the traceback, then go up to the first line in *their* file.
3. **Get the real response:** status code, headers and body, with `print(response.status_code, response.text)` or the same request in curl.
4. **One hypothesis, one check:** change one thing, run again.
5. **Fix and confirm:** run their original command and see it work.

## The short list

What you'd otherwise look up. Type each one at least once tonight.

- **curl:** `-i` (status and headers), `-v` (everything, including what you sent), `-H "Name: value"` (a header), `-d '...'` (a body, which makes it a POST), `-X GET` (force a method), `-N` (don't buffer, for streams), `-s` (no progress bar)
- **Reading JSON:** `| python3 -m json.tool`
- **Timing:** `time <command>`
- **Environment:** `echo $VAR`, `export VAR=value`, `env | grep LAB`, `VAR=value command` (for one command only)
- **Python setup:** `python3 -m venv .venv`, `source .venv/bin/activate`, `pip install -r requirements.txt`, `which python3`
- **Files:** `cat`, `less` (`/word` searches, `q` quits), `grep -n word file`, `head`, `tail`
- **Inside a script:** `os.environ.get("KEY")`, `print(repr(x))` (shows hidden spaces and `None`), `response.status_code`, `response.headers`, `response.text`, `response.json()`
- **Inspecting:** `python3 -i script.py` (stay in Python after a crash), `help(thing)`, `dir(thing)`
- **Built-in help:** `curl --help all | grep -i header`, `man curl` then `/word`, `python3 -m pydoc requests.post`
