# Hints

Open a hint only after five minutes stuck. Each ticket has three levels: a nudge, the commands that help, then the cause and the fix. Open them in that order and stop as soon as you can carry on alone.

Every ticket also ends with model answers to its **Explain it** questions. Open those only after you've checked yourself against the questions and written answers for any your work left open.

## 0. Getting the key into your shell

<details><summary>Nudge</summary>

The scripts read `LAB_API_KEY` from the environment. Python doesn't read a `.env` file on its own, and neither does the shell; something has to put the values into the shell first. Check what the shell has now before changing anything.

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
curl -s $LAB_BASE_URL/models -H "Authorization: Bearer $LAB_API_KEY" | python3 -m json.tool

curl -s $LAB_BASE_URL/chat/completions \
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

</details>

<details><summary>Model answers</summary>

1. The key was never checked. The API reads the header as a scheme followed by the credentials, and a bare key has no scheme, so it refuses the request before it looks at the key. The error body says so: `invalid_auth_scheme`.
2. Still `401`, so the status alone can't tell them apart. The body can: the code becomes `invalid_api_key`, and the message shows the start and end of the key that was sent, masked, so you can compare it with the right one without printing the whole key.

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

</details>

<details><summary>Model answers</summary>

1. The model, not the URL. The error body says `lab/legacy-chat` was retired on 1 October and names `lab/small` as its replacement, and `GET /v1/models` no longer lists it.
2. A `404` here means either a route that doesn't exist or a model that doesn't exist. The error body tells them apart: the code is `unknown_route` or `model_not_found`, and for a model, `param` is `"model"`.
3. Print or log the status and the error body whenever a call fails, instead of only raising. The first failed night would then have said that the model was retired and what replaces it, and the fix would have taken a minute.

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

</details>

<details><summary>Model answers</summary>

1. A `415` with an error body, `{"error": {...}}`, saying the body must be JSON with `Content-Type: application/json`. The script never checked the status, so it read the error as if it were an answer, and an error has no `choices`.
2. `data=` sends whatever you give it as it is, and a string gets no `Content-Type`. `json=` turns the dictionary into JSON and sets `Content-Type: application/json`. The header tells the server how to read the body, and this API refuses to guess.

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

</details>

<details><summary>Model answers</summary>

1. The limit is 5 chat completions per 10 seconds per account, and the script sends as fast as answers come back. Three rows never reach the limit; the real file reaches it on the sixth request.
2. `429 Too Many Requests` means the client sent too much in a window, not that the service is down. `Retry-After` is the server saying how long to wait, here in seconds, before trying again.
3. The limit belongs to the server. A pause after every five requests hard-codes it, so it breaks when the limit changes or differs between plans, and it can't see other scripts using the same key, which share the same allowance. `Retry-After` follows what the server actually says. Either way, cap the attempts, so a problem that won't clear doesn't loop forever.

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

</details>

<details><summary>Model answers</summary>

1. The same request with curl, timed with `time`: it comes back `200` with an answer after about 7 seconds. The model is up and slow, and the script stops waiting before it answers.
2. A client's timeout is how long the client waits before giving up, and says nothing about the server's health. The connect timeout covers setting up the connection; the read timeout covers waiting for the server to send data once connected. Here the connection was fine and the read timed out, which the last line of the traceback says: `ReadTimeout`, `read timeout=5`.
3. A server that never answers would then keep the script waiting forever: a job that never finishes, or a page that hangs. Set the timeout above the slowest normal answer, around 30 seconds here, and treat reaching it as an error worth reporting.

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

</details>

<details><summary>Model answers</summary>

1. Their trial credit ran out. The account is on the trial plan with a balance of $0.00, so every chat completion is refused with `402` and `insufficient_balance`, whatever the code does. Adding credit fixes it with no code change.
2. `GET /v1/account` with their key shows the plan and the balance, and costs nothing. Checking it before blaming the code would have answered the ticket in one request.

</details>

## 7. "It breaks when we set a limit"

<details><summary>Nudge</summary>

