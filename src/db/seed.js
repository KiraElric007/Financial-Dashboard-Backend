const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const xlsx = require('@e965/xlsx');
const bcrypt = require('bcrypt');

const ORG_CODE = 'Example_CORP';
const ORG_NAME = 'Example Corporation';

const DB_PATH = path.join(__dirname, '../../database/finance.db');
const BF_PATH = path.join(__dirname, '../../dataset/Budget-Forecast.xlsx');
const GL_PATH = path.join(__dirname, '../../dataset/General-Ledger.xlsx');

const SALT_ROUNDS = 10;

const ROLES = [
  { name: 'ADMIN', description: 'System administrator with full access' },
  { name: 'FINANCE_MANAGER', description: 'Can manage finance data and approve transactions' },
  { name: 'ACCOUNTANT', description: 'Can manage and post transactions' },
  { name: 'MANAGER', description: 'Can view analytics for their departments' },
  { name: 'EMPLOYEE', description: 'Basic read-only access to own org data' }
];

const PERMISSIONS = [
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

function openDb() {
  return new sqlite3.Database(DB_PATH);
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function readExcelRows(filePath) {
  const workbook = xlsx.readFile(filePath, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet, { defval: null });
}

function toDateTime(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 19).replace('T', ' ');
  }
  const d = new Date(value);
  if (!isNaN(d)) {
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }
  // fallback: assume it is already a proper string
  return value;
}

