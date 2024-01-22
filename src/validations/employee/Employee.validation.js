const { z } = require('zod');
const { validate } = require('../../utils/helper.util');

const addEmployeeInputScheme = z.object({
    body: z.object({
        nik: z.string({
            required_error: 'Nik Is Required',
        }),
        name: z.string({
            required_error: 'Name Is Required',
        }),
        email: z.string({
            required_error: 'Email Is Required',
        }),
    })
});

const editEmployeeInputScheme = z.object({
    body: z.object({
        name: z.string({
            required_error: 'Name Is Required',
        })
    })
});

const addEmmployeeInputValidation = validate(addEmployeeInputScheme)
const editEmmployeeInputValidation = validate(editEmployeeInputScheme)

module.exports = { 
    addEmmployeeInputValidation,
    editEmmployeeInputValidation
 }