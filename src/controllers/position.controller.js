const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const {
  errorResponse,
  successResponse,
  paginate,
  successResponseWithPage,
} = require('../utils/helper.util');

async function getPositions(req, res) {
  try {
    const { page, perPage } = req.query;

    const pagination = await paginate(prisma.positions, { page, perPage });

    const positions = await prisma.positions.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    });

    // Menambahkan jumlah karyawan dari setiap posisi
    const positionsWithEmployeeCount = await Promise.all(
      positions.map(async (position) => {
        const employeeCount = await prisma.employee.count({
          where: {
            positionId: position.id,
          },
        });
        return {
          ...position,
          employeeCount,
        };
      }),
    );

    return successResponseWithPage(
      res,
      'Successfully retrieved positions',
      positionsWithEmployeeCount,
      200,
      pagination.meta,
    );
  } catch (error) {
    console.error('Error getting positions:', error);
    return errorResponse(
      res,
      'Failed to get positions',
      error.message || 'Internal server error',
      500,
    );
  }
}

async function getPositionById(req, res) {
  const positionId = parseInt(req.params.id, 10);

  try {
    const position = await prisma.positions.findUnique({
      where: {
        id: positionId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!position) {
      return errorResponse(res, 'Position not found', '', 404);
    }

    return successResponse(res, 'Position retrieved successfully', position, 200);
  } catch (error) {
    console.error('Failed to get position:', error);
    return errorResponse(
      res,
      'Failed to get position',
      error.message || 'Internal server error',
      500,
    );
  }
}

async function createPosition(req, res) {
  const { name } = req.body;

  try {
    const newPosition = await prisma.positions.create({
      data: {
        name,
      },
    });

    return successResponse(res, 'Position created successfully', newPosition, 201);
  } catch (error) {
    console.error('Failed to create position:', error);
    return errorResponse(
      res,
      'Failed to create position',
      error.message || 'Internal server error',
      500,
    );
  }
}

async function updatePosition(req, res) {
  const positionId = parseInt(req.params.id, 10);
  const { name } = req.body;

  try {
    const updatedPosition = await prisma.positions.update({
      where: {
        id: positionId,
      },
      data: {
        name,
      },
    });

    return successResponse(res, 'Position updated successfully', updatedPosition, 200);
  } catch (error) {
    console.error('Failed to update position:', error);
    return errorResponse(
      res,
      'Failed to update position',
      error.message || 'Internal server error',
      500,
    );
  }
}

async function deletePosition(req, res) {
  const positionId = parseInt(req.params.id, 10);

  try {
    // Check if there are employees using the position
    const employeesUsingPosition = await prisma.employee.findMany({
      where: {
        positionId,
      },
    });

    if (employeesUsingPosition.length > 0) {
      // Jika ada karyawan yang menggunakan posisi, kirim respons bahwa posisi tidak dapat dihapus
      return errorResponse(
        res,
        'Position cannot be deleted as it is still in use by employees',
        '',
        400,
      );
    }

    // Jika tidak ada karyawan yang menggunakan posisi, lanjutkan dengan menghapus posisi
    await prisma.positions.delete({
      where: {
        id: positionId,
      },
    });

    return successResponse(res, 'Position deleted successfully', {}, 200);
  } catch (error) {
    console.error('Failed to delete position:', error);
    return errorResponse(
      res,
      'Failed to delete position',
      error.message || 'Internal server error',
      500,
    );
  }
}

module.exports = {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
};
