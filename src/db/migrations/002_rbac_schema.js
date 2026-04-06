// 002_rbac_schema.js

module.exports.up = function up(db) {
  return new Promise((resolve, reject) => {
    db.exec(
      `
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS roles (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT NOT NULL UNIQUE,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS permissions (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        code        TEXT NOT NULL UNIQUE,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS user_roles (
        user_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        PRIMARY KEY (user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id       INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
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
      DROP TABLE IF EXISTS role_permissions;
      DROP TABLE IF EXISTS user_roles;
      DROP TABLE IF EXISTS permissions;
      DROP TABLE IF EXISTS roles;
      `,
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};