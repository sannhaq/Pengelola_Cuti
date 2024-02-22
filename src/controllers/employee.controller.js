const { PrismaClient } = require('@prisma/client');

const { validationResult } = require('express-validator');

const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const moment = require('moment');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const prisma = new PrismaClient();
const {
  errorResponse,
  successResponse,
  paginate,
  successResponseWithPage,
  formatEmployeeData,
} = require('../utils/helper.util');

async function getAll(req, res) {
  try {
    // Extract page, perPage, search, and orderBy from query parameters
    const { page, perPage, search, orderBy, isWorking, position } = req.query;

    // Perform pagination using custom paginate function
    const pagination = await paginate(prisma.employee, { page, perPage });

    // Build base query with selected fields
    let baseQuery = {
      select: {
        name: true,
        nik: true,
        positions: {
          select: {
            name: true,
          },
        },
        gender: true,
        amountOfLeave: {
          select: {
            id: true,
            amount: true,
            year: true,
          },
        },
        isWorking: true,
      },
      // Calculate skip and take based on pagination information
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    };

    const filter = {};
    // Build search conditions dynamically based on provided search parameter
    if (search) {
      filter.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nik: { contains: search } },
        { positions: { name: { contains: search, mode: 'insensitive' } }, isWorking: true },
      ];
      baseQuery = { ...baseQuery, where: filter };
    }

    if (position) {
      filter.positions = {
        name: {
          contains: position,
          mode: 'insensitive',
        },
      };
    }

    // Add orderBy condition based on the orderBy parameter
    if (orderBy) {
      const [field, order] = orderBy.split('_');
      baseQuery = { ...baseQuery, orderBy: { [field]: order } };
    }

    // Build isWorking condition based on the isWorking parameter
    if (isWorking !== undefined) {
      filter.isWorking = isWorking.toLowerCase() === 'true';
    }

    // Combine search and isWorking conditions
    if (Object.keys(filter).length > 0) {
      baseQuery = { ...baseQuery, where: { ...baseQuery.where, ...filter } };
    }

    // Fetch employees with selected fields and positions' names based on search conditions and orderBy
    const employees = await prisma.employee.findMany(baseQuery);

    // Format employees data for response
    const formattedEmployees = employees.map((employee) => {
      // Sort amountOfLeave by year in descending order
      const sortedAmountOfLeave = employee.amountOfLeave.sort((a, b) => b.year - a.year);

      return {
        ...employee,
        positions: {
          // Display '-' for positions' name if not working
          ...employee.positions,
          name: employee.isWorking ? employee.positions.name : '-',
        },
        amountOfLeave: sortedAmountOfLeave,
      };
    });

    const totalEmployee = await prisma.employee.count({
      where: filter,
    });

    // Return success response with paginated employee data
    return successResponseWithPage(
      res,
      'Successfully retrieved employees',
      formattedEmployees,
      200,
      {
        total: totalEmployee,
        currPage: pagination.meta.currPage,
        lastPage: Math.ceil(totalEmployee / perPage),
        perPage: pagination.meta.perPage,
        skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
        take: pagination.meta.perPage,
        prev: pagination.meta.prev,
        next: pagination.meta.next,
      },
    );
  } catch (error) {
    console.error('Error getting employees:', error);
    // Return error response if an error occurs
    return errorResponse(res, 'Failed to get employees', '', 500);
  }
}

