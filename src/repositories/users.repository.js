const db = require('../config/db');
const User = require('../models/user.model');

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

async function findByEmail(email) {
  const row = await get('SELECT * FROM users WHERE email = ?', [email]);
  return User.fromRow(row);
}

async function findById(id) {
  const row = await get('SELECT * FROM users WHERE id = ?', [id]);
  return User.fromRow(row);
}

async function findAllByOrganization(organizationId) {
  const rows = await all(
    'SELECT * FROM users WHERE organization_id = ? ORDER BY created_at DESC',
    [organizationId]
  );
  return rows.map(User.fromRow);
}

async function findByIdAndOrganization(id, organizationId) {
  const row = await get(
    'SELECT * FROM users WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  return User.fromRow(row);
}

async function create({ organizationId, email, fullName, passwordHash, isActive }) {
  const res = await run(
    `INSERT INTO users
     (organization_id, email, full_name, password_hash, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [organizationId, email, fullName, passwordHash, isActive ? 1 : 0]
  );
  return findById(res.lastID);
}

async function update(id, organizationId, update) {
  const columnMap = {
    fullName: 'full_name',
    isActive: 'is_active',
    passwordHash: 'password_hash',
    email: 'email'
  };

  const keys = Object.keys(update);
  if (keys.length === 0) {
    return findByIdAndOrganization(id, organizationId);
  }

  const sets = [];
  const params = [];
  keys.forEach((k) => {
    const col = columnMap[k] || k;
    sets.push(`${col} = ?`);
    params.push(
      k === 'isActive' ? (update[k] ? 1 : 0) : update[k]
    );
  });
  params.push(id, organizationId);

  await run(
    `UPDATE users SET ${sets.join(', ')}
     WHERE id = ? AND organization_id = ?`,
    params
  );
  return findByIdAndOrganization(id, organizationId);
}

async function remove(id, organizationId) {
  await run('DELETE FROM users WHERE id = ? AND organization_id = ?', [
    id,
    organizationId
  ]);
}

module.exports = {
  findByEmail,
  findById,
  findAllByOrganization,
  findByIdAndOrganization,
  create,
  update,
  remove
};