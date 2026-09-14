# Prompts — w05-aduana

Prompts worth keeping from this build. Raw material for the Week 12 Method.

## 1. Implementation prompt (packet → coding agent)

> Derived from docs/PACKET.md before writing code. Small testable features, acceptance criteria, commit plan.

```
Build "Aduana" in the existing Next.js 15 (App Router, JS) + Tailwind 4 skeleton. Spanish UI, dark theme, mobile-first (390 px). No database, no auth, nothing persisted. All payers, contracts and cases are invented and labeled on screen.

F1 lib/reglas.js — term sheet (14 closed fields) + 24 deterministic rules. Each rule: id, Blueprint condition 1-6, severity BLOQUEA|RIESGO|VERIFICAR, test(t), why, source, curing clause. evaluar(t) → verdict (NO CRUZA if any BLOQUEA, else CRUZA CON CONDICIONES, else CRUZA), sorted findings, exposure matrix (data × Paciente/Navegadora/Clínico/Pagador/Familiar). 5 invented presets: pharmacy commission, pharmacy fixed fee (Blueprint payer), remittance as offered, remittance with firewall, migrant son who wants to see.
  AC: commission → NO CRUZA w/ R01; fixed fee → CRUZA CON CONDICIONES with only [R19,R20]; remittance as offered → NO CRUZA incl. R04,R08,R11; firewall → [R20,R23]; migrant son → NO CRUZA, payer AND family see result = violation.

F2 lib/ruta.js — fictional case → routes to verify (IMSS / IMSS-Bienestar or state services for the 8 non-adhered states / Seguro de Salud para la Familia "NO PARA ESTA ACCIÓN" with 2026 fee by age / independent-worker incorporation / out of pocket), missing documents, handoff card (next action, owner, deadline = min(clinician deadline,14d), status, barrier + cause modifiable|structural, escalation, contact channel, family).
  AC: Chiapas no-SS → imssb; Jalisco → estatal; 2 attempts → REVISIÓN HUMANA OBLIGATORIA; cost → NO RESUELTO — BARRERA FINANCIERA; blank owner → SIN DUEÑA — NO SE PUEDE ABRIR; no consent → OPT-OUT; 7-day clinician deadline wins; missing CURP → first action is getting it.

F3 lib/pii.js — reject CURP, RFC, NSS, 10-digit phone, email. AC: all 5 preset texts pass clean.

F4 lib/lector.js + app/api/leer — POST {terminos, texto≤4000}; zod strict; PII → 400; 8 req/10 min per IP; generateText + Output.object via AI Gateway model string; any gateway error → keyword-based simulated reader labeled SIMULADO with human reason. ALWAYS run verificarCitas: drop any quote not found verbatim (whitespace/quotes normalized) and return it under descartados. The model never changes the verdict.
  AC: invented quote discarded; simulated reader finds the 2 contradictions in the fixed-fee pharmacy text (datosPagador, dirigeRuta) and does not flag a prohibition clause.

F5 pages — / (two doors + comparar teaser), /canal (presets, live verdict, findings with cure+source, matrix, textarea + reading, collapsible 14-field form), /comparar (verdict cards + rule×payer table + written finding), /ruta (status, handoff card, missing docs, routes with sources, form), /reglas (all rules, LLM guard, route sources).

Commit plan: (1) packet docs (2) lib + tests (3) api (4) ui → deploy (5) mechanical-test fixes → deploy (6) persona-test fix → deploy. node --test must stay green before each deploy.
```

## 2. System prompt of the contract reader (lib/lector.js → SISTEMA)

Kept verbatim in `lib/lector.js`. Design choices worth reusing:
- The contract is declared DATA, not instructions (prompt-injection guard).
- "Cite verbatim or don't report": the rule is stated in the prompt AND enforced in code; the prompt alone is not trusted.
- Output is split into *hallazgos* (clause violates a condition) and *contradicciones* (declared term sheet ≠ text): the second is where the LLM adds value the rules cannot.
- "A clause that PROHIBITS a misuse is not a finding" — added after thinking through the firewall preset.
- After the persona test, contradictions also return `valor_segun_texto` (an option key of that field): the model proposes the corrected term, the coordinator confirms with one tap, the rules recalculate. The model still never decides.

## 3. Persona test prompt (fresh agent, no build context)

```
You are running a PERSONA TEST. Only use Read to view the screenshots, then Write one file.
Persona: Lupita Méndez, 38, enfermera general. Coordina un piloto de navegación de pacientes (resultado anormal de diabetes tipo 2) en una farmacia de Tuxtla Gutiérrez, Chiapas. Lee contratos en el celular entre turnos. Nunca ha usado IA para trabajar. Desconfía de la letra chiquita pero se cansa con textos largos. Si no entiende un término técnico, lo ignora en silencio y sigue (o se va). No es abogada.
Tasks: (1) Cadena farmacéutica B le ofreció dinero: ¿lo firmo o no, y qué les pido que cambien? (2) ¿Me conviene más la farmacia o la remesadora? (3) Paciente ficticia (50–59, Chiapas, sin seguridad social, informal, celular básico, transporte): ¿a dónde la mando, qué papeles lleva y qué sigue?
Read EVERY screenshot in order (home → /canal → lectura → /comparar → /ruta). Narrate AS LUPITA, first person: where she hesitates, which words she doesn't understand, where she'd give up silently. Be honest, not nice.
Output: narration per screen · confusion log table (# | pantalla | qué intentaba | qué no entendió | sus palabras | BLOQUEA TAREA / FRENA / MENOR) · did she complete each task · top-3 fixes with the concrete change.
```