async function getNIK(req, res) {
  try {
    // Extract NIK from request parameters
    const { nik } = req.params;

    // Fetch employee data from the database using Prisma
    const employee = await prisma.employee.findMany({
      where: {
        nik,
      },
      select: {
        nik: true,
        name: true,
        positions: {
          select: {
            id: true,
            name: true,
          },
        },
        gender: true,
        isWorking: true,
        typeOfEmployee: {
          select: {
            newContract: true,
            startContract: true,
            isContract: true,
            endContract: true,
          },
        },
        user: {
          select: {
            email: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        historicalName: true,
        historicalNik: true,
      },
    });

    // Check if the response from the database is in the expected array format
    if (!Array.isArray(employee)) {
      return errorResponse(res, 'Invalid data format', '', 500);
    }

    // Format the employee data for better readability
    const formattedData = formatEmployeeData(employee);

    // Transform the data: set endContract to null if the employee is not on contract
    const transformedData = formattedData.map((data) => {
      if (!data.typeOfEmployee.isContract) {
        data.typeOfEmployee.endContract = null;
      }
      return data;
    });

    // Return a 404 response if no employee is found with the given NIK
    if (formattedData.length === 0) {
      return errorResponse(res, 'Employee not found', '', 404);
    }

    // Return a successful response with the transformed data
    return successResponse(res, 'Successfully retrieved employee data', transformedData, 200);
  } catch (error) {
    // Log and return an error response if any exception occurs
    console.error('Error getting employee data:', error);
    return errorResponse(res, 'Failed to get employee data', '', 500);
  }
}

async function disableEmployee(req, res) {
  // Extract employee NIK from request parameters
  const employeeNik = req.params.nik;

  try {
    // Fetch the employee from the database using Prisma
    const employee = await prisma.employee.findUnique({
      where: {
        nik: employeeNik,
      },
    });

    if (!employee) {
      return errorResponse(res, 'Employee not found', '', 404);
    }

    if (employee.isWorking === false) {
      return errorResponse(res, 'Employee has already been disabled', '', 400);
    }

    // Update the employee's working status to false
    await prisma.employee.update({
      where: {
        nik: employeeNik,
      },
      data: {
        isWorking: false,
      },
    });

    return successResponse(res, 'Employee disabled successfully', employee, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'An error occured while disbaled the emplooye', '', 500);
  }
}

async function enableEmployee(req, res) {
  const employeeNik = req.params.nik;

  try {
    const employee = await prisma.employee.findUnique({
      where: {
        nik: employeeNik,
      },
    });

    if (!employee) {
      return errorResponse(res, 'Employee not found', '', 404);
    }

    if (employee.isWorking === true) {
      return errorResponse(res, 'Employee has already been enabled', '', 400);
    }

    // Update the employee's working status to true
    await prisma.employee.update({
      where: {
        nik: employeeNik,
      },
      data: {
        isWorking: true,
      },
    });

    return successResponse(res, 'Employee enabled successfully', employee, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'An error occured while enabled the emplooye', '', 500);
  }
}

async function getMe(req, res) {
  try {
    const userId = req.user.id;

    // Fetch user data, including associated employee data, from the database using Prisma
    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: {
        nik: true,
        name: true,
        amountOfLeave: {
          select: {
            id: true,
            amount: true,
            year: true,
          },
        },
      },
    });

    // Return a 404 response if no user is found with the given ID
    if (!employee) {
      return errorResponse(res, 'User not found', '', 404);
    }

    if (employee.amountOfLeave) {
      employee.amountOfLeave.sort((a, b) => b.year - a.year);
    }

    return successResponse(res, 'Me success', employee);
  } catch (error) {
    console.error('Error getting user data:', error);
    return errorResponse(res, 'Internal server error', '', 500);
  }
}

