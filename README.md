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
| `/certificates/<id>/` | A certificate the lab has issued, with its PDF at `/certificates/<id>.pdf` | `src/certificates.js`, and the PDF in `public/certificates/` |

- `src/index.js`: the entry point. It sends page addresses to their pages and everything else to the API, adds the request id to every response and a noindex header to everything but the pages and the sitemap, serves `/sitemap.xml`, and logs each request. An address with no page gets an HTML 404 in a browser and the API's JSON 404 everywhere else, so curl and scripts still hear that API routes start with `/v1/`.
- `src/frame.js`: what every page shares: the head, the main site's header (his name and About) and footer, and the 404 page.
- `src/courses/index.js`: the list of courses. Adding one means writing its module beside it and adding it there.
- `src/certificates.js`: the certificates the lab has issued, each written out in full (below).
- `public/`: static files Cloudflare serves without running the Worker. `lab.css` is the pages' styles: its first half is a copy of the parts of the site's `src/styles/base.css` and `theme.css` (in `~/Dev/personal-blog`) it uses, so a change to the site's colours needs copying here too, and its second half is the lab's own (the hub's rows, a course's panel, and a certificate with its print layout). The fonts are copies of the latin files from `@fontsource/charis-sil` and `@fontsource/ibm-plex-sans` 5.3.0, the favicon is the site's, and `_headers` adds `nosniff` to all of them. `robots.txt` allows everything and names the sitemap.
- `wrangler.jsonc`: deploys it as its own Worker, `lyubomirevtimov-lab`, on the subdomain.
- `practice/`: the troubleshooting course, with two Python tools, ten tickets, the concepts, the hints, and prompts for an AI tester and an AI teacher. Start with `practice/README.md`.
- `exercises/`: the course's practice that isn't a call to the API. `token-usage/` is a log of 311 requests (`requests.jsonl`) and a brief: write the script that finds who used the most tokens, and spot what in the log would make a total wrong.
- `scripts/setup.mjs`: `npm run setup`, which makes a learner's own keys (below).
- `scripts/certificate-pdf.mjs`: `npm run certificate -- <id>`, which makes a certificate's PDF from its page (below).

The pages carry no scripts and load nothing from elsewhere, so they're sent with a strict Content-Security-Policy (in `src/frame.js`). Their footer names the licence.

## Search engines

The pages are open to search engines (since 22 November 2026; before that the whole lab was kept out of their results). Each page has a canonical address on `https://lab.lyubomirevtimov.com`, fixed rather than read from the request, so a learner's local copy still points to the live pages, and a JSON-LD block saying what it is, built only from facts already on the page: the hub is a list of courses, a course page a `Course` (free, by him, under the repository's licence) and its reference a `TechArticle`. `/sitemap.xml`, which the Worker builds from the list of pages, lists them, and `robots.txt` points to it. The API's responses, redirects and 404s carry an `X-Robots-Tag: noindex` header, and the 404 page a robots meta tag, so none of those are listed. Neither are certificates: their pages carry both, their PDFs the header (from `_headers`), and the sitemap leaves them out. The AI crawler policy is the site's: Cloudflare's settings apply to the whole domain, subdomains included.

## Certificates

A certificate is checked where it was issued, so the lab's certificates live here rather than on his site. Each has a page at `/certificates/<id>/`, which is the certificate itself, and a PDF of the same page beside it at `/certificates/<id>.pdf`, to keep or attach. They aren't offered to learners: nothing in the lab links to them, the sitemap leaves them out and search engines are told not to list them, so they're reached only from their holders' own links, such as a LinkedIn entry. The only one so far is `tapi-2026-001`, his own, for Troubleshooting an API.

A certificate's facts are written out in full in `src/certificates.js` rather than read from its course's module, so it still says what was true on the day it was issued after the course changes. Each has two sheets: the certificate (holder, course, topics, dates, workload, the issuer and the address to check it at), and a proof of completion, a table with one row per module saying what it teaches, what passing it takes, what the work showed and the help used. It's self-issued, and it says so: the proof stands where a certifying organisation's name would.

To make or remake a PDF, start the lab with `npm run dev`, then, in another terminal:

```
npm run certificate -- tapi-2026-001
```

