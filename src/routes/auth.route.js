const express = require('express');
const { loginValidation } = require('../validations/auth.validation');
const { login, refresh, logout } = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', auth, logout);

module.exports = router;
