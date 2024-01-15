const { PrismaClient } = require('@prisma/client');

const { validationResult } = require('express-validator');

const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const moment = require('moment');
const bcrypt = require('bcrypt');

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
    const { page, perPage } = req.query;
    const pagination = await paginate(prisma.employee, { page, perPage });

    const employees = await prisma.employee.findMany({
      select: {
        name: true,
        nik: true,
        positions: {
          select: {
            name: true,
          },
        },
        amountOfLeave: true,
        isWorking: true,
      },
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    });

    const formattedEmployees = employees.map((employee) => ({
      ...employee,
      positions: {
        ...employee.positions,
        name: employee.isWorking ? employee.positions.name : '-',
      },
    }));

    return successResponseWithPage(
      res,
      'Successfully retrieved employees',
      formattedEmployees,
      200,
      pagination.meta,
    );
  } catch (error) {
    console.error('Error getting employees:', error);
    return errorResponse(res, 'Failed to get employees', '', 500);
  }
}

async function getNIK(req, res) {
  try {
    const { nik } = req.params;

    const employee = await prisma.employee.findMany({
      where: {
        nik,
      },
      select: {
        nik: true,
        name: true,
        positions: {
          select: {
            name: true,
          },
        },
        isWorking: true,
        typeOfEmployee: {
          select: {
            startContract: true,
            isContract: true,
            endContract: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
        historicalName: true,
        historicalNik: true,
      },
    });

    if (!Array.isArray(employee)) {
      return errorResponse(res, 'Invalid data format', '', 500);
    }

    const formattedData = formatEmployeeData(employee);

    const transformedData = formattedData.map((data) => {
      if (!data.typeOfEmployee.isContract) {
        data.typeOfEmployee.endContract = null;
      }
      return data;
    });

    if (formattedData.length === 0) {
      return errorResponse(res, 'Employee not found', '', 404);
    }

    return successResponse(res, 'Successfully retrieved employee data', transformedData, 200);
  } catch (error) {
    console.error('Error getting employee data:', error);
    return errorResponse(res, 'Failed to get employee data', '', 500);
  }
}

async function disableEmployee(req, res) {
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

    if (employee.isWorking === false) {
      return errorResponse(res, 'Employee has already been disabled', '', 400);
    }

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

    const employee = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          select: {
            nik: true,
            name: true,
            amountOfLeave: true,
          },
        },
      },
    });

    if (!employee) {
      return errorResponse(res, 'User not found', '', 404);
    }

    return successResponse(res, 'Me success', employee);
  } catch (error) {
    console.error('Error getting user data:', error);
    return errorResponse(res, 'Internal server error', '', 500);
  }
}

async function updateEmployee(req, res) {
  const employeeNik = req.params.nik;
  const { name, positionId, typeOfEmployee } = req.body;

  try {
    const employee = await prisma.employee.findUnique({
      where: {
        nik: employeeNik,
      },
      include: {
        positions: true,
        typeOfEmployee: true,
      },
    });

    if (!employee) {
      return errorResponse(res, 'Employee not found', '', 404);
    }

    if (req.user.role.name === 'Admin') {
      const updateData = {
        name,
        positions: {
          connect: { id: positionId },
        },
        typeOfEmployee: {
          update: {
            isContract: typeOfEmployee.isContract,
            endContract: typeOfEmployee.isContract
              ? moment.utc(typeOfEmployee.endContract).format()
              : null,
          },
        },
      };

      await prisma.employee.update({
        where: {
          nik: employeeNik,
        },
        data: updateData,
      });
    } else if (req.user.role.name === 'User') {
      await prisma.employee.update({
        where: {
          nik: employeeNik,
        },
        data: {
          name,
        },
      });
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
    const { newPassword } = req.body;
    const { user } = req;

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedNewPassword,
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
    const employee = await prisma.employee.findUnique({
      where: {
        nik,
      },
    });

    if (!employee) {
      return errorResponse(res, 'Employee not found', '', 404);
    }

    const defaultPassword = 'password';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await prisma.user.update({
      where: {
        id: employee.userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return successResponse(res, 'Password reset successfully', hashedPassword, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'An error occurred while resetting the password', '', 500);
  }
}

async function addEmployee(req, res) {
  const { nik, name, email, isContract, startContract, endContract, positionId } = req.body;
  const { user } = req;

  try {
    // Check if email is unique
    const existingEmployee = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmployee) {
      return errorResponse(res, 'Email is already in use', '', 400);
    }

    const employeeData = await prisma.employee.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!employeeData) {
      return errorResponse(res, 'Employee data not found for the current user', '', 404);
    }

    const { name: historicalName, nik: historicalNik } = employeeData;

    // Set default password
    const defaultPassword = 'password';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create employee in the database
    const createdEmployee = await prisma.employee.create({
      data: {
        nik,
        name,
        isWorking: true,
        historicalName,
        historicalNik,
        positions: {
          connect: { id: positionId },
        },
        typeOfEmployee: {
          create: {
            isContract,
            startContract: moment.utc(startContract).toDate(),
            endContract: isContract ? moment.utc(endContract).toDate() : null,
          },
        },
        amountOfLeave: isContract ? 0 : 12,
        user: {
          create: {
            email,
            password: hashedPassword,
            role: {
              connect: {
                id: 3,
              },
            },
          },
        },
      },
    });

    const employeeCreationDate = moment.utc(startContract);

    const monthsOfWork = moment.utc().diff(employeeCreationDate, 'months');

    if (monthsOfWork >= 4 && moment().isBefore(moment.utc(endContract))) {
      const amountToAdd = monthsOfWork - 3;

      await prisma.employee.update({
        where: {
          nik,
        },
        data: {
          amountOfLeave: {
            increment: amountToAdd,
          },
        },
      });

      const startContractDate = moment.utc(startContract).toDate();

      const rule = new schedule.RecurrenceRule();
      rule.date = startContractDate.getDate();
      rule.month = new schedule.Range(0, 11);

      schedule.scheduleJob(rule, async () => {
        const employeeScheduled = await prisma.employee.findUnique({
          where: {
            nik,
          },
        });

        if (employeeScheduled) {
          const { endContract: endContractScheduled } = employeeScheduled;

          const monthsOfWorkScheduled = moment.utc().diff(moment.utc(startContract), 'months');

          if (moment().isBefore(moment.utc(endContractScheduled)) && monthsOfWorkScheduled >= 4) {
            const amountToAddScheduled = monthsOfWorkScheduled - 3;

            // Update karyawan dengan penambahan "amountOfLeave"
            await prisma.employee.update({
              where: {
                nik,
              },
              data: {
                amountOfLeave: {
                  increment: amountToAddScheduled,
                },
              },
            });
          }
        }
      });
    }

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
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Welcome to the Company',
      text: `Dear ${name},\n\nWelcome to the company!\n\nYour login credentials:\nEmail: ${email}\nSecret Key: ${defaultPassword}\n\nBest regards,\nThe Company`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    return successResponse(res, 'Employee added successfully', createdEmployee, 201);
  } catch (error) {
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
};
