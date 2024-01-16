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
    // Extract page and perPage from query parameters
    const { page, perPage } = req.query;
    // Perform pagination using custom paginate function
    const pagination = await paginate(prisma.employee, { page, perPage });

    // Fetch employees with selected fields and positions' names
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
      // Calculate skip and take based on pagination information
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    });

    // Format employees data for response
    const formattedEmployees = employees.map((employee) => ({
      ...employee,
      positions: {
        // Display '-' for positions' name if not working
        ...employee.positions,
        name: employee.isWorking ? employee.positions.name : '-',
      },
    }));

    // Return success response with paginated employee data
    return successResponseWithPage(
      res,
      'Successfully retrieved employees',
      formattedEmployees,
      200,
      pagination.meta,
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

    // Return a 404 response if no user is found with the given ID
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
    // Fetch the existing employee data from the database using Prisma
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

    // Check if the authenticated user has admin privileges
    if (req.user.role.name === 'Admin') {
      // Prepare update data for admin user
      const updateData = {
        name,
        positions: {
          connect: { id: positionId },
        },
        typeOfEmployee: {
          update: {
            isContract: typeOfEmployee.isContract,
            newContract: typeOfEmployee.isContract,
            endContract: typeOfEmployee.isContract
              ? moment.utc(typeOfEmployee.endContract).format()
              : null,
          },
        },
      };

      // Update employee data with the prepared data
      await prisma.employee.update({
        where: {
          nik: employeeNik,
        },
        data: updateData,
      });
    } else if (req.user.role.name === 'User') {
      // Update employee name for non-admin user
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
        user: true
      },
    });

    if (!employee) {
      return errorResponse(res, 'Employee not found', '', 404);
    }

    // Generate random password
    const randomPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: {
        id: employee.userId,
      },
      data: {
        password: hashedPassword,
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
      from: process.env.GMAIL_USER,
      to: employee.user.email,
      subject: 'Password Reset',
      text: `Your password has been reset. Your new password is:\nSecret Key: ${randomPassword}`,
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


// Fungsi untuk menambahkan employee baru
async function addEmployee(req, res) {
  const { nik, name, email, isContract, startContract, endContract, positionId, newContract } = req.body;
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
    const randomPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Deklarasi variabel amountOfLeave
    let amountOfLeave;

    // Logika untuk menentukan nilai amountOfLeave
    if (isContract) {
      if (newContract) {
        // Logika untuk newContract true
        // Tambahkan amountOfLeave setiap bulan setelah 3 bulan bekerja
        const monthsOfWork = moment.utc().diff(moment.utc(startContract), 'months');
        amountOfLeave = Math.max(monthsOfWork - 2, 0);

        // Tambahkan amountOfLeave setiap bulan
        const startContractDate = moment.utc(startContract).toDate();
        const rule = new schedule.RecurrenceRule();
        rule.date = startContractDate.getDate();
        rule.month = new schedule.Range(0, 11);

        schedule.scheduleJob(rule, async () => {
          await prisma.employee.update({
            where: {
              nik,
            },
            data: {
              amountOfLeave: {
                increment: 1,
              },
            },
          });
        });
        
      } else {
        const monthsOfWork = moment.utc().diff(moment.utc(startContract), 'months');
        // Logika untuk newContract false
        // Tambahkan amountOfLeave di bulan pertama
        amountOfLeave = monthsOfWork;

        // Tambahkan amountOfLeave setiap bulan
        const startContractDate = moment.utc(startContract).toDate();
        const rule = new schedule.RecurrenceRule();
        rule.date = startContractDate.getDate();
        rule.month = new schedule.Range(0, 11);

        schedule.scheduleJob(rule, async () => {
          await prisma.employee.update({
            where: {
              nik,
            },
            data: {
              amountOfLeave: {
                increment: 1,
              },
            },
          });
        });
      }
    } else {
      // Jika bukan kontrak
      amountOfLeave = 12;
    }

    // Buat employee baru di database
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
            newContract: isContract ? newContract : false,
          },
        },
        amountOfLeave,
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

    // Reset amountOfLeave ke 12 jika tahun baru dimulai
    if (!isContract && moment().format('YYYY') !== moment(startContract).format('YYYY')) {
      await prisma.employee.update({
        where: {
          nik,
        },
        data: {
          amountOfLeave: 12,
        },
      });
    }

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
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Welcome to the Company',
      text: `Dear ${name},\n\nWelcome to the company!\n\nYour login credentials:\nEmail: ${email}\nSecret Key: ${randomPassword}\n\nBest regards,\nThe Company`,
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
};