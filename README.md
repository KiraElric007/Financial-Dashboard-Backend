# Finance Dashboard Backend

This backend application uses two public datasets `General-Ledger.xlsx` and `Budget-Forecast.xlsx`. [source](https://excelx.com/practice-data/finance-accounting/).

The dataset is loaded into the database using `/src/db/seed.js`. `seed.js` populate sample users, roles and permissions as well.

---

This application handles:
1. User and Role Management.
2. CRUD operations for Org, Users, and Financial data
3. Dashboard Summary APIs (Analytics).
4. Access Control Logic (Auth, RBAC).
5. Validation and Error Handling. (Validation utils and Middlewares)
6. Data Persistance using SQLite3.
7. Supports Database migration
8. Authentication using JWT.
9. Pagination (List Transaction end point)
10. E2E tests and coverage report.
11. Linting with ESLint (The console statements are left in the code deliberately for debugging as well as show the working of eslint)
12. Provisions for Multiple env files for easy pipeline management in future.

---


```
Note: The `/auth/logout` endpoint is just a placeholder at this time since JWT is stateless. It can be implemented using token blacklisting in the future with the help of `sessions` table in DB or using Redis.

JWT_SECRET is hardcoded in env file for development purpose.
```

---

The setup and running is explained in `/docs/QUICKSTART.md`

The Folder structure is explained in `/docs/FOLDER_STRUCTURE.md`.

Request and Response examples for all endpoints is provided in `/docs/ENDPOINT_EXAMPLES.md`

API Schema is provided in json and yaml format in `/docs/api_schema` folder.

API Documentation in Swagger - https://app.swaggerhub.com/apis-docs/freelancer-67d/finance-dashboard-backend-api/1.0.0?view=uiDocs