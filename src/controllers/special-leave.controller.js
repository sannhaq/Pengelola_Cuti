const { prisma } = require('../configs/prisma.config');
const {
  successResponseWithPage,
  errorResponse,
  paginate,
  successResponse,
} = require('../utils/helper.util');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getSpecialLeaveList(req, res) {
  try {
    const { page, perPage, search, gender } = req.query;

    const pagination = await paginate(prisma.specialLeave, { page, perPage });

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
    const specialLeaves = await prisma.specialLeave.findMany({
      where: filter,
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

    const totalPage = await prisma.specialLeave.count({
      where: filter,
    });

    return successResponseWithPage(res, 'Succescfully get special leave list', specialLeaves, 200, {
      ...pagination.meta,
      total: totalPage,
      lastPage: Math.ceil(totalPage / perPage),
    });
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
    const { id } = req.params;

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
    const { id } = req.params;
    const { leaveTitle, gender, amount, leaveInformation } = req.body;

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
    const { leaveTitle, gender, amount, leaveInformation } = req.body;

    const newSpecialLeave = await prisma.specialLeave.create({
      data: {
        leaveTitle,
        gender,
        amount,
        typeOfLeaveId: 4,
        leaveInformation,
      },
    });
    return successResponse(res, 'Successfully created special leave', newSpecialLeave, 200);
  } catch {
    return errorResponse(res, 'Failed to create special leave', null, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function specialLeaveUsers(req, res) {
  try {
    const { page, perPage, search, status } = req.query;

    const pagination = await paginate(prisma.employeeSpecialLeave, { page, perPage });

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

    const totalSpecialLeave = await prisma.employeeSpecialLeave.count({
      where: filter,
    });

    const allSpecialLeave = leaveHistory.map((item) => ({
      id: item.id,
      ...item.employee,
      ...item.specialLeave,
      status: item.status,
      note: item.note,
      startLeave: item.startLeave,
      endLeave: item.endLeave,
    }));

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
    const { nik } = req.params;

    const { page, perPage, status } = req.query;

    const pagination = await paginate(prisma.employeeSpecialLeave, { page, perPage });

    const filter = {};
    if (status) {
      if (typeof status === 'string') {
        filter.status = status.toUpperCase();
      } else {
        throw new Error('Invalid status parameter');
      }
    }

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

    if (!leaveHistory || leaveHistory.length === 0) {
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

    const totalSpecialLeave = await prisma.employeeSpecialLeave.count({
      where: { employeeNik: nik, ...filter },
    });

    const allSpecialLeave = leaveHistory.map((item) => ({
      id: item.id,
      ...item.employee,
      ...item.specialLeave,
      status: item.status,
      note: item.note,
      startLeave: item.startLeave,
      endLeave: item.endLeave,
    }));

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
module.exports = {
  getSpecialLeaveList,
  getSpecialLeaveById,
  updateSpecialLeave,
  createSpecialLeave,
  specialLeaveUsers,
  getSpecialLeaveByNik,
};