async function seedRolesAndPermissions(db) {
  console.log('Seeding roles and permissions...');

  // Seed roles
  for (const role of ROLES) {
    await run(
      db,
      `INSERT OR IGNORE INTO roles (name, description)
       VALUES (?, ?)`,
      [role.name, role.description]
    );
  }

  // Seed permissions
  for (const perm of PERMISSIONS) {
    await run(
      db,
      `INSERT OR IGNORE INTO permissions (code, description)
       VALUES (?, ?)`,
      [perm.code, perm.description]
    );
  }

  // Build lookup maps
  const roleRows = await all(db, 'SELECT id, name FROM roles');
  const roleMap = {};
  roleRows.forEach((r) => { roleMap[r.name] = r.id; });

  const permRows = await all(db, 'SELECT id, code FROM permissions');
  const permMap = {};
  permRows.forEach((p) => { permMap[p.code] = p.id; });

  // Seed role_permissions
  for (const [roleName, permCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap[roleName];
    if (!roleId) continue;

    for (const code of permCodes) {
      const permId = permMap[code];
      if (!permId) continue;

      await run(
        db,
        `INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
         VALUES (?, ?)`,
        [roleId, permId]
      );
    }
  }

  console.log('Roles and permissions seeded.');
}

async function seedUsers(db, orgId) {
  console.log('Seeding users...');

  const demoUsers = [
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

  for (const u of demoUsers) {
    const exists = await get(
      db,
      'SELECT id FROM users WHERE email = ?',
      [u.email]
    );
    if (exists) continue;

    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);

    const res = await run(
      db,
      `INSERT INTO users (organization_id, email, full_name, password_hash, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [orgId, u.email, u.fullName, hash]
    );

    const userId = res.lastID;

    // Optionally: attach roles if you have pre-seeded roles
    for (const roleName of u.roles) {
      const role = await get(
        db,
        'SELECT id FROM roles WHERE name = ?',
        [roleName]
      );
      if (role) {
        await run(
          db,
          'INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [userId, role.id]
        );
      }
    }
  }
}

async function seed() {
  const db = openDb();
  db.serialize();

  try {
    console.log('Reading Excel datasets...');
    const glRows = readExcelRows(GL_PATH); // General-Ledger.xlsx
    const bfRows = readExcelRows(BF_PATH); // Budget-Forecast.xlsx

    console.log('Ensuring base organization...');
    await run(
      db,
      'INSERT OR IGNORE INTO organizations (name, code) VALUES (?, ?)',
      [ORG_NAME, ORG_CODE]
    );
    const org = await get(
      db,
      'SELECT id FROM organizations WHERE code = ?',
      [ORG_CODE]
    );
    const orgId = org.id;

    seedRolesAndPermissions(db);
    seedUsers(db, orgId);

    // Collect unique dimension values from both sheets
    const deptSet = new Set();
    const costCenterSet = new Set();
    const accountKeySet = new Set(); // `${AccountNumber}|${AccountName}|${AccountType}|${Currency}`

    glRows.forEach((row) => {
      if (row.Dept) deptSet.add(row.Dept);
      if (row.CostCenter) costCenterSet.add(row.CostCenter);
      if (row.AccountNumber) {
        const key = [
          String(row.AccountNumber),
          row.AccountName || String(row.AccountNumber),
          Number(row.debit) === 0 ? 'REVENUE' : 'EXPENSE', // simple heuristic
          row.Currency || 'USD'
        ].join('|');
        accountKeySet.add(key);
      }
    });

    bfRows.forEach((row) => {
      if (row.Dept) deptSet.add(row.Dept);
    });

    console.log('Seeding departments...');
    for (const dept of deptSet) {
      await run(
        db,
        'INSERT OR IGNORE INTO departments (organization_id, code, name) VALUES (?, ?, ?)',
        [orgId, String(dept), String(dept)]
      );
    }

    console.log('Seeding cost centers...');
    for (const cc of costCenterSet) {
      await run(
        db,
        'INSERT OR IGNORE INTO cost_centers (organization_id, code, name) VALUES (?, ?, ?)',
        [orgId, String(cc), String(cc)]
      );
    }

    console.log('Seeding accounts...');
    for (const key of accountKeySet) {
      const [accountNumber, accountName, accountType, currency] = key.split('|');
      await run(
        db,
        `INSERT OR IGNORE INTO accounts
         (organization_id, account_number, name, account_type, currency)
         VALUES (?, ?, ?, ?, ?)`,
        [orgId, accountNumber, accountName, accountType, currency]
      );
    }

    // Build lookup maps
    console.log('Building lookup maps...');
    const deptRows = await all(
      db,
      'SELECT id, code FROM departments WHERE organization_id = ?',
      [orgId]
    );
    const deptMap = {};
    deptRows.forEach((r) => { deptMap[r.code] = r.id; });

    const ccRows = await all(
      db,
      'SELECT id, code FROM cost_centers WHERE organization_id = ?',
      [orgId]
    );
    const ccMap = {};
    ccRows.forEach((r) => { ccMap[r.code] = r.id; });

    const accountRows = await all(
      db,
      'SELECT id, account_number FROM accounts WHERE organization_id = ?',
      [orgId]
    );
    const accountMap = {};
    accountRows.forEach((r) => { accountMap[r.account_number] = r.id; });

    console.log('Seeding transactions (General Ledger)...');
    await run(db, 'BEGIN TRANSACTION');
    for (const row of glRows) {
      const accountNumber = String(row.AccountNumber);
      const accountId = accountMap[accountNumber];
      if (!accountId) {
        console.warn('Skipping row without valid account:', accountNumber);
        continue;
      }

      const deptCode = row.Dept ? String(row.Dept) : null;
      const costCenterCode = row.CostCenter ? String(row.CostCenter) : null;

      const departmentId = deptCode ? deptMap[deptCode] : null;
      const costCenterId = costCenterCode ? ccMap[costCenterCode] : null;

      const txnDate = toDateTime(row.TxnDate);
      const debit = Number(row.Debit || 0);
      const credit = Number(row.Credit || 0);
      const currency = row.Currency || 'USD';

      await run(
        db,
        `INSERT INTO transactions
         (organization_id, txn_date, account_id,
          department_id, cost_center_id, description,
          debit_amount, credit_amount, currency, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orgId,
          txnDate,
          accountId,
          departmentId,
          costCenterId,
          row.Description || null,
          debit,
          credit,
          currency,
          'POSTED'
        ]
      );
    }
    await run(db, 'COMMIT');

    console.log('Seeding budgets (Budget Forecast)...');
    await run(db, 'BEGIN TRANSACTION');
    for (const row of bfRows) {
      const deptCode = row.Dept ? String(row.Dept) : null;
      if (!deptCode) continue;

      let departmentId = deptMap[deptCode];
      // In case a dept appears only in budget file
      if (!departmentId) {
        const res = await run(
          db,
          'INSERT INTO departments (organization_id, code, name) VALUES (?, ?, ?)',
          [orgId, deptCode, deptCode]
        );
        // re-query to get id
        const d = await get(
          db,
          'SELECT id FROM departments WHERE organization_id = ? AND code = ?',
          [orgId, deptCode]
        );
        departmentId = d.id;
        deptMap[deptCode] = departmentId;
      }

      const fiscalYear = Number(row.FiscalYear);
      const quarter = Number(row.Quarter);
      const budget = Number(row.BudgetUSD || 0);
      const forecast = row.ForecastUSD != null ? Number(row.ForecastUSD) : null;
      const actual = row.ActualUSD != null ? Number(row.ActualUSD) : null;
      const variance = row.VarianceUSD != null ? Number(row.VarianceUSD) : null;
      const notes = row.Notes || null;

      await run(
        db,
        `INSERT OR REPLACE INTO budgets
         (organization_id, department_id, fiscal_year, quarter,
          budget_amount, forecast_amount, actual_amount, variance_amount,
          currency, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orgId,
          departmentId,
          fiscalYear,
          quarter,
          budget,
          forecast,
          actual,
          variance,
          'USD',
          notes
        ]
      );
    }
    await run(db, 'COMMIT');

    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Seeding error:', err);
    try {
      await run(openDb(), 'ROLLBACK');
    } catch (err) {
      console.error('Rollback error:', err);
    }
  } finally {
    db.close();
  }
}

// Allow running via: node src/db/seed.js
if (require.main === module) {
  seed();
}

module.exports = { seed };