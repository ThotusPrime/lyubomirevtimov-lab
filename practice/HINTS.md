# Hints

Open a hint only after five minutes stuck. Each ticket has three levels: a nudge, the commands that help, then the cause and the fix. Open them in that order and stop as soon as you can carry on alone.

## 0. Getting the key into your shell

<details><summary>Nudge</summary>

The scripts read `LAB_API_KEY` from the environment, the same way a Laravel command reads its `.env` through the framework. Python doesn't read a `.env` file on its own; something has to put the values into the shell first. Check what the shell has now before changing anything.

</details>

<details><summary>Commands that help</summary>

- `echo $LAB_API_KEY` prints the value, or an empty line if it isn't set
- `env | grep LAB` lists every LAB variable the shell will pass to programs
- `cat .env` shows what's in the file
- `export NAME=value` sets a variable for this shell and everything it starts

</details>

<details><summary>Cause and fix</summary>

`set -a; source .env; set +a` loads the file and exports every line. `source .env` alone sets the variables in the shell but doesn't export them, so `echo` shows the value while Python still sees nothing. That's a classic: it works in the terminal, not in the script.

It lasts until you close that terminal window. A new window needs it again.

</details>

<details><summary>The happy path with curl, for reference</summary>

Try writing these yourself first.

```
curl -s https://lab.lyubomirevtimov.com/v1/models -H "Authorization: Bearer $LAB_API_KEY" | python3 -m json.tool

curl -s https://lab.lyubomirevtimov.com/v1/chat/completions \
  -H "Authorization: Bearer $LAB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "lab/small", "messages": [{"role": "user", "content": "Hello. How are you?"}]}'
```

Add `-i` to see the status line and headers, or `-v` to see everything, including what curl sent.

</details>

## 1. "The key is right, we checked"

<details><summary>Nudge</summary>

`raise_for_status()` hides the body of the error, and the body says exactly what's wrong. Get the body. Then compare what their script sends with what works for you.

</details>

<details><summary>Commands that help</summary>

- In the script, before `raise_for_status()`: `print(response.status_code, response.text)`
- `grep -n Authorization ask.py` finds where the header is built
- The same call with curl and `-v` shows the header you're sending; compare it with theirs

</details>

<details><summary>Cause and fix</summary>

The header is `Authorization: <key>`, without the `Bearer ` scheme. The API answers `invalid_auth_scheme`. The key itself is fine, which is why checking it character by character didn't help.

Fix: `headers={"Authorization": f"Bearer {api_key}"}`.

**Reply:** "Your key is valid; the header was missing the word Bearer. It needs to be `Authorization: Bearer <key>`. Here's the one-line change."

</details>

## 2. "It worked last month"

<details><summary>Nudge</summary>

There are two kinds of 404 here: a route that doesn't exist and a model that doesn't exist. The status code alone can't tell them apart, but the body can. The date they mention matters too.

</details>

<details><summary>Commands that help</summary>

- `print(response.text)` before `raise_for_status()`, or the same request with curl
- `curl -s .../v1/models -H "Authorization: Bearer $LAB_API_KEY" | python3 -m json.tool` lists what exists today
- `grep -n model ask.py`

</details>

<details><summary>Cause and fix</summary>

The URL is fine. The script's default model is `lab/legacy-chat`, which was retired on 1 October. The error body says so and names the replacement, `lab/small`.

Fix: change the default model, or pass `--model lab/small`.

**Reply:** explain that the model was retired on 1 October and `lab/small` replaced it. Then the useful part: print the error body when a call fails, so the next change explains itself instead of showing a bare 404.

</details>

## 3. "Your API returns broken responses"

<details><summary>Nudge</summary>

`KeyError: 'choices'` means the JSON they got back has no `choices`. So what did it have? The script never checks the status code before reading the body.

</details>

<details><summary>Commands that help</summary>

- `print(response.status_code, response.headers.get("Content-Type"), response.text)` before the line that crashes
- `python3 -i summarise.py notes.txt` drops you into Python after the crash, with `response` and `result` still there to inspect
- `help(requests.post)` and `help(requests.request)`: read what `data=` and `json=` each do

</details>

<details><summary>Cause and fix</summary>

The script sends `data=json.dumps(payload)`. That sends the right text, but without the header `Content-Type: application/json`, so the API answers `415 Unsupported Media Type` with an error body. The script reads that error as if it were an answer and crashes on `choices`.

Fix: `json=payload`, which turns the dictionary into JSON and sets the header. Then add `response.raise_for_status()`, or better, print the body when the status isn't 200, before reading `choices`.

**Reply:** the API's format hasn't changed. The request was missing its JSON content type, so the response was an error, not an answer. Here's the fix, and a check so errors show up as errors.

</details>

## 4. "It dies halfway through"

<details><summary>Nudge</summary>

The status code is in the last line. Read the API's limits on its documentation page, then look at the response headers of a 429: the API tells you how long to wait.

</details>

<details><summary>Commands that help</summary>

- `curl -i` on a chat completion, repeated quickly, until you get a 429; read the headers
- `response.headers["Retry-After"]` in Python
- `time.sleep(seconds)`, after `import time`

