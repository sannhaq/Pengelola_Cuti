const { prisma } = require('./config');

const permissions = [
  {
    name: 'Dashboard',
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
    name: 'Positions',
    created_at: new Date(),
  },
  {
    name: 'Home',
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
