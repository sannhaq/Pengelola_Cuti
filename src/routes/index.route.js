const express = require('express');
const auth = require('./auth.route');
const employee = require('./employee.route');
const leave = require('./leave.route');
const position = require('./position.route');
const role = require('./role.route');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use('/auth', auth);
router.use(authMiddleware);
router.use('/employee', employee);
router.use('/leave', leave);
router.use('/position', position);
router.use('/role', role);

module.exports = router;
