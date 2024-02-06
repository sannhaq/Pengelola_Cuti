const { prisma } = require('./config');

const permissions = [
  {
    name: 'Get Employee',
    created_at: new Date(),
  },
  {
    name: 'Get Detail Employee',
    created_at: new Date(),
  },
  {
    name: 'Disable Employee',
    created_at: new Date(),
  },
  {
    name: 'Enable Employee',
    created_at: new Date(),
  },
  {
    name: 'Change Password',
    created_at: new Date(),
  },
  {
    name: 'Reset Password',
    created_at: new Date(),
  },
  {
    name: 'Update Employee',
    created_at: new Date(),
  },
  {
    name: 'Add Employee',
    created_at: new Date(),
  },
  {
    name: 'Home',
    created_at: new Date(),
  },
  {
    name: 'Positions',
    created_at: new Date(),
  },
  {
    name: 'Add Positions',
    created_at: new Date(),
  },
  {
    name: 'Update Positions',
    created_at: new Date(),
  },
  {
    name: 'Delete Positions',
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
