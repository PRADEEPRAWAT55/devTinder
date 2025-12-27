const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Try later.',
});

module.exports = { loginLimiter };