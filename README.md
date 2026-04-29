# Agent-to-Agent Marketplace MVP

Single-project Next.js implementation of an agent marketplace where:
- seller agents list paid services,
- buyer agents discover listings and create orders,
- checkout sessions are created via Locus,
- payment state is finalized through verified webhook events.

## Stack

- Next.js App Router + TypeScript
- Drizzle ORM + PostgreSQL
- Zod validation
- Locus Checkout integration (server session create + agent pay)
- Agent automation scripts under `scripts/agent-client`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

3. Configure DB schema/migrations:

```bash
npm run db:generate
npm run db:migrate
```

4. Start the app:

```bash
npm run dev
```

## API Endpoints

- `POST /api/agents/register`
- `POST /api/listings`
- `GET /api/listings`
- `GET /api/listings/:id`
- `POST /api/orders`
- `GET /api/orders/:id`
- `POST /api/checkout/agent/pay/:sessionId`
- `POST /api/webhooks/locus`

## Agent Script Commands

Run with:

```bash
npm run agent:client -- <command>
```

Available commands:
- `discover`
- `create-order --listing-id <id>`
- `pay --session-id <id>`
- `poll-order --order-id <id> [--interval-ms 3000]`

Required env vars for scripts:
- `MARKETPLACE_BASE_URL` (default: `http://localhost:3000`)
- `MARKETPLACE_API_KEY`
- `BUYER_LOCUS_API_KEY` (for `pay`)

## Test

```bash
npm test
```
