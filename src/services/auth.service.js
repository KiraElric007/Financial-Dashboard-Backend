const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usersRepository = require('../repositories/users.repository');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

async function login(email, password) {
  const user = await usersRepository.findByEmail(email);
  if (!user || !user.isActive) {
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return null;
  }

  const token = jwt.sign(
    { userId: user.id, orgId: user.organizationId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: user.toSafeJSON()
  };
}

async function getCurrentUser(userId) {
  const user = await usersRepository.findById(userId);
  if (!user) return null;
  return user.toSafeJSON();
}

module.exports = {
  login,
  getCurrentUser
};