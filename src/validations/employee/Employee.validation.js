const { z } = require('zod');
const { validate } = require('../../utils/helper.util');

const addEmployeeInputScheme = z.object({
  body: z.object({
    nik: z
      .string({
        required_error: 'Nik Is Required',
      })
      .min(1),
    name: z
      .string({
        required_error: 'Name Is Required',
      })
      .min(1),
    email: z
      .string({
        required_error: 'Email Is Required',
      })
      .min(1),
  }),
});

const editEmployeeInputScheme = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name Is Required',
    }),
  }),
});

const addEmmployeeInputValidation = validate(addEmployeeInputScheme);
const editEmmployeeInputValidation = validate(editEmployeeInputScheme);

module.exports = {
  addEmmployeeInputValidation,
  editEmmployeeInputValidation,
};
