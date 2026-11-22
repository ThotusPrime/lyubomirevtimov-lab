# The lab (lab.lyubomirevtimov.com): project context

A practice inference API and the troubleshooting course built around it, made on 12 November 2026 to practise for a terminal troubleshooting interview. It copies the shape of an OpenAI-compatible API, with stand-in models (text rules, not AI) and real authentication, billing, rate-limit, latency and streaming errors. `README.md` has the details and commands, and `practice/README.md` is the course itself.

Background on Lyubomir (his work, boundaries and languages) is in `~/Dev/personal-blog/CLAUDE.local.md`. Draw on it, but don't copy it into files here.

## Where it came from

Until 21 November 2026 this was `lab/` inside the website's repository (`~/Dev/personal-blog`). It was split off into this folder so the course can be worked on without touching the site, and its Git history came with it (two commits, from 12 and 14 November). Since 21 November 2026 it's a **public** GitHub repository, https://github.com/ThotusPrime/lyubomirevtimov-lab, under his account ThotusPrime (`origin`, over SSH). Its commits show `code@lyubomirevtimov.com`, his global Git email, so anyone can read it there. **Push only `main`**, never `--all`, `--tags` or `--mirror`: the split brought 25 `design/*` tags with it, and they carry the private site repository's whole history.

The chats it was made in:

- **A claude.ai web chat with access to his Mac** (by 12 November) wrote the first version straight into the project files. It isn't on this Mac, so search claude.ai for it.
- **"Subdomain lab module deployment"** (Claude Code, 12 November) restyled it to match the site, kept it out of search results, deployed it and committed it.
- **The ticket work** (13 November): the fixed copies for tickets 1 to 4 and the token-usage exercise are dated that day, but no Claude Code chat on this Mac was active then, so it most likely happened in a claude.ai chat, where Claude acted as his tester.
- **"About section writing"** (Claude Code, 14 November), at its end: the ticket work was tidied into `_fixed.py` copies, the originals were restored, and the certificate plan below was recorded.

## The course

- **It's a crash course for anyone learning to troubleshoot an API**, from the terminal and from code. Decided on 21 November 2026, after he passed the interview it was built for: not a course for support workers. The tickets are reports from whoever's script fails (a team, a job's owner), with no customers, companies or cities. Instead of writing a reply to a customer, the learner checks themselves against a ticket's **Explain it** questions (the cause, the general rule, a prediction). Since 22 November 2026, at his request, a question their work already answers counts as answered: the tester (`TESTER.md`) reads the work first and asks only about real gaps, and a ticket with none left is done without a quiz.
- **It runs locally:** the course starts with cloning the repository, `npm ci`, `npm run setup` and `npm run dev`, so each learner has their own lab, keys and log.
- `practice/` is the course: two Python tools (`ask.py`, `batch.py`), `CONCEPTS.md`, ten tickets in `practice/tickets/` (1 to 8 in order, 9 and 10 bonuses), `HINTS.md` (three levels per ticket, then model answers), `TESTER.md` (a prompt that makes any AI chat question the learner afterwards) and `LOG.template.md`. The tickets are grouped by layer in the course README. On 21 November 2026, tickets 7 (a 422, from `argparse` without `type=int`) and 8 (a request id looked up in the lab's log, a `context_length_exceeded`) were added, and the bonuses moved from 7 and 8 to 9 and 10.
- `exercises/token-usage/` is the usage exercise: a log of 300 requests and a brief, `README.md`, whose hints are at the end of `HINTS.md`. It came from `~/Dev/intervew` on 21 November 2026. His own script for it, once `test.py` in Git, is now `solution.py` beside it, which Git ignores.
- **Tickets are solved with AI assistants switched off**, and an assistant comes back only afterwards, as the tester (`practice/README.md`). When he works a ticket here, don't hand him the fix. Point him to the method in the practice README, or to `HINTS.md` one level at a time, unless he asks for the answer.
- **His work on the tickets stays out of Git**, so the tickets stay broken for practice. Each fix goes in a copy beside the original (`ask_fixed.py` and so on), the tool output in `results*.csv` and the learner's log in `practice/LOG.md`, all ignored by `.gitignore`. Never edit or commit the original ticket files to hold a solution.
- **Status as of 22 November 2026:** he has done tickets 1 to 5, and none of 6 to 10 or the usage exercise. Ticket 5 was worked through in a Claude Code chat on 22 November, with him asking questions freely as he went: he measured `lab/large` at about 7 to 8.5 seconds with timed curl requests, and set the timeout to 15 in `ask_fixed.py`. His fixed copies exist only on his Mac. Ticket 1's copy holds the broken header plus a debug print, from a check he was asked to do after solving it, so it isn't the fix. The record of the hints he opened and his answers is on claude.ai, not on this Mac; Claude's memory for this project has the links.
- **Every ticket and the usage exercise now has its questions and model answers**, written on 21 November 2026 at his request, before he had done 5 to 10. Don't show him or summarise the hints or model answers for those until he asks for one. Ticket 8 needs the lab running locally, and his own `practice/.env` predates `LAB_BASE_URL`, so he needs `export LAB_BASE_URL=http://localhost:8788/v1` for it.
- **A certificate is undecided.** On 14 November he planned a page on lyubomirevtimov.com that works as a real certificate for this training: one of his own, which describes the course and how it can be checked, and never imitates any real certificate issuer. On 21 November he said he hasn't settled what to do about it, so build nothing for it until he does. The fixed copies and results are his only record of the work so far. Any such page belongs to the site's repository, not this one.

## Where it's going

Decided on 21 November 2026: once he has finished the course, the lab becomes a **free product** that anyone can download from GitHub and run on their own machine. Until then, the live demo stays exactly as it is.

- **The live demo stays unchanged while he works through it**, current keys included. Don't rotate the keys, change the live page or redeploy for this plan until he says he's done.
- **Learners make their own keys.** `npm run setup` (`scripts/setup.mjs`, built 21 November 2026) generates two random keys and writes `.dev.vars` (the `LAB_KEYS` JSON, practice and trial accounts) and `practice/.env`, including `LAB_BASE_URL=http://localhost:8788/v1`. It never overwrites a file, and stops if only one of the two exists. The reason: the Worker counts the rate limit per account (`account.id`), so a key published for the live lab would put every learner in one shared allowance and on one shared free-plan daily quota. Local keys also keep the course's habit that keys never go in Git.
- **The Worker in the repository is ahead of the live one.** Since 21 November 2026 it logs a failed request's error code (`"error"` in the log line), which ticket 8 relies on locally, and its header comment no longer names a company. Neither is deployed, and neither changes a response.
- **The live page will point to the repository.** It will say the documentation applies, but that trying the lab means downloading the repository from GitHub and running it locally, with a link. Not written yet, and it needs the repository to exist first.
- **Once he's done, harden the live demo.** Before it's presented as a product, review the live Worker for vulnerabilities and remove them. The starting points: its keys (rotate them, since they've been in use throughout the practice and may have been pasted into chats), what anyone can do with it, abuse of the free plan's daily quota, and the response headers. Nothing is decided beyond that.

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
- **No AI attribution in Git or on GitHub**: no `Co-Authored-By: Claude` trailer or similar in commit messages, and no "Generated with Claude Code" line or other credit in pull request titles or descriptions. Claude is credited on the site and in the lab's final documentation, which he'll have written once he's finished the course.
- **Stage files by name when committing**, never `git add .` or `git add -A`, so no keys or ticket work get swept in.
- He uses British spelling, and he will maintain this himself, so explain the trade-offs behind technical choices.
