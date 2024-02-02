const express = require('express');

const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const roleMiddleware = require('../middleware/role.middleware');
const validation = require('../validations/leave.validation');
const specialLeaveController = require('../controllers/special-leave.controller');

//  api
// GET ALL Mandatory Leave
router.get('/mandatory', roleMiddleware('User', 'Admin'), leaveController.mandatoryLeave);
// GET ALL Leave history by user login
router.get('/history/me', roleMiddleware('User', 'Admin'), leaveController.getLeaveHistoryMe);
// GET ALL Optional Leave
router.get('/optional', roleMiddleware('User', 'Admin'), leaveController.optionalLeave);
// PATCH reject optional leave
router.patch(
  '/optional/:id/reject',
  roleMiddleware('User', 'Admin'),
  validation.rejectLeave,
  leaveController.rejectOptionalLeave,
);
// GET leave history based on nik
router.get('/history/:nik', roleMiddleware('Admin'), leaveController.getLeaveHistoryNik);
// POST optional and mandatory leave
router.post(
  '/collective',
  roleMiddleware('Admin'),
  validation.collectiveLeaveValidation,
  leaveController.collectiveLeave,
);
// POST personal leave
router.post(
  '/personal/:nik',
  roleMiddleware('Admin'),
  validation.personalLeaveValidation,
  leaveController.createPersonalLeave,
);
// PATCH accept leave applications from users
router.patch(
  '/personal/:id/approve',
  roleMiddleware('Admin'),
  leaveController.approvePersonalLeave,
);
// PATCH reject the user's leave application
router.patch(
  '/personal/:id/reject',
  roleMiddleware('Admin'),
  validation.rejectLeave,
  leaveController.rejectPersonalLeave,
);
// GET All leave
router.get('/all', roleMiddleware('Admin'), leaveController.allLeaves);

// GET All special leave list
router.get('/special-leaves', roleMiddleware('Admin'), specialLeaveController.getSpecialLeaveList);
// GET special leave by id
router.get(
  '/special-leave/:id',
  roleMiddleware('Admin'),
  specialLeaveController.getSpecialLeaveById,
);

// PATCH special leave
router.patch(
  '/special-leave/:id',
  roleMiddleware('Admin'),
  validation.updateSpecialLeave,
  specialLeaveController.updateSpecialLeave,
);

// POST special leave
router.post(
  '/special-leave',
  roleMiddleware('Admin'),
  validation.createSpecialLeave,
  specialLeaveController.createSpecialLeave,
);

// GET all special leave users
router.get(
  '/employee-special-leaves',
  roleMiddleware('Admin'),
  specialLeaveController.specialLeaveUsers,
);

router.get(
  '/employee-special-leave/history/:nik',
  roleMiddleware('Admin'),
  specialLeaveController.getSpecialLeaveByNik,
);

module.exports = router;
