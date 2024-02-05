const { z } = require('zod');
const { validate } = require('../middleware/validation.middleware');
const { recordExist } = require('../utils/db-validations.util');

const collectiveLeaveValidation = validate({
  typeOfLeaveId: z
    .number()
    .refine((value) => value === 1 || value === 2, {
      message: 'typeOfLeaveId should be 1 or 2',
    })
    .refine(recordExist('typeOfLeave', 'id')),
  reason: z.string().refine((data) => data.trim() !== '', {
    message: 'Reason cannot be empty',
  }),
  startLeave: z.coerce.date(),
  endLeave: z.coerce.date(),
});

const personalLeaveValidation = validate({
  reason: z.string().refine((data) => data.trim() !== '', {
    message: 'Reason cannot be empty',
  }),
  startLeave: z.coerce.date(),
  endLeave: z.coerce.date(),
});

const rejectLeave = validate({
  note: z.string().refine((data) => data.trim() !== '', {
    message: 'Note cannot be empty',
  }),
});

const updateSpecialLeave = validate({
  leaveTitle: z.string().optional(),
  gender: z.enum(['L', 'P', 'LP']).optional(),
  amount: z.coerce.number().optional(),
  leaveInformation: z.string().optional(),
});

const createSpecialLeave = validate({
  leaveTitle: z.string(),
  gender: z.enum(['L', 'P', 'LP']),
  amount: z.coerce.number(),
  leaveInformation: z.string(),
});

const createEmployeeSpecialLeave = validate({
  specialLeaveId: z.coerce.number().refine(recordExist('specialLeave', 'id'), {
    message: 'Special Leave does not exist',
  }),
  startLeave: z.coerce.date(),
});

const rejectSpecialLeave = validate({
  note: z.string().refine((data) => data.trim() !== '', {
    message: 'Note cannot be empty',
  }),
});

module.exports = {
  collectiveLeaveValidation,
  personalLeaveValidation,
  rejectLeave,
  updateSpecialLeave,
  createSpecialLeave,
  createEmployeeSpecialLeave,
  rejectSpecialLeave,
};
