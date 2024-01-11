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

module.exports = {
  getLeaveHistoryNik,
};
