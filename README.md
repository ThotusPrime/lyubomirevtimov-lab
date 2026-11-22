# The lab

**https://lab.lyubomirevtimov.com**: a hub of courses, each one free to download and run on your own computer. Its first page lists the courses, newest first, one row each, and each course has its own page with what it is, what it covers, how it works and how to get it.

The first course is **Troubleshooting an API**, a crash course in finding out why a call to an API fails and what fixes it, from the terminal and from code. It comes with a practice API that copies the shape of an OpenAI-compatible inference API, the kind behind most AI features: list the models, check the account, send messages to a model and get an answer with its token count and cost. The models are stand-ins: simple text rules, not AI. Everything around them behaves like a real API, and each failure has its own status code: authentication (401), billing (402), unknown routes and models (404), content type (415), validation (422), a rate limit (429 with `Retry-After`), latency, and streaming.

## What's where

The same Worker serves the live hub and every learner's own copy, started with `npm run dev`:

| Address | What it is | Source |
|---|---|---|
| `/` | The hub: the list of courses | `src/hub.js` |
| `/troubleshooting-an-api/` | The course's page | `src/courses/troubleshooting-an-api.js` |
| `/troubleshooting-an-api/docs/` | The practice API's reference | the same file |
| `/v1/...` | The practice API | `src/api.js` |

- `src/index.js`: the entry point. It sends page addresses to their pages and everything else to the API, adds the request id and noindex header to every response, and logs each request. An address with no page gets an HTML 404 in a browser and the API's JSON 404 everywhere else, so curl and scripts still hear that API routes start with `/v1/`.
- `src/frame.js`: what every page shares: the head, the main site's header (his name and About) and footer, and the 404 page.
- `src/courses/index.js`: the list of courses. Adding one means writing its module beside it and adding it there.
- `public/`: static files Cloudflare serves without running the Worker. `lab.css` is the pages' styles: its first half is a copy of the parts of the site's `src/styles/base.css` and `theme.css` (in `~/Dev/personal-blog`) it uses, so a change to the site's colours needs copying here too, and its second half is the lab's own (the hub's rows and a course's panel). The fonts are copies of the latin files from `@fontsource/charis-sil` and `@fontsource/ibm-plex-sans` 5.3.0, the favicon is the site's, and `_headers` adds the noindex header to all of them.
- `wrangler.jsonc`: deploys it as its own Worker, `lyubomirevtimov-lab`, on the subdomain.
- `practice/`: the troubleshooting course, with two Python tools, ten tickets, the concepts, the hints and a tester prompt. Start with `practice/README.md`.
- `exercises/`: the course's practice that isn't a call to the API. `token-usage/` is a log of 311 requests (`requests.jsonl`) and a brief: write the script that finds who used the most tokens, and spot what in the log would make a total wrong.
- `scripts/setup.mjs`: `npm run setup`, which makes a learner's own keys (below).

The pages carry no scripts and load nothing from elsewhere, so they're sent with a strict Content-Security-Policy (in `src/frame.js`).

## Kept out of search results

The same way as the site: crawlers may read everything, and every response says `noindex`. The Worker adds an `X-Robots-Tag: noindex, nofollow` header to all its responses (JSON and errors included), `public/_headers` adds it to the static files, and every page carries a robots meta tag as well. `robots.txt` allows crawling on purpose. A crawler blocked by `robots.txt` never fetches the page, so it never sees the `noindex`, and a search engine can then still list the bare address if another page links to it. The AI policy is the site's: Cloudflare's crawler settings apply to the whole domain, subdomains included.

## How it relates to the site

It's a separate Worker and, since 21 November 2026, a separate project: this folder used to be `lab/` inside the site's repository (`~/Dev/personal-blog`), and its Git history came with it. The site's footer links here, and that's the only connection. Workers Builds deploys only the site, never this. The site is pure static assets, which Cloudflare serves free and without limit, so nothing the lab does can use up the site's quota or take it down.

## Cost

None. It runs on the Workers Free plan: no storage, no AI models, nothing billed by usage. Past 100,000 requests in a day, Cloudflare stops the lab with error 1027 until midnight UTC; it doesn't charge.

## Keys

Every learner makes their own keys with `npm run setup`. It writes two files Git ignores: `.dev.vars`, the `LAB_KEYS` secret that `npm run dev` reads, and `practice/.env`, the two keys the tools use plus `LAB_BASE_URL=http://localhost:8788/v1`. It never overwrites either file, and stops if only one of them exists, because new keys in one wouldn't match the other. Own keys matter because the lab counts its rate limit per account: a shared key would put everyone in one allowance.

The live lab's keys live in the Worker's `LAB_KEYS` secret, never in this repository. The secret is JSON, in this shape:

```
{"<key>": {"id": "acct_practice", "plan": "pay-as-you-go", "balance": 25},
 "<key>": {"id": "acct_trial", "plan": "trial", "balance": 0}}
```

To change the live lab's keys, edit both files, then upload the secret again (below).

## Running and deploying

From this folder, after `eval "$(fnm env --shell zsh)" && fnm use` (and `npm ci` the first time):

- **Locally:** `npm run setup` once, then `npm run dev` (it reads `.dev.vars`), and open http://localhost:8788/. The Python tools send their requests to `LAB_BASE_URL`, and to `http://localhost:8788/v1` when it isn't set, so they find the local lab either way. Under `wrangler dev` a request's URL carries the live hostname from the route in `wrangler.jsonc`, not localhost, so the Worker never builds an address from it: redirects are relative, and the pages name `http://localhost:8788` outright.
- **Deploy:** `npm run deploy` (the same as `npx wrangler deploy`). The first deploy also created the subdomain and its DNS record.
- **Upload the keys:** `npx wrangler secret bulk .dev.vars`, whenever the keys change.
- **Server logs:** every request prints one JSON line (request id, path, account, model, status, and the error code when it fails): in the `npm run dev` terminal locally, and through `npm run tail` for the live lab. It's the server's view of a call, the way an API provider looks up a request id someone quotes to them. Ticket 8 is built on it.
- **Take it down:** `npx wrangler delete`. That removes the Worker and its subdomain; the site isn't affected.
