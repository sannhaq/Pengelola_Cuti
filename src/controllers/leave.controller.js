const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const {
  errorResponse,
  successResponse,
  calculateLeaveAmount,
  paginate,
  successResponseWithPage,
  sum,
  updateLeaveAmount,
} = require('../utils/helper.util');

async function getLeaveHistoryNik(req, res) {
  try {
    // Extract NIK from request parameters
    const { nik } = req.params;

    // Extract page and perPage from query parameters for pagination
    const { page, perPage, status, typeOfLeave } = req.query;

    // Perform pagination using custom paginate function
    const pagination = await paginate(prisma.leaveEmployee, { page, perPage });

    const filter = {};

    if (status) {
      if (typeof status === 'string') {
        filter.status = status.toUpperCase();
      } else {
        throw new Error('Invalid status parameter');
      }
    }

    if (typeOfLeave) {
      filter.leave = {
        typeOfLeave: {
          name: {
            contains: typeOfLeave,
            mode: 'insensitive',
          },
        },
      };
    }

    // Retrieve leave history for the specified employeeNik
    const leaveHistory = await prisma.leaveEmployee.findMany({
      where: { employeeNik: nik, ...filter },
      orderBy: { updated_at: 'desc' },
      include: {
        employee: {
          select: {
            nik: true,
            name: true,
          },
        },
        leave: {
          select: {
            id: true,
            typeOfLeave: {
              select: {
                name: true,
              },
            },
            startLeave: true,
            endLeave: true,
            reason: true,
          },
        },
      },
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    });

    // Check if leave history is empty
    if (!leaveHistory || leaveHistory.length === 0) {
      const employeeInfo = await prisma.employee.findUnique({
        where: { nik: nik },
        select: {
          nik: true,
          name: true,
        },
      });

      const total = 0;
      const lastPage = 0;

      return successResponseWithPage(res, 'No leave history found', [employeeInfo], 200, {
        ...pagination.meta,
        total,
        lastPage,
      });
    }

    // Count total leave records for the specified employeeNik
    const total = await prisma.leaveEmployee.count({
      where: { employeeNik: nik, ...filter },
    });

    // Calculate the last page based on total and perPage
    const lastPage = Math.ceil(total / perPage);

    // Transform the leave history data for response
    const allLeaves = leaveHistory.map((item) => ({
      ...item.employee,
      ...item.leave,
      status: item.status,
      leaveUse: calculateLeaveAmount(item.leave.startLeave, item.leave.endLeave),
      note: item.note,
    }));

    return successResponseWithPage(res, 'Successfully retrieved leave history', allLeaves, 200, {
      ...pagination.meta,
      total,
      lastPage,
    });
  } catch (error) {
    console.error('Error getting leave history:', error);
    return errorResponse(res, 'Failed to get leave history', '', 500);
  }
}

async function getLeaveHistoryMe(req, res) {
  try {
    // Extract user ID from the authenticated user
    const userId = req.user.id;
    // Extract page and perPage from query parameters for pagination
    const { page, perPage } = req.query;
    // Retrieve user-specific leave information using Prisma
    const userLeaveInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        employee: {
          select: {
            leaveEmployees: {
              orderBy: {
                updated_at: 'desc',
              },
              select: {
                id: true,
                status: true,
                leave: {
                  select: {
                    id: true,
                    typeOfLeaveId: true,
                    typeOfLeave: {
                      select: {
                        name: true,
                      },
                    },
                    startLeave: true,
                    endLeave: true,
                    reason: true,
                  },
                },
                note: true,
              },
            },
          },
        },
      },
    });

    // Count total leaves for the user
    const totalLeaves = userLeaveInfo.employee.leaveEmployees.length;

    // Perform pagination using custom paginate function
    const pagination = await paginate(prisma.user, { page, perPage, total: totalLeaves });

    // Slice leaves based on current page and perPage
    const paginatedLeaves = userLeaveInfo.employee.leaveEmployees.slice(
      (pagination.meta.currPage - 1) * pagination.meta.perPage,
      pagination.meta.currPage * pagination.meta.perPage,
    );

    // Transform leave data for response
    const allLeaves = paginatedLeaves.map((item) => ({
      ...item.leave,
      leaveEmployeeId: item.id,
      status: item.status,
      leaveUse: calculateLeaveAmount(item.leave.startLeave, item.leave.endLeave),
      note: item.note,
    }));

    // Create a sanitized user object
    const sanitizedUser = {
      id: userLeaveInfo.id,
      employee: {
        leaves: allLeaves,
      },
    };

    // Update total and lastPage in the pagination meta
    pagination.meta.total = totalLeaves;
    pagination.meta.lastPage = Math.ceil(totalLeaves / pagination.meta.perPage);

    return successResponseWithPage(
      res,
      'Successfully retrieved leave history',
      sanitizedUser,
      200,
      pagination.meta,
    );
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', '', 500);
  }
}

