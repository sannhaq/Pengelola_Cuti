const { prisma } = require('./config');

const rolePermissions = [
  // 1
  {
    roleId: 1,
    permissionId: 1,
  },

  // 2
  {
    roleId: 1,
    permissionId: 2,
  },

  // 3
  {
    roleId: 1,
    permissionId: 3,
  },

  // 4
  {
    roleId: 1,
    permissionId: 5,
  },

  // 5
  {
    roleId: 2,
    permissionId: 1,
  },

  // 6
  {
    roleId: 2,
    permissionId: 2,
  },

  // 7
  {
    roleId: 2,
    permissionId: 3,
  },

  // 8
  {
    roleId: 2,
    permissionId: 4,
  },

  // 9
  {
    roleId: 2,
    permissionId: 5,
  },

  // 10
  {
    roleId: 2,
    permissionId: 14,
  },

  // 11
  {
    roleId: 3,
    permissionId: 2,
  },

  // 12
  {
    roleId: 3,
    permissionId: 5,
  },
  {
    //6
    roleId: 2,
    permissionId: 6,
  },
  {
    //6
    roleId: 3,
    permissionId: 6,
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
