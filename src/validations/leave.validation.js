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
  reason: z.string(),
  startLeave: z.coerce.date(),
  endLeave: z.coerce.date(),
});

const personalLeaveValidation = validate({
  reason: z.string(),
  startLeave: z.coerce.date(),
  endLeave: z.coerce.date(),
});
module.exports = { collectiveLeaveValidation, personalLeaveValidation };