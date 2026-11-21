/*
 * The lab: a practice inference API on lab.lyubomirevtimov.com.
 *
 * It copies the shape of an OpenAI-compatible inference API, the kind
 * behind most AI features: list the models, check the account, send
 * messages to a model and get an answer back with its token count and cost.
 * The models are stand-ins (simple text rules, not AI). Everything around
 * them behaves like a real API: authentication, validation, billing, a rate
 * limit, latency and streaming, each failing with its own status code.
 *
 * No storage and nothing billed by usage. The fonts, favicon and robots.txt
 * are static files in public/, served by Cloudflare before the Worker runs.
 * Every response, static or not, carries a noindex header, so search engines
 * can read the lab but never list it. The keys come from the LAB_KEYS
 * secret, and the rate limit from the RATE_LIMITER binding in wrangler.jsonc.
 * Every request is logged as one JSON line, readable with `wrangler tail`.
 */

const RATE_LIMIT = { requests: 5, perSeconds: 10 };

// Prices are US dollars per million tokens.
const MODELS = {
	'lab/small': {
		description: 'Fast and cheap. Answers with the first sentence of your message.',
		contextTokens: 4096,
		inputPrice: 0.1,
		outputPrice: 0.3,
		delayMs: 250,
		sentences: 1,
	},
	'lab/large': {
		description: 'Slow, like a big model. Answers with the first two sentences.',
		contextTokens: 32768,
		inputPrice: 0.9,
		outputPrice: 2.7,
		delayMs: 7000,
		sentences: 2,
	},
};

const RETIRED = {
	'lab/legacy-chat': { retiredOn: '2026-10-01', replacement: 'lab/small' },
};

const ROLES = ['system', 'user', 'assistant'];
const DEFAULT_MAX_TOKENS = 256;

export default {
	async fetch(request, env, ctx) {
		const started = Date.now();
		const requestId = 'req_' + randomHex(12);
		const url = new URL(request.url);
		const log = { request_id: requestId, method: request.method, path: url.pathname };

		let response;
		try {
			response = await route(request, env, url, log);
		} catch (error) {
			log.exception = String(error && error.stack ? error.stack : error);
			response = apiError(500, 'server_error', 'internal_error', 'Something went wrong on our side. Quote the request id if you contact support.');
		}

		// Log an error's code next to its status, as a provider's own logs would,
		// so a request id quoted later says what went wrong.
		if (response.status >= 400) {
			const failure = await response.clone().json().catch(() => null);
			if (failure && failure.error && failure.error.code) log.error = failure.error.code;
		}

		const headers = new Headers(response.headers);
		headers.set('x-request-id', requestId);
		headers.set('X-Robots-Tag', 'noindex, nofollow');
		log.status = response.status;
		log.ms = Date.now() - started;
		console.log(JSON.stringify(log));
		return new Response(response.body, { status: response.status, statusText: STATUS_TEXT[response.status] || '', headers });
	},
};

const STATUS_TEXT = {
	200: 'OK',
	204: 'No Content',
	400: 'Bad Request',
	401: 'Unauthorized',
	402: 'Payment Required',
	404: 'Not Found',
	405: 'Method Not Allowed',
	415: 'Unsupported Media Type',
	422: 'Unprocessable Entity',
	429: 'Too Many Requests',
	500: 'Internal Server Error',
};

