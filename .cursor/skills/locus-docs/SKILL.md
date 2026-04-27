---
name: locus-docs-research
description: Retrieves and synthesizes official Locus documentation for implementation guidance, architecture questions, and API workflows. Use when the user mentions Locus, paywithlocus, x402, checkout, wrapped APIs, MPP, LASO, wallets, tasks, services, or asks to verify behavior against Locus docs.
---

# Locus Docs Research

## Purpose

Use this skill to answer questions grounded in official Locus documentation and to reduce hallucination risk by citing source pages.

## Source Pages

Treat these pages as the canonical scope:

- https://docs.paywithlocus.com/
- https://docs.paywithlocus.com/beta
- https://docs.paywithlocus.com/build
- https://docs.paywithlocus.com/build/getting-started
- https://docs.paywithlocus.com/build/environment
- https://docs.paywithlocus.com/build/for-agents
- https://docs.paywithlocus.com/build/services
- https://docs.paywithlocus.com/build/addons-and-domains
- https://docs.paywithlocus.com/build/mpp
- https://docs.paywithlocus.com/build/x402
- https://docs.paywithlocus.com/checkout
- https://docs.paywithlocus.com/checkout/for-buyers
- https://docs.paywithlocus.com/checkout/for-merchants
- https://docs.paywithlocus.com/checkout/integrate
- https://docs.paywithlocus.com/checkout/payment-router
- https://docs.paywithlocus.com/features/laso
- https://docs.paywithlocus.com/features/send-types
- https://docs.paywithlocus.com/features/tasks
- https://docs.paywithlocus.com/features/wallets
- https://docs.paywithlocus.com/wrapped-apis
- https://docs.paywithlocus.com/wrapped-apis/for-agents
- https://docs.paywithlocus.com/wrapped-apis/mpp
- https://docs.paywithlocus.com/wrapped-apis/providers
- https://docs.paywithlocus.com/credits
- https://docs.paywithlocus.com/hackathon
- https://docs.paywithlocus.com/platform-walkthrough
- https://docs.paywithlocus.com/quickstart
- https://docs.paywithlocus.com/quickstart-beta

## Default Workflow (Exhaustive)

Follow this sequence unless the user asks for a quick answer:

1. Identify all relevant pages from the source list.
2. Read multiple pages (prefer at least 2 to 4) to cross-check details.
3. Reconcile differences, then provide a single coherent answer.
4. Include markdown links to each page used as citations.
5. Explicitly mark unknowns when docs do not state the answer.

## Response Rules

- Prefer doc-grounded statements over assumptions.
- Quote short snippets only when necessary; otherwise paraphrase.
- If instructions differ across pages, call out the conflict and the most specific page.
- For implementation guidance, provide minimal steps first, then optional depth.
- If the question is outside the source pages, state that clearly and ask whether to use external sources.

## Output Template

Use this format:

```markdown
Answer
- <direct answer>

How to implement
- <step 1>
- <step 2>

Sources
- [Page title or path](https://docs.paywithlocus.com/...)
- [Page title or path](https://docs.paywithlocus.com/...)

Open gaps
- <only if docs are missing or ambiguous>
```
