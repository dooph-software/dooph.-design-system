#!/usr/bin/env bash
# make-consumer-sandbox.sh <dir> [--with-skills]
#
# Creates a consumer-app sandbox for ONE consumer behaviour-scenario run
# (scenarios.md "Consumer fixture"; run-consumer.sh calls this). The source is
# the template app at ../ds-consumer-template: Next.js App Router, React 19,
# Tailwind v4, TypeScript, with @dooph-software/design-system installed from a
# tarball vendored at vendor/dooph-software-design-system-<ver>.tgz
# (dependency "file:vendor/…", so `npm install <anything>` in the sandbox keeps
# working).
#
# - Exports the template's committed tree (`git archive HEAD`) into <dir>.
# - DS_TARBALL=<path> (optional) replaces the vendored tarball first, e.g. a
#   fresh pack-ds.sh build after the docs pass; the lockfile's integrity for
#   the package is recomputed.
# - Default (baseline, RED): the vendored tarball is REPACKED without the
#   package's skills/ and with its README.md replaced by a 3-line stub (dist and
#   types kept), the lockfile integrity is recomputed, then `npm ci` installs
#   it. So node_modules/@dooph-software/design-system has no skills/ and a stub
#   README, and neither does the tarball an `npm install` would reinstall from.
# - --with-skills (GREEN): `npm ci`, then the package's own init-skills
#   (`npx @dooph-software/design-system init-skills --yes`), which copies the
#   shipped skills into .agents/skills, .claude/skills and .agent/skills; Claude
#   Code loads .claude/skills as project skills.
# - Then `git init` and ONE commit of the hand-over state (author ds-fixture),
#   so the sandbox is "a git repo with one commit" and plain `git diff` /
#   `git status` show only the agent's work. A fresh repo, not a clone, so the
#   RED sandbox's history never holds the unstripped tarball. The marker
#   <git-dir>/consumer-sandbox records only the template commit (the agent can
#   read it, so never the mode); remove-consumer-sandbox.sh refuses any dir
#   without it.
# Prints the dir, the mode, the installed tarball's sha256 (after any RED
# repack), the template commit and the hand-over commit.
set -euo pipefail
export GIT_OPTIONAL_LOCKS=0

usage() { echo "usage: $0 <dir> [--with-skills]" >&2; exit 2; }
[ $# -ge 1 ] || usage
DIR_ARG=$1; shift
WITH_SKILLS=0
for a in "$@"; do
  case "$a" in
    --with-skills) WITH_SKILLS=1 ;;
    *) usage ;;
  esac
done

TEMPLATE=/c/Users/stick/Github/dooph/ds-consumer-template
PKG=@dooph-software/design-system
DIR=$(realpath -m "$DIR_ARG")
[ -e "$DIR" ] && { echo "refusing: $DIR already exists" >&2; exit 1; }
[ -z "$(git -C "$TEMPLATE" status --porcelain)" ] || { echo "refusing: template has uncommitted changes" >&2; exit 1; }
TPL_COMMIT=$(git -C "$TEMPLATE" rev-parse HEAD)

# 1. The template's committed tree.
mkdir -p "$DIR"
git -C "$TEMPLATE" archive --format=tar HEAD | tar -x -C "$DIR"
cd "$DIR"
TGZ_REL=$(node -p 'require("./package.json").dependencies["'"$PKG"'"].replace(/^file:/, "")')
[ -f "$TGZ_REL" ] || { echo "vendored tarball $TGZ_REL missing" >&2; exit 1; }

# 2. Tarball: optional override, RED strip, lockfile integrity.
TGZ_CHANGED=0
if [ -n "${DS_TARBALL:-}" ]; then
  cp "$DS_TARBALL" "$TGZ_REL"; TGZ_CHANGED=1
fi
if [ "$WITH_SKILLS" -eq 0 ]; then
  tmpd=$(mktemp -d)
  tar -xzf "$TGZ_REL" -C "$tmpd"
  [ -f "$tmpd/package/package.json" ] || { echo "unexpected tarball layout" >&2; exit 1; }
  rm -rf "$tmpd/package/skills"
  printf '%s\n' '# @dooph-software/design-system' '' \
    'React component library: import components from `@dooph-software/design-system`.' > "$tmpd/package/README.md"
  tar -czf "$TGZ_REL" -C "$tmpd" package
  rm -rf "$tmpd"
  TGZ_CHANGED=1
