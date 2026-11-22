/*
 * The first course: troubleshooting an API, from the terminal and from code.
 * Two pages: the course page (what it is, what it covers, how it works and
 * how to get it) and the reference for the practice API in src/api.js.
 *
 * The course itself lives in the repository (practice/ and exercises/), and
 * runs on the learner's own computer: these pages describe it and point to
 * it. Nothing here gives a ticket's cause away, since a learner may read the
 * page before starting.
 */

import { MODELS, RATE_LIMIT } from '../api.js';
import { AUTHOR, back, esc, LAB, LICENCE, page, shortDate } from '../frame.js';
import { PREVIEWS } from '../previews.js';

export const slug = 'troubleshooting-an-api';
export const title = 'Troubleshooting an API';
export const published = '2026-11-22';
export const summary =
	'Find out why an API call fails and what fixes it, from the terminal and from Python, on a practice API you run on your own computer: ten tickets from people whose scripts have stopped working, and one log to dig through.';
// The line under the title, on the course page and its link preview.
export const tagline = 'A crash course in finding out why a call to an HTTP API fails and what fixes it, from the terminal and from Python code.';
export const meta = ['Course', '10 tickets and an exercise', 'About 5 hours', 'curl and Python', 'Free'];

// What search results show under the course page's title.
const DESCRIPTION =
	'A free course in troubleshooting an HTTP API from the terminal and from Python: ten tickets from people whose scripts have stopped working, on a practice API you run on your own computer.';

// What the course teaches, as its page says it, for its structured data.
const TEACHES = [
	'Calling an API with curl and reading the status, headers and body of what comes back',
	'Getting the real error out of a script that hides it',
	'Telling whether a problem is in the request, the traffic, the account or the protocol',
	'Explaining what went wrong and why, not only fixing it',
];
const PREREQUISITES = 'A terminal, Git, Node.js 24, Python 3 and curl. No knowledge of this API beforehand.';

const REPOSITORY = 'https://github.com/ThotusPrime/lyubomirevtimov-lab';
const COURSE_README = `${REPOSITORY}/blob/main/practice/README.md`;
const LOCAL_BASE = 'http://localhost:8788/v1';

// The tickets by layer, the same grouping as the course's README.
const LAYERS = [
	{ layer: 'The request', looks: 'What the script sends: its headers, its body, the names and values in it', tickets: [[1, 'The key is right, we checked'], [2, 'It worked last month'], [3, 'Your API returns broken responses'], [7, 'It breaks when we set a limit']] },
	{ layer: 'Traffic and time', looks: 'How often it sends, and how long it waits', tickets: [[4, 'It dies halfway through'], [5, 'The large model is down']] },
	{ layer: 'The account', looks: 'What the key is allowed to do', tickets: [[6, 'Payment required?']] },
	{ layer: "The server's side", looks: "What the API's own log knows that the response didn't say", tickets: [[8, 'All we have is the request id'], ['Exercise', 'The usage spike']] },
	{ layer: 'The protocol', looks: "Responses and libraries that don't work the way the script expects", tickets: [[9, 'Streaming broke our script'], [10, 'We switched from OpenAI and nothing works']] },
];

export const pages = {
	'': coursePage,
	'docs/': docsPage,
};

