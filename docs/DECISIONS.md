# Decisions — w05-aduana

> Session close ritual, every session: one line per decision with the why, tomorrow's first move at the top, commit, push. This file is where the Week 12 Extraction gets mined from.

**Tomorrow's first move:** build lib/reglas.js + lib/ruta.js against the packet's test plan, then pages.

---

<!-- newest first: YYYY-MM-DD — decision — why -->
- 2026-09-13 — Presets include my own favored payer (remittance) failing as it is typically offered — the Adversary attacks his own dissent; the curing clauses turn out to be the same for pharmacy and remittance, which is the finding.
- 2026-09-13 — Payers are invented archetypes ("Cadena farmacéutica A", "Remesadora de grupo financiero"), never real company names — no impersonation or defamation; the real companies stay in my brief as evidence.
- 2026-09-13 — No persistence, no auth, no DB — nothing personal is stored; fictional data only; PII guard blocks CURP/RFC/NSS/phone/email before anything reaches the model (security floor + Condition 6).
- 2026-09-13 — Model `anthropic/claude-sonnet-5` through Vercel AI Gateway with OIDC (no key in repo) — cheap at demo volume ($2/$10 per M tokens), strong on Spanish contract text.
- 2026-09-13 — Real LLM + labeled SIMULATED fallback — team class19 has no card on file (`403 customer_verification_required`, credits balance 0); the URL must work regardless and turns real the moment a card is added, with no redeploy.
- 2026-09-13 — The LLM never decides the verdict; deterministic rules do; every quote the LLM returns must exist verbatim in the pasted text or it is discarded on screen — an adversary without a source is an opinion (my own brief's rule).
- 2026-09-13 — The LLM reads contracts, never people: no messages to patients — Condition 3 (no AI persuasion) makes a patient-facing message the riskiest place for a model.
- 2026-09-13 — No risk score; the FINDRISC-style idea from my brief is withdrawn — Blueprint Condition 1 forbids a diagnostic/risk model in this MVP.
- 2026-09-13 — Slice = my Blueprint declaration, literally: adversarial channel/payer checklist + eligibility checklist, Condition 6 first — Emiliano's dashboard and Santiago's protocol cover handoff tracking; mine covers the two moments before it: before the money and before the door.
