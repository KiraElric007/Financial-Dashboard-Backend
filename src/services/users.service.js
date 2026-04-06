const bcrypt = require('bcrypt');
const usersRepository = require('../repositories/users.repository');

const SALT_ROUNDS = 10;

async function listUsers(organizationId) {
  return usersRepository.findAllByOrganization(organizationId);
}

async function getUserById(organizationId, id) {
  const user = await usersRepository.findByIdAndOrganization(id, organizationId);
  return user;
}

async function createUser(organizationId, payload) {
  const { email, fullName, password, isActive = true } = payload;

  const existing = await usersRepository.findByEmail(email);
  if (existing) {
    const err = new Error('User with this email already exists');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const created = await usersRepository.create({
    organizationId,
    email,
    fullName,
    passwordHash,
    isActive
  });

  return created;
}

async function updateUser(organizationId, id, payload) {
  const user = await usersRepository.findByIdAndOrganization(id, organizationId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const update = {};
  if (payload.fullName !== undefined) update.fullName = payload.fullName;
  if (payload.isActive !== undefined) update.isActive = !!payload.isActive;
  if (payload.password) {
    update.passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
  }

  const updated = await usersRepository.update(id, organizationId, update);
  return updated;
}

async function deleteUser(organizationId, id) {
  const user = await usersRepository.findByIdAndOrganization(id, organizationId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  await usersRepository.remove(id, organizationId);
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};