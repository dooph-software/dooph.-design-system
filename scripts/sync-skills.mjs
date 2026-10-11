/**
 * sync-skills.mjs — keeps the agent skill mirrors identical to the canonical
 * skills.
 *
 * ## behavior
 * - Canonical: .agents/skills/<skill>/ (every directory in it, third-party
 *   skills included). Mirrors: .claude/skills/ and .agent/skills/.
 * - `node scripts/sync-skills.mjs` makes each mirror hold exactly the canonical
 *   skills as plain files: it copies every canonical file that is missing or
 *   different, and removes every mirror entry with no canonical source (a skill
 *   deleted from .agents/skills/, a stray file, a symlink). A mirror ROOT that
 *   is a symlink, a junction or a file is unlinked and rebuilt as a real
 *   directory. It prints one line per change.
 * - `node scripts/sync-skills.mjs --check` writes nothing. It compares each
 *   mirror to the canonical tree byte for byte (CRLF read as LF, so a Windows
 *   autocrlf clone does not fail), prints `stale <path> (<why>)` for each
 *   missing, extra, differing or symlinked entry, and exits 1; exits 0 when all
 *   match. scripts/check-conventions.mjs runs it inside `npm run lint`.
 * - Nothing outside the two mirror skill directories is read for writing or
 *   removal: `.claude/` and `.agent/` beside `skills/` are never touched.
 *
 * ## constraints
 * - Mirrors are real directories and files, never symlinks. The maintainer
 *   develops on Windows with core.symlinks=false, where a symlink checks out as
 *   a text file holding its target path (or, if absolute, points at one
 *   machine's clone), so the skill silently stops loading.
 * - Remove a mirror entry only after `lstat`/`readdir({withFileTypes})` and never
 *   follow a link: a symlink is removed with `unlinkSync`, so the delete cannot
 *   reach the canonical skill it points at and destroy the source of truth.
 *   This holds for the mirror roots themselves: a linked root is replaced,
 *   never walked or written through.
 * - Canonical is never written. A mirror edit is overwritten on the next sync;
 *   the fix for a wrong skill is always in .agents/skills/.
 * - A symlink inside .agents/skills/ is an error, not something to copy: its
 *   target is not part of the skill.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CANONICAL = ".agents/skills";
const MIRRORS = [".claude/skills", ".agent/skills"];
const check = process.argv.includes("--check");

const abs = (rel) => path.join(REPO, ...rel.split("/"));

/** CRLF -> LF for text; a file with a NUL byte is binary and compared as is. */
const normalise = (buf) => (buf.includes(0) ? buf : Buffer.from(buf.toString("latin1").replace(/\r\n/g, "\n"), "latin1"));

/**
 * Walk a directory without following links. Returns a Map of
 * relative posix path -> "file" | "dir" | "symlink". Symlinks are listed, never entered.
 */
function walk(root) {
  const out = new Map();
  if (!fs.lstatSync(root, { throwIfNoEntry: false })) return out;
  const rec = (dir, rel) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      const p = path.join(dir, e.name);
      if (e.isSymbolicLink()) out.set(r, "symlink");
      else if (e.isDirectory()) {
        out.set(r, "dir");
        rec(p, r);
      } else out.set(r, "file");
    }
  };
  rec(root, "");
  return out;
}

/** Remove one path without following it. */
function remove(p) {
  const st = fs.lstatSync(p, { throwIfNoEntry: false });
  if (!st) return;
  if (st.isSymbolicLink()) fs.unlinkSync(p);
  else if (st.isDirectory()) fs.rmSync(p, { recursive: true, force: true });
  else fs.unlinkSync(p);
}

// ── Canonical tree ────────────────────────────────────────────────────────────
const canonRoot = abs(CANONICAL);
if (!fs.existsSync(canonRoot)) {
  console.error(`${CANONICAL} does not exist`);
  process.exit(2);
}
const canon = walk(canonRoot);
const badLinks = [...canon].filter(([, k]) => k === "symlink").map(([r]) => `${CANONICAL}/${r}`);
if (badLinks.length) {
  console.error(`symlink inside ${CANONICAL} (not copied; replace it with real files):\n  ${badLinks.join("\n  ")}`);
  process.exit(2);
}
// Top-level entries that are not directories (a stray README) are not skills.
const skills = [...canon].filter(([r, k]) => k === "dir" && !r.includes("/")).map(([r]) => r);
const inSkill = (r) => skills.includes(r.split("/")[0]);

