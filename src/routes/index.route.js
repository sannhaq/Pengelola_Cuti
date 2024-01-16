const express = require('express');
const auth = require('./auth.route');
const authMiddleware = require('../middleware/auth.middleware');
const leave = require('./leave.route');

const router = express.Router();

router.use('/auth', auth);
router.use(authMiddleware);
router.use('/leave', leave);

module.exports = router;