async function route(request, env, url, log) {
	const path = url.pathname.replace(/\/+$/, '') || '/';
	const method = request.method;

	if (path === '/' && (method === 'GET' || method === 'HEAD')) return docsPage(url);
	if (path === '/favicon.ico') return new Response(null, { status: 204 });

	const endpoints = {
		'/v1/models': { GET: listModels },
		'/v1/account': { GET: getAccount },
		'/v1/chat/completions': { POST: chatCompletions },
	};

	const endpoint = endpoints[path];
	if (!endpoint) {
		const hint = path.startsWith('/v1/')
			? 'Check the path against the list of endpoints on https://lab.lyubomirevtimov.com/.'
			: 'All API routes start with /v1/.';
		return apiError(404, 'invalid_request_error', 'unknown_route', `Unknown route ${method} ${url.pathname}. ${hint}`);
	}
	const handler = endpoint[method];
	if (!handler) {
		const allowed = Object.keys(endpoint).join(', ');
		return apiError(405, 'invalid_request_error', 'method_not_allowed', `${method} is not allowed on ${path}. Use ${allowed}.`, null, { Allow: allowed });
	}

	const auth = authenticate(request, env);
	if (auth.error) return auth.error;
	log.account = auth.account.id;
	return handler(request, env, auth.account, log);
}

// --- Authentication -------------------------------------------------------

function authenticate(request, env) {
	const header = request.headers.get('Authorization');
	if (!header) {
		return { error: apiError(401, 'authentication_error', 'missing_api_key', "No API key provided. Send it in the Authorization header: 'Authorization: Bearer <key>'.") };
	}
	if (!/^Bearer /.test(header)) {
		return { error: apiError(401, 'authentication_error', 'invalid_auth_scheme', "The Authorization header must use the Bearer scheme: 'Authorization: Bearer <key>'.") };
	}
	const key = header.slice('Bearer '.length);
	const account = loadKeys(env)[key];
	if (!account) {
		return { error: apiError(401, 'authentication_error', 'invalid_api_key', `Invalid API key provided: ${maskKey(key)}.`) };
	}
	return { account };
}

function loadKeys(env) {
	try {
		return JSON.parse(env.LAB_KEYS || '{}');
	} catch {
		return {};
	}
}

function maskKey(key) {
	if (!key) return '(empty)';
	if (key.length <= 12) return key.slice(0, 3) + '…';
	return key.slice(0, 9) + '…' + key.slice(-4);
}

// --- Endpoints ------------------------------------------------------------

function listModels() {
	const data = Object.entries(MODELS).map(([id, m]) => ({
		id,
		object: 'model',
		owned_by: 'lab',
		description: m.description,
		context_tokens: m.contextTokens,
		pricing: { input_per_million_usd: m.inputPrice, output_per_million_usd: m.outputPrice },
	}));
	return json({ object: 'list', data });
}

function getAccount(request, env, account) {
	return json({
		object: 'account',
		id: account.id,
		plan: account.plan,
		balance_usd: account.balance,
		rate_limit: { requests: RATE_LIMIT.requests, per_seconds: RATE_LIMIT.perSeconds },
	});
}

