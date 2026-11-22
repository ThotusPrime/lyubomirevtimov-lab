/*
 * The lab, lab.lyubomirevtimov.com: a hub of courses, each one free to
 * download and run on your own computer. The same Worker runs the live hub
 * and every learner's own copy, started with `npm run dev`.
 *
 *   /                          the hub, a list of the courses (src/hub.js)
 *   /<slug>/ and below         a course's pages (src/courses/)
 *   /v1/...                    the practice API of the troubleshooting
 *                              course (src/api.js)
 *
 * The styles, fonts, favicon and robots.txt are static files in public/,
 * served by Cloudflare before the Worker runs. Search engines may list the
 * pages, and /sitemap.xml lists them; the API's responses, redirects and
 * 404s carry a noindex header. No storage and nothing billed by usage. Every request is
 * logged as one JSON line: in the `npm run dev` terminal locally, and
 * through `npm run tail` for the live lab.
 */

import { api, apiError, randomHex } from './api.js';
import { COURSES } from './courses/index.js';
import { LAB, notFound } from './frame.js';
import { hub } from './hub.js';

export default {
	async fetch(request, env, ctx) {
		const started = Date.now();
		const requestId = 'req_' + randomHex(12);
		const url = new URL(request.url);
		const log = { request_id: requestId, method: request.method, path: url.pathname };

		let response;
		try {
			response = pages(request, url) || (await api(request, env, url, log));
		} catch (error) {
			log.exception = String(error && error.stack ? error.stack : error);
			response = apiError(500, 'server_error', 'internal_error', 'Something went wrong on our side. Quote the request id if you contact support.');
		}

		// Log an error's code next to its status, as a provider's own logs would,
		// so a request id quoted later says what went wrong.
		if (response.status >= 400 && (response.headers.get('Content-Type') || '').startsWith('application/json')) {
			const failure = await response.clone().json().catch(() => null);
			if (failure && failure.error && failure.error.code) log.error = failure.error.code;
		}

		const headers = new Headers(response.headers);
		headers.set('x-request-id', requestId);
		// Only the pages and the sitemap are for search engines: the API's
		// JSON, redirects and 404s are kept out of their results.
		const contentType = headers.get('Content-Type') || '';
		const listable = response.status === 200 && /^(text\/html|application\/xml)/.test(contentType);
		if (!listable) headers.set('X-Robots-Tag', 'noindex');
		log.status = response.status;
		log.ms = Date.now() - started;
		console.log(JSON.stringify(log));
		return new Response(response.body, { status: response.status, statusText: STATUS_TEXT[response.status] || '', headers });
	},
};

const STATUS_TEXT = {
	200: 'OK',
	204: 'No Content',
	301: 'Moved Permanently',
	400: 'Bad Request',
	401: 'Unauthorized',
	402: 'Payment Required',
	404: 'Not Found',
	405: 'Method Not Allowed',
	415: 'Unsupported Media Type',
	422: 'Unprocessable Entity',
	429: 'Too Many Requests',
	500: 'Internal Server Error',
	503: 'Service Unavailable',
};

// Every page, by its address: the hub, and each course's pages under its slug.
const PAGES = { '/': hub };
for (const course of COURSES) {
	for (const [sub, render] of Object.entries(course.pages)) PAGES[`/${course.slug}/${sub}`] = render;
}

// Answers a request for a page, or returns null to hand it to the API.
function pages(request, url) {
	const path = url.pathname;
	if (path === '/favicon.ico') return new Response(null, { status: 204 });
	if (request.method !== 'GET' && request.method !== 'HEAD') return null;
	if (path === '/v1' || path.startsWith('/v1/')) return null;

	if (path === '/sitemap.xml') return sitemap();
	if (PAGES[path]) return PAGES[path](url);
	// A page's address without its closing slash goes to the one with it, so
	// each page has one address. The Location is relative because under
	// `wrangler dev` the request's origin is the live hostname from the route
	// in wrangler.jsonc, not localhost.
	if (PAGES[path + '/']) return new Response(null, { status: 301, headers: { Location: path + '/' + url.search } });

	// Anything else is a page that doesn't exist for a browser, and the API's
	// own JSON 404 for curl and scripts, which tells them API routes start
	// with /v1/.
	const accept = request.headers.get('Accept') || '';
	if (accept.includes('text/html')) return notFound(url);
	return null;
}

// Every page, for search engines, with the day its course went up.
function sitemap() {
	const newest = COURSES.map((c) => c.published).sort().at(-1);
	const lastmod = { '/': newest };
	for (const course of COURSES) {
		for (const sub of Object.keys(course.pages)) lastmod[`/${course.slug}/${sub}`] = course.published;
	}
	const urls = Object.keys(PAGES)
		.map((path) => `\t<url><loc>${LAB}${path}</loc><lastmod>${lastmod[path]}</lastmod></url>`)
		.join('\n');
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