</details>

<details><summary>Cause and fix</summary>

The limit is 5 chat completions per 10 seconds per account. Three rows never hit it; the real file does on the sixth. The 429 response carries `Retry-After: 10`, and the script ignores it.

Fix: when the status is 429, wait `Retry-After` seconds and try the same row again, with a cap on the attempts. The happy-path `batch.py` in `practice/` does exactly this, if you want to compare.

**Reply:** the service is stable; they're reaching the rate limit, which is 5 requests per 10 seconds. Every 429 says how long to wait in `Retry-After`. Retrying after that wait makes the job finish. If they need more throughput, that's a conversation about their plan.

</details>

## 5. "The large model is down"

<details><summary>Nudge</summary>

A timeout is the client giving up, not the server failing. Time how long the large model actually takes, without their script in the way.

</details>

<details><summary>Commands that help</summary>

- `time curl -s ... -d '{"model": "lab/large", ...}'` measures the real response time
- `grep -n -i timeout ask.py`
- The traceback's last line says which timeout it hit and its value

</details>

<details><summary>Cause and fix</summary>

The large model takes about 7 seconds. The script gives up after 5 (`TIMEOUT_SECONDS = 5`), so it never sees an answer, and the model looks down. It isn't: curl gets a 200.

Fix: raise the timeout above the model's real response time, for example 30 seconds. Still keep one, so a hung connection can't block forever. requests also accepts a pair, `timeout=(5, 30)`: 5 seconds to connect, 30 to wait for the answer. Streaming is the other route, since the first words arrive sooner.

**Reply:** the model is up; it just takes about 7 seconds per answer, and their client gives up after 5. Raise the read timeout to 30 seconds, or use streaming.

</details>

## 6. "Payment required?"

<details><summary>Nudge</summary>

402 is about money, not code. Check what the API knows about their account. Run the script with their key for one command only.

</details>

<details><summary>Commands that help</summary>

- `LAB_API_KEY=$LAB_TRIAL_KEY python3 ask.py "Hi."` sets the variable for that one command only
- `curl -s .../v1/account -H "Authorization: Bearer $LAB_TRIAL_KEY" | python3 -m json.tool`

</details>

<details><summary>Cause and fix</summary>

Their account is on the trial plan with a balance of $0.00. The trial credit ran out, so every request is refused with `insufficient_balance`. Nothing in the code needs changing.

**Reply:** say what happened, in plain words: the trial credit is used up, and that's why requests started failing today. Then the next step: add credit, and requests work straight away. A good reply also says how they can check it themselves next time (`GET /v1/account`) and offers to go through their expected usage, so they choose the right amount.

</details>

## 7. Bonus: "Streaming broke our script"

<details><summary>Nudge</summary>

With streaming on, the response isn't one JSON document any more. Look at the raw response.

</details>

<details><summary>Commands that help</summary>

- `curl -N ... -d '{..., "stream": true}'`: `-N` shows the stream as it arrives, without buffering
- `print(response.headers["Content-Type"])` and `print(response.text[:500])`
- `help(requests.Response.iter_lines)`

</details>

<details><summary>Cause and fix</summary>

A stream is a series of server-sent events: lines starting with `data: `, each holding a small JSON chunk, ending with `data: [DONE]`. `response.json()` tries to read all of it as one JSON document and fails on the first character.

Fix: send the request with `stream=True` (the requests argument, so it doesn't wait for the whole body), then read it line by line:

```python
for line in response.iter_lines(decode_unicode=True):
    if not line.startswith("data: "):
        continue
    payload = line[len("data: "):]
    if payload == "[DONE]":
        break
    chunk = json.loads(payload)
    print(chunk["choices"][0]["delta"].get("content", ""), end="", flush=True)
print()
```

**Reply:** streaming changes the response format, so the code that reads it has to change too. Here's the loop.

</details>

## 8. Bonus: "We switched from OpenAI and nothing works"

<details><summary>Nudge</summary>

Read the error again: where is the SDK looking for the key, and where did they put it?

</details>

<details><summary>Commands that help</summary>

- `env | grep -i key` shows which key variables your shell has
- `python3 -c "import openai; help(openai.OpenAI.__init__)"` lists the client's arguments

</details>

<details><summary>Cause and fix</summary>

The OpenAI SDK reads `OPENAI_API_KEY` by default. The key is in `LAB_API_KEY`, and the client is created without `api_key=`, so the SDK finds nothing and stops before sending anything.

Fix: `client = OpenAI(base_url="https://lab.lyubomirevtimov.com/v1", api_key=os.environ["LAB_API_KEY"])`, with `import os` at the top.

If your shell has an `OPENAI_API_KEY` of its own, the SDK sends that key to the lab instead, and you get a 401 with a masked `sk-...` key in the message. That's the same mistake from the other side, and a nasty one, because the customer's OpenAI key leaves their machine for the wrong provider.

**The other thing teams trip over:** model names. OpenAI's model names don't exist here, so a leftover model name gives `404 model_not_found`. `GET /v1/models` lists the right ones.

</details>
