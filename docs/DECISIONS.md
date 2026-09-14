# Decisions — w05-aduana

> Session close ritual, every session: one line per decision with the why, tomorrow's first move at the top, commit, push. This file is where the Week 12 Extraction gets mined from.

**Tomorrow's first move:** add a card to the class19 team so AI Gateway serves requests → re-run /canal on "Farmacia B" with the real model and compare its contradictions with the simulated reader's two; then /ruta form-first (persona confusions #34, #40, #46).

---

<!-- newest first: YYYY-MM-DD — decision — why -->
- 2026-09-13 — Persona RE-TEST (deploy #4 → 0 task blockers) → deploy #5: R05 (payer gets patient names + phones) RIESGO → BLOQUEA, rules v0.1.2, cure names the clause; button "Corregir: el contrato dice «…»" (the old label read like consenting to share phones); /comparar Farmacia B card warns its contract fails — Lupita: "si la farmacia tiene la lista de mi programa, ya sabe que mis señoras salieron mal de azúcar"; the Blueprint gives sponsors aggregates only, so the adversary agrees with the user.
- 2026-09-13 — No payer amounts or tie-breaker on /comparar — payers are invented archetypes and the Blueprint records "no payer willingness is proven"; inventing money would fabricate evidence.
- 2026-09-13 — NOT fixed this week: /ruta form-first layout, "which papers she is missing" for registration requirements, a concrete action for the transport barrier, course context on the home page — all FRENA/MENOR, and the persona got the right window and deadline on /ruta; the blocking confusions were on /canal and /comparar.
- 2026-09-13 — Rule R25 added (payer *suggests* its own branches = RIESGO, Condition 4), rules → v0.1.1 — the packet promised "sugiere → RIESGO" but no rule did it; the persona walk exposed the gap (Farmacia B's "se sugerirá el de la Farmacia" changed nothing).
- 2026-09-13 — /comparar answers first ("same four conditions → either works; watch the route with a pharmacy, the data with a remittance group") and hides the rule×payer table behind a details — persona blocker #30: "Me voy sin saber cuál me conviene"; "Yo defendí la remesa" read as bias and was removed from the user-facing page (it stays in the packet and DECISIONS).
- 2026-09-13 — Plain decision layer `decisionSimple()` over the rules (BLOQUEA or RIESGO → "NO LO FIRMES ASÍ"; only VERIFICAR → "SE PUEDE FIRMAR, DESPUÉS DE VERIFICAR") + copy-for-WhatsApp change list; exposure table → cards — "cruza" was an unexplained metaphor, the pharmacy column was cut off on a phone, and the coordinator acts through WhatsApp.
- 2026-09-13 — PERSONA FIX (worst confusion): the verdict waits for the contract; each contradiction offers "Usar lo que dice el contrato" — the LLM only proposes a term value, the coordinator confirms with one tap, the rules recalculate — Lupita read "CRUZA CON CONDICIONES · 0 bloquean" (shown before the text was read) as "sign", and the reading that exposed the patient phone list never changed it: two opposite answers on one screen.
- 2026-09-13 — Mechanical pass: two bugs fixed with regression tests — PII guard missed a phone number followed by a period (production curl returned 200 instead of 400); handoff deadline computed in UTC shifted a day after 18:00 CDMX (seen in the /ruta screenshot).
- 2026-09-13 — Presets include my own favored payer (remittance) failing as it is typically offered — the Adversary attacks his own dissent; the curing clauses turn out to be the same for pharmacy and remittance, which is the finding.
- 2026-09-13 — Payers are invented archetypes ("Cadena farmacéutica A", "Remesadora de grupo financiero"), never real company names — no impersonation or defamation; the real companies stay in my brief as evidence.
- 2026-09-13 — No persistence, no auth, no DB — nothing personal is stored; fictional data only; PII guard blocks CURP/RFC/NSS/phone/email before anything reaches the model (security floor + Condition 6).
- 2026-09-13 — Model `anthropic/claude-sonnet-5` through Vercel AI Gateway with OIDC (no key in repo) — cheap at demo volume ($2/$10 per M tokens), strong on Spanish contract text.
- 2026-09-13 — Real LLM + labeled SIMULATED fallback — team class19 has no card on file (`403 customer_verification_required`, credits balance 0); the URL must work regardless and turns real the moment a card is added, with no redeploy.
- 2026-09-13 — The LLM never decides the verdict; deterministic rules do; every quote the LLM returns must exist verbatim in the pasted text or it is discarded on screen — an adversary without a source is an opinion (my own brief's rule).
- 2026-09-13 — The LLM reads contracts, never people: no messages to patients — Condition 3 (no AI persuasion) makes a patient-facing message the riskiest place for a model.
- 2026-09-13 — No risk score; the FINDRISC-style idea from my brief is withdrawn — Blueprint Condition 1 forbids a diagnostic/risk model in this MVP.
- 2026-09-13 — Slice = my Blueprint declaration, literally: adversarial channel/payer checklist + eligibility checklist, Condition 6 first — Emiliano's dashboard and Santiago's protocol cover handoff tracking; mine covers the two moments before it: before the money and before the door.
