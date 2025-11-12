# NFSC Mock API (Retell AI Function)

This is a **mock** implementation of the Retell AI custom function:

**Endpoint:** `POST /retell/functions/get_portfolio_status`

**Body format (Retell tool-call):**
```json
{
  "name": "get_portfolio_status",
  "parameters": {
    "name": "نورة خالد الشمري",
    "national_id": "1009081082"
  }
}
```

**Response:**
```json
{
  "result": {
    "found": true,
    "name": "نورة خالد الشمري",
    "national_id": "1009081082",
    "portfolio_status": "سارية"
  }
}
```

## Quick start (local)
```bash
npm install
npm run dev
# http://localhost:3000/
```

Test with curl:
```bash
curl -X POST http://localhost:3000/retell/functions/get_portfolio_status       -H "Content-Type: application/json"       -d '{ "name":"get_portfolio_status", "parameters": { "name":"نورة خالد الشمري", "national_id":"1009081082" } }'
```

## Deploy (Docker)
```bash
docker build -t nfsc-mock-api .
docker run -p 3000:3000 nfsc-mock-api
```

## Deploy (Render / Railway / Fly.io / GCP Cloud Run)
- Use Node 18+, set start command `npm start`.
- Optional: set `RETELL_WEBHOOK_SECRET` if you enable signature verification.

## OpenAPI
See `openapi.yaml` for schema (import into Postman/Insomnia/Swagger UI).
```
