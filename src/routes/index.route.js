const express = require('express');
const auth = require('./auth.route');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use('/auth', auth);
router.use(authMiddleware);

module.exports = router;
