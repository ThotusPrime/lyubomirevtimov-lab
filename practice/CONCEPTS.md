# Concepts

The few ideas every ticket rests on. Read this once before the tickets; the tickets are where they become habits.

## A request and its response

Every call to an API is one request and one response, and each has three parts. This is a real exchange with the lab, as `curl -v` shows it: `>` is what curl sent, `<` is what came back.

```
> POST /v1/chat/completions HTTP/1.1
> Authorization: Bearer lab_1a2b3…
> Content-Type: application/json
>
> {"model": "lab/small", "messages": [{"role": "user", "content": "Hi."}]}

< HTTP/1.1 200 OK
< Content-Type: application/json
< x-request-id: req_5f95556ff0e9eb0cde5b6b3b
<
< {"id": "chatcmpl-…", "choices": [{"message": {"role": "assistant", "content": "Hi."}}], "usage": {…}}
```

- **The request line** says what to do and to what: the method (`GET` reads, `POST` sends something) and the path.
- **The headers** say how: who you are, what format the body is in. One `Name: value` per line.
- **The body** is the content itself, here a JSON document. A `GET` usually has none.

The response mirrors it. **The status line** says how it went, **the headers** carry details about the answer, and **the body** holds either the answer or an explanation of what went wrong.

That last part is the one scripts most often throw away. When a call fails, the body almost always says why, in more words than the status code can.

## Status codes

The first digit is the kind of answer:

- **2xx:** it worked.
- **4xx:** the API refused the request, and something on your side can change that: the key, the body, the rate, the account.
- **5xx:** the API failed. Nothing in your request can fix it; report it, with the request id.

The number narrows it down, and the body pins it: two failures can share a status code and differ only in the body. The lab's documentation page lists every code it uses.

## Headers worth knowing

- `Authorization`: your credentials, in the form the API's documentation gives.
- `Content-Type`: what format a body is in. It's on both sides: the request says what it sends, the response says what it returns.
- `Retry-After`: on a refusal, how long to wait before trying again.
- `x-request-id`: the name of this exact request. Quote it when you report a problem, and the provider can find it in their logs.

## JSON

The format almost every API speaks. Its values each have a type: a string (`"text"`), a number (`42`), `true` or `false`, `null`, an object (`{"key": value}`) or a list (`[1, 2]`). Python's `json` module turns them into a `str`, an `int` or `float`, a `bool`, `None`, a `dict` and a `list`, and back again.

## Environment variables

A variable such as `LAB_API_KEY` belongs to a running shell and the programs that shell starts, not to a folder or a file. Close the terminal and it's gone; open a new one and it isn't there yet. A `.env` file is only a file until something reads it into the shell. When a script says a variable isn't set, check the shell first, with `echo` or `env`, before you look at the code.

## Where to look things up

- **The API's own documentation:** http://localhost:8788/troubleshooting-an-api/docs/ while your lab runs. It lists the endpoints, the models, the limits and the errors.
- **Built-in help:** `curl --help all`, `man curl`, Python's `help()` and `python3 -m pydoc`.
- **The method** in the course README: reproduce, read the error, get the real response, change one thing, confirm.