async function mandatoryLeave(req, res) {
  try {
    // Extract page and perPage from query parameters for pagination
    const { page, perPage } = req.query;

    // Perform pagination using custom paginate function
    const pagination = await paginate(prisma.typeOfLeave, { page, perPage });

    // Retrieve mandatory leave information using Prisma
    const mandatory = await prisma.typeOfLeave.findUnique({
      where: { id: 1 },
      select: {
        name: true,
        leaves: {
          select: {
            id: true,
            reason: true,
            startLeave: true,
            endLeave: true,
          },
          skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
          take: pagination.meta.perPage,
        },
      },
    });

    // Function to format date to ISO format
    function formatDate(date) {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      return formattedDate;
    }

    // Format leave data for response
    const formattedLeaves = mandatory?.leaves.map((leave) => ({
      ...leave,
      startLeave: formatDate(leave.startLeave),
      endLeave: formatDate(leave.endLeave),
      leaveUse: calculateLeaveAmount(leave.startLeave, leave.endLeave),
    }));

    // Count total mandatory leaves using Prisma
    const totalLeaves = await prisma.leave.count({
      where: { typeOfLeaveId: 1 },
    });

    // Calculate lastPage for pagination
    const lastPage = Math.ceil(totalLeaves / pagination.meta.perPage);

    return successResponseWithPage(
      res,
      'Successfully retrieved mandatory leave',
      formattedLeaves,
      200,
      { ...pagination.meta, total: totalLeaves, lastPage },
    );
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', '', 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function optionalLeave(req, res) {
  try {
    // Extract page and perPage from query parameters for pagination
    const { page, perPage } = req.query;

    // Perform pagination using custom paginate function
    const pagination = await paginate(prisma.typeOfLeave, { page, perPage });

    // Get authenticated user's ID
    const userId = req.user.id;

    // Retrieve user's optional leave information using Prisma
    const userLeaveInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        employee: {
          select: {
            nik: true,
            leaveEmployees: {
              where: { leave: { typeOfLeaveId: 2 }, status: 'APPROVE' },
              select: {
                id: true,
                status: true,
                leave: {
                  select: {
                    id: true,
                    startLeave: true,
                    endLeave: true,
                    reason: true,
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
            },
          },
        },
      },
    });

    // Format the retrieved leaves for response
    const allLeaves = userLeaveInfo.employee.leaveEmployees.map((item) => ({
      ...item.leave,
      leaveEmployeeId: item.id,
      status: item.status,
      leaveUse: calculateLeaveAmount(item.leave.startLeave, item.leave.endLeave),
    }));

    // Count total approved optional leaves using Prisma
    const totalLeaveCount = await prisma.leaveEmployee.count({
      where: {
        employeeNik: userLeaveInfo.employee.nik,
        status: 'APPROVE',
        leave: { typeOfLeaveId: 2 },
      },
    });

    // Calculate lastPage for pagination
    const lastPage = Math.ceil(totalLeaveCount / pagination.meta.perPage);

    // Create a sanitized user object for response
    const sanitizedUser = {
      id: userLeaveInfo.id,
      employee: {
        leaves: allLeaves,
      },
    };

    return successResponseWithPage(
      res,
      'Successfully retrieved leave history',
      sanitizedUser,
      200,
      { ...pagination.meta, total: totalLeaveCount, lastPage },
    );
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', '', 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function collectiveLeave(req, res) {
  try {
    // Destructuring request body to extract necessary data
    const { typeOfLeaveId, reason, startLeave, endLeave } = req.body;

    // Checking if end date is greater than start date
    if (new Date(endLeave) < new Date(startLeave)) {
      return errorResponse(res, 'End date should be greater than start date', null, 400);
    }

    // Finding eligible employees who are currently working and have roles with id 2 or 3
    const eligibleEmployee = await prisma.employee.findMany({
      where: {
        isWorking: true,
        user: {
          role: {
            id: {
              not: 1,
            },
          },
        },
      },
    });

    // Returning error response if no eligible employees found
    if (!eligibleEmployee || eligibleEmployee.length === 0) {
      return errorResponse(res, 'There are no employees that meet the criteria', null, 404);
    }

    // Creating leave entry in the database
    const leaveData = await prisma.leave.create({
      data: {
        typeOfLeaveId,
        reason,
        startLeave,
        endLeave,
      },
    });

    // Extracting leave ID
    const leaveId = leaveData.id;

    // Assigning leave to eligible employees
    await prisma.leaveEmployee.createMany({
      data: eligibleEmployee.map((emp) => ({
        leaveId,
        employeeNik: emp.nik.toString(),
        status: 'APPROVE',
      })),
    });

    // Calculating the number of leave days
    let numberOfLeaveDays = calculateLeaveAmount(startLeave, endLeave);
    let today = new Date();
    let currentYear = today.getFullYear();
    let previousYear = currentYear - 1;

    // Updating leave amounts for eligible employees
    for (const emp of eligibleEmployee) {
      // Finding leave amount for the previous year
      const previousYearLeave = await prisma.amountOfLeave.findFirst({
        where: {
          employeeNik: emp.nik,
          year: previousYear,
        },
      });

      // Finding leave amount for the current year
      const currentYearLeave = await prisma.amountOfLeave.findFirst({
        where: {
          employeeNik: emp.nik,
          year: currentYear,
        },
      });

      // Calculating remaining leave for the previous year and updating if necessary
      if (previousYearLeave) {
        let remainingPreviousYearLeave = previousYearLeave.amount - numberOfLeaveDays;

        // Initialize variable for current year deduction
        let currentYearDeduct = 0;

        // Adjusting current year's leave amount if previous year's leave is insufficient
        if (remainingPreviousYearLeave < 0 && currentYearLeave) {
          // Calculate current year deduction
          currentYearDeduct = Math.abs(remainingPreviousYearLeave); // Menggunakan nilai absolut dari sisa potongan untuk tahun sebelumnya
          let remainingCurrentYearLeave = currentYearLeave.amount + remainingPreviousYearLeave;
          remainingPreviousYearLeave = 0;

          // Update current year's leave amount
          await prisma.amountOfLeave.update({
            where: {
              id: currentYearLeave.id,
            },
            data: {
              amount: remainingCurrentYearLeave,
            },
          });
        }

        // Update previous year's leave amount
        await prisma.amountOfLeave.update({
          where: {
            id: previousYearLeave.id,
          },
          data: {
            amount: Math.max(0, remainingPreviousYearLeave),
          },
        });

        // Create deductedLeave entry with deductions from both years
        await prisma.deductedLeave.create({
          data: {
            leaveId: leaveId,
            employeeNik: emp.nik,
            previousYearDeduct: Math.max(0, Math.min(previousYearLeave.amount, numberOfLeaveDays)), // Potongan dari tahun sebelumnya
            currentYearDeduct: Math.max(0, currentYearDeduct), // Potongan dari tahun sekarang
          },
        });
      } else {
        // Updating current year's leave amount if no previous year leave entry exists
        if (currentYearLeave) {
          const remainingCurrentYearLeave = currentYearLeave.amount - numberOfLeaveDays;
          await prisma.amountOfLeave.update({
            where: {
              id: currentYearLeave.id,
            },
            data: {
              amount: remainingCurrentYearLeave,
            },
          });

          // Saving deducted leave data to DeductedLeave table
          await prisma.deductedLeave.create({
            data: {
              leaveId: leaveId,
              employeeNik: emp.nik,
              currentYearDeduct: Math.max(0, Math.min(currentYearLeave.amount, numberOfLeaveDays)),
            },
          });
        }
      }
    }

    return successResponse(res, 'Data successfully saved', leaveData);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', null, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function rejectOptionalLeave(req, res) {
  try {
    // Extract necessary data from the request parameters and user information
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user.id;

    // // Retrieve the employeeNik of the requesting user
    // const employeeNik = await prisma.user
    //   .findUnique({
    //     where: { id: userId },
    //     select: { employee: { select: { nik: true } } },
    //   })
    //   .then((user) => user.employee?.nik);

    // Check if the user is authorized to reject the leave
    const isAuthorized = await prisma.leaveEmployee.findUnique({
      where: { id: parseInt(id) },
      select: { employeeNik: true, leaveId: true },
    });

    // if (!isAuthorized || isAuthorized.employeeNik !== employeeNik) {
    //   return errorResponse(res, 'Forbidden', null, 403);
    // }

    const deductedInfo = await prisma.deductedLeave.findFirst({
      where: { leaveId: isAuthorized.leaveId, employeeNik: isAuthorized.employeeNik },
      select: {
        id: true,
        previousYearDeduct: true,
        currentYearDeduct: true,
      },
    });

    // Check if the leave status is already 'REJECT'
    const rejectStatus = await prisma.leaveEmployee.findUnique({
      where: { id: parseInt(id) },
      select: { status: true },
    });

    if (rejectStatus.status === 'REJECT') {
      return errorResponse(res, 'Leave status is already REJECT', null, 409);
    }

    // Update the leave status to 'REJECT'
    const updatedLeave = await prisma.leaveEmployee.update({
      where: { id: parseInt(id) },
      data: {
        status: 'REJECT',
        note: note,
      },
    });

    let today = new Date();
    let currentYear = today.getFullYear();
    let previousYear = currentYear - 1;

    const amountOfLeave = await prisma.amountOfLeave.findMany({
      where: { employeeNik: isAuthorized.employeeNik },
      select: {
        id: true,
        year: true,
      },
    });

    for (const entry of amountOfLeave) {
      if (
        entry.year === previousYear &&
        deductedInfo.previousYearDeduct !== null &&
        deductedInfo.previousYearDeduct !== 0
      ) {
        await prisma.amountOfLeave.update({
          where: { id: entry.id },
          data: { amount: { increment: deductedInfo.previousYearDeduct } },
        });
      }
      if (
        entry.year === currentYear &&
        deductedInfo.currentYearDeduct !== null &&
        deductedInfo.currentYearDeduct !== 0
      ) {
        await prisma.amountOfLeave.update({
          where: { id: entry.id },
          data: { amount: { increment: deductedInfo.currentYearDeduct } },
        });
      }
    }

    if (deductedInfo) {
      await prisma.deductedLeave.delete({
        where: {
          id: deductedInfo.id,
        },
      });
    }
    return successResponse(res, 'Leave status updated to REJECT', updatedLeave);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', null);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function createPersonalLeave(req, res) {
  try {
    // Extract necessary data from the request body and parameters
    const { reason, startLeave, endLeave } = req.body;
    const { nik } = req.params;

    // Validate that end date is greater than start date
    if (new Date(endLeave) < new Date(startLeave)) {
      return errorResponse(res, 'End date should be greater than start date', null, 400);
    }
    const leaveAmount = calculateLeaveAmount(startLeave, endLeave);
    let today = new Date();
    let currentYear = today.getFullYear();
    let previousYear = currentYear - 1;

    const amountOfLeave = await prisma.amountOfLeave.findMany({
      where: { employeeNik: nik },
      select: {
        id: true,
        year: true,
        amount: true,
      },
    });

    const previousYearLeaveEntry = amountOfLeave.find((entry) => entry.year === previousYear);
    const currentYearLeaveEntry = amountOfLeave.find((entry) => entry.year === currentYear);

    const yourAvailableLeave = sum(previousYearLeaveEntry.amount, currentYearLeaveEntry.amount);

    // Check if leave amount exceeds the available amount of leave
    if (leaveAmount > yourAvailableLeave) {
      return errorResponse(res, 'Not enough leave balance', null, 400);
    }

    if (leaveAmount > 8) {
      return errorResponse(res, 'Leave can only be taken for a maximum of 8 days', null, 400);
    }

    // Create a new personal leave entry in the database
    const leaveData = await prisma.leave.create({
      data: {
        typeOfLeaveId: 3,
        reason,
        startLeave,
        endLeave,
      },
    });

    // Retrieve the generated leaveId
    const leaveId = leaveData.id;

    // Create a leaveEmployee entry linking the leave to the specified employee (identified by nik)
    await prisma.leaveEmployee.create({
      data: {
        leaveId: leaveId,
        employeeNik: nik,
      },
    });

    if (previousYearLeaveEntry) {
      let remainingPreviousYearLeave = previousYearLeaveEntry.amount - leaveAmount;
      let currentYearDeduct = 0;

      if (remainingPreviousYearLeave < 0 && currentYearLeaveEntry) {
        currentYearDeduct = Math.abs(remainingPreviousYearLeave);
        remainingPreviousYearLeave = 0;
      }

      await prisma.deductedLeave.create({
        data: {
          leaveId: leaveId,
          employeeNik: nik,
          previousYearDeduct: Math.max(0, Math.min(previousYearLeaveEntry.amount, leaveAmount)),
          currentYearDeduct: Math.max(0, currentYearDeduct),
        },
      });
    } else {
      if (currentYearLeaveEntry) {
        await prisma.deductedLeave.create({
          data: {
            leaveId: leaveId,
            employeeNik: nik,
            currentYearDeduct: Math.max(0, Math.min(currentYearLeaveEntry.amount, leaveAmount)),
          },
        });
      }
    }

    return successResponse(res, 'Data succcessfully created', leaveData);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', null);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function approvePersonalLeave(req, res) {
  try {
    // Extract the leaveEmployee ID from the request parameters
    const { id } = req.params;

    // Retrieve relevant information about the leaveEmployee and associated leave
    const leaveEmployeeInfo = await prisma.leaveEmployee.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        status: true,
        employeeNik: true,
        leave: {
          select: {
            id: true,
            typeOfLeaveId: true,
            startLeave: true,
            endLeave: true,
          },
        },
      },
    });

    // Validate the typeOfLeaveId for personal leave
    if (leaveEmployeeInfo.leave.typeOfLeaveId !== 3) {
      return errorResponse(res, 'Invalid typeOfLeaveId for personal leave', null, 400);
    }

    // Check if the leave status is already APPROVE
    if (leaveEmployeeInfo.status === 'APPROVE') {
      return errorResponse(res, 'Leave status is already APPROVE', null, 409);
    }

    // Update the leaveEmployee status to APPROVE
    const updateStatus = await prisma.leaveEmployee.update({
      where: { id: parseInt(id) },
      data: {
        status: 'APPROVE',
        note: null,
      },
    });

    const deductedInfo = await prisma.deductedLeave.findFirst({
      where: {
        leaveId: leaveEmployeeInfo.leave.id,
        employeeNik: leaveEmployeeInfo.employeeNik,
      },
      select: {
        previousYearDeduct: true,
        currentYearDeduct: true,
      },
    });

    await updateLeaveAmount(leaveEmployeeInfo.employeeNik, deductedInfo, 'decrement');

    return successResponse(res, 'Leave status updated to APPROVE', updateStatus);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', null);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function rejectPersonalLeave(req, res) {
  try {
    // Extract the leaveEmployee ID from the request parameters
    const { note } = req.body;
    const { id } = req.params;

    // Retrieve relevant information about the leaveEmployee and associated leave
    const leaveEmployeeInfo = await prisma.leaveEmployee.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        status: true,
        employeeNik: true,
        leave: {
          select: {
            id: true,
            typeOfLeaveId: true,
            startLeave: true,
            endLeave: true,
          },
        },
      },
    });

    // Validate the typeOfLeaveId for personal leave
    if (leaveEmployeeInfo.leave.typeOfLeaveId !== 3) {
      return errorResponse(res, 'Invalid typeOfLeaveId for personal leave', null, 400);
    }

    // Check if the leave status is already REJECTED
    if (leaveEmployeeInfo.status === 'REJECT') {
      return errorResponse(res, 'Leave status is already REJECTED', null, 409);
    }

    // Update the leaveEmployee status to REJECT
    const updateStatus = await prisma.leaveEmployee.update({
      where: { id: parseInt(id) },
      data: {
        status: 'REJECT',
        note: note,
      },
    });

    const deductedInfo = await prisma.deductedLeave.findFirst({
      where: {
        leaveId: leaveEmployeeInfo.leave.id,
        employeeNik: leaveEmployeeInfo.employeeNik,
      },
      select: {
        previousYearDeduct: true,
        currentYearDeduct: true,
      },
    });

    if (leaveEmployeeInfo.status === 'APPROVE') {
      await updateLeaveAmount(leaveEmployeeInfo.employeeNik, deductedInfo, 'increment');
    }

    return successResponse(res, 'Leave status updated to REJECT', updateStatus);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', null);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function allLeaves(req, res) {
  try {
    // Extract query parameters from the request
    const { page, perPage, search, status, typeOfLeave } = req.query;

    // Perform pagination using the paginate utility function
    const pagination = await paginate(prisma.leaveEmployee, { page, perPage });

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
          leave: {
            reason: {
              contains: search,
              mode: 'insensitive',
            },
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

    if (typeOfLeave) {
      filter.leave = {
        typeOfLeave: {
          name: {
            contains: typeOfLeave,
            mode: 'insensitive',
          },
        },
      };
    }

    // Retrieve leave history based on the applied filters
    const leaveHistory = await prisma.leaveEmployee.findMany({
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
        leave: {
          select: {
            id: true,
            typeOfLeave: {
              select: {
                name: true,
              },
            },
            reason: true,
            startLeave: true,
            endLeave: true,
          },
        },
      },
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    });

    // Count total leaves for the specified status
    const totalLeaves = await prisma.leaveEmployee.count({
      where: filter,
    });

    // Format the result to include leaveEmployeeId and leaveUse
    const allLeave = leaveHistory.map((item) => ({
      ...item.employee,
      ...item.leave,
      status: item.status,
      leaveEmployeeId: item.id,
      leaveUse: calculateLeaveAmount(item.leave.startLeave, item.leave.endLeave),
      note: item.note,
    }));

    return successResponseWithPage(res, 'Successfully get all leave history', allLeave, 200, {
      ...pagination.meta,
      total: totalLeaves, // Total leaves based on the applied filters
      lastPage: Math.ceil(totalLeaves / perPage), // Calculate lastPage based on total and perPage
    });
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Failed to get leave history', null, 500);
  }
}

module.exports = {
  getLeaveHistoryNik,
  getLeaveHistoryMe,
  mandatoryLeave,
  optionalLeave,
  collectiveLeave,
  rejectOptionalLeave,
  createPersonalLeave,
  approvePersonalLeave,
  rejectPersonalLeave,
  allLeaves,
};