function coursePage(url) {
	const layers = LAYERS.map(
		(l) => `<div><dt>${esc(l.layer)}</dt><dd><p>${esc(l.looks)}.</p><ul class="ticket-list">${l.tickets
			.map(([n, name]) => `<li><span class="ticket-number">${typeof n === 'number' ? `Ticket ${n}${n > 8 ? ', bonus' : ''}` : esc(n)}</span> “${esc(name)}”</li>`)
			.join('')}</ul></dd></div>`,
	).join('\n\t\t\t');

	return page({
		url,
		title,
		description: DESCRIPTION,
		preview: PREVIEWS.courses[slug],
		// What search engines read the page as: a free course, by him, under
		// the repository's licence. Only facts the page itself states.
		structured: {
			'@type': 'Course',
			name: title,
			description: DESCRIPTION,
			url: `${LAB}/${slug}/`,
			inLanguage: 'en-GB',
			datePublished: published,
			provider: AUTHOR,
			creator: AUTHOR,
			isAccessibleForFree: true,
			license: LICENCE,
			teaches: TEACHES,
			coursePrerequisites: PREREQUISITES,
			offers: [{ '@type': 'Offer', category: 'Free' }],
			// About 5 hours: his own times on tickets 5 to 10, the slow ones halved for
			// the time he wasn't focused, the midpoint of the shortest and longest
			// times the course's 11 exercises (CLAUDE.md has the sums).
			hasCourseInstance: [{ '@type': 'CourseInstance', courseMode: 'Online', courseWorkload: 'PT5H' }],
			hasPart: { '@type': 'TechArticle', name: 'API reference', url: `${LAB}/${slug}/docs/` },
		},
		body: `${back('/', 'The lab')}
<article class="panel">
	<header class="panel-head">
		<p class="panel-kind">Course <span aria-hidden="true">·</span> <time datetime="${published}">${shortDate(published)}</time></p>
		<h1 class="panel-title">${esc(title)}</h1>
		<p class="panel-subtitle">${esc(tagline)}</p>
		<dl class="facts">
			<div><dt>Made of</dt><dd>Eight tickets in order, two bonus tickets and one exercise</dd></div>
			<div><dt>Takes</dt><dd>About 5 hours at your own pace, after 10 minutes of setting up</dd></div>
			<div><dt>You need</dt><dd>A terminal, Git, Node.js 24, Python 3 and curl</dd></div>
			<div><dt>Costs</dt><dd>Nothing. It runs on your own computer</dd></div>
		</dl>
	</header>
	<div class="panel-body prose">
		<h2>What it is</h2>
		<p>The course comes with its own API, which you run on your own computer. It works like an OpenAI-compatible inference API, the kind behind most AI features, and the only thing about it that isn't real is the models, which are simple text rules rather than AI. Everything around them, the keys, the billing, the rate limit, the latency and the streaming, fails the way a real API fails, each with its own status code and error.</p>
		<p>Each ticket is a report from someone whose script has stopped working: the command they ran, the error they got and usually their guess at the cause, which is often wrong, so it's a lead rather than a fact. You reproduce the problem, find the cause and fix their script, and then check whether you understood what went wrong or only patched it.</p>

		<h2>What it covers</h2>
		<p>By the end you'll be able to call an API with curl and read the status, headers and body of what comes back, get the real error out of a script that hides it, tell whether a problem is in the request, the traffic, the account or the protocol, and explain what went wrong and why rather than only fix it. These carry over to any HTTP API, and you need no knowledge of this one beforehand.</p>
		<p>The tickets are grouped by the layer the problem is in:</p>
		<dl class="layers">
			${layers}
		</dl>
		<p>Before the tickets, a short set of concepts covers what a request and a response are made of, status codes, the headers worth knowing, JSON and environment variables, and the happy path shows what a working call looks like before anything breaks.</p>

		<h2>How it works</h2>
		<p>You can take it alone or with an AI assistant as your teacher, and either way you read every error yourself, because that's the skill the course teaches. Built-in help, such as <code>--help</code>, <code>man</code> and Python's <code>help()</code>, is allowed, and learning to use it is part of the point. Each ticket has hints in three levels, to open one at a time once you've been stuck for five minutes.</p>
		<p>Alone, you solve each ticket with AI assistants switched off, since an assistant would read the error for you. With a teacher, the course has a prompt that makes an AI chat give you one ticket at a time, a hint only when you ask for one and an explanation of what you ask about, and never write the fix for you, while the AI in your editor stays switched off.</p>
		<p>A ticket is done when its own test passes, usually the original command working, and when you can answer its questions on the cause, the rule behind it and what would happen in a related case. Your work often answers them already. Once you've fixed a ticket, an AI assistant comes back as your tester, or your teacher becomes one: the course has a prompt that makes it read your work and question you only on what the work doesn't show, without giving the answers away. Model answers are at the end of each ticket's hints.</p>

		<h2>Get it</h2>
		<p>The course is a repository on GitHub. Clone it and start your own lab, from wherever you keep projects:</p>
		<pre tabindex="0"><code>git clone ${REPOSITORY}.git
cd lyubomirevtimov-lab
npm ci
npm run setup
npm run dev</code></pre>
		<p><code>npm run setup</code> makes two API keys that only you have, and <code>npm run dev</code> starts the lab at <code>http://localhost:8788</code>, with these pages and the API under <code>/v1</code>. The course itself starts in <a href="${COURSE_README}"><code>practice/README.md</code></a>. The commands are written for macOS and Linux, and on Windows they work as written in WSL.</p>
		<p><a href="${REPOSITORY}">The repository on GitHub</a></p>
		<p>It's free to use, change and share for any purpose, including training at work, as long as you credit me and say what you changed, under <a href="${LICENCE}" rel="license">CC BY 4.0</a>.</p>

		<h2>The API</h2>
		<p>The <a href="/${slug}/docs/">API reference</a> lists the endpoints, the models, the limits and every error the API returns. It's the documentation the tickets' authors had in front of them, and you'll keep it open while you work.</p>
	</div>
</article>`,
	});
}

