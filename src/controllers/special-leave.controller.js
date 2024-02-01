const { prisma } = require('../configs/prisma.config');
const { successResponseWithPage, errorResponse, paginate } = require('../utils/helper.util');

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

module.exports = {
  getSpecialLeaveList,
};