async function updateAmountOfLeaveForEmployee(employeeNik, isContract, startContract, endContract) {
  const currentYear = moment().year();
  const twoYearsAgo = currentYear - 2;

  // Cek apakah kolom amountOfLeave dengan year tahun sekarang sudah ada
  const existingAmountOfLeave = await prisma.amountOfLeave.findFirst({
    where: {
      employeeNik,
      year: currentYear,
    },
  });

  // Jika sudah ada, tidak perlu membuat kolom baru
  if (existingAmountOfLeave) {
    const responseMessage = `AmountOfLeave for year ${currentYear} already exists.`;
    console.log(responseMessage);

    return {
      success: false,
      message: responseMessage,
    };
  }

  // Mengubah isActive menjadi false untuk year yang berada 2 tahun lalu dari tahun sekarang
  const amountOfLeaveToUpdate = await prisma.amountOfLeave.findFirst({
    where: {
      employeeNik,
      year: twoYearsAgo,
    },
  });

  if (amountOfLeaveToUpdate) {
    await prisma.amountOfLeave.update({
      where: {
        id: amountOfLeaveToUpdate.id,
      },
      data: {
        isActive: false,
      },
    });
    console.log(
      `Successfully updated isActive to false for AmountOfLeave in year ${twoYearsAgo} for employeeNik ${employeeNik}.`,
    );
  } else {
    console.error('Unable to find a matching amountOfLeave.');
  }

  let amount = 0;

  console.log('Is Contract:', isContract);
  if (isContract !== undefined) {
    if (isContract) {
      // Jika isContract true, amount diatur menjadi 1
      amount = 1;

      // Gunakan node-schedule untuk menambahkan 1 setiap bulannya
      const startContractDate = moment.utc(startContract).date();
      const rule = new schedule.RecurrenceRule();
      rule.date = startContractDate;
      rule.month = new schedule.Range(0, 11);

      schedule.scheduleJob(rule, async () => {
        console.log('Job is running!');
        const today = moment.utc();
        const lastIncrementDate = moment.utc();

        if (!lastIncrementDate.isSame(today, 'month')) {
          // Jika endContract belum tercapai dan tidak melebihi tahun saat ini, lakukan penambahan
          if (
            today.isBefore(moment.utc(endContract)) &&
            moment.utc(endContract).year() === today.year()
          ) {
            console.log(
              `Incrementing AmountOfLeave for employee ${employeeNik} in year ${currentYear}.`,
            );
            await prisma.amountOfLeave.create({
              data: {
                amount: {
                  increment: 1,
                },
                year: currentYear,
                isActive: true,
                employee: {
                  connect: {
                    nik: employeeNik,
                  },
                },
              },
            });
          }
        }
      });
    } else {
      // Jika isContract false, amount diatur menjadi 12
      amount = 12;
    }
  } else {
    // Jika isContract undefined, atur amount menjadi 0
    amount = 0;
    console.log('Is Contract is undefined. Setting amount to 0.');
  }

  // Buat kolom amountOfLeave baru
  console.log(
    `Creating AmountOfLeave for employee ${employeeNik} in year ${currentYear} with amount ${amount}.`,
  );
  await prisma.amountOfLeave.create({
    data: {
      amount,
      year: currentYear,
      isActive: true,
      employee: {
        connect: {
          nik: employeeNik,
        },
      },
    },
  });
}

async function updateAmountOfLeaveForActiveEmployees(req, res) {
  try {
    const activeEmployees = await prisma.employee.findMany({
      where: {
        isWorking: true,
      },
      include: {
        typeOfEmployee: {
          select: {
            isContract: true,
          },
        },
      },
    });

    for (const employee of activeEmployees) {
      const { nik, typeOfEmployee, startContract, endContract } = employee;
      const isContract = typeOfEmployee?.isContract;
      const result = await updateAmountOfLeaveForEmployee(
        nik,
        isContract,
        startContract,
        endContract,
      );
      if (result && result.success === false) {
        // Berikan respons ke client dengan status 400 dan pesan dari fungsi updateAmountOfLeaveForEmployee
        return res.status(400).json({ message: result.message });
      }
    }

    console.log('Successfully updated amount of leave for active employees.');
    successResponse(res, 'Amount of leave updated successfully.');
  } catch (error) {
    console.error('Error updating amount of leave:', error);
    errorResponse(res, 'Error updating amount of leave.');
  }
}

// async function updateAmountOfLeaveForActiveEmployees(req, res) {
//   try {
//     const currentYear = moment().year();
//     const twoYearsAgo = currentYear - 2;

//     // Fetch all active employees
//     const activeEmployees = await prisma.employee.findMany({
//       where: {
//         isWorking: true,
//       },
//     });

//     // Iterate through active employees
//     for (const employee of activeEmployees) {
//       // Check if amountOfLeave for current year already exists
//       const existingAmountOfLeave = await prisma.amountOfLeave.findFirst({
//         where: {
//           employeeNik: employee.nik,
//           year: currentYear,
//         },
//       });

