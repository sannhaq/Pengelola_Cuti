const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const {
  errorResponse,
  successResponse,
  paginate,
  successResponseWithPage,
} = require('../utils/helper.util');

/**
 * Get Positions with Employee Count
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with positions and employee count
 */
async function getPositions(req, res) {
  try {
    const { page, perPage, search } = req.query;

    const pagination = await paginate(prisma.positions, { page, perPage });

    const filter = {};
    if (search) {
      filter.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const positions = await prisma.positions.findMany({
      where: filter,
      orderBy: {
        updated_at: 'desc',
      },
      select: {
        id: true,
        name: true,
      },
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    });

    // Add employee count to each position using Promise.all
    const positionsWithEmployeeCount = await Promise.all(
      positions.map(async (position, index) => {
        // Count the number of employees for each position
        const employeeCount = await prisma.employee.count({
          where: {
            positionId: position.id,
          },
        });
        // Combine position data with employee count
        return {
          no: (pagination.meta.currPage - 1) * pagination.meta.perPage + index + 1,
          ...position,
          employeeCount,
        };
      }),
    );

    const totalPage = await prisma.positions.count({
      where: filter,
    });

    return successResponseWithPage(
      res,
      'Successfully retrieved positions',
      positionsWithEmployeeCount,
      200,
      { ...pagination.meta, total: totalPage, perPage: Math.ceil(totalPage / perPage) },
    );
  } catch (error) {
    // Handle error and return error response
    console.error('Error getting positions:', error);
    return errorResponse(
      res,
      'Failed to get positions',
      error.message || 'Internal server error',
      500,
    );
  }
}

/**
 * Get Position by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with the retrieved position
 */
async function getPositionById(req, res) {
  // Extract position ID from request parameters
  const positionId = parseInt(req.params.id, 10);

  try {
    // Find the position by its unique ID
    const position = await prisma.positions.findUnique({
      where: {
        id: positionId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Check if the position is not found
    if (!position) {
      return errorResponse(res, 'Position not found', '', 404);
    }

    // Return success response with the retrieved position
    return successResponse(res, 'Position retrieved successfully', position, 200);
  } catch (error) {
    // Handle error and return error response
    console.error('Failed to get position:', error);
    return errorResponse(
      res,
      'Failed to get position',
      error.message || 'Internal server error',
      500,
    );
  }
}

/**
 * Create a new Position
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with the newly created position
 */
async function createPosition(req, res) {
  // Extract position name from request body
  const { name } = req.body;

  try {
    // Create a new position in the database
    const newPosition = await prisma.positions.create({
      data: {
        name,
      },
    });

    // Return success response with the newly created position
    return successResponse(res, 'Position created successfully', newPosition, 201);
  } catch (error) {
    // Handle error and return error response
    console.error('Failed to create position:', error);
    return errorResponse(
      res,
      'Failed to create position',
      error.message || 'Internal server error',
      500,
    );
  }
}

/**
 * Update an existing Position by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with the updated position
 */
async function updatePosition(req, res) {
  // Extract position ID and updated name from request parameters and body
  const positionId = parseInt(req.params.id, 10);
  const { name } = req.body;

  try {
    // Update the position in the database
    const updatedPosition = await prisma.positions.update({
      where: {
        id: positionId,
      },
      data: {
        name,
      },
    });

    // Return success response with the updated position
    return successResponse(res, 'Position updated successfully', updatedPosition, 200);
  } catch (error) {
    // Handle error and return error response
    console.error('Failed to update position:', error);
    return errorResponse(
      res,
      'Failed to update position',
      error.message || 'Internal server error',
      500,
    );
  }
}

/**
 * Delete a Position by ID, if no employees are using it
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response indicating success or failure
 */
async function deletePosition(req, res) {
  // Extract position ID from request parameters
  const positionId = parseInt(req.params.id, 10);

  try {
    // Check if there are employees using the position
    const employeesUsingPosition = await prisma.employee.findMany({
      where: {
        positionId,
      },
    });

    // If there are employees using the position, prevent deletion and return an error response
    if (employeesUsingPosition.length > 0) {
      return errorResponse(
        res,
        'Position cannot be deleted as it is still in use by employees',
        '',
        400,
      );
    }

    // If no employees are using the position, proceed with deleting the position
    await prisma.positions.delete({
      where: {
        id: positionId,
      },
    });

    // Return success response with an empty object
    return successResponse(res, 'Position deleted successfully', {}, 200);
  } catch (error) {
    // Handle error and return error response
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
