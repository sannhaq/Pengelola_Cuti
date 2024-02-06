const { prisma } = require('./config');

const rolePermissions = [
  {
    roleId: 1,
    permissionId: 1,
  },
  {
    roleId: 1,
    permissionId: 2,
  },
  {
    roleId: 1,
    permissionId: 3,
  },
  {
    roleId: 1,
    permissionId: 5,
  },
  {
    roleId: 2,
    permissionId: 1,
  },
  {
    roleId: 2,
    permissionId: 2,
  },
  {
    roleId: 2,
    permissionId: 3,
  },
  {
    roleId: 2,
    permissionId: 4,
  },
  {
    roleId: 2,
    permissionId: 5,
  },
  {
    roleId: 3,
    permissionId: 2,
  },
  {
    roleId: 3,
    permissionId: 5,
  },
];

async function rolePermissionSeed() {
  for (let rolePermission of rolePermissions) {
    await prisma.rolePermission.create({
      data: rolePermission,
    });
  }
}

module.exports = { rolePermissionSeed };