//       // If already exists, skip creating a new column
//       if (existingAmountOfLeave) {
//         console.log(
//           `AmountOfLeave for year ${currentYear} already exists for employee ${employee.nik}.`,
//         );
//         continue;
//       }

//       // Change isActive to false for the year two years ago
//       const amountOfLeaveToUpdate = await prisma.amountOfLeave.findMany({
//         where: {
//           employee: {
//             nik: employee.nik,
//           },
//           year: twoYearsAgo,
//         },
//       });

//       for (const leaveToUpdate of amountOfLeaveToUpdate) {
//         await prisma.amountOfLeave.update({
//           where: {
//             id: leaveToUpdate.id,
//           },
//           data: {
//             isActive: false,
//           },
//         });
//         console.log(
//           `Successfully updated isActive to false for AmountOfLeave in year ${twoYearsAgo} for employeeNik ${employee.nik}.`,
//         );
//       }

//       // Calculate the initial amount based on isContract
//       let amount = 0;
//       if (employee.typeOfEmployee && employee.typeOfEmployee.isContract) {
//         amount = 1;
//       } else {
//         amount = 12;
//       }

//       // Use node-schedule to increment by 1 every month for contract employees
//       if (amount === 1) {
//         const startContractDate = moment.utc(employee.typeOfEmployee.startContract).date();
//         const rule = new schedule.RecurrenceRule();
//         rule.date = startContractDate;
//         rule.month = new schedule.Range(0, 11);

//         schedule.scheduleJob(rule, async () => {
//           const today = moment.utc();

//           if (
//             employee.isWorking &&
//             today.isBefore(moment.utc(employee.typeOfEmployee.endContract)) &&
//             moment.utc(employee.typeOfEmployee.endContract).year() === today.year()
//           ) {
//             console.log(
//               `Incrementing AmountOfLeave for employee ${employee.nik} in year ${currentYear}.`,
//             );
//             await prisma.amountOfLeave.create({
//               data: {
//                 amount: {
//                   increment: 1,
//                 },
//                 year: currentYear,
//                 isActive: true,
//                 employee: {
//                   connect: {
//                     nik: employee.nik,
//                   },
//                 },
//               },
//             });
//           }
//         });
//       }

//       // Create a new amountOfLeave column
//       console.log(
//         `Creating AmountOfLeave for employee ${employee.nik} in year ${currentYear} with amount ${amount}.`,
//       );
//       await prisma.amountOfLeave.create({
//         data: {
//           amount,
//           year: currentYear,
//           isActive: true,
//           employee: {
//             connect: {
//               nik: employee.nik,
//             },
//           },
//         },
//       });
//     }

//     console.log('Update AmountOfLeave completed successfully.');
//     successResponse(res, 'Update AmountOfLeave completed successfully.', '', 200);
//   } catch (error) {
//     console.error('Error updating AmountOfLeave:', error);
//     errorResponse(res, 'Error updating AmountOfLeave', '', 500);
//   }
// }

