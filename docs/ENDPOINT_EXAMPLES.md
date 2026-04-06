# Finance Dashboard API – Example Requests and Responses

Base URL: `http://localhost:3000/api/v1`  

Authentication: JWT Bearer token in `Authorization` header.  

---

## Auth

### POST /auth/login

Authenticate and obtain a JWT.

#### Request

```http
POST /api/v1/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "admin@example.test",
  "password": "Admin@123"
}
```

#### Response – 200 OK

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "organizationId": 1,
    "email": "admin@example.test",
    "fullName": "Admin",
    "isActive": true,
    "createdAt": "2025-01-01T10:00:00.000Z"
  }
}
```

#### Response – 400 Bad Request (missing fields)

```json
{
  "error": "email and password are required"
}
```

#### Response – 401 Unauthorized (invalid credentials)

```json
{
  "error": "Invalid email or password"
}
```

---

### POST /auth/logout

Stateless logout endpoint.

#### Request

```http
POST /api/v1/auth/logout HTTP/1.1
Authorization: Bearer <JWT>
```

#### Response – 204 No Content

(no body)

---

### GET /auth/me

Get the current authenticated user.

#### Request

```http
GET /api/v1/auth/me HTTP/1.1
Authorization: Bearer <JWT>
```

#### Response – 200 OK

```json
{
  "id": 1,
  "organizationId": 1,
  "email": "admin@example.test",
  "fullName": "Admin",
  "isActive": true,
  "createdAt": "2025-01-01T10:00:00.000Z"
}
```

#### Response – 401 Unauthorized

```json
{
  "error": "Missing Authorization header"
}
```

---

## Users

### GET /users

List all users in the current organization. Requires `USER_MANAGE`.

#### Request

```http
GET /api/v1/users HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
```

#### Response – 200 OK

```json
[
  {
    "id": 1,
    "organizationId": 1,
    "email": "admin@example.test",
    "fullName": "Admin",
    "isActive": true,
    "createdAt": "2025-01-01T10:00:00.000Z"
  },
  {
    "id": 2,
    "organizationId": 1,
    "email": "fmgr@example.test",
    "fullName": "Finance Manager",
    "isActive": true,
    "createdAt": "2025-01-02T09:30:00.000Z"
  }
]
```

#### Response – 403 Forbidden (no permission)

```json
{
  "error": "Forbidden",
  "missingPermission": "USER_MANAGE"
}
```

---

### POST /users

Create a new user in the current organization. Requires `USER_MANAGE`.

#### Request

```http
POST /api/v1/users HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
Content-Type: application/json

{
  "email": "new.user@example.test",
  "fullName": "New User",
  "password": "NewUser@123",
  "isActive": true
}
```

#### Response – 201 Created

```json
{
  "id": 5,
  "organizationId": 1,
  "email": "new.user@example.test",
  "fullName": "New User",
  "isActive": true,
  "createdAt": "2026-04-06T10:00:00.000Z"
}
```

#### Response – 400 Bad Request (validation error)

```json
{
  "error": "fullName is required"
}
```

#### Response – 409 Conflict (duplicate email)

```json
{
  "error": "User with this email already exists"
}
```

---

### GET /users/{id}

#### Request

```http
GET /api/v1/users/5 HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
```

#### Response – 200 OK

```json
{
  "id": 5,
  "organizationId": 1,
  "email": "new.user@example.test",
  "fullName": "New User",
  "isActive": true,
  "createdAt": "2026-04-06T10:00:00.000Z"
}
```

#### Response – 404 Not Found

```json
{
  "error": "User not found"
}
```

---

### PATCH /users/{id}

#### Request

```http
PATCH /api/v1/users/5 HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
Content-Type: application/json

