## Overview

The project is a Node.js + Express + sqlite3 backend for a multi-tenant finance dashboard. Code is organized by technical layers (routing, controllers, services, repositories, models) plus dedicated areas for database, tests, and API docs. This keeps HTTP concerns, business logic, and persistence clearly separated.

## Top Level layout

```
finance-dashboard-backend/
├──.env-config/ (contains variables for different environments (dev, beta, stage, prod))
├── database/ (contains database created from dataset)
├── dataset/ (contains the dataset used)
├── docs/ (contains api schema, and documentations)
├── src/ (source code)
└── tests/ (e2e tests)
├── package.json
├── package-lock.json (please do not change - made changes to fix vulnerabilities in dependencies.)
├── .env
├── README.md
├── .nvmrc (node version)
├── .nycrc (test coverage config)
├── eslint.config.js
```

### **.env-config/**

.env-config/ folder is not used in the current implementation. But it will be useful when running CI/CD pipelines. 

## src/ (application code)

```
src/
├── app.js (Express app setup (middlewares, routes))
├── server.js (Starts HTTP server and runs migrations on boot)
├── config/
|    └── db.js (sqlite3 connection pool)
├── db/ (migration and seeding of database)
├── routes/ (Request routing)
├── controllers/ (HTTP logic)
├── services/ (Business logic (no Express or sqlite details))
├── repositories/ (sqlite3 handling)
├── models/ (JS representations of tables)
├── middlewares/ (auth, rbac and error handling)
└── utils/ (utility function for validation etc.)
```

