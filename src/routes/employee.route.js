const express = require('express');

const router = express.Router();
const { body } = require('express-validator');
const employeeController = require('../controllers/employee.controller');
const roleMiddleware = require('../middleware/role.middleware');
const auth = require('../middleware/auth.middleware');

// GET All Employee
router.get('/', roleMiddleware('Super Admin', 'Admin'), employeeController.getAll);

// GET Employee detail By NIK
router.get('/detail/:nik', roleMiddleware('Super Admin', 'Admin'), employeeController.getNIK);

// GET Employee login
router.get('/me', roleMiddleware('User'), employeeController.getMe);

// POST Disable employee
router.post('/disable/:nik', roleMiddleware('Admin'), employeeController.disableEmployee);

// POST Enable employee
router.post('/enable/:nik', roleMiddleware('Admin'), employeeController.enableEmployee);

// PUT edit employee
router.put('/update/:nik', roleMiddleware('Admin', 'User'), employeeController.updateEmployee);

// POST change password
router.post(
  '/change-password',
  roleMiddleware('User'),
  auth,
  [
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  employeeController.changePassword,
);

// POST Employee
// router.post('/create', employeeController.create);

module.exports = router;
