# PLAYMATE

Responsive game-services marketplace MVP with store onboarding, service projects, player profiles, merchant-authorized support, voice recording, ads, orders, and a merchant console.

The role, permission, order, funds, support, dispute, and compliance model is documented in [docs/product-workflows.md](docs/product-workflows.md).

## Local development

```powershell
npm.cmd install
npm.cmd run dev
```

- Web: http://127.0.0.1:4173
- API: http://127.0.0.1:8787/api/health

Runtime orders are written to `server/data/db.json`. Uploaded audio is stored under `server/uploads/`; both are ignored by Git.

## API areas

- `/api/auth/demo-login`
- `/api/stores` and `/api/stores/:storeId/projects`
- `/api/orders`
- `/api/orders/:id/pay`, `/api/orders/:id/cancel`, and `/api/orders/:id/disputes`
- `/api/disputes` and `/api/disputes/:id/resolve`
- `/api/player/verification` and `/api/admin/player-verifications`
- `/api/admin/store-applications`, `/api/admin/ads`, and `/api/admin/violations`
- `/api/admin/ledger` and `/api/admin/audit-logs`
- `/api/stores/:storeId/support`
- `/api/support/conversations` and `/api/support/conversations/:id/messages`
- `/api/player/dashboard` and `/api/player/orders/:id/:action`
- `/api/ads`
- `/api/audio`

Realtime support messages are delivered over `/ws` after subscribing with an authenticated conversation id. Voice recordings are uploaded first and then persisted as audio messages.

Merchant write operations require a bearer token returned by the demo login endpoint. Replace the file database and demo login with PostgreSQL and production authentication before deployment.
