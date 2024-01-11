const express = require('express');

const router = express.Router();
const leaveController = require('../controllers/leave.controller');

// GET History Employee By NIK
router.get('/history/:nik', leaveController.getLeaveHistoryNik);

module.exports = router;
