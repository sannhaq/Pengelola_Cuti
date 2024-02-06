const express = require('express');

const router = express.Router();
const roleController = require('../controllers/role.controller');
const checkPermission = require('../middleware/checkPermission.middleware');

// PUT role
router.put('/update/:id', checkPermission('Update Role'), roleController.updateRole);

module.exports = router;
