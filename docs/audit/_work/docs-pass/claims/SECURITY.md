# Claims: SECURITY.md

S = `SECURITY.md` at the repo root. Checked 2026-10-11.

- S:12 link https://github.com/dooph-software/dooph.-design-system/security/advisories/new. Evidence: browser (built-in, signed out): redirects to GitHub sign-in with `return_to` set to that URL, so the form itself could not be seen. The repo's Security tab (https://github.com/dooph-software/dooph.-design-system/security) loads and renders this policy. The old slug (`/dooph-software/dooph-Design-System/security`) shows "Page not found". NOT VERIFIED: whether private vulnerability reporting is enabled. Signed out, the Security tab showed no GitHub "Report a vulnerability" button, only the link inside the rendered policy. The maintainer should confirm it in the repo settings.
- S:14 the CONTRIBUTING.md link is relative, and the file exists at the repo root.
- S:5, S:9 unchanged from HEAD (the maintainer's policy statements).

## Claim-check fix (batch 5)

- S:11-14 (reworded): the advisory form is named as GitHub's private vulnerability reporting, and a fallback is given for when the form is not available: open an issue saying only that a security report exists, no details; the maintainer arranges a private way. The claim now holds whether or not the setting is enabled. No contact address is given because the repo holds none (package.json has no author, bugs or email field; no email in README, CONTRIBUTING or LICENSE.txt).
