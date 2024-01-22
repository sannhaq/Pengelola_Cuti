const express = require('express');

const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const roleMiddleware = require('../middleware/role.middleware');
const validation = require('../validations/leave.validation');

//  api
//menampilkan seluruh list mandatory leave
router.get('/mandatory', roleMiddleware('User', 'Admin'), leaveController.mandatoryLeave);
//meanmpilkan seluruh history cuti user yang sedang login
router.get('/history/me', roleMiddleware('User', 'Admin'), leaveController.getLeaveHistoryMe);
//meanmpilkan seluruh list optional leave
router.get('/optional', roleMiddleware('User', 'Admin'), leaveController.optionalLeave);
//untuk menolak optional leave
router.patch(
  '/optional/:id/reject',
  roleMiddleware('User', 'Admin'),
  leaveController.rejectOptionalLeave,
);
//menampilkan salah satu history leave user
router.get('/history/:nik', roleMiddleware('Admin'), leaveController.getLeaveHistoryNik);
// menambahkan untuk cuti optional dan mandatory
router.post(
  '/collective',
  roleMiddleware('Admin'),
  validation.collectiveLeaveValidation,
  leaveController.collectiveLeave,
);
// menambahkan untuk cuti personal
router.post(
  '/personal/:nik',
  roleMiddleware('Admin'),
  validation.personalLeaveValidation,
  leaveController.createPersonalLeave,
);
// menerima pengajuan cuti dari user
router.patch(
  '/personal/:id/approve',
  roleMiddleware('Admin'),
  leaveController.approvePersonalLeave,
);
// menonlak pengajuan cuti dari user
router.patch('/personal/:id/reject', roleMiddleware('Admin'), leaveController.rejectPersonalLeave);
router.get('/all', roleMiddleware('Admin'), leaveController.allLeaves);

module.exports = router;
