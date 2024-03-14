const { prisma } = require('./config');

const permissionGroups = [
  // 1
  {
    name: 'Home',
    created_at: new Date(),
  },
  // 2
  {
    name: 'Dashboard',
    created_at: new Date(),
  },
  // 3
  {
    name: 'List Of Leave',
    created_at: new Date(),
  },
  // 4
  {
    name: 'Email Organizer',
    created_at: new Date(),
  },
  // 5
  {
    name: 'List Of Position',
    created_at: new Date(),
  },
  // 6
  {
    name: 'Special Leave List',
    created_at: new Date(),
  },
];

async function permissionGroupSeed() {
  for (let permissionGroup of permissionGroups) {
    await prisma.permissionGroup.create({
      data: permissionGroup,
    });
  }
}

module.exports = { permissionGroupSeed };
