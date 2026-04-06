const authService = require('../services/auth.service');
const { validateLoginBody } = require('../utils/validation');

async function login(req, res, next) {
  try {
    validateLoginBody(req.body);

    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await authService.login(email, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    // Stateless JWT: logout is frontend concern; can implement token blacklist later
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    // In case you want to refresh from DB:
    // const safe = await authService.getCurrentUser(user.id);
    // return res.json(safe || {});

    return res.json(user.toSafeJSON ? user.toSafeJSON() : user);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  logout,
  getCurrentUser
};