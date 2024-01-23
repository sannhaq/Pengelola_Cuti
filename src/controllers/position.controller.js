const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const {
    errorResponse,
    successResponse,
  } = require('../utils/helper.util');

async function getPositions(req, res) {
    try {
        const positions = await prisma.positions.findMany({
        select: {
            id: true,
            name: true,
        },
        });

        return successResponse(res, 'Successfully retrieved positions', positions, 200);
    } catch (error) {
        console.error('Error getting positions:', error);
        return errorResponse(res, 'Failed to get positions', error.message || 'Internal server error', 500);
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
      return errorResponse(res, 'Failed to get position', error.message || 'Internal server error', 500);
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
        return errorResponse(res, 'Failed to create position', error.message || 'Internal server error', 500);
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
      return errorResponse(res, 'Failed to update position', error.message || 'Internal server error', 500);
    }
  }

module.exports = {
    getPositions,
    getPositionById,
    createPosition,
    updatePosition,
};