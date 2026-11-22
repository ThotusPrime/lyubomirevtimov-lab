// npm run certificate -- <id>: makes a certificate's PDF from its page, so the
// two can't say different things. With `npm run dev` running, it prints
// http://localhost:8788/certificates/<id>/ with Chrome, headless, and writes
// public/certificates/<id>.pdf, which is committed and served as a static
// file beside the page. The page's print styles (public/lab.css) make each
// of its two sheets one landscape A4 page.
//
// It uses the Chrome already installed rather than a library such as
// Puppeteer, so the repository gains no dependency for a file made a few
// times a year. Set CHROME to its path if it isn't in the usual place on a
// Mac. Chrome stamps each PDF with the time it was made, so two runs never
// give byte-identical files, even from the same page.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
if (!id || !/^[a-z0-9-]+$/.test(id)) {
	console.error('Usage: npm run certificate -- <id>, for example npm run certificate -- tapi-2026-001');
	process.exit(1);
}

const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(chrome)) {
	console.error(`Chrome isn't at ${chrome}. Set CHROME to its path and run this again.`);
	process.exit(1);
}

const url = `http://localhost:8788/certificates/${id}/`;
const check = await fetch(url, { headers: { Accept: 'text/html' } }).catch(() => null);
if (!check) {
	console.error('The lab isn\'t running. Start it with npm run dev in another terminal, then run this again.');
	process.exit(1);
}
if (!check.ok) {
	console.error(`${url} answered ${check.status}. Is there a certificate with the id ${id} in src/certificates.js?`);
	process.exit(1);
}

const out = join(root, 'public', 'certificates', `${id}.pdf`);
mkdirSync(dirname(out), { recursive: true });

// A throwaway profile, so the run never touches the Chrome you browse with.
const profile = mkdtempSync(join(tmpdir(), 'lab-certificate-'));
try {
	execFileSync(
		chrome,
		[
			'--headless',
			`--user-data-dir=${profile}`,
			'--no-first-run',
			'--disable-extensions',
			'--no-pdf-header-footer',
			// Gives the fonts time to load before the page is printed.
			'--virtual-time-budget=5000',
			`--print-to-pdf=${out}`,
			url,
		],
		{ stdio: ['ignore', 'ignore', 'pipe'] },
	);
} finally {
	rmSync(profile, { recursive: true, force: true });
}

console.log(`Wrote ${relative(root, out)} (${Math.round(statSync(out).size / 1024)} KB) from ${url}`);
