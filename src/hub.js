/*
 * The hub: the lab's first page, a list of its courses, newest first. Each
 * course is one row, like a message in an inbox: the title and date on the
 * first line, a summary under it, and a line of facts. A new course goes on
 * top and pushes the others down. Opening one opens its own page.
 */

import { COURSES } from './courses/index.js';
import { esc, LAB, page, shortDate } from './frame.js';

export function hub(url) {
	const newestFirst = [...COURSES].sort((a, b) => b.published.localeCompare(a.published));
	const rows = newestFirst
		.map(
			(c) => `<li class="message">
		<h2 class="message-title"><a href="/${esc(c.slug)}/">${esc(c.title)}</a></h2>
		<p class="message-date"><time datetime="${esc(c.published)}">${esc(shortDate(c.published))}</time></p>
		<p class="message-summary">${esc(c.summary)}</p>
		<p class="message-meta">${c.meta.map(esc).join(' <span aria-hidden="true">·</span> ')}</p>
	</li>`,
		)
		.join('\n\t');

	return page({
		url,
		description: 'Courses for learning a technical skill by doing it, free to download and run on your own computer.',
		// The list of courses, the form search engines read a page of courses in.
		structured: {
			'@type': 'ItemList',
			name: 'The lab',
			itemListElement: newestFirst.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `${LAB}/${c.slug}/` })),
		},
		body: `<header class="hub-head">
	<h1 class="hub-title">The lab</h1>
	<p class="hub-intro">Courses I've built for learning a technical skill by doing it, each one free to download and run on your own computer.</p>
</header>
<h2 class="sr-only">Courses</h2>
<ul class="inbox">
	${rows}
</ul>`,
	});
}
