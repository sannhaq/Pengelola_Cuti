const express = require('express');
const auth = require('./auth.route');
const employee = require('./employee.route');
const leave = require('./leave.route');
const position = require('./position.route');
const role = require('./role.route');
const webSetting = require('./webSetting.route');
const siteSetting = require('./siteSetting.route');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use('/auth', auth);
router.use('/webSetting', webSetting);
router.use(authMiddleware);
router.use('/employee', employee);
router.use('/leave', leave);
router.use('/position', position);
router.use('/role', role);
router.use('/siteSetting', siteSetting);

module.exports = router;
