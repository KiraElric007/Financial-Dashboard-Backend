const usersService = require('../services/users.service');
const { validateUserCreateBody } = require('../utils/validation');

async function listUsers(req, res, next) {
  try {
    const orgId = req.user.organizationId;
    const users = await usersService.listUsers(orgId);
    res.json(users.map(u => (u.toSafeJSON ? u.toSafeJSON() : u)));
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const orgId = req.user.organizationId;
    const { id } = req.params;
    const user = await usersService.getUserById(orgId, Number(id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.toSafeJSON ? user.toSafeJSON() : user);
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    validateUserCreateBody(req.body);
    const orgId = req.user.organizationId;
    const created = await usersService.createUser(orgId, req.body || {});
    res.status(201).json(created.toSafeJSON ? created.toSafeJSON() : created);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const orgId = req.user.organizationId;
    const { id } = req.params;
    const updated = await usersService.updateUser(orgId, Number(id), req.body || {});
    res.json(updated.toSafeJSON ? updated.toSafeJSON() : updated);
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const orgId = req.user.organizationId;
    const { id } = req.params;
    await usersService.deleteUser(orgId, Number(id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};