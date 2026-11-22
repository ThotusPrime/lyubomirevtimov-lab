/*
 * The frame every page of the lab shares: the <head>, the main site's header
 * (his name, linking home, and About), the bucket the page sits in, and a
 * one-line footer. It's the main site's empty bucket, without the crate its
 * home page fills it with. The styles are in public/lab.css, a static file
 * Cloudflare serves without running the Worker.
 */

import { PREVIEWS } from './previews.js';

const SITE = 'https://lyubomirevtimov.com';

// The lab's own address, for canonical links, the sitemap and structured
// data. It's fixed rather than read from the request, so a learner's local
// copy still names the live pages as the ones that count.
export const LAB = 'https://lab.lyubomirevtimov.com';
export const LICENCE = 'https://creativecommons.org/licenses/by/4.0/';
export const AUTHOR = { '@type': 'Person', name: 'Lyubomir Evtimov', url: SITE + '/' };

// Pages carry no scripts and load nothing from anywhere else, so the policy
// can be the strictest one: styles, fonts and the favicon from the lab itself.
const PAGE_HEADERS = {
	'Content-Type': 'text/html; charset=utf-8',
	'Content-Security-Policy': "default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// Escapes text for HTML. Everything the pages show is written in this
// repository, but titles and summaries pass through here anyway, so a stray
// "<" or "&" in one can't break a page.
export function esc(value) {
	return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// 22 November 2026 -> "22 Nov 2026", the way a list of messages shows a date.
export function shortDate(iso) {
	return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// A page in the frame. `structured` is what the page is, for search engines
// (schema.org, as JSON-LD), built only from facts already on the page.
// `noindex` keeps a page out of search results, for the 404 page.
// `preview` is the picture a link to the page shows when it's posted
// somewhere (src/previews.js, drawn by npm run previews): a course's own for
// its pages, and the site's mark, small, for every other page.
export function page({ url, title, description, body, status = 200, structured, noindex = false, preview = PREVIEWS.mark }) {
	const fullTitle = title ? `${title} · The lab` : 'The lab · Lyubomir Evtimov';
	const year = new Date().getFullYear();
	const canonical = LAB + url.pathname;
	// A "<" inside the data could otherwise close the script element early.
	const structuredJson = structured && JSON.stringify({ '@context': 'https://schema.org', ...structured }).replace(/</g, '\\u003c');

	const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '' : `<link rel="canonical" href="${esc(canonical)}">\n`}<meta property="og:site_name" content="The lab">
<meta property="og:locale" content="en_GB">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title || 'The lab')}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
${preview ? previewTags(preview) : ''}<meta name="color-scheme" content="light dark">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/charis-sil-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/ibm-plex-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/lab.css">
${structuredJson ? `<script type="application/ld+json">${structuredJson}</script>\n` : ''}</head>
<body>
<a class="skip-link" href="#main">Skip to the content</a>
<header class="site-header">
	<a class="site-name" href="${SITE}/">Lyubomir Evtimov</a>
	<nav aria-label="Site"><a href="${SITE}/about/">About</a></nav>
</header>
<main id="main" class="bucket">
${body}
</main>
<footer class="site-footer"><p>© ${year} Lyubomir Evtimov · Courses under <a href="${LICENCE}" rel="license">CC BY 4.0</a> · Lab built with Claude</p></footer>
</body>
</html>
`;
	return new Response(html, { status, headers: PAGE_HEADERS });
}

// The link preview's tags. The picture's address is on the live lab even in
// a local copy, like the canonical link, since only the live one can be
// fetched by LinkedIn or Slack.
function previewTags(preview) {
	return `<meta property="og:image" content="${esc(LAB + preview.path)}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="${preview.width}">
<meta property="og:image:height" content="${preview.height}">
<meta property="og:image:alt" content="${esc(preview.alt)}">
<meta name="twitter:card" content="${preview.size === 'large' ? 'summary_large_image' : 'summary'}">
`;
}

// The way back from a page to the one above it, above the panel.
export function back(href, label) {
	return `<p class="back"><a href="${esc(href)}"><span aria-hidden="true">←</span> ${esc(label)}</a></p>`;
}

export function notFound(url) {
	return page({
		url,
		title: 'Not found',
		description: 'There is no page at this address.',
		status: 404,
		noindex: true,
		body: `${back('/', 'The lab')}
<article class="panel">
	<header class="panel-head">
		<p class="panel-kind">404</p>
		<h1 class="panel-title">Nothing at this address</h1>
		<p class="panel-subtitle">There's no page at <code>${esc(url.pathname)}</code>. The lab's courses are listed on its first page.</p>
	</header>
</article>`,
	});
}