{
  "fullName": "New User (Updated)",
  "isActive": false
}
```

#### Response – 200 OK

```json
{
  "id": 5,
  "organizationId": 1,
  "email": "new.user@example.test",
  "fullName": "New User (Updated)",
  "isActive": false,
  "createdAt": "2026-04-06T10:00:00.000Z"
}
```

---

### DELETE /users/{id}

#### Request

```http
DELETE /api/v1/users/5 HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
```

#### Response – 204 No Content

(no body)

---

## Organizations

### GET /orgs/me

Get the organization of the current user.

#### Request

```http
GET /api/v1/orgs/me HTTP/1.1
Authorization: Bearer <ANY_VALID_JWT>
```

#### Response – 200 OK

```json
{
  "id": 1,
  "name": "Example Corporation",
  "code": "EXAMPLE_CORP",
  "createdAt": "2025-01-01T09:00:00.000Z"
}
```

---

### GET /orgs

List all organizations. Requires `ORG_MANAGE`.

#### Request

```http
GET /api/v1/orgs HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
```

#### Response – 200 OK

```json
[
  {
    "id": 1,
    "name": "Example Corporation",
    "code": "EXAMPLE_CORP",
    "createdAt": "2025-01-01T09:00:00.000Z"
  }
]
```

---

### GET /orgs/{id}

#### Request

```http
GET /api/v1/orgs/1 HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
```

#### Response – 200 OK

```json
{
  "id": 1,
  "name": "Example Corporation",
  "code": "EXAMPLE_CORP",
  "createdAt": "2025-01-01T09:00:00.000Z"
}
```

#### Response – 404 Not Found

```json
{
  "error": "Organization not found"
}
```

---

### PATCH /orgs/{id}

#### Request

```http
PATCH /api/v1/orgs/1 HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
Content-Type: application/json

{
  "name": "Example Corp Intl"
}
```

#### Response – 200 OK

```json
{
  "id": 1,
  "name": "Example Corp Intl",
  "code": "EXAMPLE_CORP",
  "createdAt": "2025-01-01T09:00:00.000Z"
}
```

---

## Accounts

### GET /accounts

List accounts for current organization. Requires `TRANSACTION_READ`.

#### Request

```http
GET /api/v1/accounts HTTP/1.1
Authorization: Bearer <ACCOUNTANT_JWT>
```

#### Response – 200 OK

```json
[
  {
    "id": 10,
    "organizationId": 1,
    "accountNumber": "4000",
    "name": "Product Revenue",
    "accountType": "REVENUE",
    "currency": "USD"
  },
  {
    "id": 11,
    "organizationId": 1,
    "accountNumber": "6000",
    "name": "Marketing Expense",
    "accountType": "EXPENSE",
    "currency": "USD"
  }
]
```

---

### POST /accounts

Create a new account. Requires `TRANSACTION_WRITE`.

#### Request

```http
POST /api/v1/accounts HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
Content-Type: application/json

{
  "accountNumber": "9999",
  "name": "E2E Test Account",
  "accountType": "EXPENSE",
  "currency": "USD"
}
```

#### Response – 201 Created

```json
{
  "id": 20,
  "organizationId": 1,
  "accountNumber": "9999",
  "name": "E2E Test Account",
  "accountType": "EXPENSE",
  "currency": "USD"
}
```

#### Response – 400 Bad Request

```json
{
  "error": "accountNumber (string) is required"
}
```

#### Response – 409 Conflict

```json
{
  "error": "Account with this number already exists"
}
```

---

### GET /accounts/{id}

#### Request

```http
GET /api/v1/accounts/20 HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
```

#### Response – 200 OK

```json
{
  "id": 20,
  "organizationId": 1,
  "accountNumber": "9999",
  "name": "E2E Test Account",
  "accountType": "EXPENSE",
  "currency": "USD"
}
```

---

### PATCH /accounts/{id}

#### Request

```http
PATCH /api/v1/accounts/20 HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
Content-Type: application/json

