const express = require('express');

const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const roleMiddleware = require('../middleware/role.middleware');

//  testing
router.get('/history/:nik/testing', leaveController.getLeaveHistoryNik);

//  api
router.get('/mandatory', roleMiddleware('User'), leaveController.mandatoryLeave);
router.get('/history/me', roleMiddleware('User'), leaveController.getLeaveHistoryMe);
router.get('/history/:nik', roleMiddleware('Admin'), leaveController.getLeaveHistoryNik);

module.exports = router;
