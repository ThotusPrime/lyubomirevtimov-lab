// npm run previews: draws the pictures a link to the lab shows when it's
// posted somewhere (LinkedIn, Slack, a messenger), and writes
// src/previews.js, which tells the pages where they are.
//
// The same split as the main site's link previews (src/lib/preview.ts in
// ~/Dev/personal-blog): a course's pages get a large picture of their own,
// the course's row opened up, in the lab's colours, and every other page
// gets the site's mark, small, beside the text. Each picture is drawn from
// the course's own module (its title, tagline and facts), the colours in
// public/lab.css and the fonts and favicon in public/, so nothing is drawn
// by hand. Run it again after changing any of those, or adding a course,
// and commit what it writes.
//
// A picture's file name ends in a fingerprint of the picture, so a changed
// picture gets a new address: a platform that reads the page again fetches
// the new one rather than a copy it kept under the old name, and posts
// already made keep theirs.
//
// Like npm run certificate, it uses the Chrome already installed (headless,
// with a throwaway profile), so the repository gains no dependency for a
// few pictures a year. Set CHROME to its path if it isn't in the usual
// place on a Mac. It needs no running lab.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COURSES } from '../src/courses/index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = (path) => readFileSync(join(root, path));

const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(chrome)) {
	console.error(`Chrome isn't at ${chrome}. Set CHROME to its path and run this again.`);
	process.exit(1);
}

// The light theme's colours, read from public/lab.css so the pictures
// follow a change to the lab's look.
const css = file('public/lab.css').toString();
const colour = (name) => {
	const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`));
	if (!match) throw new Error(`public/lab.css has no --${name} colour for the link previews.`);
	return match[1];
};
const c = { bg: colour('bg'), card: colour('card-bg'), ink: colour('card-ink'), muted: colour('card-muted'), accent: colour('card-accent') };

// The fonts go into the page itself, since a page opened from a file can't
// load fonts from another file.
const font = (family, weight, name) =>
	`@font-face { font-family: '${family}'; font-weight: ${weight}; src: url(data:font/woff2;base64,${file(`public/fonts/${name}`).toString('base64')}) format('woff2'); }`;
const fonts = [font('IBM Plex Sans', 400, 'ibm-plex-sans-latin-400-normal.woff2'), font('IBM Plex Sans', 600, 'ibm-plex-sans-latin-600-normal.woff2')].join('\n');

// The site's mark in its light blue, from the favicon.
const favicon = file('public/favicon.svg').toString();
const viewBox = favicon.match(/viewBox="([^"]+)"/)?.[1];
const shapes = favicon.match(/<g>([\s\S]*?)<\/g>/)?.[1];
if (!viewBox || !shapes) throw new Error('public/favicon.svg no longer has the shape the link previews read (a viewBox and one <g>).');
const mark = (size) =>
	`<svg width="${size}" height="${size}" viewBox="${viewBox}" fill="none" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><g stroke="${c.accent}">${shapes}</g></svg>`;

const esc = (value) => String(value).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

const doc = (width, height, style, body) => `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><style>
${fonts}
* { box-sizing: border-box; margin: 0; }
html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: ${c.bg}; font-family: 'IBM Plex Sans', sans-serif; -webkit-font-smoothing: antialiased; }
${style}
</style></head><body>${body}</body></html>`;

// A course: its row on the hub, opened up, as its own page shows it. The
// blue edge down the left, the kind, the title, the line under it, and the
// facts at the bottom, with the site's mark in the corner.
const courseHtml = (course) =>
	doc(
		1200,
		630,
		`.panel { position: absolute; inset: 48px; background: ${c.card}; color: ${c.ink}; border-left: 12px solid ${c.accent}; padding: 56px 64px 52px; display: flex; flex-direction: column; }
.top { display: flex; justify-content: space-between; align-items: flex-start; }
.kind { font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: ${c.muted}; }
.title { margin-top: 22px; font-weight: 600; font-size: 84px; line-height: 1.04; letter-spacing: -0.025em; text-wrap: balance; }
.tagline { margin-top: 24px; max-width: 900px; font-size: 30px; line-height: 1.4; color: ${c.muted}; }
.meta { margin-top: auto; font-size: 24px; color: ${c.muted}; }`,
		`<div class="panel">
	<div class="top"><p class="kind">${esc(course.meta[0])}</p>${mark(64)}</div>
	<h1 class="title">${esc(course.title)}</h1>
	<p class="tagline">${esc(course.tagline)}</p>
	<p class="meta">${course.meta.slice(1).map(esc).join(' &nbsp;·&nbsp; ')}</p>
</div>`,
	);

// Every other page: the mark alone, small, as on the main site.
const markHtml = () => doc(300, 300, 'body { display: flex; align-items: center; justify-content: center; }', mark(180));

// Draws a page at exactly its own size, with Chrome, and returns the PNG.
const profile = mkdtempSync(join(tmpdir(), 'lab-previews-'));
function shoot(html, width, height) {
	const page = join(profile, 'page.html');
	const out = join(profile, 'shot.png');
	writeFileSync(page, html);
	execFileSync(
		chrome,
		[
			'--headless',
			`--user-data-dir=${profile}`,
			'--no-first-run',
			'--disable-extensions',
			'--hide-scrollbars',
			'--force-device-scale-factor=1',
			`--window-size=${width},${height}`,
			'--virtual-time-budget=3000',
			`--screenshot=${out}`,
			`file://${page}`,
		],
		{ stdio: ['ignore', 'ignore', 'pipe'] },
	);
	const png = readFileSync(out);
	// A PNG's width and height sit at bytes 16 to 24 of its header.
	const [w, h] = [png.readUInt32BE(16), png.readUInt32BE(20)];
	if (w !== width || h !== height) throw new Error(`Chrome drew a ${w}×${h} picture instead of ${width}×${height}.`);
	return png;
}

const dir = join(root, 'public', 'previews');
mkdirSync(dir, { recursive: true });
const written = [];
function save(name, png, width, height, alt, size) {
	const path = `/previews/${name}-${createHash('sha256').update(png).digest('hex').slice(0, 10)}.png`;
	writeFileSync(join(root, 'public', path), png);
	written.push(path);
	return { path, width, height, alt, size };
}

let previews;
try {
	previews = {
		mark: save('mark', shoot(markHtml(), 300, 300), 300, 300, 'The mark of Lyubomir Evtimov’s site.', 'small'),
		courses: Object.fromEntries(
			COURSES.map((course) => [
				course.slug,
				save(course.slug, shoot(courseHtml(course), 1200, 630), 1200, 630, `${course.title}. ${course.tagline}`, 'large'),
			]),
		),
	};
} finally {
	rmSync(profile, { recursive: true, force: true });
}

// Pictures from earlier runs go, so the folder holds only what the pages use.
for (const name of readdirSync(dir)) {
	if (!written.includes(`/previews/${name}`)) rmSync(join(dir, name));
}

writeFileSync(
	join(root, 'src', 'previews.js'),
	`// Written by npm run previews (scripts/previews.mjs). Don't edit it by hand:
// change the course or the lab's look, and run that again.
export const PREVIEWS = ${JSON.stringify(previews, null, '\t')};
`,
);

for (const path of written) console.log(`Wrote public${path}`);
console.log('Wrote src/previews.js');