Their JSON is valid, so the API could read the request. A `422` means it read it and one value broke its rules, and the error body names the field. Then look at what Python actually put in that field.

</details>

<details><summary>Commands that help</summary>

- `print(response.status_code, response.text)` before `raise_for_status()`
- `print(repr(args.max_tokens))` shows the value with its type: quotes mean a string
- `python3 -m pydoc argparse`, then `/type=` to search for what `type=` does
- The same request with curl, once with `"max_tokens": "50"` and once with `"max_tokens": 50`

</details>

<details><summary>Cause and fix</summary>

`argparse` returns every argument as a string unless it's told the type. The default, `200`, is already a number, which is why the script works without the flag. With `--max-tokens 50`, the body says `"max_tokens": "50"`, and the API answers `422` with `invalid_value`, `param` `"max_tokens"`, and the message that it must be a whole number from 1 to 2048.

Fix: `parser.add_argument("--max-tokens", type=int, default=200)`.

</details>

<details><summary>Model answers</summary>

1. The value of `max_tokens`. The error body's `param` is `"max_tokens"`, and its message says the value must be a whole number from 1 to 2048. A `422` means the API could read the request but one field broke its rules, and `param` says which.
2. In JSON, `"50"` is a string and `50` is a number, and the API wants a number. `argparse` returns strings unless the argument has `type=int`, and `json=` sends Python values as they are, so a Python string became a JSON string. The default, `200`, was a number already, so the script only failed with the flag.
3. Still a `422`, on the same field: 5000 is a number now, but it's over the limit of 2048. The fix corrects the type, not the range. The script could check the range too, for a clearer message before anything is sent, but the API stays the one that decides.

</details>

## 8. "All we have is the request id"

<details><summary>Nudge</summary>

The job's output holds one useful thing: the request id. Every request the lab answers prints one JSON line with its id in the terminal where `npm run dev` runs. Find that line.

</details>

<details><summary>Commands that help</summary>

- Search the lab's terminal for the id, or start the lab with `npm run dev 2>&1 | tee lab.log` and run `grep <request id> lab.log` from the other terminal (Git ignores `lab.log`)
- `wc -c docs/*.txt` compares the sizes of the documents
- `curl -s $LAB_BASE_URL/models -H "Authorization: Bearer $LAB_API_KEY" | python3 -m json.tool` lists each model's context size

</details>

<details><summary>Cause and fix</summary>

