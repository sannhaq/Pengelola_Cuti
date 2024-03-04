const { date } = require('zod');
const { prisma } = require('../configs/prisma.config');
const nodemailer = require('nodemailer');
const {
  successResponseWithPage,
  errorResponse,
  paginate,
  successResponse,
} = require('../utils/helper.util');
const { leaveRejectEmailTemplate, getLeaveApprovalEmailTemplate } = require('../utils/email.util');
const { getConfig } = require('../../config');
const config = getConfig();
if (!config) {
  console.error('Failed to load config data. Existing');
  process.exit(1);
}

const gmailName = config.GMAIL_USER;
const gmailPass = config.GMAIL_PASSWORD;

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getSpecialLeaveList(req, res) {
  try {
    // Extract query parameters from the request
    const { page, perPage, search, gender } = req.query;

    // Perform pagination using the paginate utility function
    const pagination = await paginate(prisma.specialLeave, { page, perPage });

    // Define the filter object based on optional search and gender parameters
    const filter = {};
    if (search) {
      filter.leaveTitle = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (gender) {
      if (typeof gender === 'string') {
        filter.gender = gender.toUpperCase();
      }
    }

    // Retrieve special leaves based on the applied filters
    const specialLeaves = await prisma.specialLeave.findMany({
      where: { ...filter, isDelete: false },
      orderBy: {
        updated_at: 'desc',
      },
      select: {
        id: true,
        leaveTitle: true,
        gender: true,
        amount: true,
        leaveInformation: true,
        typeOfLeave: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    });

    const displaySpecialLeaves = specialLeaves.map((leave, index) => ({
      no: (pagination.meta.currPage - 1) * pagination.meta.perPage + index + 1,
      id: leave.id,
      leaveTitle: leave.leaveTitle,
      gender: leave.gender,
      amount: leave.amount,
      leaveInformation: leave.leaveInformation,
      typeOfLeave: leave.typeOfLeave.name,
    }));

    // Count total special leaves for the specified criteria
    const totalPage = await prisma.specialLeave.count({
      where: { ...filter, isDelete: false },
    });

    return successResponseWithPage(
      res,
      'Succescfully get special leave list',
      displaySpecialLeaves,
      200,
      {
        ...pagination.meta,
        total: totalPage,
        lastPage: Math.ceil(totalPage / perPage),
      },
    );
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Failed to get special leave list', null, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getSpecialLeaveById(req, res) {
  try {
    // Extract the special leave ID from the request parameters
    const { id } = req.params;

    // Retrieve the special leave with the specified ID
    const specialLeave = await prisma.specialLeave.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        leaveTitle: true,
        gender: true,
        amount: true,
        leaveInformation: true,
        typeOfLeave: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return successResponse(res, 'Successfully get special leave by id', specialLeave, 200);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Failed to get special leave by id', null, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updateSpecialLeave(req, res) {
  try {
    // Extract the special leave ID from the request parameters
    const { id } = req.params;

    // Extract necessary data from the request body
    const { leaveTitle, gender, amount, leaveInformation } = req.body;

    // Update the special leave with the specified ID
    const updateSpecialLeave = await prisma.specialLeave.update({
      where: { id: parseInt(id) },
      data: {
        leaveTitle,
        gender,
        amount,
        leaveInformation,
      },
    });

    return successResponse(res, 'Successfully updated special leave', updateSpecialLeave, 200);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Failed to update special leave', null, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function createSpecialLeave(req, res) {
  try {
    // Extract necessary data from the request body
    const { leaveTitle, gender, amount, leaveInformation } = req.body;

    // Create a new special leave entry in the database
    const newSpecialLeave = await prisma.specialLeave.create({
      data: {
        leaveTitle,
        gender,
        amount,
        typeOfLeaveId: 4, // typeOfLeaveId for special leave is 4
        leaveInformation,
      },
    });
    return successResponse(res, 'Successfully created special leave', newSpecialLeave, 200);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Failed to create special leave', null, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function specialLeaveUsers(req, res) {
  try {
    // Extract query parameters from the request
    const { page, perPage, search, status } = req.query;

    // Perform pagination using the paginate utility function
    const pagination = await paginate(prisma.employeeSpecialLeave, { page, perPage });

    // Define the filter object based on optional search and status parameters
    const filter = {};
    if (search) {
      filter.OR = [
        {
          employee: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
        {
          specialLeave: {
            leaveTitle: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (status) {
      if (typeof status === 'string') {
        filter.status = status.toUpperCase();
      } else {
        throw new Error('Invalid status parameter');
      }
    }

    // Retrieve special leave history based on the applied filters
    const leaveHistory = await prisma.employeeSpecialLeave.findMany({
      where: filter,
      orderBy: {
        updated_at: 'desc',
      },
      include: {
        employee: {
          select: {
            nik: true,
            name: true,
          },
        },
        specialLeave: {
          select: {
            leaveTitle: true,
            amount: true,
            typeOfLeave: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    });

    // Count total special leave entries for the specified status
    const totalSpecialLeave = await prisma.employeeSpecialLeave.count({
      where: filter,
    });

    // Format the result to include special leave details and pagination metadata
    const allSpecialLeave = leaveHistory.map((item) => {
      let additionalFields = {};

      if (item.status === 'APPROVE') {
        additionalFields.approveBy = item.approveBy;
      }

      if (item.status === 'REJECT') {
        additionalFields.rejectBy = item.rejectBy;
      }

      if (item.status != 'WAITING') {
        return {
          id: item.id,
          ...item.employee,
          ...item.specialLeave,
          status: item.status,
          note: item.note,
          startLeave: item.startLeave,
          endLeave: item.endLeave,
          ...additionalFields,
        };
      } else {
        return {
          id: item.id,
          ...item.employee,
          ...item.specialLeave,
          status: item.status,
          note: item.note,
          startLeave: item.startLeave,
          endLeave: item.endLeave,
        };
      }
    });

    return successResponseWithPage(
      res,
      'Successfully get all special leave',
      allSpecialLeave,
      200,
      {
        ...pagination.meta,
        total: totalSpecialLeave,
        lastPage: Math.ceil(totalSpecialLeave / perPage),
      },
    );
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Failed to get special leave users', null, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getSpecialLeaveByNik(req, res) {
  try {
    // Extract NIK from the request parameters
    const { nik } = req.params;

    // Extract query parameters from the request
    const { page, perPage, status } = req.query;

    // Perform pagination using the paginate utility function
    const pagination = await paginate(prisma.employeeSpecialLeave, { page, perPage });

    // Define the filter object based on optional status parameter
    const filter = {};
    if (status) {
      if (typeof status === 'string') {
        filter.status = status.toUpperCase();
      } else {
        throw new Error('Invalid status parameter');
      }
    }

    // Retrieve special leave history for the specified employee
    const leaveHistory = await prisma.employeeSpecialLeave.findMany({
      where: { employeeNik: nik, ...filter },
      orderBy: { updated_at: 'desc' },
      include: {
        employee: {
          select: {
            nik: true,
            name: true,
          },
        },
        specialLeave: {
          select: {
            leaveTitle: true,
            amount: true,
            typeOfLeave: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    });

    // If no special leave history found for the employee
    if (!leaveHistory || leaveHistory.length === 0) {
      // Retrieve basic employee information
      const employeeInfo = await prisma.employee.findUnique({
        where: { nik: nik },
        select: {
          nik: true,
          name: true,
        },
      });

      const total = 0;
      const currPage = 0;
      const lastPage = 0;

      return successResponseWithPage(res, 'No special leave history found', employeeInfo, 200, {
        ...pagination.meta,
        total,
        currPage,
        lastPage,
      });
    }

    // Count total special leave entries for the specified employee
    const totalSpecialLeave = await prisma.employeeSpecialLeave.count({
      where: { employeeNik: nik, ...filter },
    });

    // Format the result to include special leave details and pagination metadata
    const allSpecialLeave = leaveHistory.map((item) => {
      let additionalFields = {};

      if (item.status === 'APPROVE') {
        additionalFields.approveBy = item.approveBy;
      }

      if (item.status === 'REJECT') {
        additionalFields.rejectBy = item.rejectBy;
      }

      if (item.status != 'WAITING') {
        return {
          id: item.id,
          ...item.employee,
          ...item.specialLeave,
          status: item.status,
          note: item.note,
          startLeave: item.startLeave,
          endLeave: item.endLeave,
          ...additionalFields,
        };
      } else {
        return {
          id: item.id,
          ...item.employee,
          ...item.specialLeave,
          status: item.status,
          note: item.note,
          startLeave: item.startLeave,
          endLeave: item.endLeave,
        };
      }
    });

    return successResponseWithPage(
      res,
      'Succesfull get all special leave by NIK',
      allSpecialLeave,
      200,
      {
        ...pagination.meta,
        total: totalSpecialLeave,
        lastPage: Math.ceil(totalSpecialLeave / perPage),
      },
    );
  } catch {
    return errorResponse(res, 'Failed to get special leave by NIK', null, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getSpecialLeaveMe(req, res) {
  try {
    // Extract user ID from the request
    const userId = req.user.id;

    // Extract pagination parameters from the request query
    const { page, perPage } = req.query;

    // Retrieve user's special leave information including pagination metadata
    const userSpecialLeaveInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        employee: {
          select: {
            employeeSpecialLeaves: {
              orderBy: {
                updated_at: 'desc',
              },
              select: {
                id: true,
                status: true,
                specialLeave: {
                  select: {
                    id: true,
                    typeOfLeaveId: true,
                    typeOfLeave: {
                      select: {
                        name: true,
                      },
                    },
                    leaveTitle: true,
                    gender: true,
                    amount: true,
                  },
                },
                note: true,
                startLeave: true,
                endLeave: true,
                approveBy: true,
                rejectBy: true,
              },
            },
          },
        },
      },
    });

    // Calculate total number of special leaves for the user
    const totalLeaves = userSpecialLeaveInfo.employee.employeeSpecialLeaves.length;

    // Perform pagination on the user's special leave history
    const pagination = await paginate(prisma.user, { page, perPage, total: totalLeaves });

    // Slice the special leave entries based on pagination parameters
    const paginatedLeaves = userSpecialLeaveInfo.employee.employeeSpecialLeaves.slice(
      (pagination.meta.currPage - 1) * pagination.meta.perPage,
      pagination.meta.currPage * pagination.meta.perPage,
    );

    // Format special leave data for the response
    const allLeaves = paginatedLeaves.map((item) => {
      let additionalFields = {};

      if (item.status === 'APPROVE') {
        additionalFields.approveBy = item.approveBy;
      }

      if (item.status === 'REJECT') {
        additionalFields.rejectBy = item.rejectBy;
      }

      if (item.status != 'WAITING') {
        return {
          id: item.id,
          status: item.status,
          typeOfLeave: {
            id: item.specialLeave.typeOfLeaveId,
            name: item.specialLeave.typeOfLeave.name,
          },
          leaveTitle: item.specialLeave.leaveTitle,
          gender: item.specialLeave.gender,
          amount: item.specialLeave.amount,
          note: item.note,
          startLeave: item.startLeave,
          endLeave: item.endLeave,
          ...additionalFields,
        };
      } else {
        return {
          id: item.id,
          status: item.status,
          typeOfLeave: {
            id: item.specialLeave.typeOfLeaveId,
            name: item.specialLeave.typeOfLeave.name,
          },
          leaveTitle: item.specialLeave.leaveTitle,
          gender: item.specialLeave.gender,
          amount: item.specialLeave.amount,
          note: item.note,
          startLeave: item.startLeave,
          endLeave: item.endLeave,
        };
      }
    });

    // Sanitize user data by including only special leave history
    const sanitizedUser = {
      id: userSpecialLeaveInfo.id,
      employee: {
        specialLeave: allLeaves,
      },
    };

    // Update total and lastPage in the pagination meta
    pagination.meta.total = totalLeaves;
    pagination.meta.lastPage = Math.ceil(totalLeaves / pagination.meta.perPage);

    return successResponseWithPage(
      res,
      'Successfully retrieved leave history for the currently logged in user',
      sanitizedUser,
      200,
      {
        ...pagination.meta,
        total: totalLeaves,
        lastPage: Math.ceil(totalLeaves / perPage),
      },
    );
  } catch (e) {
    console.error(e);
    return errorResponse(res, 'Failed to get leave history for logged in user', null, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getSpecialLeaveByNikGender(req, res) {
  try {
    // Extract NIK from the request parameters
    const { nik } = req.params;

    // Retrieve employee's gender based on NIK
    const employee = await prisma.employee.findUnique({
      where: { nik },
      select: { gender: true },
    });

    // If employee is not found, return 404 error response
    if (!employee) {
      return errorResponse(res, 'Employee not found', null, 404);
    }

    // Retrieve special leave options based on employee's gender and 'LP' (Leave Policy) gender
    const specialLeave = await prisma.specialLeave.findMany({
      where: {
        OR: [{ gender: employee.gender }, { gender: 'LP' }],
        isDelete: false,
      },
      orderBy: {
        gender: 'asc',
      },
      select: {
        id: true,
        leaveTitle: true,
        gender: true,
        amount: true,
        leaveInformation: true,
        typeOfLeave: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return successResponse(res, 'Successfully get special leave by nik', specialLeave, 200);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Failed to get special leave by nik', null, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function setSpecialLeave(req, res) {
  try {
    // Extract NIK, specialLeaveId, and startLeave from the request
    const { nik } = req.params;
    const { specialLeaveId, startLeave } = req.body;

    // Retrieve employee's gender based on NIK
    const employee = await prisma.employee.findUnique({
      where: {
        nik: nik,
      },
      select: {
        gender: true,
      },
    });

    // Find the special leave based on specialLeaveId and employee's gender
    const specialLeave = await prisma.specialLeave.findUnique({
      where: {
        id: parseInt(specialLeaveId),
        OR: [{ gender: employee.gender }, { gender: 'LP' }],
      },
      select: {
        amount: true,
      },
    });

    // If special leave not found or does not match employee's gender, return 404 error response
    if (!specialLeave) {
      return errorResponse(
        res,
        'Special leave not found or does not match employee gender',
        null,
        404,
      );
    }

    // Function to calculate endLeave date based on startLeave and special leave amount
    const setEndLeave = (date, days) => {
      let countedDays = 0;
      let currentDate = new Date(date.getTime());

      while (countedDays < days) {
        currentDate.setDate(currentDate.getDate() + 1);
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          countedDays++;
        }
      }

      return currentDate;
    };

    // Create a new entry for employeeSpecialLeave in the database
    const setSpecialLeave = await prisma.employeeSpecialLeave.create({
      data: {
        employeeNik: nik,
        specialLeaveId,
        startLeave,
        endLeave: setEndLeave(startLeave, specialLeave.amount - 1),
      },
    });

    return successResponse(res, 'Successfully set the special leave', setSpecialLeave);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Failed to set special leave ', null, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function approveSpecialLeave(req, res) {
  try {
    // Extract the ID of the special leave from the request parameters
    const { id } = req.params;

    const { user } = req;

    const employeeData = await prisma.employee.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!employeeData) {
      return errorResponse(res, 'Employee data not found for the current user', '', 404);
    }

    const { name: approveBy } = employeeData;

    // Retrieve information about the special leave based on the ID
    const specialLeaveInfo = await prisma.employeeSpecialLeave.findUnique({
      where: { id: parseInt(id) },
      select: {
        status: true,
        startLeave: true,
        endLeave: true,
        employee: {
          select: {
            name: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        specialLeave: {
          select: {
            leaveTitle: true,
          },
        },
      },
    });

    // Check if the special leave status is already 'APPROVE'
    if (specialLeaveInfo.status === 'APPROVE') {
      return errorResponse(res, 'Special leave is already APPROVE', null, 409);
    }

    if (specialLeaveInfo.status === 'REJECT') {
      await prisma.employeeSpecialLeave.update({
        where: { id: parseInt(id) },
        data: {
          rejectBy: null,
        },
      });
    }

    // Update the special leave status to 'APPROVE'
    const approveSpecialLeave = await prisma.employeeSpecialLeave.update({
      where: { id: parseInt(id) },
      data: {
        status: 'APPROVE',
        note: null,
        approveBy: approveBy,
      },
    });

    const emailData = {
      employeeName: specialLeaveInfo.employee.name,
      reason: specialLeaveInfo.specialLeave.leaveTitle,
      startLeave: specialLeaveInfo.startLeave,
      endLeave: specialLeaveInfo.endLeave,
      sendBy: approveBy,
    };

    const startDate = new Date(emailData.startLeave);
    const endDate = new Date(emailData.endLeave);

    const formattedStartDate = `${startDate.getDate()} ${startDate.toLocaleString('en-US', {
      month: 'long',
    })} ${startDate.getFullYear()}`;
    const formattedEndDate = `${endDate.getDate()} ${endDate.toLocaleString('en-US', {
      month: 'long',
    })} ${endDate.getFullYear()}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: gmailName,
        pass: gmailPass,
      },
    });

    const emailView = getLeaveApprovalEmailTemplate(
      'Special Leave Request Approval',
      emailData,
      formattedStartDate,
      formattedEndDate,
    );

    const mailOptions = {
      from: `"${approveBy} - ${req.user.email}" <${process.env.GMAIL_USER}>`,
      to: specialLeaveInfo.employee.user.email,
      subject: 'Confirmation: Your Special Leave Request Has Been Approved',
      html: emailView,
    };

    await transporter.sendMail(mailOptions);

    return successResponse(res, 'Successfully approved special leave', approveSpecialLeave);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Failed to approve special leave', null, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function rejectSpecialLeave(req, res) {
  try {
    // Extract the ID of the special leave from the request parameters
    const { id } = req.params;

    // Extract the rejection note from the request body
    const { note } = req.body;

    const { user } = req;

    const employeeData = await prisma.employee.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!employeeData) {
      return errorResponse(res, 'Employee data not found for the current user', '', 404);
    }

    const { name: rejectBy } = employeeData;

    // Retrieve information about the special leave based on the ID
    const specialLeaveInfo = await prisma.employeeSpecialLeave.findUnique({
      where: { id: parseInt(id) },
      select: {
        status: true,
        startLeave: true,
        endLeave: true,
        employee: {
          select: {
            name: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        specialLeave: {
          select: {
            leaveTitle: true,
          },
        },
      },
    });

    // Check if the special leave status is already 'REJECT'
    if (specialLeaveInfo.status === 'REJECT') {
      return errorResponse(res, 'Special leave is already rejected', null, 409);
    }

    if (specialLeaveInfo.status === 'APPROVE') {
      await prisma.employeeSpecialLeave.update({
        where: { id: parseInt(id) },
        data: {
          approveBy: null,
        },
      });
    }

    // Update the special leave status to 'REJECT' and set the rejection note
    const rejectSpecialLeave = await prisma.employeeSpecialLeave.update({
      where: { id: parseInt(id) },
      data: {
        status: 'REJECT',
        note,
        rejectBy: rejectBy,
      },
    });

    const emailData = {
      employeeName: specialLeaveInfo.employee.name,
      reason: specialLeaveInfo.specialLeave.leaveTitle,
      startLeave: specialLeaveInfo.startLeave,
      endLeave: specialLeaveInfo.endLeave,
      note: rejectSpecialLeave.note,
    };

    const startDate = new Date(emailData.startLeave);
    const endDate = new Date(emailData.endLeave);

    const formattedStartDate = `${startDate.getDate()} ${startDate.toLocaleString('en-US', {
      month: 'long',
    })} ${startDate.getFullYear()}`;
    const formattedEndDate = `${endDate.getDate()} ${endDate.toLocaleString('en-US', {
      month: 'long',
    })} ${endDate.getFullYear()}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: gmailName,
        pass: gmailPass,
      },
    });

    const emailView = leaveRejectEmailTemplate(
      'Special Leave Request Rejection',
      emailData,
      formattedStartDate,
      formattedEndDate,
    );

    const mailOptions = {
      from: `"${rejectBy} - ${req.user.email}" <${process.env.GMAIL_USER}>`,
      to: specialLeaveInfo.employee.user.email,
      subject: 'Notification: Special Leave Request Rejected',
      html: emailView,
    };

    await transporter.sendMail(mailOptions);

    return successResponse(res, 'Successfully rejected special leave', rejectSpecialLeave);
  } catch (e) {
    return errorResponse(res, 'Failed to reject special leave', null, 500);
  }
}

async function deleteSpecialLeaveList(req, res) {
  try {
    const { id } = req.params;

    // special leave information
    const specialLeave = await prisma.specialLeave.update({
      where: { id: parseInt(id) },
      data: {
        isDelete: true,
      },
    });

    return successResponse(res, 'Successfully deleted special leave list', specialLeave, 200);
  } catch (e) {
    return errorResponse(res, 'Failed to delete special leave list', null, 500);
  }
}

async function setSpecialLeaveBySelf(req, res) {
  try {
    const { specialLeaveId, startLeave } = req.body;

    const employeeData = await prisma.employee.findUnique({
      where: {
        userId: req.user.id,
      },
      select: {
        nik: true,
        name: true,
      },
    });

    // Retrieve employee's gender based on NIK
    const employee = await prisma.employee.findUnique({
      where: {
        nik: employeeData.nik,
      },
      select: {
        gender: true,
      },
    });

    // Find the special leave based on specialLeaveId and employee's gender
    const specialLeave = await prisma.specialLeave.findUnique({
      where: {
        id: parseInt(specialLeaveId),
        OR: [{ gender: employee.gender }, { gender: 'LP' }],
      },
      select: {
        amount: true,
        leaveTitle: true,
      },
    });

    // If special leave not found or does not match employee's gender, return 404 error response
    if (!specialLeave) {
      return errorResponse(
        res,
        'Special leave not found or does not match employee gender',
        null,
        404,
      );
    }

    // Function to calculate endLeave date based on startLeave and special leave amount
    const setEndLeave = (date, days) => {
      let countedDays = 0;
      let currentDate = new Date(date.getTime());

      while (countedDays < days) {
        currentDate.setDate(currentDate.getDate() + 1);
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          countedDays++;
        }
      }

      return currentDate;
    };

    // Create a new entry for employeeSpecialLeave in the database
    const setSpecialLeave = await prisma.employeeSpecialLeave.create({
      data: {
        employeeNik: employeeData.nik,
        specialLeaveId,
        startLeave,
        endLeave: setEndLeave(startLeave, specialLeave.amount - 1),
      },
    });

    const leaveEmailData = {
      employeeName: employeeData.name,
      reason: specialLeave.leaveTitle,
      startLeave: setSpecialLeave.startLeave,
      endLeave: setSpecialLeave.endLeave,
    };

    const startDate = new Date(leaveEmailData.startLeave);
    const endDate = new Date(leaveEmailData.endLeave);

    const formattedStartDate = `${startDate.getDate()} ${startDate.toLocaleString('en-US', {
      month: 'long',
    })} ${startDate.getFullYear()}`;
    const formattedEndDate = `${endDate.getDate()} ${endDate.toLocaleString('en-US', {
      month: 'long',
    })} ${endDate.getFullYear()}`;

    const userIdsWithReceiveEmail = await prisma.emailPreference.findMany({
      where: {
        receiveEmail: true,
      },
      select: {
        userId: true,
      },
    });

    const recipients = await prisma.user.findMany({
      where: {
        id: {
          in: userIdsWithReceiveEmail.map((item) => item.userId),
        },
      },
      select: {
        email: true,
      },
    });

    const recipientEmails = recipients.map((recipient) => recipient.email);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: gmailName,
        pass: gmailPass,
      },
    });

    const mailOptions = {
      from: `"${employeeData.name} - ${req.user.email}" <${process.env.GMAIL_USER}>`,
      bcc: recipientEmails.join(','),
      subject: 'Special Leave Request',
      html: `<html>
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
            margin: 0 auto;
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
            <h1>Special Leave Request Information</h1>
          </div>
          <div class="content">
            <p>This is to inform you that a special leave request has been submitted for the following period:</p>
            <table class="credentials">
            <tr>
                <td><strong>Reason</strong></td>
                <td><strong>:</strong></td>
                <td>${leaveEmailData.reason}</td>
              </tr> 
            <tr>
                <td><strong>From</strong></td>
                <td><strong>:</strong></td>
                <td>${formattedStartDate}</td>
              </tr>
              <tr>
                <td><strong>Until</strong></td>
                <td><strong>:</strong></td>
                <td>${formattedEndDate}</td>
              </tr>
            </table>
          </div>
          <div class="footer">
            <p>
              Best regards, <br />
              ${employeeData.name}
            </p>
          </div>
        </div>
      </body>
    </html>`,
    };

    await transporter.sendMail(mailOptions);

    return successResponse(res, 'Successfully set the special leave', setSpecialLeave);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Failed to set special leave ', null, 500);
  }
}
module.exports = {
  getSpecialLeaveList,
  getSpecialLeaveById,
  updateSpecialLeave,
  createSpecialLeave,
  specialLeaveUsers,
  getSpecialLeaveByNik,
  getSpecialLeaveMe,
  getSpecialLeaveByNikGender,
  setSpecialLeave,
  approveSpecialLeave,
  rejectSpecialLeave,
  deleteSpecialLeaveList,
  setSpecialLeaveBySelf,
};
