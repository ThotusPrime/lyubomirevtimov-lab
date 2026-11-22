/*
 * The practice API that the troubleshooting course runs on, served under /v1.
 *
 * It copies the shape of an OpenAI-compatible inference API, the kind
 * behind most AI features: list the models, check the account, send
 * messages to a model and get an answer back with its token count and cost.
 * The models are stand-ins (simple text rules, not AI). Everything around
 * them behaves like a real API: authentication, validation, billing, a rate
 * limit, latency and streaming, each failing with its own status code.
 *
 * The keys come from the LAB_KEYS secret (.dev.vars locally, made by
 * `npm run setup`), and the rate limit from the RATE_LIMITER binding in
 * wrangler.jsonc. The API reference page (src/courses/troubleshooting-an-api.js)
 * reads MODELS and RATE_LIMIT from here, so the two never disagree.
 */

// Where the course's reference lives, for the hint in an unknown route's error.
const DOCS_PATH = '/troubleshooting-an-api/docs/';

export const RATE_LIMIT = { requests: 5, perSeconds: 10 };

// Prices are US dollars per million tokens.
export const MODELS = {
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

export async function api(request, env, url, log) {
	const path = url.pathname.replace(/\/+$/, '') || '/';
	const method = request.method;

	const endpoints = {
		'/v1/models': { GET: listModels },
		'/v1/account': { GET: getAccount },
		'/v1/chat/completions': { POST: chatCompletions },
	};

	const endpoint = endpoints[path];
	if (!endpoint) {
		const hint = path.startsWith('/v1/')
			? `Check the path against the list of endpoints in the API reference, ${DOCS_PATH}.`
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

export function apiError(status, type, code, message, param = null, extraHeaders = {}) {
	return json({ error: { message, type, code, param } }, status, extraHeaders);
}

function json(data, status = 200, extraHeaders = {}) {
	return new Response(JSON.stringify(data, null, 2) + '\n', {
		status,
		headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
	});
}

export function randomHex(bytes) {
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
