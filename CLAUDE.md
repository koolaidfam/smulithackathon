# CLAUDE.md

Context for coding agents working in this repository. Read fully before writing code.

## What this project is

A regulatory resilience system for a law firm. It models the firm as a graph
of sources, documents and people, tracks the volatile rule values those
documents depend on, and when a regulatory instrument changes it identifies
every affected artefact, explains how the change reached it, and routes a
task to a named human who can dispose of it.

Hackathon build. Optimise for a demo that survives hostile questions from
lawyers, not for production hardening.

## The one idea

Firms are fragile because documents hardcode rules. One obligation lives in
a checklist, a bot ruleset and a training slide as three independent copies.
We call this **regulatory hardcoding**. The product finds it, routes fixes,
and over time replaces hardcoded values with references to a single
parameter. Detection is a feature. Reducing hardcoding is the product.

## Non-negotiable design rules

Violating any of these breaks the pitch, not just the code.

1. **Affectedness comes from stored edges, never from similarity.**
   Embeddings may propose candidate edges for human confirmation, and may
   flag unmapped documents as coverage gaps. They must never decide that a
   document is affected. If we cannot show the chain, we do not flag it.

2. **The model does not draft substantive legal text.**
   Split proposed edits into `mechanical` and `substantive`.
   Mechanical means the change follows from the parameter with no judgement:
   date arithmetic, boilerplate footers, cross references, exhibit lists.
   Generate those. Substantive means a choice exists. Generate no
   replacement text at all: show the parameter delta, cite the paragraph,
   name the lawyer who decides.

3. **Document class determines the action.**
   - `internal` (checklists, precedents, training, automation rules)
     -> proposed edit plus owner sign-off
   - `formal` (constitutions, registered filings)
     -> procedural task, never a redline, because changing it needs a
        resolution and a lodgement
   - `bilateral` (executed contracts)
     -> flagged exposure plus any change-in-law clause, never an edit,
        because no party can amend unilaterally

4. **Nothing propagates from a draft instrument.**
   Consultation papers are mapped so users can see what they would reach,
   but nothing downstream is marked stale until `in_force_at` has passed.
   A system that redlines on drafts trains people to ignore redlines.

5. **Report coverage, not just findings.**
   Every propagation result carries the assets reached AND the unmapped
   documents that plausibly should have been. A missed edge produces a
   confident all-clear, which is worse than no tool.

6. **Edges point at document identity, not document version.**
   Versions hang off a stable document id. Otherwise every save spawns a
   ghost node and the graph rots.

## Data model

```
node(id, kind, title, subtitle, cluster, doc_class, props jsonb)
    kind in ('source','document','person')
    doc_class in ('internal','formal','bilateral')  -- documents only
    props holds rank ('senior','partner','associate','intern') for people

edge(src, dst, relation, confidence, source_system,
     created_at, confirmed_by, confirmed_at)
    relation is a real tie: 'cites', 'teaches', 'issued_alongside',
    'evidence_relied_on_by', 'owned_by', 'supervised_by'
    confidence + confirmed_by distinguish an LLM-proposed edge from a
    human-confirmed one; propagation must be able to say which kind
    carried a flag

parameter(id, name, value, unit, effective_from, effective_to, citation)
document_parameter(document_id, parameter_id, location, hardcoded bool)

change(id, source_node, instrument_ref, gazetted_at, in_force_at)
task(id, change_id, node_id, owner_id, state, decided_by, decided_at,
     reason, disposition)
    state in ('open','routed','accepted','amended','rejected','verified')
```

Seniority is a **property on the person**, not a node label. People get
promoted and we do not want label migrations.

## Stack

- Postgres for everything, including `pgvector` for candidate-edge
  suggestion. Traversals are bounded at four or five hops over a few
  thousand nodes, so recursive CTEs are ample. Neo4j is the scale path,
  not the hackathon choice. If asked why not a graph database, the answer
  is that we avoided operating a second store for a trivial join cost.
- Frontend graph: `react-force-graph` (Obsidian look, WebGL, minimal work)
  or `cytoscape.js` if we need compound nodes and better layouts.
- Live updates over SSE or WebSocket. Push affected node ids only.

## Graph rendering rules

- **Two views, always.** The global graph is an orientation screen and is
  unreadable past ~1000 nodes. The working view is the subgraph reached by
  one change, small enough to lay out stably. Obsidian users abandon the
  global view; assume ours will too.
- **Never relayout on state change.** Pin positions once physics settles.
  Re-running the simulation moves every node the user had just learned,
  which is what makes force graphs feel broken.
- Node size by degree. Hover dims non-neighbours. Zoom reveals labels.
- Colour: `stale` for flagged, `fresh` for cleared by a human, cluster
  colour otherwise. Source nodes get their own accent.

## Ingestion

Government sources first, because they are more structured than people
expect. Prefer **diffing consolidated versions** over asking a model to
summarise an amendment. Given before-and-after paragraph text, the textual
delta is free and exact. The model's only job is to classify that delta:
which parameter it touches, mechanical or substantive, and the commencement
date.

People edges are **imports, not inferences**. Ownership from matter
management and document metadata, reporting lines from the practice
directory.

## Escalation

If a task's owner cannot dispose of it (no owner, insufficient seniority,
left the firm), walk `supervised_by` edges upward until reaching someone
who can approve. This traversal is a feature no alerting product has,
because they have no model of the firm's people. The demo must show a case
where the nominal owner cannot dispose and the task climbs.

## Verification

An accepted edit is not done. Re-check that the edit landed in the document
of record and only then set `state = 'verified'`. Detection without
verified disposition is just a prettier alert.

## Demo priorities

In order. Do not spend build time further down the list until the earlier
items work.

1. Propagation from one change with a readable chain per affected asset
2. Task routing, commencement countdown, recorded disposition
3. At least one asset that stays clean for a stated reason (a keyword
   sweep would have flagged it; we did not)
4. The silent-failure asset (automation with no natural error signal)
5. Escalation up the supervision chain
6. Coverage report of unmapped near-miss documents
7. The pretty global graph, five seconds of it, then zoom to the subgraph

## Known limits, state them before a judge finds them

- The parameter registry assumes rules factor into discrete values.
  Qualitative standards and reasonableness tests do not. Claim the
  factorable subset is large and is where silent failures concentrate.
  Do not claim universality.
- Graph completeness is the whole product and extraction is the real
  engineering risk. Never answer "we would ingest their documents."
- Cognitive offloading cuts both ways. If associates stop reading
  amendments, the human redundancy we rely on atrophies. Name this first.

## Style

- No em dashes in generated prose or UI copy.
- UI copy is plain, active and specific. Buttons say what happens.
- Never write copy that implies the system decided something a lawyer
  should decide.