async function createOrUpdateAmountOfLeave(employeeNik, isContract, startContract, endContract) {
  const currentYear = moment().year();
  const twoYearsAgo = currentYear - 2;

  // Cek apakah kolom amountOfLeave dengan year tahun sekarang sudah ada
  const existingAmountOfLeave = await prisma.amountOfLeave.findFirst({
    where: {
      employeeNik,
      year: currentYear,
    },
  });

  // Jika sudah ada, tidak perlu membuat kolom baru
  if (existingAmountOfLeave) {
    console.log(
      `AmountOfLeave for year ${currentYear} already exists for employee ${employeeNik}.`,
    );
    return;
  }

  // Mengubah isActive menjadi false untuk year yang berada 2 tahun lalu dari tahun sekarang
  const amountOfLeaveToUpdate = await prisma.amountOfLeave.findFirst({
    where: {
      employeeNik,
      year: twoYearsAgo, // Sesuaikan dengan tahun yang diinginkan
    },
  });

  if (amountOfLeaveToUpdate) {
    await prisma.amountOfLeave.update({
      where: {
        id: amountOfLeaveToUpdate.id,
      },
      data: {
        isActive: false,
      },
    });
    console.log(
      `Successfully updated isActive to false for AmountOfLeave in year ${twoYearsAgo} for employeeNik ${employeeNik}.`,
    );
  } else {
    console.error('Unable to find a matching amountOfLeave.');
  }

  let amount = 0;

  if (isContract) {
    // Jika isContract true, amount diatur menjadi 1
    amount = 1;

    // Gunakan node-schedule untuk menambahkan 1 setiap bulannya
    const startContractDate = moment.utc(startContract).date();
    const rule = new schedule.RecurrenceRule();
    rule.date = startContractDate;
    rule.month = new schedule.Range(0, 11);

    schedule.scheduleJob(rule, async () => {
      const today = moment.utc();
      const lastIncrementDate = moment.utc();

      if (!lastIncrementDate.isSame(today, 'month')) {
        // Jika endContract belum tercapai dan tidak melebihi tahun saat ini, lakukan penambahan
        if (
          today.isBefore(moment.utc(endContract)) &&
          moment.utc(endContract).year() === today.year()
        ) {
          console.log(
            `Incrementing AmountOfLeave for employee ${employeeNik} in year ${currentYear}.`,
          );
          await prisma.amountOfLeave.create({
            data: {
              amount: {
                increment: 1,
              },
              year: currentYear,
              isActive: true,
              employee: {
                connect: {
                  nik: employeeNik,
                },
              },
            },
          });
        }
      }
    });
  } else {
    // Jika isContract false, amount diatur menjadi 12
    amount = 12;
  }

  // Buat kolom amountOfLeave baru
  console.log(
    `Creating AmountOfLeave for employee ${employeeNik} in year ${currentYear} with amount ${amount}.`,
  );
  await prisma.amountOfLeave.create({
    data: {
      amount,
      year: currentYear,
      isActive: true,
      employee: {
        connect: {
          nik: employeeNik,
        },
      },
    },
  });
}

async function updateEmployee(req, res) {
  const employeeNik = req.params.nik;
  const { name, positionId, typeOfEmployee, roleId, gender } = req.body;

  try {
    // Fetch the existing employee data from the database using Prisma
    const employee = await prisma.employee.findUnique({
      where: {
        nik: employeeNik,
      },
      include: {
        positions: true,
        typeOfEmployee: true,
        user: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!employee) {
      return errorResponse(res, 'Employee not found', '', 404);
    }

    // Check if the authenticated user has admin privileges
    if (req.user.role.name === 'Admin' || req.user.role.name === 'Super Admin') {
      // Menyiapkan data pembaruan untuk pengguna admin atau super admin
      const updateData = {
        name,
        gender,
        positions: {
          connect: { id: positionId },
        },
        typeOfEmployee: {
          update: {
            isContract: typeOfEmployee.isContract,
            newContract: typeOfEmployee.isContract ? typeOfEmployee.newContract : false,
            endContract: typeOfEmployee.isContract
              ? moment.utc(typeOfEmployee.endContract).format()
              : null,
            startContract: typeOfEmployee.isContract
              ? moment.utc(typeOfEmployee.startContract).format()
              : undefined,
          },
        },
        // Jika roleId disediakan dalam body permintaan, perbarui peran
        ...(roleId && {
          user: {
            update: {
              role: {
                connect: { id: roleId },
              },
            },
          },
        }),
      };

      // Memperbarui data karyawan dengan data yang sudah disiapkan
      const existingEmployee = await prisma.employee.findUnique({
        where: {
          nik: employeeNik,
        },
        include: {
          typeOfEmployee: true,
        },
      });

      if (existingEmployee.typeOfEmployee.isContract === false) {
        // Jika isContract false, pastikan startContract tidak diubah
        delete updateData.typeOfEmployee.update.startContract;
      }

      // Memperbarui data karyawan dengan data yang sudah disiapkan
      await prisma.employee.update({
        where: {
          nik: employeeNik,
        },
        data: updateData,
      });

      // Pembaruan atau pembuatan amountOfLeave setelah pembaruan data employee
      await createOrUpdateAmountOfLeave(
        employeeNik,
        typeOfEmployee.isContract,
        typeOfEmployee.startContract,
        typeOfEmployee.endContract,
      );
    } else if (req.user.role.name === 'User') {
      // Update employee name for non-admin user
      await prisma.employee.update({
        where: {
          nik: employeeNik,
        },
        data: {
          name,
          gender,
        },
      });

      // Pembaruan atau pembuatan amountOfLeave setelah pembaruan data employee
      await createOrUpdateAmountOfLeave(
        employeeNik,
        typeOfEmployee.isContract,
        typeOfEmployee.startContract,
        typeOfEmployee.endContract,
      );
    }

    return successResponse(res, 'Employee updated successfully', employee, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'An error occurred while updating the employee', '', 500);
  }
}

async function changePassword(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation error', errors.array(), 400);
  }

  try {
    // Extract the new password and authenticated user information from the request
    const { newPassword } = req.body;
    const { user } = req;

    // Hash the new password using bcrypt
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedNewPassword,
        isFirst: false,
      },
    });

    return successResponse(res, 'Password changed successfully', '', 200);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'An error occurred while changing the password', '', 500);
  }
}