{
  "name": "E2E Test Account (Updated)"
}
```

#### Response – 200 OK

```json
{
  "id": 20,
  "organizationId": 1,
  "accountNumber": "9999",
  "name": "E2E Test Account (Updated)",
  "accountType": "EXPENSE",
  "currency": "USD"
}
```

---

### DELETE /accounts/{id}

#### Request

```http
DELETE /api/v1/accounts/20 HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
```

#### Response – 204 No Content

(no body)

---

## Transactions

### GET /transactions

List transactions with optional filters. Requires `TRANSACTION_READ`.

#### Request

```http
GET /api/v1/transactions?from=2025-01-01&to=2025-12-31&accountId=10&limit=20&offset=0 HTTP/1.1
Authorization: Bearer <ACCOUNTANT_JWT>
```

#### Response – 200 OK

```json
[
  {
    "id": 100,
    "organizationId": 1,
    "externalGlid": 12345,
    "txnDate": "2025-03-15 10:30:00",
    "accountId": 10,
    "departmentId": 3,
    "costCenterId": 2,
    "description": "Invoice #INV-1001",
    "debitAmount": 0,
    "creditAmount": 5000,
    "currency": "USD",
    "status": "POSTED",
    "createdBy": 3,
    "approvedBy": 2,
    "createdAt": "2025-03-15 10:31:00",
    "approvedAt": "2025-03-15 11:00:00"
  }
]
```

---

### POST /transactions

Create a draft transaction. Requires `TRANSACTION_WRITE`.

#### Request

```http
POST /api/v1/transactions HTTP/1.1
Authorization: Bearer <ACCOUNTANT_JWT>
Content-Type: application/json

{
  "txnDate": "2026-04-06 09:00:00",
  "accountId": 11,
  "departmentId": 3,
  "costCenterId": 2,
  "description": "Conference sponsorship",
  "debitAmount": 1500,
  "creditAmount": 0,
  "currency": "USD"
}
```

#### Response – 201 Created

```json
{
  "id": 200,
  "organizationId": 1,
  "externalGlid": null,
  "txnDate": "2026-04-06 09:00:00",
  "accountId": 11,
  "departmentId": 3,
  "costCenterId": 2,
  "description": "Conference sponsorship",
  "debitAmount": 1500,
  "creditAmount": 0,
  "currency": "USD",
  "status": "DRAFT",
  "createdBy": 4,
  "approvedBy": null,
  "createdAt": "2026-04-06 09:01:00",
  "approvedAt": null
}
```

#### Response – 400 Bad Request (invalid date)

```json
{
  "error": "txnDate must be a valid datetime (YYYY-MM-DD HH:mm[:ss])"
}
```

---

### GET /transactions/{id}

#### Request

```http
GET /api/v1/transactions/200 HTTP/1.1
Authorization: Bearer <ACCOUNTANT_JWT>
```

#### Response – 200 OK

```json
{
  "id": 200,
  "organizationId": 1,
  "externalGlid": null,
  "txnDate": "2026-04-06 09:00:00",
  "accountId": 11,
  "departmentId": 3,
  "costCenterId": 2,
  "description": "Conference sponsorship",
  "debitAmount": 1500,
  "creditAmount": 0,
  "currency": "USD",
  "status": "DRAFT",
  "createdBy": 4,
  "approvedBy": null,
  "createdAt": "2026-04-06 09:01:00",
  "approvedAt": null
}
```

---

### PATCH /transactions/{id}

#### Request

```http
PATCH /api/v1/transactions/200 HTTP/1.1
Authorization: Bearer <ACCOUNTANT_JWT>
Content-Type: application/json

