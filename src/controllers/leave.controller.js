const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const {
  errorResponse,
  successResponse,
  calculateLeaveAmount,
  formatLeaveHistoryData,
} = require('../utils/helper.util');

async function getLeaveHistoryNik(req, res) {
  try {
    const { nik } = req.params;

    const leaveHistory = await prisma.leave.findMany({
      where: {
        employeeNik: nik,
      },
      select: {
        status: true,
        typeOfLeave: {
          select: {
            name: true,
          },
        },
        startLeave: true,
        endLeave: true,
        reason: true,
      },
    });

    // Menghitung amount of leave berdasarkan selisih antara startLeave dan endLeave
    const leaveHistoryWithAmount = leaveHistory.map((leave) => ({
      ...leave,
      amountOfLeave: calculateLeaveAmount(leave.startLeave, leave.endLeave),
    }));

    console.log('leaveHistoryWithAmount:', leaveHistoryWithAmount);

    const formattedData = formatLeaveHistoryData(leaveHistoryWithAmount);

    console.log('formattedData:', formattedData);

    return successResponse(res, 'Successfully retrieved leave history', formattedData, 200);
  } catch (error) {
    console.error('Error getting leave history:', error);
    return errorResponse(res, 'Failed to get leave history', '', 500);
  }
}

async function getLeaveHistoryMe(req, res) {
  try {
    const userId = req.user.id;
    const leave = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          select: {
            leaves: {
              select: {
                typeOfLeave: {
                  select: {
                    name: true,
                  },
                },
                startLeave: true,
                endLeave: true,
                reason: true,
                status: true,
              },
            },
          },
        },
      },
    });

    const sanitizedUser = {
      id: leave.id,
      employee: {
        leaves: leave.employee.leaves.map((item) => ({
          ...item,
          amountOfLeave: calculateLeaveAmount(item.startLeave, item.endLeave),
        })),
      },
    };

    return successResponse(res, 'Successfully retrieved leave history', sanitizedUser);
  } catch {
    return errorResponse(res, 'Internal server error', '', 500);
  }
}

async function mandatoryLeave(req, res) {
  try {
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
        },
      },
    });

    return successResponse(res, 'successfully retrieved mandatory leave', mandatory);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Internal server error', '', 500);
  }
}

module.exports = {
  getLeaveHistoryNik,
  getLeaveHistoryMe,
  mandatoryLeave,
};
