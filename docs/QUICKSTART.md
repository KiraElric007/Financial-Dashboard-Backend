## Quickstart Guide
1. Run `nvm use` for installing or selecting (if already available) node version v24.14.1
2. Run `npm install` to install dependencies.
3. Run `npm run setup` to create database, tables and seed the tables with data.
4. Run `npm run test-e2e` to test everything is working.
5. Run `npm run dev` to start the server.
6. Call the `POST /api/v1/auth/login` endpoint with username and password to get the JWT token.
The following users are seeded in db:
```
[
    {
      email: 'admin@example.test',
      fullName: 'Admin',
      password: 'Admin@123',
      roles: ['ADMIN']
    },
    {
      email: 'fmgr@example.test',
      fullName: 'Finance Manager',
      password: 'Finance@123',
      roles: ['FINANCE_MANAGER']
    },
    {
      email: 'acct@example.test',
      fullName: 'Accountant',
      password: 'Account@123',
      roles: ['ACCOUNTANT']
    }
  ];
```
7. Use the token as bearer token in headers of other endpoints. `Authorization: Bearer <token>`.

## Seeded Roles and Permissions

```
ROLES = [
  { name: 'ADMIN', description: 'System administrator with full access' },
  { name: 'FINANCE_MANAGER', description: 'Can manage finance data and approve transactions' },
  { name: 'ACCOUNTANT', description: 'Can manage and post transactions' },
  { name: 'MANAGER', description: 'Can view analytics for their departments' },
  { name: 'EMPLOYEE', description: 'Basic read-only access to own org data' }
];

PERMISSIONS = [
  { code: 'ORG_MANAGE', description: 'Manage organization settings' },
  { code: 'USER_MANAGE', description: 'Manage users and roles' },

  { code: 'TRANSACTION_READ', description: 'View transactions' },
  { code: 'TRANSACTION_WRITE', description: 'Create and edit transactions' },
  { code: 'TRANSACTION_APPROVE', description: 'Approve and post transactions' },

  { code: 'BUDGET_READ', description: 'View budgets and forecasts' },
  { code: 'BUDGET_WRITE', description: 'Create and edit budgets and forecasts' },

  { code: 'ANALYTICS_VIEW', description: 'View analytics dashboards' }
];

// Role → permission mapping
const ROLE_PERMISSIONS = {
  ADMIN: [
    'ORG_MANAGE',
    'USER_MANAGE',
    'TRANSACTION_READ',
    'TRANSACTION_WRITE',
    'TRANSACTION_APPROVE',
    'BUDGET_READ',
    'BUDGET_WRITE',
    'ANALYTICS_VIEW'
  ],
  FINANCE_MANAGER: [
    'TRANSACTION_READ',
    'TRANSACTION_WRITE',
    'TRANSACTION_APPROVE',
    'BUDGET_READ',
    'BUDGET_WRITE',
    'ANALYTICS_VIEW'
  ],
  ACCOUNTANT: [
    'TRANSACTION_READ',
    'TRANSACTION_WRITE',
    'BUDGET_READ',
    'ANALYTICS_VIEW'
  ],
  MANAGER: [
    'TRANSACTION_READ',
    'BUDGET_READ',
    'ANALYTICS_VIEW'
  ],
  EMPLOYEE: [
    'TRANSACTION_READ',
    'ANALYTICS_VIEW'
  ]
};
```

## Endpoint list

### Auth endpoints
`POST /api/v1/auth/login`

Authenticate with email and password, returns JWT and user info.

`POST /api/v1/auth/logout`

This endpoint is a placeholder for future use. Can use sessions table in DB or use Redis to blacklist JWT tokens when logout is called.

`GET /api/v1/auth/me`

Get the currently authenticated user’s profile (requires Authorization: Bearer <token>).

### User endpoints
(All require authentication and USER_MANAGE permission.)

`GET /api/v1/users`

List users in the current organization.

`POST /api/v1/users`

Create a new user in the current organization.

`GET /api/v1/users/{id}`

Get details of a specific user.

`PATCH /api/v1/users/{id}`

Update an existing user (e.g., name, active flag, password).

`DELETE /api/v1/users/{id}`

Delete (or hard-remove) a user.

### Organization endpoints

`GET /api/v1/orgs/me`

Get the organization record associated with the current user (requires auth).

`GET /api/v1/orgs`

List all organizations (requires auth and ORG_MANAGE permission).

`GET /api/v1/orgs/{id}`

Get a specific organization by id (requires ORG_MANAGE).

`PATCH /api/v1/orgs/{id}`

Update organization fields (e.g., name, code) (requires ORG_MANAGE).

### Account endpoints
(All require authentication; permissions vary by action.)

`GET /api/v1/accounts`

List accounts for the current organization (requires TRANSACTION_READ).

`POST /api/v1/accounts`

Create a new account (requires TRANSACTION_WRITE).

`GET /api/v1/accounts/{id}`

Get a specific account (requires TRANSACTION_READ).

`PATCH /api/v1/accounts/{id}`

Update an account (requires TRANSACTION_WRITE).

`DELETE /api/v1/accounts/{id}`
Delete an account (requires TRANSACTION_WRITE).

### Transaction endpoints
(All require authentication; permissions vary by action.)

`GET /api/v1/transactions`

List transactions for the current organization. Requires TRANSACTION_READ.
```
query params:

from / to – optional - date/time range

accountId –  optional - filter by account

deptCode – optional - filter by department

costCenterCode – optional - filter by cost center

limit, offset – optional  - pagination (default first 50)
```

`POST /api/v1/transactions`

Create a new draft transaction (requires TRANSACTION_WRITE).

`GET /api/v1//transactions/{id}`

Get a specific transaction (requires TRANSACTION_READ).

`PATCH /api/v1//transactions/{id}`

Update an existing transaction (only allowed while in DRAFT) (requires TRANSACTION_WRITE).

`POST /api/v1/transactions/{id}/approve`

Approve and post a transaction (set status to POSTED) (requires TRANSACTION_APPROVE).

### Analytics endpoints
(All require authentication and ANALYTICS_VIEW permission.)

`GET /api/v1/analytics/category-spend`

Returns spend by category (e.g., expense accounts).
```
Query params:
from, to – date range (YYYY-MM-DD).
```

`GET /api/v1/analytics/budget-vs-actual`

Returns budget vs actual by department and quarter.
```
Query params:
year - e.g. 2025
```

`GET /api/v1/analytics/cashflow`

Returns cash inflow/outflow and net by period.
```
Query params:
from, to – date range (YYYY-MM-DD).
```

