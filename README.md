# 🚀 Bitespeed Identity Reconciliation Service

A robust backend service for identifying and tracking customer identities across multiple purchases with different contact information.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Testing](#testing)
- [Examples](#examples)

## 🎯 Overview

This service helps e-commerce platforms like FluxKart maintain a unified customer identity even when customers use different email addresses or phone numbers for different purchases. It intelligently links contact information and maintains a primary-secondary relationship model.

### The Problem

Dr. Emmett Brown uses different email addresses and phone numbers for each purchase to maintain privacy. However, FluxKart wants to:
- Reward loyal customers
- Provide personalized experiences
- Track purchases across different contact information

### The Solution

Our service identifies and links different contact information to the same customer using smart reconciliation logic.

## ✨ Features

- **🔗 Smart Identity Linking**: Automatically links contacts with matching email or phone numbers
- **🎯 Primary-Secondary Model**: Maintains a clean hierarchy with the oldest contact as primary
- **🔄 Dynamic Reconciliation**: Merges multiple primary contacts when new information reveals they're the same person
- **✅ Input Validation**: Robust validation using express-validator
- **🛡️ Security**: Helmet.js for security headers, CORS support
- **📊 Database Optimization**: Indexed queries for fast lookups
- **🚦 Health Checks**: Built-in health check endpoint
- **📝 Comprehensive Logging**: Detailed logs for debugging
- **🏗️ Clean Architecture**: Separation of concerns with controllers, services, and models

## 🛠️ Tech Stack

- **Backend**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Deployment**: Render / Railway / Vercel (configurable)

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- PostgreSQL 14 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd bitespeed-identity-reconciliation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your database credentials:
   ```env
   PORT=3000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bitespeed_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # Or use DATABASE_URL for production
   # DATABASE_URL=postgresql://user:password@host:port/database
   ```

4. **Create database**
   ```bash
   # Using psql
   psql -U postgres
   CREATE DATABASE bitespeed_db;
   \q
   ```

5. **Run migrations**
   ```bash
   npm run migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL

- **Local**: `http://localhost:3000`
- **Production**: `[Your deployed URL]`

### Endpoints

#### 1. Health Check

Check if the service is running.

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-03-06T10:30:00.000Z",
  "service": "Bitespeed Identity Reconciliation"
}
```

#### 2. Identify Contact

Reconcile and retrieve customer identity information.

```http
POST /identify
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```

**Note**: At least one of `email` or `phoneNumber` must be provided.

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

**Response Fields:**
- `primaryContactId`: ID of the primary contact
- `emails`: Array of all emails (primary contact's email comes first)
- `phoneNumbers`: Array of all phone numbers (primary contact's phone comes first)
- `secondaryContactIds`: Array of all secondary contact IDs linked to the primary

### Error Responses

**400 Bad Request** - Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

## 🗄️ Database Schema

### Contacts Table

```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20),
  email VARCHAR(255),
  linked_id INTEGER REFERENCES contacts(id),
  link_precedence VARCHAR(10) CHECK (link_precedence IN ('primary', 'secondary')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**
- `idx_contacts_email` - On email (for fast lookups)
- `idx_contacts_phone_number` - On phone_number (for fast lookups)
- `idx_contacts_linked_id` - On linked_id (for relationship queries)
- `idx_contacts_precedence` - On link_precedence (for filtering)

## 🏗️ Architecture

```
src/
├── config/           # Database configuration and migrations
│   ├── database.ts
│   └── migrate.ts
├── controllers/      # Request handlers
│   └── identifyController.ts
├── middleware/       # Express middleware
│   └── validation.ts
├── models/          # Database models
│   └── Contact.ts
├── routes/          # API routes
│   └── index.ts
├── services/        # Business logic
│   └── identityService.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── app.ts           # Express app configuration
└── server.ts        # Server entry point
```

### Design Patterns

- **MVC Pattern**: Separation of concerns with Models, Controllers, and Views (JSON responses)
- **Service Layer**: Business logic isolated in service classes
- **Repository Pattern**: Database operations encapsulated in model classes
- **Middleware Pattern**: Request validation and error handling

## 🌐 Deployment

### Deploy to Render

1. **Create a new Web Service** on [Render](https://render.com)
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Add environment variables** in Render dashboard:
   ```
   NODE_ENV=production
   DATABASE_URL=<your-postgres-url>
   ```
5. **Create a PostgreSQL database** on Render and link it

### Deploy to Railway

1. **Install Railway CLI** or use the web dashboard
2. **Create a new project**:
   ```bash
   railway init
   ```
3. **Add PostgreSQL**:
   ```bash
   railway add postgresql
   ```
4. **Deploy**:
   ```bash
   railway up
   ```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000
```

## 🧪 Testing

### Manual Testing

Use the provided test cases:

**Test Case 1: New Customer**
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lorraine@hillvalley.edu",
    "phoneNumber": "123456"
  }'
```

**Test Case 2: Add Secondary Contact**
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mcfly@hillvalley.edu",
    "phoneNumber": "123456"
  }'
```

**Test Case 3: Merge Primary Contacts**
```bash
# Create first primary
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "george@hillvalley.edu",
    "phoneNumber": "919191"
  }'

# Create second primary
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "biffsucks@hillvalley.edu",
    "phoneNumber": "717171"
  }'

# Merge them
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "george@hillvalley.edu",
    "phoneNumber": "717171"
  }'
```

## 📖 Examples

### Example 1: First-time Customer

**Request:**
```json
{
  "email": "doc@hillvalley.edu",
  "phoneNumber": "555-0100"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["doc@hillvalley.edu"],
    "phoneNumbers": ["555-0100"],
    "secondaryContactIds": []
  }
}
```

**Database State:**
```
id: 1
email: doc@hillvalley.edu
phoneNumber: 555-0100
linkedId: null
linkPrecedence: primary
```

### Example 2: Same Customer, New Email

**Request:**
```json
{
  "email": "emmett@hillvalley.edu",
  "phoneNumber": "555-0100"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["doc@hillvalley.edu", "emmett@hillvalley.edu"],
    "phoneNumbers": ["555-0100"],
    "secondaryContactIds": [2]
  }
}
```

**Database State:**
```
id: 1 (primary)
email: doc@hillvalley.edu
phoneNumber: 555-0100
linkedId: null
linkPrecedence: primary

id: 2 (secondary)
email: emmett@hillvalley.edu
phoneNumber: 555-0100
linkedId: 1
linkPrecedence: secondary
```

### Example 3: Merging Two Primary Contacts

**Initial State:**
```
Contact 1 (primary):
  email: marty@hillvalley.edu
  phone: 555-0200

Contact 2 (primary):
  email: mcfly@hillvalley.edu
  phone: 555-0300
```

**Request:**
```json
{
  "email": "marty@hillvalley.edu",
  "phoneNumber": "555-0300"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["marty@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["555-0200", "555-0300"],
    "secondaryContactIds": [2]
  }
}
```

**Final State:**
```
Contact 1 remains primary
Contact 2 becomes secondary, linkedId: 1
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Bharath**

---

**Built with ❤️ for Bitespeed**
