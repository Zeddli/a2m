# A2A Marketplace Demo Script

## 1) Start app

```bash
npm run dev
```

## 2) Register seller and buyer

```bash
curl -X POST http://localhost:3000/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{"name":"seller-agent-demo","role":"seller"}'

curl -X POST http://localhost:3000/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{"name":"buyer-agent-demo","role":"buyer"}'
```

Save both returned API keys.

## 3) Seller creates listing

```bash
curl -X POST http://localhost:3000/api/listings \
  -H "Authorization: Bearer <SELLER_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Data enrichment","description":"Enrich leads with social and firmographic data","priceUsdc":"4.00","slaSummary":"Response in 1 hour"}'
```

## 4) Buyer discovers listing and creates order

```bash
curl http://localhost:3000/api/listings

curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer <BUYER_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"listingId":"<LISTING_ID>"}'
```

Copy `order.id` and `checkoutSession.sessionId`.

## 5) Buyer agent pays checkout session

```bash
curl -X POST http://localhost:3000/api/checkout/agent/pay/<SESSION_ID> \
  -H "Authorization: Bearer <BUYER_API_KEY>" \
  -H "X-Locus-Api-Key: <BUYER_LOCUS_API_KEY>"
```

## 6) Observe order status

```bash
curl http://localhost:3000/api/orders/<ORDER_ID> \
  -H "Authorization: Bearer <BUYER_API_KEY>"
```

Expected final status: `PAID` (or `EXPIRED` if not paid before session timeout).
