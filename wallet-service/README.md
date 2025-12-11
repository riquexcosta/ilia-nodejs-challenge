# Wallet Service

Microservice for managing user wallets and financial transactions with JWT authentication.

## Requirements

- Node.js 22+
- PostgreSQL 15+
- Docker and Docker Compose (optional)

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wallet_db
DB_USER=admin
DB_PASSWORD=admin123
JWT_SECRET=ILIACHALLENGE
JWT_SECRET_INTERNAL=ILIACHALLENGE_INTERNAL
PRIVATE_KEY=ILIACHALLENGE
PRIVATE_KEY_INTERNAL=ILIACHALLENGE_INTERNAL
```

### Installation

```bash
npm install
```

### Run Migrations

Migrations are executed automatically when starting the service.

### Run Locally

```bash
npm start
```

The service will be available at `http://localhost:3001`

## Docker

### Build Image

```bash
docker build -t wallet-service .
```

### Run with Docker Compose

```bash
docker-compose up wallet-service
```

## Endpoints

### External (client-facing, requires `PRIVATE_KEY` JWT)
- `POST /transactions` — create transaction (`user_id`, `type` = CREDIT|DEBIT, `amount`, optional `description`)
- `GET /transactions?type=CREDIT|DEBIT` — list authenticated user transactions
- `GET /balance` — get authenticated user consolidated balance

### Internal (service-to-service, requires `PRIVATE_KEY_INTERNAL` JWT)
- `POST /internal/transactions`
- `GET /internal/transactions?userId=...&type=CREDIT|DEBIT`
- `GET /internal/balance?userId=...`

## Features

- **SQL Transactions**: All transaction operations use SQL transactions to ensure atomicity and prevent double credit/debit
- **Dynamic Balance Calculation**: Balance is calculated dynamically from transactions using SQL queries (as per requirements)
- **Lock Mechanism**: Uses SELECT FOR UPDATE to prevent race conditions
- **Balance Validation**: Validates sufficient balance before processing debit transactions

## Security

- External routes require JWT signed with `PRIVATE_KEY` (`ILIACHALLENGE`)
- Internal routes require JWT signed with `PRIVATE_KEY_INTERNAL` (`ILIACHALLENGE_INTERNAL`)
- Input validation on all endpoints (express-validator)

## Tests

Integration tests (sqlite in-memory):
```bash
npm test
```

## Project Structure

```
wallet-service/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # HTTP controllers
│   ├── middleware/      # Middlewares (auth, validators)
│   ├── migrations/      # Database migrations
│   ├── models/          # Sequelize models
│   ├── routes/          # Route definitions (external + internal)
│   ├── services/        # Business logic
│   └── utils/           # Utilities
├── __tests__/           # Integration tests (jest + supertest)
├── Dockerfile
├── package.json
└── README.md
```