async function chatCompletions(request, env, account, log) {
	if (env.RATE_LIMITER) {
		const { success } = await env.RATE_LIMITER.limit({ key: account.id });
		if (!success) {
			log.rate_limited = true;
			return apiError(
				429,
				'rate_limit_error',
				'rate_limit_exceeded',
				`Rate limit reached for ${account.id}: ${RATE_LIMIT.requests} requests per ${RATE_LIMIT.perSeconds} seconds. Retry after ${RATE_LIMIT.perSeconds} seconds.`,
				null,
				{
					'Retry-After': String(RATE_LIMIT.perSeconds),
					'x-ratelimit-limit-requests': String(RATE_LIMIT.requests),
					'x-ratelimit-window-seconds': String(RATE_LIMIT.perSeconds),
				},
			);
		}
	}

	const contentType = (request.headers.get('Content-Type') || '').toLowerCase();
	if (!contentType.startsWith('application/json')) {
		return apiError(415, 'invalid_request_error', 'unsupported_media_type', `The request body must be JSON with 'Content-Type: application/json'. This request had: ${contentType || 'no Content-Type'}.`);
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return apiError(400, 'invalid_request_error', 'invalid_json', 'We could not parse the JSON body of your request. Check that it is valid JSON.');
	}

	const invalid = validate(body);
	if (invalid) return invalid;

	const modelId = body.model;
	log.model = modelId;
	if (RETIRED[modelId]) {
		const r = RETIRED[modelId];
		return apiError(404, 'invalid_request_error', 'model_not_found', `The model '${modelId}' was retired on ${r.retiredOn}. Use '${r.replacement}' instead. GET /v1/models lists the models available now.`, 'model');
	}
	const model = MODELS[modelId];
	if (!model) {
		return apiError(404, 'invalid_request_error', 'model_not_found', `The model '${modelId}' does not exist. GET /v1/models lists the models available.`, 'model');
	}

	if (!(account.balance > 0)) {
		return apiError(402, 'billing_error', 'insufficient_balance', `Your account balance is $${Number(account.balance || 0).toFixed(2)}. Add credit to continue.`);
	}

	const maxTokens = body.max_tokens === undefined ? DEFAULT_MAX_TOKENS : body.max_tokens;
	const promptText = body.messages.map((m) => m.content).join('\n');
	const promptTokens = countTokens(promptText) + 4 * body.messages.length;
	if (promptTokens + maxTokens > model.contextTokens) {
		return apiError(400, 'invalid_request_error', 'context_length_exceeded', `This model's maximum context length is ${model.contextTokens} tokens. Your request has ${promptTokens} prompt tokens plus max_tokens ${maxTokens}.`, 'messages');
	}

	const lastUser = [...body.messages].reverse().find((m) => m.role === 'user');
	let answer = respond(lastUser ? lastUser.content : '', model.sentences);
	let finishReason = 'stop';
	if (countTokens(answer) > maxTokens) {
		answer = answer.slice(0, maxTokens * 4).trimEnd();
		finishReason = 'length';
	}
	const completionTokens = countTokens(answer);
	const usage = {
		prompt_tokens: promptTokens,
		completion_tokens: completionTokens,
		total_tokens: promptTokens + completionTokens,
		estimated_cost: round((promptTokens * model.inputPrice + completionTokens * model.outputPrice) / 1e6),
	};
	log.tokens = usage.total_tokens;

	const id = 'chatcmpl-' + randomHex(12);
	const created = Math.floor(Date.now() / 1000);

	if (body.stream === true) {
		return streamAnswer({ id, created, modelId, answer, finishReason, usage, delayMs: model.delayMs });
	}

	await sleep(model.delayMs);
	return json({
		id,
		object: 'chat.completion',
		created,
		model: modelId,
		choices: [{ index: 0, message: { role: 'assistant', content: answer }, finish_reason: finishReason }],
		usage,
	});
}

function validate(body) {
	const bad = (param, message) => apiError(422, 'invalid_request_error', 'invalid_value', message, param);

	if (body === null || typeof body !== 'object' || Array.isArray(body)) {
		return bad(null, 'The request body must be a JSON object.');
	}
	if (body.model === undefined) return bad('model', "Missing required field 'model'.");
	if (typeof body.model !== 'string') return bad('model', "'model' must be a string.");
	if (body.messages === undefined) return bad('messages', "Missing required field 'messages'.");
	if (!Array.isArray(body.messages) || body.messages.length === 0) {
		return bad('messages', "'messages' must be a non-empty list of {role, content} objects.");
	}
	for (let i = 0; i < body.messages.length; i++) {
		const m = body.messages[i];
		if (m === null || typeof m !== 'object' || Array.isArray(m)) {
			return bad(`messages[${i}]`, `messages[${i}] must be an object with 'role' and 'content'.`);
		}
		if (!ROLES.includes(m.role)) {
			return bad(`messages[${i}].role`, `messages[${i}].role must be one of ${ROLES.join(', ')}; got ${JSON.stringify(m.role)}.`);
		}
		if (typeof m.content !== 'string') {
			return bad(`messages[${i}].content`, `messages[${i}].content must be a string.`);
		}
	}
	if (body.max_tokens !== undefined && !(Number.isInteger(body.max_tokens) && body.max_tokens >= 1 && body.max_tokens <= 2048)) {
		return bad('max_tokens', "'max_tokens' must be a whole number from 1 to 2048.");
	}
	if (body.temperature !== undefined && !(typeof body.temperature === 'number' && body.temperature >= 0 && body.temperature <= 2)) {
		return bad('temperature', "'temperature' must be a number from 0 to 2.");
	}
	if (body.stream !== undefined && typeof body.stream !== 'boolean') {
		return bad('stream', "'stream' must be true or false.");
	}
	return null;
}

