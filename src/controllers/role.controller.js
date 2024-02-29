const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const {
  errorResponse,
  successResponse,
  successResponseWithPage,
  paginate,
} = require('../utils/helper.util');

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
    if (!permissions || permissions.length === 0) {
      return errorResponse(res, 'Permissions are required', 'Permissions must be provided', 400);
    }
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

/**
 * Get All Roles with Permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with all roles and their permissions
 */
async function getAllRolesWithPermissions(req, res) {
  try {
    // Extract query parameters from the request
    const { page, perPage, search } = req.query;

    // Perform pagination using the paginate utility function
    const pagination = await paginate(prisma.role, { page, perPage });

    const filter = {};
    if (search) {
      filter.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Get all roles with their associated permissions and count of rolePermissions
    const rolesWithPermissions = await prisma.role.findMany({
      where: filter,
      orderBy: {
        updated_at: 'desc',
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        users: true,
      },
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    });

    // Map through rolesWithPermissions and calculate count of rolePermissions for each role
    const rolesWithDetails = rolesWithPermissions.map((role, index) => ({
      no: (pagination.meta.currPage - 1) * pagination.meta.perPage + index + 1,
      id: role.id,
      name: role.name,
      created_at: role.created_at,
      updated_at: role.updated_at,
      rolePermissionCount: role.rolePermissions.length,
      userCount: role.users.length,
    }));

    const totalPage = await prisma.role.count({
      where: filter,
    });

    // Return success response with roles and their rolePermission counts
    return successResponseWithPage(
      res,
      'All roles with rolePermission count retrieved successfully',
      rolesWithDetails,
      200,
      {
        ...pagination.meta,
        total: totalPage,
        lastPage: Math.ceil(totalPage / perPage),
      },
    );
  } catch (error) {
    // Handle error and return error response
    console.error('Failed to get all roles with permissions:', error);
    return errorResponse(
      res,
      'Failed to get all roles with permissions',
      error.message || 'Internal server error',
      500,
    );
  }
}

async function createRoleWithPermissions(req, res) {
  // Extract data from request body
  const { name, permissions } = req.body;

  try {
    if (!permissions || permissions.length === 0) {
      return errorResponse(res, 'Permissions are required', 'Permissions must be provided', 400);
    }
    // Create a new role in the database
    const newRole = await prisma.role.create({
      data: {
        name,
        rolePermissions: {
          create: permissions.map((permissionId) => ({
            permission: {
              connect: { id: permissionId },
            },
          })),
        },
      },
      include: {
        rolePermissions: true,
      },
    });

    // Return success response with the newly created role
    return successResponse(res, 'Role created successfully', newRole, 201);
  } catch (error) {
    // Handle error and return error response
    console.error('Failed to create role:', error);
    return errorResponse(
      res,
      'Failed to create role',
      error.message || 'Internal server error',
      500,
    );
  }
}

/**
 * Delete Role by ID, if no users are using it
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response indicating success or failure
 */
async function deleteRole(req, res) {
  // Extract role ID from request parameters
  const roleId = parseInt(req.params.id, 10);

  try {
    // Check if there are users using the role
    const usersUsingRole = await prisma.user.findMany({
      where: {
        roleId,
      },
    });

    // If there are users using the role, prevent deletion and return an error response
    if (usersUsingRole.length > 0) {
      return errorResponse(
        res,
        'Role cannot be deleted as it is still in use by employees',
        '',
        400,
      );
    }

    // Delete role permissions associated with the role
    await prisma.rolePermission.deleteMany({
      where: {
        roleId,
      },
    });

    // Delete the role itself
    await prisma.role.delete({
      where: {
        id: roleId,
      },
    });

    // Return success response with an empty object
    return successResponse(res, 'Role deleted successfully', {}, 200);
  } catch (error) {
    // Handle error and return error response
    console.error('Failed to delete role:', error);
    return errorResponse(
      res,
      'Failed to delete role',
      error.message || 'Internal server error',
      500,
    );
  }
}

async function getRoleById(req, res) {
  // Extract role ID from request parameters
  const roleId = parseInt(req.params.id, 10);

  try {
    // Find the role by its unique ID with its associated role permissions
    const role = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
      include: {
        rolePermissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        users: {
          select: {
            employee: {
              select: {
                nik: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // If the role is not found, return an error response
    if (!role) {
      return errorResponse(res, 'Role not found', '', 404);
    }

    // Return success response with the role details and its permissions
    return successResponse(
      res,
      'Role details with permissions and employee names retrieved successfully',
      role,
      200,
    );
  } catch (error) {
    // Handle error and return error response
    console.error('Failed to get role details:', error);
    return errorResponse(
      res,
      'Failed to get role details',
      error.message || 'Internal server error',
      500,
    );
  }
}

async function getPermissions(req, res) {
  try {
    const { page, perPage } = req.query;

    // Perform pagination
    const pagination = await paginate(prisma.permission, { page, perPage });

    // Retrieve permissions based on pagination settings
    const permissions = await prisma.permission.findMany({
      select: {
        id: true,
        name: true,
      },
      skip: (pagination.meta.currPage - 1) * pagination.meta.perPage,
      take: pagination.meta.perPage,
    });

    // Send success response with pagination metadata
    return successResponseWithPage(
      res,
      'Successfully retrieved permissions',
      permissions,
      200,
      pagination.meta,
    );
  } catch {
    return errorResponse(res, 'Failed to retrieve permissions', null, 500);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function selectRole(req, res) {
  try {
    // Retrieve roles excluding 'Super Admin'
    const roles = await prisma.role.findMany({
      where: { name: { not: 'Super Admin' } },
      select: {
        id: true,
        name: true,
      },
    });

    // Send success response with roles
    return successResponse(res, 'Successfully get roles', roles);
  } catch (e) {
    console.log(e);
    return errorResponse(res, 'Failed to select roles', null, 500);
  }
}

async function getGroupPermissionById(req, res) {
  const permissionGroupId = parseInt(req.params.id, 10);
  try {
    const permissionGroup = await prisma.permissionGroup.findUnique({
      where: {
        id: permissionGroupId,
      },
      include: {
        permissionToGroup: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!permissionGroup) {
      return errorResponse(res, 'Permission group not found', '', 404);
    }

    // Mengambil data grup izin beserta izin-izin yang terkait
    const data = {
      id: permissionGroup.id,
      name: permissionGroup.name,
      permissions: permissionGroup.permissionToGroup.map((permissionGroup) => ({
        id: permissionGroup.permission.id,
        name: permissionGroup.permission.name,
      })),
    };

    return successResponse(res, 'Successfully retrieved permission group', data, 200);
  } catch (error) {
    console.error('Failed to get permission group:', error);
    return errorResponse(
      res,
      'Failed to get permission group',
      error.message || 'Internal server error',
      500,
    );
  }
}

async function getGroupPermissionName(req, res) {
  try {
    const permissionGroups = await prisma.permissionGroup.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return successResponse(res, 'Successfully retrieved permission groups', permissionGroups);
  } catch (error) {
    console.error('Failed to get permission groups:', error);
    return errorResponse(
      res,
      'Failed to get permission groups',
      error.message || 'Internal server error',
      500,
    );
  }
}

module.exports = {
  updateRole,
  getAllRolesWithPermissions,
  createRoleWithPermissions,
  deleteRole,
  getRoleById,
  getPermissions,
  selectRole,
  getGroupPermissionById,
  getGroupPermissionName,
};