async function resetPassword(req, res) {
  const { nik } = req.params;

  try {
    // Fetch the employee data, including associated user data, from the database using Prisma
    const employee = await prisma.employee.findUnique({
      where: {
        nik,
      },
      include: {
        user: true,
      },
    });

    if (!employee) {
      return errorResponse(res, 'Employee not found', '', 404);
    }

    // Generate random password
    function generateRandomPassword(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let password = '';
      for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return password;
    }

    // Generate random password dengan panjang 8 karakter
    const randomPassword = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: {
        id: employee.userId,
      },
      data: {
        password: hashedPassword,
        isFirst: true,
      },
    });

    // Send an email with the new password using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${req.user.email}" <${process.env.GMAIL_USER}>`,
      to: employee.user.email,
      subject: 'Password Reset',
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: auto;
                background: #fff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: #007bff;
                color: #fff;
                text-align: center;
                padding: 10px 0;
                border-radius: 10px 10px 0 0;
              }
              .content {
                padding: 20px 0;
              }
              .password {
                font-size: 18px;
                font-weight: bold;
                text-align: center;
                padding: 10px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Notification</h1>
              </div>
              <div class="content">
                <p>Your password has been reset. Below is your new password:</p>
                <p class="password">${randomPassword}</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    // Send the email and log the response
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    return successResponse(res, 'Password reset successfully', '', 200);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'An error occurred while resetting the password', '', 500);
  }
}

async function calculateAmountOfLeave(isContract, newContract, startContract, endContract, nik) {
  let amountOfLeave;

  if (isContract) {
    if (newContract) {
      const monthsOfWork = moment.utc().diff(moment.utc(startContract), 'months');

      if (monthsOfWork >= 3) {
        amountOfLeave = Math.max(monthsOfWork - 2, 0);
      } else {
        amountOfLeave = 0;
      }

      const startContractDate = moment.utc(startContract).date();
      const rule = new schedule.RecurrenceRule();
      rule.date = startContractDate;
      rule.month = new schedule.Range(0, 11);

      schedule.scheduleJob(rule, async () => {
        const today = moment.utc();
        let lastIncrementDate = moment.utc();

        if (!lastIncrementDate.isSame(today, 'month')) {
          // Jika endContract belum tercapai dan tidak melebihi tahun saat ini, lakukan penambahan
          if (
            today.isBefore(moment.utc(endContract)) &&
            moment.utc(endContract).year() === today.year()
          ) {
            await prisma.employee.update({
              where: {
                nik,
              },
              data: {
                amountOfLeave: {
                  select: {
                    amount: {
                      increment: 1,
                    },
                  },
                },
              },
            });

            // Perbarui tanggal penambahan terakhir ke tanggal saat ini
            lastIncrementDate = today;
          }
        }
      });
    } else {
      const monthsOfWork = moment.utc().diff(moment.utc(startContract), 'months');
      amountOfLeave = Math.max(1 + monthsOfWork, 1);

      const startContractDate = moment.utc(startContract).date();
      const rule = new schedule.RecurrenceRule();
      rule.date = startContractDate;
      rule.month = new schedule.Range(0, 11);

      schedule.scheduleJob(rule, async () => {
        const today = moment.utc();
        let lastIncrementDate = moment.utc();

        if (!lastIncrementDate.isSame(today, 'month')) {
          // Jika endContract belum tercapai dan tidak melebihi tahun saat ini, lakukan penambahan
          if (
            today.isBefore(moment.utc(endContract)) &&
            moment.utc(endContract).year() === today.year()
          ) {
            await prisma.employee.update({
              where: {
                nik,
              },
              data: {
                amountOfLeave: {
                  select: {
                    amount: {
                      increment: 1,
                    },
                  },
                },
              },
            });

            // Perbarui tanggal penambahan terakhir ke tanggal saat ini
            lastIncrementDate = today;
          }
        }
      });
    }
  } else {
    amountOfLeave = 12;
  }

  return amountOfLeave;
}