// --- The stand-in models --------------------------------------------------

function respond(text, sentences) {
	const clean = String(text).replace(/\s+/g, ' ').trim();
	if (!clean) return 'There was nothing to answer.';
	const parts = clean.match(/[^.!?]+[.!?]*/g) || [clean];
	return parts.slice(0, sentences).join(' ').replace(/\s+/g, ' ').trim();
}

function countTokens(text) {
	return Math.ceil(String(text).length / 4);
}

function streamAnswer({ id, created, modelId, answer, finishReason, usage, delayMs }) {
	const { readable, writable } = new TransformStream();
	const writer = writable.getWriter();
	const encoder = new TextEncoder();
	const send = (obj) => writer.write(encoder.encode(`data: ${typeof obj === 'string' ? obj : JSON.stringify(obj)}\n\n`));
	const chunk = (delta, finish, extra) => ({
		id,
		object: 'chat.completion.chunk',
		created,
		model: modelId,
		choices: [{ index: 0, delta, finish_reason: finish }],
		...extra,
	});

	(async () => {
		await sleep(Math.min(delayMs, 3000));
		await send(chunk({ role: 'assistant', content: '' }, null));
		const words = answer.split(' ');
		for (let i = 0; i < words.length; i++) {
			await send(chunk({ content: (i === 0 ? '' : ' ') + words[i] }, null));
			await sleep(40);
		}
		await send(chunk({}, finishReason, { usage }));
		await send('[DONE]');
		await writer.close();
	})();

	return new Response(readable, {
		headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache' },
	});
}

// --- Helpers --------------------------------------------------------------

function apiError(status, type, code, message, param = null, extraHeaders = {}) {
	return json({ error: { message, type, code, param } }, status, extraHeaders);
}

function json(data, status = 200, extraHeaders = {}) {
	return new Response(JSON.stringify(data, null, 2) + '\n', {
		status,
		headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
	});
}

