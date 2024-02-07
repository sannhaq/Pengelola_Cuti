const express = require('express');

const router = express.Router();
const roleController = require('../controllers/role.controller');
const checkPermission = require('../middleware/checkPermission.middleware');

// Get all role and permission
router.get('/', checkPermission('Get All Role'), roleController.getAllRolesWithPermissions);

// PUT role
router.put('/update/:id', checkPermission('Update Role'), roleController.updateRole);

// POST role
router.post('/create', checkPermission('Create Role'), roleController.createRoleWithPermissions);

// DELETE role
router.delete('/delete/:id', checkPermission('Delete Role'), roleController.deleteRole);

// GET role by id
router.get('/:id', checkPermission('Get All Role'), roleController.getRoleById);

module.exports = router;
