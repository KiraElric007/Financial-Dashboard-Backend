const db = require('../config/db');
const Organization = require('../models/organization.model');

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

async function findById(id) {
  const row = await get('SELECT * FROM organizations WHERE id = ?', [id]);
  return Organization.fromRow(row);
}

async function findAll() {
  const rows = await all('SELECT * FROM organizations ORDER BY created_at DESC');
  return rows.map(Organization.fromRow);
}

async function update(id, update) {
  const keys = Object.keys(update);
  if (keys.length === 0) return findById(id);

  const sets = [];
  const params = [];
  keys.forEach((k) => {
    sets.push(`${k} = ?`);
    params.push(update[k]);
  });
  params.push(id);

  await run(`UPDATE organizations SET ${sets.join(', ')} WHERE id = ?`, params);
  return findById(id);
}

module.exports = {
  findById,
  findAll,
  update
};