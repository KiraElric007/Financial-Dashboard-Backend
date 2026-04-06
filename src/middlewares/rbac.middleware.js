const db = require('../config/db');

// Fetch distinct permission codes for a given user
function getUserPermissionCodes(userId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT p.code
      FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      INNER JOIN user_roles ur ON ur.role_id = rp.role_id
      WHERE ur.user_id = ?
    `;
    db.all(sql, [userId], (err, rows) => {
      if (err) return reject(err);
      const codes = rows.map((r) => r.code);
      resolve(codes);
    });
  });
}

function requirePermission(permissionCode) {
  return async function (req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthenticated' });
      }

      const userId = req.user.id;
      const perms = await getUserPermissionCodes(userId);

      if (!perms.includes(permissionCode)) {
        return res.status(403).json({
          error: 'Forbidden',
          missingPermission: permissionCode
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  requirePermission
};