The log line says `"status": 400`, `"error": "context_length_exceeded"` and `"model": "lab/small"`. The handbook is about 24,000 characters, roughly 6,000 tokens. `lab/small` takes 4,096 tokens, and the prompt plus `max_tokens` (256 when the script doesn't set it) has to fit. The other documents are a few hundred characters each.

Fix: send a document that doesn't fit to `lab/large`, which takes 32,768 tokens, or split it into parts and summarise each part. Either way, print `response.text` next to the request id when a request fails, so the job's own log explains itself.

</details>

<details><summary>Model answers</summary>

1. The status (`400`), the error code (`context_length_exceeded`), the model (`lab/small`) and the account. The job printed only that the request failed and its id; the API's explanation was in the response body, which the script threw away.
2. The most a model can take in one request, counted in tokens, with the prompt and the answer together. `lab/small` takes 4,096 and `lab/large` 32,768, so the handbook, at about 6,000 tokens, fits only the large one. The lab counts a token as about four characters; real models count differently, but every model has a limit.

</details>

## 9. Bonus: "Streaming broke our script"

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

</details>

<details><summary>Model answers</summary>

1. With streaming on, the response isn't one JSON document. Its `Content-Type` is `text/event-stream`, and the body is many lines, so `response.json()` fails on the very first character.
2. A series of server-sent events: lines starting with `data: `, each holding a small JSON chunk with the next piece of the answer in `choices[0].delta`, separated by blank lines. The last chunk carries `finish_reason` and the `usage`, and then `data: [DONE]` says the stream is over.
3. `"stream": true` in the body asks the API to stream. `stream=True` in `requests` tells the library to hand the response over as it arrives instead of waiting for all of it. Without it, the loop still works, but every word appears at once at the end, which defeats the point of streaming.

</details>

## 10. Bonus: "We switched from OpenAI and nothing works"

<details><summary>Nudge</summary>

Read the error again: where is the SDK looking for the key, and where did they put it?

</details>

<details><summary>Commands that help</summary>

- `env | grep -i key` shows which key variables your shell has
- `python3 -c "import openai; help(openai.OpenAI.__init__)"` lists the client's arguments

</details>

<details><summary>Cause and fix</summary>

The OpenAI SDK reads `OPENAI_API_KEY` by default. The key is in `LAB_API_KEY`, and the client is created without `api_key=`, so the SDK finds nothing and stops before sending anything.

Fix: pass the key in explicitly, `api_key=os.environ["LAB_API_KEY"]`, next to `base_url` when the client is created.

If your shell has an `OPENAI_API_KEY` of its own, the SDK sends that key to the lab instead, and you get a 401 with a masked `sk-...` key in the message. That's the same mistake from the other side, and a nasty one, because their OpenAI key leaves their machine for the wrong provider.

</details>

<details><summary>Model answers</summary>

1. The SDK looks for the key in its `api_key` argument or in `OPENAI_API_KEY`, finds neither, and stops before it builds a request. Nothing reached the API, so there's no status code: it's the client's own error.
2. The SDK sends that key, their OpenAI key, to the lab, and gets a `401` with a masked `sk-...` key in the message. It's worse because a secret for one provider has just been sent to another, and the error looks like the lab's fault.

</details>

## Exercise: the usage spike

<details><summary>Nudge</summary>

Read the file in a few lines first, with `head`, before writing anything. Then load every row and count before you add: how many rows, how many users, which statuses. A log written by real systems is rarely as tidy as its first line.

</details>

<details><summary>Commands that help</summary>

- `head -3 requests.jsonl` and `wc -l requests.jsonl`
- `json.loads(line)` for each line, and `collections.Counter` to count values, such as `Counter(row["status"] for row in rows)`
- `print(repr(value))` shows whether a value is `None`, a number or a string
- `row.get("latency_ms")` reads a field that some rows don't have, without a `KeyError`

</details>

<details><summary>Cause and fix</summary>

Four things in the log trip a first script:

- 40 rows have `null` for both token counts, so adding them up crashes on `None`. Count them as zero.
- 7 request ids appear twice, a `429` and then a `200` two seconds later.
- 12 rows have their status as a string, all from one user: eleven `"200"` and one `"429"`. Compare with `int(row["status"])`.
- 5 rows have no `latency_ms` at all. It doesn't matter for the totals, only if you go on to time things.

The top three: `kestrel` with 144,019 tokens, `orchard` with 129,543, and `harbour` with 118,363.

</details>

<details><summary>Model answers</summary>

1. The 40 requests that failed: 37 refused with `429` and 3 that hit a `500`. A failed request produced no answer and isn't billed, so it adds no tokens. Zero is right; crashing on `None`, or leaving those users out, isn't. The latency agrees: a `429` came back in 4 to 15 ms, because the API refused it before any model ran, while an answer took 150 to 950 ms from `lab/small` and 6 to 9 seconds from `lab/large`.
2. Each one is a retry: the client got a `429`, waited, and sent the same request again, which got a `200` two seconds later. The tokens are only on the `200`, so the totals don't change. A count of requests per user would count them twice, though.
3. `harbour`. Eleven of its successful requests have the status as the string `"200"`, and `"200" == 200` is false in Python, so they drop out: its tokens come to 87,324 instead of 118,363, and it falls out of the top three, with `lumen` (111,676) taking its place. Turning the status into a number first, `int(row["status"])`, fixes it.
4. `pinecone`: 24 of its 55 requests were refused with `429`, while it used the fewest tokens of anyone, 50,917. It doesn't send the most (`kestrel` sends 57); it sends in bursts of 8 to 10 requests within two seconds, against a limit of 5 per 10 seconds. The limit counts requests in a window, not tokens, so the lightest user can be the one it stops most.

</details>
