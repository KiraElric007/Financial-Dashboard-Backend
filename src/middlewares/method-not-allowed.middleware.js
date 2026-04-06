module.exports = function methodNotAllowed(req, res) {
  res.status(405).json({
    error: 'Method Not Allowed',
    method: req.method,
    path: req.originalUrl
  });
};