{
  "description": "Conference sponsorship (updated)"
}
```

#### Response – 200 OK

```json
{
  "id": 200,
  "organizationId": 1,
  "externalGlid": null,
  "txnDate": "2026-04-06 09:00:00",
  "accountId": 11,
  "departmentId": 3,
  "costCenterId": 2,
  "description": "Conference sponsorship (updated)",
  "debitAmount": 1500,
  "creditAmount": 0,
  "currency": "USD",
  "status": "DRAFT",
  "createdBy": 4,
  "approvedBy": null,
  "createdAt": "2026-04-06 09:01:00",
  "approvedAt": null
}
```

#### Response – 400 Bad Request (editing POSTED)

```json
{
  "error": "Posted transactions cannot be edited"
}
```

---

### POST /transactions/{id}/approve

Approve and post a transaction. Requires `TRANSACTION_APPROVE`.

#### Request

```http
POST /api/v1/transactions/200/approve HTTP/1.1
Authorization: Bearer <FINANCE_MANAGER_JWT>
```

#### Response – 200 OK

```json
{
  "id": 200,
  "organizationId": 1,
  "externalGlid": null,
  "txnDate": "2026-04-06 09:00:00",
  "accountId": 11,
  "departmentId": 3,
  "costCenterId": 2,
  "description": "Conference sponsorship (updated)",
  "debitAmount": 1500,
  "creditAmount": 0,
  "currency": "USD",
  "status": "POSTED",
  "createdBy": 4,
  "approvedBy": 2,
  "createdAt": "2026-04-06 09:01:00",
  "approvedAt": "2026-04-06 10:00:00"
}
```

#### Response – 403 Forbidden (wrong role)

```json
{
  "error": "Forbidden",
  "missingPermission": "TRANSACTION_APPROVE"
}
```

---

## Analytics

All analytics endpoints require `ANALYTICS_VIEW`.

### GET /analytics/monthly-pnl

#### Request

```http
GET /api/v1/analytics/monthly-pnl?year=2025 HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
```

#### Response – 200 OK

```json
[
  {
    "month": "2025-01",
    "revenue": 50000,
    "expense": 30000,
    "net": 20000
  },
  {
    "month": "2025-02",
    "revenue": 62000,
    "expense": 31000,
    "net": 31000
  }
]
```

#### Response – 400 Bad Request (invalid year)

```json
{
  "error": "year must be between 1900 and 2100"
}
```

---

### GET /analytics/category-spend

#### Request

```http
GET /api/v1/analytics/category-spend?from=2025-01-01&to=2025-12-31 HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
```

#### Response – 200 OK

```json
[
  {
    "category": "Marketing Expense",
    "spend": 12000
  },
  {
    "category": "Travel Expense",
    "spend": 8000
  }
]
```

#### Response – 400 Bad Request (invalid date)

```json
{
  "error": "from must be a valid date (YYYY-MM-DD)"
}
```

---

### GET /analytics/budget-vs-actual

#### Request

```http
GET /api/v1/analytics/budget-vs-actual?year=2025 HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
```

#### Response – 200 OK

```json
[
  {
    "department_code": "SALES",
    "fiscal_year": 2025,
    "quarter": 1,
    "budget_amount": 50000,
    "forecast_amount": 48000,
    "actual_amount": 47000,
    "variance_amount": -3000
  },
  {
    "department_code": "SALES",
    "fiscal_year": 2025,
    "quarter": 2,
    "budget_amount": 52000,
    "forecast_amount": 51000,
    "actual_amount": 53000,
    "variance_amount": 1000
  }
]
```

---

### GET /analytics/cashflow

#### Request

```http
GET /api/v1/analytics/cashflow?from=2025-01-01&to=2025-06-30 HTTP/1.1
Authorization: Bearer <ADMIN_JWT>
```

#### Response – 200 OK

```json
[
  {
    "month": "2025-01",
    "inflow": 55000,
    "outflow": 30000,
    "net": 25000
  },
  {
    "month": "2025-02",
    "inflow": 60000,
    "outflow": 35000,
    "net": 25000
  }
]
```

#### Response – 400 Bad Request (invalid `to` date)

```json
{
  "error": "to must be a valid date (YYYY-MM-DD)"
}
```