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

  {
    roleId: 1,
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

  // 13
  {
    roleId: 2,
    permissionId: 15,
  },
  // 13
  {
    roleId: 1,
    permissionId: 15,
  },
  // 14
  {
    roleId: 2,
    permissionId: 16,
  },
  //14
  {
    roleId: 1,
    permissionId: 16,
  },
  {
    // 17
    roleId: 2,
    permissionId: 17,
  },
  {
    // 17
    roleId: 3,
    permissionId: 17,
  },
  {
    // 18
    roleId: 2,
    permissionId: 18,
  },
  {
    // 18
    roleId: 3,
    permissionId: 18,
  },
  {
    // 19
    roleId: 2,
    permissionId: 19,
  },
  {
    // 19
    roleId: 3,
    permissionId: 19,
  },
  {
    // 20
    roleId: 2,
    permissionId: 20,
  },
  {
    // 20
    roleId: 3,
    permissionId: 20,
  },
  {
    // 22
    roleId: 2,
    permissionId: 22,
  },
  {
    // 22
    roleId: 3,
    permissionId: 22,
  },
  {
    // home
    roleId: 2,
    permissionId: 9,
  },
  {
    // posisition
    roleId: 2,
    permissionId: 10,
  },
  {
    // 23
    roleId: 2,
    permissionId: 23,
  },
  {
    // 24
    roleId: 2,
    permissionId: 24,
  },
  {
    // 25
    roleId: 2,
    permissionId: 25,
  },
  {
    // 26
    roleId: 2,
    permissionId: 26,
  },
  {
    // 27
    roleId: 2,
    permissionId: 27,
  },
  {
    // 28
    roleId: 2,
    permissionId: 28,
  },
  {
    // 29
    roleId: 2,
    permissionId: 29,
  },
  {
    // 30
    roleId: 2,
    permissionId: 30,
  },
  {
    // 31
    roleId: 2,
    permissionId: 31,
  },
  {
    // 32
    roleId: 2,
    permissionId: 32,
  },
  {
    // 33
    roleId: 2,
    permissionId: 33,
  },
  {
    // 34
    roleId: 2,
    permissionId: 34,
  },
  {
    // 35
    roleId: 2,
    permissionId: 6,
  },
  {
    // 36
    roleId: 2,
    permissionId: 7,
  },
  {
    // 37
    roleId: 2,
    permissionId: 8,
  },
  {
    // 38
    roleId: 2,
    permissionId: 11,
  },
  {
    // 39
    roleId: 2,
    permissionId: 12,
  },
  {
    // 40
    roleId: 2,
    permissionId: 13,
  },
  {
    // 40
    roleId: 2,
    permissionId: 21,
  },
  {
    // 41
    roleId: 1,
    permissionId: 10,
  },
  {
    // 42
    roleId: 1,
    permissionId: 7,
  },
  {
    // 43
    roleId: 1,
    permissionId: 11,
  },
  {
    // 44
    roleId: 1,
    permissionId: 12,
  },
  {
    // 45
    roleId: 1,
    permissionId: 13,
  },
  {
    // 46
    roleId: 3,
    permissionId: 9,
  },
  {
    // 47
    roleId: 3,
    permissionId: 10,
  },
  {
    // 48
    roleId: 3,
    permissionId: 7,
  },
  {
    // 49
    roleId: 2,
    permissionId: 35,
  },
  {
    // 49
    roleId: 1,
    permissionId: 35,
  },
  {
    // 36
    roleId: 2,
    permissionId: 36,
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
