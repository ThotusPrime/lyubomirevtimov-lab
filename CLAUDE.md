# The lab (lab.lyubomirevtimov.com): project context

A practice inference API and the troubleshooting course built around it, made on 12 November 2026 to practise for a terminal troubleshooting interview. It copies the shape of an OpenAI-compatible API, with stand-in models (text rules, not AI) and real authentication, billing, rate-limit, latency and streaming errors. `README.md` has the details and commands, and `practice/README.md` is the course itself.

Background on Lyubomir (his work, boundaries and languages) is in `~/Dev/personal-blog/CLAUDE.local.md`. Draw on it, but don't copy it into files here.

## Where it came from

Until 21 November 2026 this was `lab/` inside the website's repository (`~/Dev/personal-blog`). It was split off into this folder so the course can be worked on without touching the site, and its Git history came with it (two commits, from 12 and 14 November). This repository is **local only**: there's no GitHub remote yet, so a lost Mac loses it. Adding a private remote is his call.

The chats it was made in:

- **A claude.ai web chat with access to his Mac** (by 12 November) wrote the first version straight into the project files. It isn't on this Mac, so search claude.ai for it.
- **"Subdomain lab module deployment"** (Claude Code, 12 November) restyled it to match the site, kept it out of search results, deployed it and committed it.
- **The ticket work** (13 November): the fixed copies for tickets 1 to 4 and the token-usage exercise are dated that day, but no Claude Code chat on this Mac was active then, so it most likely happened in a claude.ai chat, where Claude acted as his tester.
- **"About section writing"** (Claude Code, 14 November), at its end: the ticket work was tidied into `_fixed.py` copies, the originals were restored, and the certificate plan below was recorded.

## The course

- `practice/` is the customer's side: two Python tools (`ask.py`, `batch.py`), eight tickets in `practice/tickets/` (1 to 6 in order, 7 and 8 bonuses) and `HINTS.md`.
- `exercises/` holds practice that isn't part of the API. `token-usage/` came from `~/Dev/intervew` on 21 November 2026: a log of 300 requests and a script that totals tokens per user.
- **The course is done with AI assistants switched off**, as in the interview (`practice/README.md`). When he works a ticket here, don't hand him the fix. Point him to the method in the practice README, or to `HINTS.md` one level at a time, unless he asks for the answer.
- **His work on the tickets stays out of Git**, so the tickets stay broken for practice. Each fix goes in a copy beside the original (`ask_fixed.py` and so on), and the tool output in `results*.csv`, both ignored by `.gitignore`. Never edit or commit the original ticket files to hold a solution.
- **Status as of 21 November 2026:** fixed copies exist for tickets 1 to 4, which may not be finished, and none for 5 to 8. They exist only on his Mac.
- **Planned: finish the tickets, then a certificate page on the site.** Once the tickets are done, he wants a page on lyubomirevtimov.com that works as a real certificate for this training: one of his own, which describes the course and how it can be checked. It must not imitate or pretend to be any real certificate issuer. Nothing about it is built or decided yet, including what counts as proof that the work was done. The fixed copies and results are his only record of it so far. The page itself belongs to the site's repository, not this one.

## Running it

- Node.js is managed with fnm from `.nvmrc`, the same version as the site. In a non-interactive shell, such as an agent's, run `eval "$(fnm env --shell zsh)" && fnm use` before any `npm` or `npx` command.
- `npm ci` once, then `npm run dev` serves it on http://localhost:8788 (the `lab-dev` entry in `.claude/launch.json` does the same). Point the tools at it with `export LAB_BASE_URL=http://localhost:8788/v1`; without that they use the live lab.
- The Python tools run from `practice/` in its virtual environment: `source .venv/bin/activate`. It was recreated here on 21 November 2026 from `practice/requirements.txt`, on the macOS system Python (3.9.6, which no longer gets updates). That file names `requests` and `openai` without versions, so a rebuild installs the newest ones: on 21 November that was `requests` 2.32.5 and `openai` 2.48.0 (`pip freeze` shows the rest).
- Wrangler is pinned to the site's version, and its install scripts (esbuild, workerd) are denied in `allowScripts`, as on the site.

## Deploying

- **It's its own Worker**, `lyubomirevtimov-lab`, on the subdomain lab.lyubomirevtimov.com. Nothing deploys it automatically: it changes only when `npm run deploy` (`npx wrangler deploy`) is run from this folder. It runs on the free plan with no storage.
- **The keys are a Worker secret** (`LAB_KEYS`), with local copies in `.dev.vars` and `practice/.env`, which Git ignores. Never put a key in a committed file.
- **It stays out of search results**: crawling is allowed and every response carries `X-Robots-Tag: noindex, nofollow`. This one stays on, unlike the site's. The AI crawler policy is the site's, set in Cloudflare for the whole domain.

## How it relates to the site

- **The site's footer links to the lab**, and that's the only connection. Removing or renaming the lab means changing that link in `~/Dev/personal-blog`.
- **It follows the site's look**: the documentation page in `src/index.js` uses the record sleeve styling, the site's header and footer, and copies of its fonts and favicon in `public/`. Its CSS is a copy of the parts of the site's `src/styles/base.css` and `theme.css` it uses, so a change to the site's look needs copying here by hand.
- The site's accessibility check doesn't cover the lab. Its page was checked with axe by hand when it went live, with no violations.

## How to work on this project

- **Publish no internal company data**, the same rule as the site: no real tickets, incidents, identifiers, figures or names from his employer. The tickets here are invented.
- **No AI attribution in Git history**: no `Co-Authored-By: Claude` trailer or similar in commit messages.
- **Stage files by name when committing**, never `git add .` or `git add -A`, so no keys or ticket work get swept in.
- He uses British spelling, and he will maintain this himself, so explain the trade-offs behind technical choices.
