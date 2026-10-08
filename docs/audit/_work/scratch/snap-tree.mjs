// Per-batch patches without committing or staging.
// Writes the current working tree (tracked + untracked, honouring .gitignore) to a git TREE object using a throwaway
// index file, so the real index, HEAD and branches are untouched. Then diffs it against the previous snapshot.
// Usage (repo root): node docs/audit/_work/scratch/snap-tree.mjs <NN-batch-name>
//   → appends "<name> <tree>" to docs/audit/_work/patches/trees.txt
//   → writes docs/audit/_work/patches/<name>.patch = diff(previous tree → this tree), excluding docs/audit/
// Apply/revert a batch later:  git apply [-R] docs/audit/_work/patches/<name>.patch
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

const name = process.argv[2];
if (!name) { console.error('usage: snap-tree.mjs <NN-batch-name>'); process.exit(1); }
const dir = 'docs/audit/_work/patches';
fs.mkdirSync(dir, { recursive: true });
const idx = path.join(os.tmpdir(), `ds-snap-index-${process.pid}`);
const env = { ...process.env, GIT_INDEX_FILE: idx };
execSync('git read-tree HEAD', { env });
execSync('git add -A -- .', { env, stdio: ['ignore', 'ignore', 'ignore'] });
const tree = execSync('git write-tree', { env }).toString().trim();
fs.rmSync(idx, { force: true });

const log = path.join(dir, 'trees.txt');
const prev = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).pop()?.split(' ')[1] : null;
const base = prev || execSync('git show -s --format=%T HEAD').toString().trim();
const patch = execSync(`git diff --binary ${base} ${tree} -- . ":(exclude)docs/audit"`, { maxBuffer: 1 << 28 }).toString();
fs.writeFileSync(path.join(dir, `${name}.patch`), patch);
fs.appendFileSync(log, `${name} ${tree}\n`);
const stat = execSync(`git diff --shortstat ${base} ${tree} -- . ":(exclude)docs/audit"`).toString().trim();
console.log(`${name}: tree ${tree.slice(0, 10)} (base ${base.slice(0, 10)}) — ${stat || 'no changes'}`);
