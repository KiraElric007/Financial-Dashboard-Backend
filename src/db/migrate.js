const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_FOLDER = path.join(__dirname, '../../database');
const DB_PATH = path.join(DB_FOLDER, 'finance.db');
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');


if (!fs.existsSync(DB_FOLDER)) {
  fs.mkdirSync(DB_FOLDER, { recursive: true });
}

function openDb() {
  return new sqlite3.Database(DB_PATH);
}

function ensureMigrationsTable(db) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS migrations (
        name   TEXT PRIMARY KEY,
        run_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      `,
      (err) => (err ? reject(err) : resolve())
    );
  });
}

function getAppliedMigrations(db) {
  return new Promise((resolve, reject) => {
    db.all('SELECT name FROM migrations ORDER BY name', (err, rows) => {
      if (err) return reject(err);
      const names = rows.map((r) => r.name);
      resolve(names);
    });
  });
}

function recordMigration(db, name) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO migrations (name) VALUES (?)',
      [name],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

function loadMigrationFiles() {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.match(/^\d+.*\.js$/)) // e.g. 001_initial_core_schema.js
    .sort(); // numeric prefix ordering

  return files.map((file) => ({
    name: file,
    path: path.join(MIGRATIONS_DIR, file),
    module: require(path.join(MIGRATIONS_DIR, file))
  }));
}

async function runMigrations() {
  const db = openDb();
  db.serialize();

  try {
    console.log('Ensuring migrations table exists...');
    await ensureMigrationsTable(db);

    const applied = await getAppliedMigrations(db);
    const migrations = loadMigrationFiles();

    const pending = migrations.filter((m) => !applied.includes(m.name));

    if (pending.length === 0) {
      console.log('No pending migrations. Database is up to date.');
      return;
    }

    console.log('Pending migrations:', pending.map((m) => m.name).join(', '));

    for (const migration of pending) {
      const { name, module } = migration;
      if (typeof module.up !== 'function') {
        throw new Error(`Migration ${name} does not export an up(db) function`);
      }

      console.log(`Running migration: ${name}...`);
      await module.up(db);
      await recordMigration(db, name);
      console.log(`Migration completed: ${name}`);
    }

    console.log('All pending migrations applied.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    db.close();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };