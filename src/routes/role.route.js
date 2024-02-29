const express = require('express');

const router = express.Router();
const roleController = require('../controllers/role.controller');
const checkPermission = require('../middleware/checkPermission.middleware');

// Get all role and permission
router.get('/', checkPermission('Get All Role'), roleController.getAllRolesWithPermissions);

// GET permissions
router.get(
  '/permissions',
  checkPermission('Create Role', 'Update Role'),
  roleController.getPermissions,
);

// PUT role
router.put('/update/:id', checkPermission('Update Role'), roleController.updateRole);

// POST role
router.post('/create', checkPermission('Create Role'), roleController.createRoleWithPermissions);

// DELETE role
router.delete('/delete/:id', checkPermission('Delete Role'), roleController.deleteRole);

// GET role for select
router.get('/select', checkPermission('Update Employee'), roleController.selectRole);

// GET role by id
router.get('/:id', roleController.getRoleById);

module.exports = router;