It prints the page with the Chrome already installed (headless, with a throwaway profile) into `public/certificates/<id>.pdf`, which is committed. The page's print styles in `lab.css` make each sheet one landscape A4 page, in the light colours. A script beats a PDF made by hand because the page and the PDF can't drift apart, and a typo fixed on the page is one command away from the PDF. Using Chrome rather than a library such as Puppeteer keeps a dependency out of the repository for a file made a few times a year. The cost is that it needs Chrome (set `CHROME` to its path if it isn't in the usual place on a Mac), and that Chrome stamps each PDF with the time it was made, so no two runs give byte-identical files. That's also why the page doesn't publish a hash of its PDF: the same person controls both, so a hash would prove nothing the page doesn't.

Once a certificate is deployed, save its page and its PDF in the Internet Archive's Wayback Machine (web.archive.org/save) and record the snapshots' addresses here. They're the one record of a certificate's date that he doesn't control himself.

## Licence

The courses and everything else in this repository are © 2026 Lyubomir Evtimov and licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (`LICENSE`): free to use, change and share for any purpose, commercial included, as long as you credit him, link to the licence and say what you changed. To credit it, something like: *"Troubleshooting an API" by Lyubomir Evtimov, https://lab.lyubomirevtimov.com/troubleshooting-an-api/, CC BY 4.0.*

The fonts in `public/fonts/` aren't his: they're under the SIL Open Font License 1.1, in `public/fonts/OFL.txt`.

## How it relates to the site

It's a separate Worker and, since 21 November 2026, a separate project: this folder used to be `lab/` inside the site's repository (`~/Dev/personal-blog`), and its Git history came with it. The site's footer links here, and that's the only connection. Workers Builds deploys only the site, never this. The site is pure static assets, which Cloudflare serves free and without limit, so nothing the lab does can use up the site's quota or take it down.

## Cost

None. It runs on the Workers Free plan: no storage, no AI models, nothing billed by usage. Past 100,000 requests in a day, Cloudflare stops the lab with error 1027 until midnight UTC; it doesn't charge.

## Keys

Every learner makes their own keys with `npm run setup`. It writes two files Git ignores: `.dev.vars`, the `LAB_KEYS` secret that `npm run dev` reads, and `practice/.env`, the two keys the tools use plus `LAB_BASE_URL=http://localhost:8788/v1`. It never overwrites either file, and stops if only one of them exists, because new keys in one wouldn't match the other. Own keys matter because the lab counts its rate limit per account: a shared key would put everyone in one allowance.

A lab with no keys answers every `/v1` request with `503` and `no_keys`, and a message saying to run `npm run setup` and start the lab again. The live lab has none, on purpose (its `LAB_KEYS` secret was deleted on 22 November 2026): every learner runs the API on their own computer, so the live site serves only the pages. The keys are JSON, in this shape:

```
{"<key>": {"id": "acct_practice", "plan": "pay-as-you-go", "balance": 25},
 "<key>": {"id": "acct_trial", "plan": "trial", "balance": 0}}
```

Locally, `.dev.vars` holds the same JSON as one line, `LAB_KEYS=...`.

## Running and deploying

From this folder, after `eval "$(fnm env --shell zsh)" && fnm use` (and `npm ci` the first time):

- **Locally:** `npm run setup` once, then `npm run dev` (it reads `.dev.vars`), and open http://localhost:8788/. The Python tools send their requests to `LAB_BASE_URL`, and to `http://localhost:8788/v1` when it isn't set, so they find the local lab either way. Under `wrangler dev` a request's URL carries the live hostname from the route in `wrangler.jsonc`, not localhost, so the Worker never builds an address from it: redirects are relative, and the pages name `http://localhost:8788` outright.
- **Deploy:** `npm run deploy` (the same as `npx wrangler deploy`). The first deploy also created the subdomain and its DNS record.
- **Server logs:** every request prints one JSON line (request id, path, account, model, status, and the error code when it fails): in the `npm run dev` terminal locally, and through `npm run tail` for the live lab. It's the server's view of a call, the way an API provider looks up a request id someone quotes to them. Ticket 8 is built on it.
- **Take it down:** `npx wrangler delete`. That removes the Worker and its subdomain; the site isn't affected.