function randomHex(bytes) {
	const a = new Uint8Array(bytes);
	crypto.getRandomValues(a);
	return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function round(n) {
	return Math.round(n * 1e8) / 1e8;
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- The documentation page -----------------------------------------------
// Laid out like an item's own page on the site: the same header and footer,
// and the card opened up in the record sleeve styling (src/styles/theme.css
// and base.css), with the sleeve's blue across the top and the reference on
// white below. The fonts and favicon are copies of the site's, in public/.

function docsPage(url) {
	const base = `${url.origin}/v1`;
	const year = new Date().getFullYear();
	const models = Object.entries(MODELS)
		.map(([id, m]) => `<tr><td><code>${id}</code></td><td>${m.description}</td><td>${m.contextTokens.toLocaleString('en-GB')}</td><td>$${m.inputPrice} / $${m.outputPrice}</td></tr>`)
		.join('');

	const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>The lab · Lyubomir Evtimov</title>
<meta name="description" content="A practice inference API for troubleshooting, with stand-in models.">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/charis-sil-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/ibm-plex-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<style>
@font-face { font-family: 'Charis SIL'; font-weight: 400; font-style: normal; font-display: swap; src: url(/fonts/charis-sil-latin-400-normal.woff2) format('woff2'); }
@font-face { font-family: 'IBM Plex Sans'; font-weight: 400; font-style: normal; font-display: swap; src: url(/fonts/ibm-plex-sans-latin-400-normal.woff2) format('woff2'); }
@font-face { font-family: 'IBM Plex Sans'; font-weight: 600; font-style: normal; font-display: swap; src: url(/fonts/ibm-plex-sans-latin-600-normal.woff2) format('woff2'); }
:root {
	--bg: #f4f4f1; --ink: #12131c; --muted: #4f5160; --accent: #1d3fc4;
	--sleeve: #1d3fc4; --sleeve-ink: #ffffff; --sleeve-muted: #dfe4f7;
	--card-bg: #ffffff; --card-ink: #12131c; --card-muted: #55586a; --card-line: #dcdee8; --card-accent: #1d3fc4;
	--fill: color-mix(in srgb, var(--card-line) 30%, var(--card-bg));
	--font-reading: 'Charis SIL', Georgia, serif;
	--font-ui: 'IBM Plex Sans', system-ui, sans-serif;
	--font-mono: ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
	--text-body: 1.0625rem; --gutter: 1rem; --measure: 38rem; --bucket: 52rem;
	--card-pad: clamp(1.25rem, 4vw, 3rem);
	color-scheme: light dark;
}
@media (min-width: 40rem) { :root { --text-body: 1.125rem; --gutter: 2rem; } }
@media (prefers-color-scheme: dark) {
	:root {
		--bg: #0c0d14; --ink: #e9ebf5; --muted: #a7abc2; --accent: #9db0ff;
		--card-bg: #161824; --card-ink: #e9ebf5; --card-muted: #a9adc4; --card-line: #2c2f42; --card-accent: #9db0ff;
	}
}
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
body { margin: 0; min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); color: var(--ink); font-family: var(--font-reading); font-size: var(--text-body); line-height: 1.6; overflow-wrap: break-word; }
h1, h2, p, table { margin: 0; }
a { color: inherit; text-decoration-thickness: 1px; text-underline-offset: 0.2em; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.skip-link { position: absolute; left: var(--gutter); top: -10rem; z-index: 10; padding: 0.5rem 0.75rem; background: var(--ink); color: var(--bg); font-family: var(--font-ui); font-size: 0.875rem; }
.skip-link:focus { top: 0.5rem; }
.site-header, .bucket, .site-footer { width: 100%; max-width: calc(var(--bucket) + 2 * var(--gutter)); margin-inline: auto; padding-inline: var(--gutter); }
.site-header { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; padding-block: 1.5rem; font-family: var(--font-ui); font-size: 0.9375rem; font-weight: 600; }
.site-header a { text-decoration: none; }
.site-header a:hover { text-decoration: underline; }
.bucket { flex: 1; padding-block: clamp(2rem, 8vw, 5rem); }
.site-footer { padding-block: 2rem; color: var(--muted); font-family: var(--font-ui); font-size: 0.8125rem; }
.card { overflow: hidden; background: var(--card-bg); color: var(--card-ink); }
.card-head { padding: var(--card-pad); padding-bottom: calc(var(--card-pad) * 1.25); margin-bottom: var(--card-pad); background: var(--sleeve); color: var(--sleeve-ink); }
.card-body { padding: 0 var(--card-pad) var(--card-pad); }
.card-kind { font-family: var(--font-ui); font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sleeve-muted); }
.card-title { margin-top: 0.75rem; font-family: var(--font-ui); font-weight: 600; font-size: clamp(2.5rem, 8vw, 4.5rem); line-height: 0.98; letter-spacing: -0.035em; text-transform: lowercase; text-wrap: balance; }
.card-subtitle { margin-top: 0.75rem; max-width: var(--measure); font-family: var(--font-ui); font-size: 1.125rem; color: var(--sleeve-muted); }
.prose { max-width: var(--measure); }
.prose > * + * { margin-top: 1.1em; }
.prose a { color: var(--card-accent); }
.prose h2 { margin-top: 3.5rem; font-family: var(--font-ui); font-size: 1.75rem; font-weight: 600; line-height: 1.3; letter-spacing: -0.02em; text-wrap: balance; }
.prose h2:first-child { margin-top: 0; }
.prose h2 + * { margin-top: 0.75rem; }
code, pre { font-family: var(--font-mono); font-size: 0.875rem; }
code { background: var(--fill); padding: 0.1em 0.35em; }
pre { background: var(--fill); padding: 1rem; overflow-x: auto; line-height: 1.5; }
pre code { background: none; padding: 0; }
.table-scroll { overflow-x: auto; max-width: 100%; }
.prose table { width: 100%; min-width: 32rem; border-collapse: collapse; font-family: var(--font-ui); font-size: 0.875rem; line-height: 1.45; }
.prose th, .prose td { padding: 0.6rem 0.75rem 0.6rem 0; text-align: left; vertical-align: top; border-bottom: 1px solid var(--card-line); }
.prose th { font-weight: 600; border-bottom-color: currentColor; }
.prose td code { font-size: 0.8125rem; }
</style>
</head>
<body>
<a class="skip-link" href="#main">Skip to the content</a>
<header class="site-header">
	<a class="site-name" href="https://lyubomirevtimov.com/">Lyubomir Evtimov</a>
	<nav aria-label="Site"><a href="https://lyubomirevtimov.com/about/">About</a></nav>
</header>
<main id="main" class="bucket">
<article class="card card-full">
	<header class="card-head">
		<p class="card-kind">Practice API</p>
		<h1 class="card-title">The lab</h1>
		<p class="card-subtitle">An inference API built for practising troubleshooting. The models are stand-ins. The authentication, tokens, billing, limits and latency behave like the real thing.</p>
	</header>
	<div class="card-body prose">
		<h2>Base URL</h2>
		<pre tabindex="0"><code>${base}</code></pre>

		<h2>Authentication</h2>
		<p>Every <code>/v1</code> request needs a key in the <code>Authorization</code> header, with the Bearer scheme:</p>
		<pre tabindex="0"><code>Authorization: Bearer &lt;your key&gt;</code></pre>

		<h2>Endpoints</h2>
		<div class="table-scroll" tabindex="0" role="region" aria-label="Endpoints"><table>
			<thead><tr><th>Method and path</th><th>What it does</th></tr></thead>
			<tbody>
				<tr><td><code>GET /v1/models</code></td><td>Lists the models, with their context size and prices</td></tr>
				<tr><td><code>GET /v1/account</code></td><td>Shows your account, balance and rate limit</td></tr>
				<tr><td><code>POST /v1/chat/completions</code></td><td>Sends messages to a model and returns its answer, token usage and cost. JSON body: <code>model</code>, <code>messages</code> (a list of <code>role</code> and <code>content</code>), and optionally <code>max_tokens</code> (1 to 2,048, default 256), <code>temperature</code> (0 to 2) and <code>stream</code></td></tr>
			</tbody>
		</table></div>

		<h2>Models</h2>
		<div class="table-scroll" tabindex="0" role="region" aria-label="Models"><table>
			<thead><tr><th>Model</th><th>Behaviour</th><th>Context (tokens)</th><th>Price per million tokens, in / out</th></tr></thead>
			<tbody>${models}</tbody>
		</table></div>

		<h2>Limits</h2>
		<p>${RATE_LIMIT.requests} chat completion requests per ${RATE_LIMIT.perSeconds} seconds for each account. Past that, the API answers <code>429</code> with a <code>Retry-After</code> header in seconds.</p>

		<h2>Errors</h2>
		<p>Errors come back as JSON: <code>{"error": {"message", "type", "code", "param"}}</code>. Every response carries an <code>x-request-id</code> header; quote it when you report a problem.</p>
		<div class="table-scroll" tabindex="0" role="region" aria-label="Errors"><table>
			<thead><tr><th>Status</th><th>Meaning</th></tr></thead>
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
			</tbody>
		</table></div>
	</div>
</article>
</main>
<footer class="site-footer"><p>© ${year} Lyubomir Evtimov · Lab built with Claude</p></footer>
</body>
</html>
`;
	return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