// Fungsi untuk menambahkan employee baru
async function addEmployee(req, res) {
  const {
    nik,
    name,
    email,
    isContract,
    startContract,
    endContract,
    positionId,
    newContract,
    gender,
  } = req.body;
  const { user } = req;

  try {
    // Check apakah email sudah digunakan
    const existingEmployee = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmployee) {
      return errorResponse(res, 'Email is already in use', '', 400);
    }

    // Ambil data employee yang sudah ada
    const employeeData = await prisma.employee.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!employeeData) {
      return errorResponse(res, 'Employee data not found for the current user', '', 404);
    }

    // Ambil historicalName dan historicalNik dari employeeData
    const { name: historicalName, nik: historicalNik } = employeeData;

    // Set password
    function generateRandomPassword(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let password = '';
      for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return password;
    }

    // Generate random password dengan panjang 8 karakter
    const randomPassword = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const amountOfLeaveData = [];

    if (isContract) {
      let leaveAmount = calculateAmountOfLeave(
        isContract,
        newContract,
        startContract,
        endContract,
        nik,
      );

      if (newContract) {
        const monthsOfWork = moment.utc().diff(moment.utc(startContract), 'months');
        leaveAmount = monthsOfWork >= 3 ? Math.max(monthsOfWork - 3, 0) : 0;
      } else {
        const monthsOfWork = moment.utc().diff(moment.utc(startContract), 'months');
        leaveAmount = Math.max(monthsOfWork, 1);
      }

      if (moment().isSame(moment.utc(startContract), 'year')) {
        amountOfLeaveData.push({
          amount: leaveAmount,
          year: moment().year(),
          isActive: true,
        });
      } else {
        const startContractYear = moment.utc(startContract).year();
        const startContractMonth = moment.utc(startContract).month() + 1;
        const currentYear = moment().year();
        const currentMonth = moment().month() + 1;

        let monthsSinceStart = 0;

        for (let year = startContractYear; year <= currentYear; year++) {
          const startMonth = year === startContractYear ? startContractMonth : 1;
          const endMonth = year === currentYear ? currentMonth : 12;

          for (let month = startMonth; month <= endMonth; month++) {
            let amount;

            if (newContract && year === startContractYear) {
              // Jika newContract true dan tahun startContract, atur amount pertama setelah 3 bulan
              amount = monthsSinceStart >= 3 ? monthsSinceStart - 2 : 0;
            } else {
              // Jika newContract false atau bukan tahun startContract, atur amount di bulan pertama dan bertambah setiap bulannya
              amount =
                month === startMonth
                  ? 1
                  : amountOfLeaveData[amountOfLeaveData.length - 1].amount + 1;
            }

            const existingItemIndex = amountOfLeaveData.findIndex(
              (item) => item.year === year && item.isActive,
            );

            if (existingItemIndex !== -1) {
              amountOfLeaveData[existingItemIndex].amount = amount;
            } else {
              // Jika item belum ada, tambahkan item baru
              amountOfLeaveData.push({
                amount,
                year,
                isActive: true,
              });
            }

            // Tambahkan 1 ke bulan yang sudah berlalu sejak kontrak dimulai
            monthsSinceStart++;
          }
        }
      }
    } else {
      // Logika untuk non-kontrak
      const amountYear = 12;
      if (moment().isSame(moment.utc(startContract), 'year')) {
        // Jika tahun saat ini sama dengan tahun startContract
        amountOfLeaveData.push({
          amount: 12,
          year: moment().year(),
          isActive: true,
        });
      } else {
        // Jika tahun startContract tidak sama dengan tahun saat ini
        const startContractYear = moment.utc(startContract).year();
        const currentYear = moment().year();

        for (let year = startContractYear; year <= currentYear; year++) {
          // Set isActive menjadi true hanya pada tahun saat ini dan satu tahun sebelumnya
          const isActive = year === currentYear || year === currentYear - 1;

          // Buat record baru untuk setiap tahun dari startContract sampai tahun saat ini
          amountOfLeaveData.push({
            amount: amountYear,
            year,
            isActive,
          });
        }
      }
    }
    // Validasi agar endContract tidak kurang dari startContract
    if (isContract && moment.utc(endContract).isBefore(moment.utc(startContract))) {
      return errorResponse(
        res,
        'End contract date cannot be earlier than start contract date',
        '',
        400,
      );
    }

    // Buat employee baru di database
    const createdEmployee = await prisma.employee.create({
      data: {
        nik,
        name,
        isWorking: true,
        historicalName,
        historicalNik,
        gender,
        positions: {
          connect: { id: positionId },
        },
        typeOfEmployee: {
          create: {
            isContract,
            startContract: moment.utc(startContract).toDate(),
            endContract: isContract ? moment.utc(endContract).toDate() : null,
            newContract: isContract ? newContract : false,
          },
        },
        amountOfLeave: {
          createMany: {
            data: amountOfLeaveData,
          },
        },
        user: {
          create: {
            email,
            password: hashedPassword,
            isFirst: true,
            role: {
              connect: {
                id: 3,
              },
            },
          },
        },
      },
    });

    const currentUser = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        employee: {
          select: {
            name: true,
          },
        },
      },
    });

    const senderName = currentUser.employee.name;

    // Konfigurasi transporter untuk mengirim email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    // Konfigurasi opsi email
    const mailOptions = {
      from: `"${req.user.email}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Welcome to the Company',
      html: `
      <html>
      <head>
    
        <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #007bff;
          color: #fff;
          text-align: center;
          padding: 20px 0;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 20px;
        }
        .content p {
          margin: 10px 0;
        }
        .credentials {
          
          padding: 10px 20px;
          border-radius: 4px;
          text-align: start;
		self-align: center;
      margin: 0 auto; /* Center the table */

        }
        .credentials strong {
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to the Company</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Thank you for joining our company! Here are your login credentials:</p>
          <table class="credentials">
          <tr>
            <td><strong>Email</strong></td>
            <td><strong>:</strong></td>
            <td>${email}</td>
          </tr>
          <tr>
            <td><strong>Password</strong></td>
            <td><strong>:</strong></td>
            <td>${randomPassword}</td>
          </tr>
          </table>
        </div>
        <div class="footer">
          <p>Best regards, <br> The Company</p>
          <p>This email was sent by ${senderName}</p>
        </div>
      </div>
      </body>
    </html>
      `,
    };

    // Kirim email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    // Respon sukses
    return successResponse(res, 'Employee added successfully', createdEmployee, 201);
  } catch (error) {
    // Tangani error
    console.error(error);
    return errorResponse(res, 'An error occurred while adding the employee', '', 500);
  }
}

module.exports = {
  getAll,
  getNIK,
  disableEmployee,
  enableEmployee,
  getMe,
  updateEmployee,
  changePassword,
  resetPassword,
  addEmployee,
  createOrUpdateAmountOfLeave,
  calculateAmountOfLeave,
  updateAmountOfLeaveForActiveEmployees,
};
