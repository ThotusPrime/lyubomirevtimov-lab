/*
 * Certificates the lab has issued, each at /certificates/<id>/, with the same
 * certificate as a PDF beside it at /certificates/<id>.pdf (a static file in
 * public/certificates/, made from the page by `npm run certificate`).
 *
 * A certificate is checked where it was issued, so this page is the
 * certificate, and the PDF is a copy to keep or attach. The pages are kept out
 * of search results and the sitemap, and nothing in the lab links to them:
 * certificates aren't offered to learners, and the course pages don't
 * mention them. They're reached from the holder's own links.
 *
 * Each certificate's facts are written out here in full rather than read from
 * its course's module, so it says what was true when it was issued even after
 * the course changes.
 */

import { esc, LAB, page } from './frame.js';

const CERTIFICATES = [
	{
		id: 'tapi-2026-001',
		holder: 'Lyubomir Evtimov',
		course: {
			title: 'Troubleshooting an API',
			href: '/troubleshooting-an-api/',
			about: 'Finding out why a call to an HTTP API fails and what fixes it, from the terminal and from Python code.',
		},
		completed: '2026-11-22',
		facts: [
			['Completed', '22 November 2026'],
			['Worked on', '13 and 22 November 2026'],
			['Workload', 'About 5 hours'],
			['Made of', '10 tickets and 1 exercise'],
		],
		// The course's layers, with the modules in each.
		topics: [
			['The request', 'Tickets 1, 2, 3 and 7'],
			['Traffic and time', 'Tickets 4 and 5'],
			['The account', 'Ticket 6'],
			['The server’s side', 'Ticket 8 and the usage exercise'],
			['The protocol', 'Tickets 9 and 10'],
		],
		signatory: 'Author of the course, for the lab',
		selfIssued:
			"Self-issued: I built this course and then took it, with an AI assistant as my teacher, so instead of an organisation’s name to vouch for it, the proof for each module follows.",
		// One row per module: what it teaches, what passing it takes, what the
		// work showed, the help used, and the day. Tickets 1 to 4 are from the
		// study doc kept on 13 November, the rest from the chat of 22 November.
		modules: [
			['1', 'The key is right, we checked', 'Reading a 401 instead of trusting the report', 'Their command answering, with the shell unchanged', 'Found the header’s missing <code>Bearer</code> scheme by comparing with a working script', 'None', '13 Nov'],
			['2', 'It worked last month', 'Telling a missing model from a missing route in a 404', 'Their command answering without <code>--model</code>', 'Printed the error body and replaced the retired default model', 'None', '13 Nov'],
			['3', 'Your API returns broken responses', 'Checking the status before reading the body', 'A summary printed, and a failed call showing the API’s error', 'Found the 415 by printing the body, set the content type and stopped on errors', 'A nudge on headers and the body', '13 Nov'],
			['4', 'It dies halfway through', 'Rate limits and <code>Retry-After</code>', 'Every row finishing, with other errors still stopping it', 'Found the limit by printing the body, and set out the fix: wait <code>Retry-After</code> and retry, only on a 429', 'None. Beyond the course: the retry code, written with Claude', '13 Nov'],
			['5', 'The large model is down', 'Timeouts, sized from measurements', 'An answer from <code>lab/large</code>, with a hang still giving up', 'Timed <code>lab/large</code> at 7 to 8.5 seconds with curl and set the timeout to 15', 'Teaching when asked: reading <code>time</code>, sizing a timeout', '22 Nov'],
			['6', 'Payment required?', 'What a key’s account allows', 'The cause shown with their key, and no code changed', 'Found the trial account’s $0 balance with <code>/v1/account</code> and reproduced the 402', 'None', '22 Nov'],
			['7', 'It breaks when we set a limit', 'Reading a 422 and the field it names', 'Their command answering, with and without <code>--max-tokens</code>', 'Printed the 422’s body and sent <code>max_tokens</code> as a whole number', 'None', '22 Nov'],
			['8', 'All we have is the request id', 'Finding a request in the server’s log', 'The cause found from the request id, and a fix that gets every file through', 'Traced the id to <code>context_length_exceeded</code> in the lab’s log, and chose the large model, or the small one with large as a fallback', 'A correction: the prompt and the answer share the context', '22 Nov'],
			['9', 'Streaming broke our script', 'Reading a streamed response', 'The answer printed as it arrives', 'Found the stream’s format: <code>data:</code> lines, <code>delta</code> chunks and <code>[DONE]</code>', 'Teaching: reading a stream line by line. Beyond the course: the streaming loop, written with Claude', '22 Nov'],
			['10', 'We switched from OpenAI and nothing works', 'Pointing an SDK at another provider', 'Their command answering, with the key only in <code>LAB_API_KEY</code>', 'Passed the key to the OpenAI client, beside <code>base_url</code>', 'A pointer to the line where the client is built', '22 Nov'],
			['Exercise', 'The usage spike', 'Totals from a log, and the rows that skew them', 'The right top three users', 'Wrote the script, and it gives the right top three, with failed rows left out', 'None', '13 Nov'],
		],
		warning: 'This page gives each ticket’s cause away. If you mean to take the course, leave it until you’ve finished.',
		checked: [
			'The course teaches troubleshooting, not writing Python, so a ticket counts as solved once its cause is found and the change it needs is set out. My teacher, Claude, an AI assistant, gave me each ticket, gave hints and taught only when I asked, and checked my work against what the ticket asks for, asking only the questions my work hadn’t already answered. Where I went on to write the code, the row says so.',
			'The working files and the chats are private, and I can show them on request.',
		],
	},
];

