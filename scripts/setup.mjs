// npm run setup: makes your own keys for the lab and writes the two files
// that hold them, both ignored by Git:
//
//   .dev.vars        the LAB_KEYS secret that `npm run dev` reads
//   practice/.env    the keys and the local address the Python tools use
//
// Each learner makes their own keys because the lab counts its rate limit per
// account: a shared key would put everyone in one allowance. It never
// overwrites either file. If both exist, there's nothing to do; if only one
// does, it stops, because new keys in one file wouldn't match the other.

import { randomBytes } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const devVars = join(root, '.dev.vars');
const practiceEnv = join(root, 'practice', '.env');

const hasDevVars = existsSync(devVars);
const hasPracticeEnv = existsSync(practiceEnv);

if (hasDevVars && hasPracticeEnv) {
	console.log('Your keys are already set up: .dev.vars and practice/.env both exist. Nothing changed.');
	process.exit(0);
}
if (hasDevVars || hasPracticeEnv) {
	const found = hasDevVars ? '.dev.vars' : 'practice/.env';
	const missing = hasDevVars ? 'practice/.env' : '.dev.vars';
	console.error(`${found} exists but ${missing} doesn't, and new keys in one wouldn't match the other.`);
	console.error(`Delete ${found} and run npm run setup again to start with fresh keys. Nothing changed.`);
	process.exit(1);
}

const newKey = () => 'lab_' + randomBytes(24).toString('hex');
const practiceKey = newKey();
const trialKey = newKey();

const keys = {
	[practiceKey]: { id: 'acct_practice', plan: 'pay-as-you-go', balance: 25 },
	[trialKey]: { id: 'acct_trial', plan: 'trial', balance: 0 },
};

// The 'wx' flag refuses to write if the file appeared in the meantime, and
// mode 0o600 keeps the keys readable by you alone.
const write = (path, text) => writeFileSync(path, text, { flag: 'wx', mode: 0o600 });

write(
	devVars,
	[
		'# The lab\'s API keys, read by `npm run dev`. Made by `npm run setup`. Git ignores this file.',
		`LAB_KEYS=${JSON.stringify(keys)}`,
		'',
	].join('\n'),
);
write(
	practiceEnv,
	[
		'# Your keys for the lab, made by `npm run setup`. Git ignores this file; don\'t commit or share it.',
		`LAB_API_KEY=${practiceKey}`,
		`LAB_TRIAL_KEY=${trialKey}`,
		'# Where the tools send their requests: your own lab, started with `npm run dev`.',
		'LAB_BASE_URL=http://localhost:8788/v1',
		'',
	].join('\n'),
);

console.log('Made two keys and wrote .dev.vars and practice/.env.');
console.log('Next: npm run dev, then follow practice/README.md in a second terminal.');