function docsPage(url) {
	const models = Object.entries(MODELS)
		.map(([id, m]) => `<tr><td><code>${id}</code></td><td>${esc(m.description)}</td><td>${m.contextTokens.toLocaleString('en-GB')}</td><td>$${m.inputPrice} / $${m.outputPrice}</td></tr>`)
		.join('');

	return page({
		url,
		title: `API reference · ${title}`,
		description: `The reference for the practice API in ${title}, a free course: its endpoints, models, limits and errors.`,
		// The course's own picture: a link to the reference is a link to the course.
		preview: PREVIEWS.courses[slug],
		structured: {
			'@type': 'TechArticle',
			headline: `API reference for ${title}`,
			url: `${LAB}/${slug}/docs/`,
			inLanguage: 'en-GB',
			author: AUTHOR,
			license: LICENCE,
			isPartOf: { '@type': 'Course', name: title, url: `${LAB}/${slug}/` },
		},
		body: `${back(`/${slug}/`, title)}
<article class="panel">
	<header class="panel-head">
		<p class="panel-kind">Reference</p>
		<h1 class="panel-title">The API</h1>
		<p class="panel-subtitle">An inference API built for practising troubleshooting, compatible with OpenAI's chat completions API. The models are stand-ins. The authentication, tokens, billing, limits and latency behave like the real thing.</p>
	</header>
	<div class="panel-body prose">
		<h2>Base URL</h2>
		<pre tabindex="0"><code>${LOCAL_BASE}</code></pre>
		<p>The API runs on your own computer, started with <code>npm run dev</code> from the course's repository, so every learner has their own, with their own keys and their own log.</p>

		<h2>Authentication</h2>
		<p>Every <code>/v1</code> request needs a key in the <code>Authorization</code> header, with the Bearer scheme:</p>
		<pre tabindex="0"><code>Authorization: Bearer &lt;your key&gt;</code></pre>

		<h2>Endpoints</h2>
		<div class="table-scroll" tabindex="0" role="region" aria-label="Endpoints"><table>
			<thead><tr><th scope="col">Method and path</th><th scope="col">What it does</th></tr></thead>
			<tbody>
				<tr><td><code>GET /v1/models</code></td><td>Lists the models, with their context size and prices</td></tr>
				<tr><td><code>GET /v1/account</code></td><td>Shows your account, balance and rate limit</td></tr>
				<tr><td><code>POST /v1/chat/completions</code></td><td>Sends messages to a model and returns its answer, token usage and cost. JSON body: <code>model</code>, <code>messages</code> (a list of <code>role</code> and <code>content</code>), and optionally <code>max_tokens</code> (1 to 2,048, default 256), <code>temperature</code> (0 to 2) and <code>stream</code> (see below)</td></tr>
			</tbody>
		</table></div>

		<h2>Streaming</h2>
		<p>With <code>"stream": true</code>, the answer arrives in pieces as it's written instead of all at once at the end, so it starts arriving sooner. A streamed answer comes in a different format from the usual JSON body.</p>

		<h2>Models</h2>
		<div class="table-scroll" tabindex="0" role="region" aria-label="Models"><table>
			<thead><tr><th scope="col">Model</th><th scope="col">Behaviour</th><th scope="col">Context (tokens)</th><th scope="col">Price per million tokens, in / out</th></tr></thead>
			<tbody>${models}</tbody>
		</table></div>

		<h2>Limits</h2>
		<p>${RATE_LIMIT.requests} chat completion requests per ${RATE_LIMIT.perSeconds} seconds for each account. Past that, the API answers <code>429</code> with a <code>Retry-After</code> header in seconds.</p>

		<h2>Errors</h2>
		<p>Errors come back as JSON: <code class="wraps">{"error": {"message", "type", "code", "param"}}</code>. Every response carries an <code>x-request-id</code> header; quote it when you report a problem.</p>
		<div class="table-scroll" tabindex="0" role="region" aria-label="Errors"><table>
			<thead><tr><th scope="col">Status</th><th scope="col">Meaning</th></tr></thead>
			<tbody>
				<tr><td>400</td><td>The body isn't valid JSON, or the request is too long for the model's context</td></tr>
				<tr><td>401</td><td>The key is missing, not sent with the Bearer scheme, or not valid</td></tr>
				<tr><td>402</td><td>The account has no balance left</td></tr>
				<tr><td>404</td><td>The route or the model doesn't exist</td></tr>
				<tr><td>405</td><td>The route exists but not with this method</td></tr>
				<tr><td>415</td><td>The body wasn't sent as <code>application/json</code></td></tr>
				<tr><td>422</td><td>A field is missing or has the wrong type or value; <code>param</code> names it</td></tr>
				<tr><td>429</td><td>Rate limit reached; wait for <code>Retry-After</code> seconds</td></tr>
				<tr><td>500</td><td>A fault on the server's side</td></tr>
				<tr><td>503</td><td>The lab has no keys yet: run <code>npm run setup</code>, then start it again</td></tr>
			</tbody>
		</table></div>
	</div>
</article>`,
	});
}
