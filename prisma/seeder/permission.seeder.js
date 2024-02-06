const { prisma } = require('./config');

const permissions = [
  // 1
  {
    name: 'Get Employee',
    created_at: new Date(),
  },

  // 2
  {
    name: 'Get Detail Employee',
    created_at: new Date(),
  },

  // 3
  {
    name: 'Disable Employee',
    created_at: new Date(),
  },

  // 4
  {
    name: 'Enable Employee',
    created_at: new Date(),
  },

  // 5
  {
    name: 'Change Password',
    created_at: new Date(),
  },

  // 6
  {
    name: 'Reset Password',
    created_at: new Date(),
  },

  // 7
  {
    name: 'Update Employee',
    created_at: new Date(),
  },

  // 8
  {
    name: 'Add Employee',
    created_at: new Date(),
  },

  // 9
  {
    name: 'Home',
    created_at: new Date(),
  },

  // 10
  {
    name: 'Positions',
    created_at: new Date(),
  },

  // 11
  {
    name: 'Add Positions',
    created_at: new Date(),
  },

  // 12
  {
    name: 'Update Positions',
    created_at: new Date(),
  },

  // 13
  {
    name: 'Delete Positions',
    created_at: new Date(),
  },

  // 14
  {
    name: 'Update Role',
    created_at: new Date(),
  },

  // 15
  {
    name: 'Create Role',
    created_at: new Date(),
  },

  // 16
  {
    name: 'Delete Role',
    created_at: new Date(),
  },
  {
    //6
    name: 'View Mandatory Leave',
    created_at: new Date(),
  },
  {
    //7
    name: 'Get Leave History for Current User',
    created_at: new Date(),
  },
];

async function permissionSeed() {
  for (let permission of permissions) {
    await prisma.permission.create({
      data: permission,
    });
  }
}

module.exports = { permissionSeed };
