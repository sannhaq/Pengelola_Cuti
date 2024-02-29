const express = require('express');

const router = express.Router();
const { body } = require('express-validator');
const employeeController = require('../controllers/employee.controller');
const checkPermission = require('../middleware/checkPermission.middleware');
const auth = require('../middleware/auth.middleware');
const {
  addEmmployeeInputValidation,
  editEmmployeeInputValidation,
} = require('../validations/employee/Employee.validation');

// GET All Employee
router.get('/', checkPermission('Get Employee'), employeeController.getAll);

// GET Employee detail By NIK
router.get('/detail/:nik', checkPermission('Get Detail Employee'), employeeController.getNIK);

// GET Employee login
router.get('/me', checkPermission('Home'), employeeController.getMe);

// POST Disable employee
router.post(
  '/disable/:nik',
  checkPermission('Disable Employee'),
  employeeController.disableEmployee,
);

// POST Enable employee
router.post('/enable/:nik', checkPermission('Enable Employee'), employeeController.enableEmployee);

// PUT edit employee
router.put(
  '/update/:nik',
  checkPermission('Update Employee'),
  editEmmployeeInputValidation,
  employeeController.updateEmployee,
);

// POST change password
router.post(
  '/change-password',
  checkPermission('Change Password'),
  auth,
  [
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  employeeController.changePassword,
);

// POST Reset Password
router.post(
  '/reset-password/:nik',
  checkPermission('Reset Password'),
  employeeController.resetPassword,
);

// POST Employee
router.post(
  '/add',
  checkPermission('Add Employee'),
  addEmmployeeInputValidation,
  employeeController.addEmployee,
);

// POST AmountOfLeave
router.post(
  '/update-amount-of-leave',
  checkPermission('Update Amount Of Leave'),
  employeeController.updateAmountOfLeaveForActiveEmployees,
);

// Patch Role
router.patch('/update-role/:nik', checkPermission('Update Role'), employeeController.updateRole);

module.exports = router;
