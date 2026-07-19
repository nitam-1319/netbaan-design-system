# prompt: component-refactor (REFACTOR/UPGRADE mode — explicit only)

Enter this mode only when explicitly asked or when resolving a REVIEW report. Read `../AGENT.md`,
then load the CREATE document set plus the findings you are resolving.

Rules:
- Change only what the findings require. Preserve public behavior unless the fix *is* an API
  correction, in which case note it as potentially breaking (→ versioning, `../guides/RELEASE_GUIDE.md`).
- Re-run the full completion definition after the upgrade.
- Never let a refactor silently expand into unrelated rewrites.
Report before/after per finding.