export const pages = Object.fromEntries(CERTIFICATES.map((c) => [`/certificates/${c.id}/`, (url) => certificatePage(url, c)]));

// "lab.lyubomirevtimov.com/certificates/<id>/", the address as it's printed.
function printedAddress(id) {
	return `${LAB.replace(/^https:\/\//, '')}/certificates/${id}/`;
}

// The top line both sheets share: the issuer on the left, the number on the right.
function sheetTop(c) {
	return `<header class="cert-top">
		<p class="cert-issuer"><span class="cert-issuer-name">The lab</span> <span class="cert-issuer-address">${esc(LAB.replace(/^https:\/\//, ''))}</span></p>
		<p class="cert-number">Certificate no. <span>${esc(c.id)}</span></p>
	</header>`;
}

function certificatePage(url, c) {
	const facts = c.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
	const topics = c.topics.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
	// The module cells hold a little markup (code), written in this file.
	const rows = c.modules
		.map(([n, name, teaches, pass, work, help, date]) => {
			const label = /^\d+$/.test(n) ? `Ticket ${n}${Number(n) > 8 ? ', bonus' : ''}` : n;
			return `<tr><th scope="row"><span class="cert-module-number">${esc(label)}</span> “${esc(name)}”</th><td>${teaches}</td><td>${pass}</td><td>${work}</td><td>${help}</td><td class="cert-date">${esc(date)}</td></tr>`;
		})
		.join('\n\t\t\t\t');
	const address = printedAddress(c.id);

	return page({
		url,
		title: `Certificate ${c.id}`,
		description: `${c.holder} completed ${c.course.title}, a course in the lab, on ${c.facts[0][1]}. Self-issued, with the proof for each module.`,
		noindex: true,
		body: `<article class="certificate">
	<section class="cert-sheet cert-front" aria-labelledby="cert-holder">
		${sheetTop(c)}
		<div class="cert-main">
			<p class="cert-kind">Certificate of completion</p>
			<h1 class="cert-holder" id="cert-holder">${esc(c.holder)}</h1>
			<p class="cert-has">has completed the course</p>
			<p class="cert-course"><a href="${esc(c.course.href)}">${esc(c.course.title)}</a></p>
			<p class="cert-about">${esc(c.course.about)}</p>
		</div>
		<div class="cert-details">
			<div>
				<h2 class="cert-label">Topics</h2>
				<dl class="cert-list">${topics}</dl>
			</div>
			<dl class="cert-facts">${facts}</dl>
		</div>
		<footer class="cert-foot">
			<div class="cert-sign">
				<p class="cert-sign-name">${esc(c.holder)}</p>
				<p class="cert-sign-role">${esc(c.signatory)}</p>
			</div>
			<div class="cert-verify">
				<p class="cert-label">Check it at</p>
				<p class="cert-verify-address">${esc(address)}</p>
			</div>
		</footer>
		<p class="cert-self">${esc(c.selfIssued)}</p>
	</section>
	<section class="cert-sheet cert-proof" aria-labelledby="cert-proof-title">
		${sheetTop(c)}
		<h2 class="cert-proof-title" id="cert-proof-title">Proof of completion</h2>
		<p class="cert-warning">${esc(c.warning)}</p>
		<div class="table-scroll" tabindex="0" role="region" aria-label="Proof of completion, by module"><table class="cert-table">
			<thead><tr><th scope="col">Module</th><th scope="col">Teaches</th><th scope="col">To pass</th><th scope="col">What the work showed</th><th scope="col">Help used</th><th scope="col">Date</th></tr></thead>
			<tbody>
				${rows}
			</tbody>
		</table></div>
		<div class="cert-checked">${c.checked.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
	</section>
	<p class="cert-download"><a href="/certificates/${esc(c.id)}.pdf">The certificate as a PDF</a>, to keep or attach. This page is the certificate: a copy anywhere else, or a PDF that says something this page doesn’t, isn’t it.</p>
</article>`,
	});
}
