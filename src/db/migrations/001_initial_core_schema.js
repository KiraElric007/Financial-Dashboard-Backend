// 001_initial_core_schema.js

module.exports.up = function up(db) {
  return new Promise((resolve, reject) => {
    db.exec(
      `
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS organizations (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT NOT NULL,
        code        TEXT NOT NULL UNIQUE,
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        email           TEXT NOT NULL UNIQUE,
        full_name       TEXT NOT NULL,
        password_hash   TEXT NOT NULL,
        is_active       INTEGER NOT NULL DEFAULT 1,
        created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS departments (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        code            TEXT NOT NULL,
        name            TEXT NOT NULL,
        UNIQUE (organization_id, code),
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS cost_centers (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        code            TEXT NOT NULL,
        name            TEXT NOT NULL,
        UNIQUE (organization_id, code),
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        account_number  TEXT NOT NULL,
        name            TEXT NOT NULL,
        currency        TEXT NOT NULL,
        account_type    TEXT NOT NULL,
        UNIQUE (organization_id, account_number),
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      );
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
      DROP TABLE IF EXISTS accounts;
      DROP TABLE IF EXISTS cost_centers;
      DROP TABLE IF EXISTS departments;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS organizations;
      `,
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};