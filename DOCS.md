# Bitespeed Identity Reconciliation Service

[![Deploy on Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## Quick Links

- 📖 [Full Documentation](README.md)
- 🚀 [API Reference](#api-endpoints)
- 🌐 [Live Demo](#) (Add your deployed URL here)

## API Endpoints

### POST /identify
Reconcile customer identity across purchases.

**Request:**
```json
{
  "email": "customer@example.com",
  "phoneNumber": "1234567890"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["customer@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

### GET /health
Check service health status.

## Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Configure `.env` file
4. Run migrations: `npm run migrate`
5. Start server: `npm run dev`

See [README.md](README.md) for detailed instructions.

## Tech Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL
- Express Validator

---

Made with ❤️ for Bitespeed Backend Task
