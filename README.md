# PLAYMATE

Responsive game-services marketplace MVP with store onboarding, service projects, player profiles, merchant-authorized support, voice recording, ads, orders, and a merchant console.

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
- `/api/stores/:storeId/support`
- `/api/ads`
- `/api/audio`

Merchant write operations require a bearer token returned by the demo login endpoint. Replace the file database and demo login with PostgreSQL and production authentication before deployment.
