const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const { errorResponse, successResponse } = require('../utils/helper.util');

/**
 * Update Role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with the updated role
 */
async function updateRole(req, res) {
  // Extract role ID from request parameters
  const roleId = parseInt(req.params.id, 10);
  const { permissions, name } = req.body;

  try {
    // Find the role by its unique ID
    const role = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
      include: {
        rolePermissions: true, // Include associated rolePermissions
      },
    });

    // Check if the role is not found
    if (!role) {
      return errorResponse(res, 'Role not found', '', 404);
    }

    // Update role name if provided
    if (name) {
      await prisma.role.update({
        where: {
          id: roleId,
        },
        data: {
          name,
        },
      });
    }

    // Update permissions for the role
    if (permissions) {
      // Delete existing rolePermissions
      await prisma.rolePermission.deleteMany({
        where: {
          roleId,
        },
      });

      // Create new rolePermissions
      const newRolePermissions = permissions.map((permissionId) => ({
        roleId,
        permissionId,
      }));

      await prisma.rolePermission.createMany({
        data: newRolePermissions,
      });
    }

    // Return success response with the updated role
    return successResponse(res, 'Role updated successfully', role, 200);
  } catch (error) {
    // Handle error and return error response
    console.error('Failed to update role:', error);
    return errorResponse(
      res,
      'Failed to update role',
      error.message || 'Internal server error',
      500,
    );
  }
}

module.exports = {
  updateRole,
};
