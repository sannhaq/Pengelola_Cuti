const express = require('express');

const router = express.Router();
const employeeController = require('../controllers/employee.controller');

// GET All Employee
router.get('/', employeeController.getAll);

// GET Employee By NIK
router.get('/:nik', employeeController.getNIK);

// POST Disable employee
router.post('/disable/:nik', employeeController.disableEmployee);

// POST Enable employee
router.post('/enable/:nik', employeeController.enableEmployee);

// POST Employee
// router.post('/create', employeeController.create);

module.exports = router;