// ── Compare / sync ────────────────────────────────────────────────────────────
const problems = []; // { path, why }
let changes = 0;
const note = (msg) => {
  changes++;
  console.log(msg);
};

for (const mirror of MIRRORS) {
  const mRoot = abs(mirror);
  // The root itself is read with lstat too: a linked root (a symlink or a
  // Windows junction to .agents/skills) would make the mirror look identical
  // and send every write into canonical. It is unlinked and rebuilt, never entered.
  const st = fs.lstatSync(mRoot, { throwIfNoEntry: false });
  const rootKind = !st ? null : st.isSymbolicLink() ? "symlink" : st.isDirectory() ? "dir" : "file";
  if (rootKind === "symlink" || rootKind === "file") {
    const why = rootKind === "symlink" ? "the mirror root is a symlink, must be a real directory" : "the mirror root is a file, must be a directory";
    if (check) {
      problems.push({ path: mirror, why });
      continue;
    }
    remove(mRoot);
    note(`removed ${mirror} (${why})`);
  }
  const mine = rootKind === "dir" ? walk(mRoot) : new Map();
  if (!check) fs.mkdirSync(mRoot, { recursive: true });

  // Extra: anything in the mirror with no canonical counterpart of the same kind.
  // Shortest paths first, so a removed directory takes its children with it in one line.
  const extras = [...mine]
    .filter(([r, k]) => k === "symlink" || !inSkill(r) || canon.get(r) !== k)
    .sort((a, b) => a[0].length - b[0].length);
  const gone = new Set();
  for (const [r, k] of extras) {
    if ([...gone].some((g) => r.startsWith(`${g}/`))) continue; // its parent already goes
    const why = k === "symlink" ? "symlink, must be real files" : canon.has(r) ? `is a ${k}, canonical is a ${canon.get(r)}` : "extra, no canonical source";
    if (check) problems.push({ path: `${mirror}/${r}`, why });
    else {
      remove(path.join(mRoot, ...r.split("/")));
      note(`removed ${mirror}/${r} (${why})`);
    }
    gone.add(r);
    mine.delete(r);
  }
  for (const r of [...mine.keys()]) if ([...gone].some((g) => r.startsWith(`${g}/`))) mine.delete(r);

  // Missing or different: every canonical skill, directory and file.
  for (const [r, k] of canon) {
    const src = path.join(canonRoot, ...r.split("/"));
    const dst = path.join(mRoot, ...r.split("/"));
    if (k === "dir") {
      if (mine.get(r) === "dir") continue;
      if (check) problems.push({ path: `${mirror}/${r}`, why: "missing" });
      else {
        fs.mkdirSync(dst, { recursive: true });
        note(`created ${mirror}/${r}/`);
      }
      continue;
    }
    if (mine.get(r) === "file") {
      if (normalise(fs.readFileSync(src)).equals(normalise(fs.readFileSync(dst)))) continue;
      if (check) problems.push({ path: `${mirror}/${r}`, why: "differs from canonical" });
      else {
        fs.copyFileSync(src, dst);
        note(`updated ${mirror}/${r}`);
      }
    } else if (check) problems.push({ path: `${mirror}/${r}`, why: "missing" });
    else {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(src, dst);
      note(`copied ${mirror}/${r}`);
    }
  }
}

if (check) {
  for (const p of problems) console.log(`stale ${p.path} (${p.why})`);
  if (problems.length) console.log(`\nskill mirrors differ from ${CANONICAL}; run node scripts/sync-skills.mjs`);
  else console.log(`skill mirrors match ${CANONICAL} (${skills.length} skills x ${MIRRORS.length} mirrors)`);
  process.exit(problems.length ? 1 : 0);
}
console.log(changes ? `\nsynced ${skills.length} skills into ${MIRRORS.join(" and ")} (${changes} changes)` : `skill mirrors already match ${CANONICAL}`);
