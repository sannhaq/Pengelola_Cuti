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

module.exports = {
  getSpecialLeaveList,
  getSpecialLeaveById,
  updateSpecialLeave,
  createSpecialLeave,
};
