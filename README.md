# Expense Tracker & Budget Management

A full-stack app for tracking personal expenses, setting monthly budgets per category, and reviewing spending trends. Built as a two-package project: an Express/TypeScript API backed by PostgreSQL, and a React/TypeScript client.

## Features

- Email/password auth with short-lived access tokens and rotating, revocable refresh tokens
- Expense CRUD with filtering by category, currency, date range, and amount
- Monthly budgets per category, with live spent/remaining tracking and an over-budget warning
- Dashboard with a spending summary and category breakdown chart
- Monthly/yearly reports with CSV and Excel export
- Multi-currency support (USD / INR) — each expense and budget carries its own currency, and totals are never mixed across currencies
- Responsive layout (mobile + desktop)

## Tech stack

**Backend** — Node.js, Express, TypeScript, PostgreSQL, Prisma, Zod, JWT, Jest
**Frontend** — React, TypeScript, Vite, Tailwind CSS, React Router, Recharts, Framer Motion, Vitest

## Project structure

```
backend/
  prisma/           schema + migrations
  src/
    config/         env validation, Prisma client
    controllers/     request handlers
    services/        business logic / DB access
    middleware/      auth, validation, error handling
    routes/
    validation/      Zod schemas
  tests/

frontend/
  src/
    api/            axios calls per resource
    components/
    context/        auth context
    hooks/
    pages/
    types/
    utils/
```

## Getting started

### Prerequisites

- Node.js 18+
- A PostgreSQL database. Locally, either install Postgres directly or run it in Docker:

  ```
  docker run --name expense-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=expense_tracker -p 5432:5432 -d postgres:16
  ```

### Backend

```
cd backend
npm install
cp .env.example .env        # fill in DATABASE_URL and JWT secrets
npx prisma migrate dev      # applies the schema to your database
npm run seed                # optional — creates a demo account with sample data
npm run dev                 # http://localhost:4000
```

Demo login (from the seed script): `demo@example.com` / `Password123!`

New accounts also get a starter set of categories (Groceries, Rent, Transport, Entertainment, Utilities, Other) on registration, so you can log an expense immediately without setting anything up first.

### Frontend

```
cd frontend
npm install
cp .env.example .env        # set VITE_API_URL if the API isn't on localhost:4000
npm run dev                 # http://localhost:5173
```

### Tests

```
# backend — unit/integration tests against a mocked Prisma client, no DB needed
cd backend && npm test

# frontend — component tests with Vitest + Testing Library
cd frontend && npm test
```

## Environment variables

**backend/.env**

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API port (default `4000`) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Signing secrets — use long, random, distinct values |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes, e.g. `15m` / `7d` |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS |

**frontend/.env**

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the API, e.g. `http://localhost:4000/api` |

## API reference

All routes except `/auth/*` and `/health` require `Authorization: Bearer <accessToken>`.

| Method & path | Notes |
| --- | --- |
| `POST /api/auth/register` | Creates the user + starter categories, returns an access token, sets a refresh cookie |
| `POST /api/auth/login` | Same response shape as register |
| `POST /api/auth/refresh` | Rotates the refresh token, issues a new access token |
| `POST /api/auth/logout` | Revokes the current refresh token |
| `GET/POST /api/categories`, `PUT/DELETE /api/categories/:id` | |
| `GET/POST /api/expenses`, `PUT/DELETE /api/expenses/:id` | `GET` filters: `categoryId`, `currency`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `page`, `pageSize` |
| `GET/POST /api/budgets`, `PUT/DELETE /api/budgets/:id` | `GET` filters: `month`, `year`, `currency`; response includes amount already spent |
| `GET /api/dashboard/summary?year=&month=&currency=` | |
| `GET /api/reports/monthly?year=&month=&currency=`, `GET /api/reports/yearly?year=&currency=` | |
| `GET /api/reports/export?year=&month=&format=csv\|xlsx&currency=` | Omit `month` to export the whole year |

## Design notes

**Auth.** Access tokens are short-lived and kept in memory on the client, not `localStorage`, so they aren't readable by injected scripts. The refresh token lives in an httpOnly cookie scoped to `/api/auth` and rotates on every use — the previous one is revoked as soon as a new pair is issued, so a stolen refresh token stops working the moment the real user refreshes. An axios interceptor on the frontend retries a request once after a silent refresh if it gets a 401.

**Currency.** Amounts aren't converted between USD and INR — each expense/budget just stores which currency it's in. Anywhere the app sums numbers (dashboard totals, reports, CSV/Excel export), it scopes the query to one currency at a time via a `currency` param, so a total is never a meaningless mix of two currencies. The dashboard and reports pages expose this as a simple USD/INR toggle.

**Database.** `expenses(userId, date)`, `expenses(userId, categoryId)`, and `budgets(userId, year, month)` are indexed since those are the actual query patterns. Deleting a category that still has expenses is blocked; deleting one that only has budgets removes those budgets in a transaction along with the category.
