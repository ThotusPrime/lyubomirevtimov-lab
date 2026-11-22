# The lab

A practice inference API at **https://lab.lyubomirevtimov.com**, and a crash course built around it in troubleshooting an API from the terminal and from code. The API copies the shape of an OpenAI-compatible inference API, the kind behind most AI features: list the models, check the account, send messages to a model and get an answer with its token count and cost.

The models are stand-ins: simple text rules, not AI. Everything around them behaves like a real API, and each failure has its own status code: authentication (401), billing (402), unknown routes and models (404), content type (415), validation (422), a rate limit (429 with `Retry-After`), latency, and streaming.

- `src/index.js`: the whole API, one file with no dependencies. The documentation page at `/` follows the site: the same header (name and About, linking back to the main site) and footer, and the card opened up in the record sleeve styling. Its CSS is a copy of the parts of the site's `src/styles/base.css` and `theme.css` (in `~/Dev/personal-blog`) it uses, so a change to the site's colours needs copying here too.
- `public/`: static files Cloudflare serves without running the Worker. The fonts are copies of the latin files from `@fontsource/charis-sil` and `@fontsource/ibm-plex-sans` 5.3.0, the favicon is the site's, and `_headers` adds the noindex header to all of them.
- `wrangler.jsonc`: deploys it as its own Worker, `lyubomirevtimov-lab`, on the subdomain.
- `practice/`: the course, with two Python tools, ten tickets, the concepts, the hints and a tester prompt. Start with `practice/README.md`.
- `scripts/setup.mjs`: `npm run setup`, which makes a learner's own keys (below).
- `exercises/`: practice that isn't a call to the API. `token-usage/` is a log of 311 requests (`requests.jsonl`) and a brief: write the script that finds who used the most tokens, and spot what in the log would make a total wrong.

## Kept out of search results

The same way as the site: crawlers may read everything, and every response says `noindex`. The Worker adds an `X-Robots-Tag: noindex, nofollow` header to all its responses (JSON and errors included), `public/_headers` adds it to the static files, and the page carries a robots meta tag as well. `robots.txt` allows crawling on purpose. A crawler blocked by `robots.txt` never fetches the page, so it never sees the `noindex`, and a search engine can then still list the bare address if another page links to it. The AI policy is the site's: Cloudflare's crawler settings apply to the whole domain, subdomains included.

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

- **Locally:** `npm run setup` once, then `npm run dev` (it reads `.dev.vars`). A `practice/.env` made by setup already points the tools at it; with an older one, `export LAB_BASE_URL=http://localhost:8788/v1`.
- **Deploy:** `npm run deploy` (the same as `npx wrangler deploy`). The first deploy also created the subdomain and its DNS record.
- **Upload the keys:** `npx wrangler secret bulk .dev.vars`, whenever the keys change.
- **Server logs:** every request prints one JSON line (request id, path, account, model, status, and the error code when it fails): in the `npm run dev` terminal locally, and through `npm run tail` for the live lab. It's the server's view of a call, the way an API provider looks up a request id someone quotes to them. Ticket 8 is built on it.
- **Take it down:** `npx wrangler delete`. That removes the Worker and its subdomain; the site isn't affected.
