const express = require('express');

const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const roleMiddleware = require('../middleware/role.middleware');
const checkPermission = require('../middleware/checkPermission.middleware');
const validation = require('../validations/leave.validation');
const specialLeaveController = require('../controllers/special-leave.controller');

//  api
// GET ALL Mandatory Leave
router.get('/mandatory', checkPermission('View Mandatory Leave'), leaveController.mandatoryLeave);
// GET ALL Leave history by user login
router.get(
  '/history/me',
  checkPermission('Get Leave History for Current User'),
  leaveController.getLeaveHistoryMe,
);
// GET ALL Optional Leave
router.get('/optional', checkPermission('View Optional Leave'), leaveController.optionalLeave);
// PATCH reject optional leave
router.patch(
  '/optional/:id/reject',
  checkPermission('Reject Optional Leave'),
  validation.rejectLeave,
  leaveController.rejectOptionalLeave,
);
// GET Special leave history by login
router.get(
  '/employee-special-leave/history/me',
  checkPermission('View Special Leave History'),
  specialLeaveController.getSpecialLeaveMe,
);
// GET leave history based on nik
router.get(
  '/history/:nik',
  checkPermission('View Special Leave History'),
  leaveController.getLeaveHistoryNik,
);
// POST optional and mandatory leave
router.post(
  '/collective',
  checkPermission('Create Collective Leave'),
  validation.collectiveLeaveValidation,
  leaveController.collectiveLeave,
);
// POST personal leave
router.post(
  '/personal/:nik',
  checkPermission('Create Personal Leave'),
  validation.personalLeaveValidation,
  leaveController.createPersonalLeave,
);
// PATCH accept leave applications from users
router.patch(
  '/personal/:id/approve',
  checkPermission('Approve and Reject Personal Leave'),
  leaveController.approvePersonalLeave,
);
// PATCH reject the user's leave application
router.patch(
  '/personal/:id/reject',
  checkPermission('Approve and Reject Personal Leave'),
  validation.rejectLeave,
  leaveController.rejectPersonalLeave,
);
// GET All leave
router.get('/all', checkPermission('View All Leave History'), leaveController.allLeaves);

// GET All collective leave
router.get(
  '/collective-leave',
  checkPermission('View All Leave History'),
  leaveController.getCollectiveLeave,
);

// GET All special leave list
router.get(
  '/special-leaves',
  checkPermission('View All Special Leave History'),
  specialLeaveController.getSpecialLeaveList,
);
// GET special leave by id
router.get(
  '/special-leave/:id',
  checkPermission('View All Special Leave History'),
  specialLeaveController.getSpecialLeaveById,
);
// GET special leave by matching gender
router.get(
  '/special-leave/gender/:nik',
  checkPermission('View All Special Leave History'),
  specialLeaveController.getSpecialLeaveByNikGender,
);

// PATCH special leave
router.patch(
  '/special-leave/:id',
  checkPermission('Update Special Leave'),
  validation.updateSpecialLeave,
  specialLeaveController.updateSpecialLeave,
);

// POST special leave
router.post(
  '/special-leave',
  checkPermission('Create Special Leave'),
  validation.createSpecialLeave,
  specialLeaveController.createSpecialLeave,
);

// GET all special leave users
router.get(
  '/employee-special-leaves',
  checkPermission('View All Employee Special Leaves'),
  specialLeaveController.specialLeaveUsers,
);

// GET special leave by nik
router.get(
  '/employee-special-leave/history/:nik',
  checkPermission('View Employee Special Leave History by NIK'),
  specialLeaveController.getSpecialLeaveByNik,
);

// set employee special leave
router.post(
  '/employee-special-leave/:nik',
  checkPermission('Set Employee Special Leave'),
  validation.createEmployeeSpecialLeave,
  specialLeaveController.setSpecialLeave,
);

// approve special leave
router.patch(
  '/employee-special-leave/:id/approve',
  checkPermission('Approve and Reject Employee Special Leave'),
  specialLeaveController.approveSpecialLeave,
);

// reject special leave
router.patch(
  '/employee-special-leave/:id/reject',
  checkPermission('Approve and Reject Employee Special Leave'),
  validation.rejectSpecialLeave,
  specialLeaveController.rejectSpecialLeave,
);

// delete special leave list
router.patch(
  '/special-leave/delete/:id',
  checkPermission('Delete Special Leave List'),
  specialLeaveController.deleteSpecialLeaveList,
);

router.get(
  '/receive-email',
  checkPermission('Receiving Email Requests for Leave'),
  leaveController.getCanReceiveEmailLeave,
);

router.patch(
  '/receive-email',
  checkPermission('Receiving Email Requests for Leave'),
  leaveController.updateEmailPreference,
);

// POST send email for leave mandatory
router.post(
  '/send-leave-email/mandatory/:id',
  checkPermission('Send Email for Leave'),
  leaveController.sendEmailLeaveMandatoryById,
);

// POST send email for leave optional
// router.post(
//   '/send-leave-email/optional/:id',
//   checkPermission('Send Email for Leave'),
//   leaveController.sendEmailLeaveOptionalById,
// );

module.exports = router;
