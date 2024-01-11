const { PrismaClient } = require('@prisma/client');

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
        isWorking: true,
        typeOfEmployee: {
          select: {
            startContract: true,
            endContract: true,
            isContract: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
        historicalName: true,
        historicalNik: true,
        leaves: {
          select: {
            amountOfLeave: {
              select: {
                amount: true,
              },
            },
          },
        },
      },
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    });

    const formattedData = formatEmployeeData(employees);

    return successResponseWithPage(
      res,
      'Successfully retrieved employees',
      formattedData,
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

    // Menampilkan data berdasarkan NIK dengan informasi yang diinginkan
    const employee = await prisma.employee.findUnique({
      where: {
        nik,
      },
      select: {
        nik: true,
        name: true,
        leaves: {
          select: {
            amountOfLeave: {
              select: {
                amount: true,
              },
            },
          },
        },
      },
    });

    if (!employee) {
      return errorResponse(res, 'Employee not found', '', 404);
    }

    return successResponse(res, 'Successfully retrieved employee data', employee, 200);
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

    // Mengubah isWorking menjadi false
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

    // Mengubah isWorking menjadi true
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

module.exports = {
  getAll,
  getNIK,
  disableEmployee,
  enableEmployee,
};
