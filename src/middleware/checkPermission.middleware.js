const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const { errorResponse } = require('../utils/helper.util');

const checkPermission = (requiredPermission) => async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: { include: { rolePermission: { include: { permission: true } } } } },
    });

    const userPermissions = user.role.rolePermission.map((rp) => rp.permission.name);

    if (userPermissions.includes(requiredPermission)) {
      next();
    } else {
      return errorResponse(res, 'Permission denied', '', 403);
    }
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Internal server error', '', 500);
  }
};
module.exports = checkPermission;
