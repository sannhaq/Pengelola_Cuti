const { z } = require('zod');
const { validate } = require('../middleware/validation.middleware');

const loginValidation = validate({
  email: z.string().email(),
  password: z.string(),
});

module.exports = { loginValidation };
