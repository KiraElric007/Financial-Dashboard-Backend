// 003_finance_fact_tables.js

module.exports.up = function up(db) {
  return new Promise((resolve, reject) => {
    db.exec(
      `
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS transactions (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        txn_date        DATETIME NOT NULL,
        account_id      INTEGER NOT NULL,
        department_id   INTEGER,
        cost_center_id  INTEGER,
        description     TEXT,
        debit_amount    NUMERIC(18,2) NOT NULL DEFAULT 0,
        credit_amount   NUMERIC(18,2) NOT NULL DEFAULT 0,
        currency        TEXT NOT NULL,
        status          TEXT NOT NULL DEFAULT 'POSTED',
        created_by      INTEGER,
        approved_by     INTEGER,
        created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        approved_at     DATETIME,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id)      REFERENCES accounts(id),
        FOREIGN KEY (department_id)   REFERENCES departments(id),
        FOREIGN KEY (cost_center_id)  REFERENCES cost_centers(id),
        FOREIGN KEY (created_by)      REFERENCES users(id),
        FOREIGN KEY (approved_by)     REFERENCES users(id)
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_org_date
        ON transactions (organization_id, txn_date);

      CREATE INDEX IF NOT EXISTS idx_transactions_account
        ON transactions (account_id);

      CREATE TABLE IF NOT EXISTS budgets (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        department_id   INTEGER NOT NULL,
        fiscal_year     INTEGER NOT NULL,
        quarter         INTEGER NOT NULL,
        budget_amount   NUMERIC(18,2) NOT NULL,
        forecast_amount NUMERIC(18,2),
        actual_amount   NUMERIC(18,2),
        variance_amount NUMERIC(18,2),
        currency        TEXT NOT NULL DEFAULT 'USD',
        notes           TEXT,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id)   REFERENCES departments(id)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_org_dept_period
        ON budgets (organization_id, department_id, fiscal_year, quarter);
      `,
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

module.exports.down = function down(db) {
  return new Promise((resolve, reject) => {
    db.exec(
      `
      DROP INDEX IF EXISTS idx_budgets_org_dept_period;
      DROP TABLE IF EXISTS budgets;

      DROP INDEX IF EXISTS idx_transactions_account;
      DROP INDEX IF EXISTS idx_transactions_org_date;
      DROP TABLE IF EXISTS transactions;
      `,
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};