fi
if [ "$TGZ_CHANGED" -eq 1 ]; then
  node -e '
    const fs = require("fs"), crypto = require("crypto");
    const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
    const e = lock.packages["node_modules/" + process.argv[1]];
    if (!e || !e.resolved?.startsWith("file:")) { console.error("lockfile entry not found"); process.exit(1); }
    e.integrity = "sha512-" + crypto.createHash("sha512").update(fs.readFileSync(e.resolved.slice(5))).digest("base64");
    fs.writeFileSync("package-lock.json", JSON.stringify(lock, null, 2) + "\n");
  ' "$PKG"
fi

# 3. Dependencies (npm ci; npm install only if the lockfile no longer fits a
#    DS_TARBALL whose own dependencies changed).
if ! npm ci --no-audit --no-fund --loglevel=error >/dev/null 2>&1; then
  [ -n "${DS_TARBALL:-}" ] || { echo "npm ci failed" >&2; exit 1; }
  echo "npm ci failed with DS_TARBALL; falling back to npm install" >&2
  npm install --no-audit --no-fund --loglevel=error >/dev/null
fi
INSTALLED="node_modules/$PKG"
[ -f "$INSTALLED/dist/index.d.ts" ] && [ -f "$INSTALLED/dist/styles.css" ] || { echo "DS dist/types missing after install" >&2; exit 1; }

# 4. Mode.
if [ "$WITH_SKILLS" -eq 0 ]; then
  # Belt and braces: the repack already removed these.
  rm -rf "$INSTALLED/skills"
  [ "$(wc -l < "$INSTALLED/README.md")" -eq 3 ] || { echo "README stub not in place" >&2; exit 1; }
  find . -path ./node_modules -prune -o -type d -name skills -print | grep -q . && { echo "a skills dir exists in RED" >&2; exit 1; }
else
  [ -d "$INSTALLED/skills" ] || { echo "GREEN: the installed package has no skills/" >&2; exit 1; }
  INIT_LOG=$(mktemp)
  npx --no-install "$PKG" init-skills --yes < /dev/null > "$INIT_LOG" 2>&1 \
    || { cat "$INIT_LOG" >&2; rm -f "$INIT_LOG"; exit 1; }
  sed 's/^/  init-skills | /' "$INIT_LOG"; rm -f "$INIT_LOG"
  ls .claude/skills | grep -q '^dooph-design-system-' || { echo "GREEN: init-skills put no skills in .claude/skills" >&2; exit 1; }
fi

# 5. One commit of the hand-over state.
git init -q -b main
git add -A
git -c user.name=ds-fixture -c user.email=ds-fixture@localhost -c commit.gpgsign=false \
  commit -q -m "Initial commit"
GITDIR=$(git rev-parse --absolute-git-dir)
mode=baseline; [ "$WITH_SKILLS" -eq 1 ] && mode=with-skills
# The marker is readable by the agent (`cat .git/consumer-sandbox`), so it
# holds no mode, scenario or tarball path: those go to stdout (the out-dir).
printf 'template %s\n' "$TPL_COMMIT" > "$GITDIR/consumer-sandbox"

echo "sandbox:          $DIR ($mode)"
echo "installed-tgz-sha256: $(sha256sum "$TGZ_REL" | cut -d' ' -f1)"
echo "template commit:  $TPL_COMMIT ($TEMPLATE)"
echo "hand-over commit: $(git rev-parse HEAD) (diff base)"
echo "DS tarball:       ${DS_TARBALL:-vendored} -> $TGZ_REL$([ "$WITH_SKILLS" -eq 0 ] && echo ' (repacked: no skills/, stub README)')"
echo "DS skills dir:    $([ -d "$INSTALLED/skills" ] && ls "$INSTALLED/skills" | tr '\n' ' ' || echo absent)"
[ "$WITH_SKILLS" -eq 1 ] && echo "project skills:   $(ls .claude/skills | tr '\n' ' ')"
exit 0
