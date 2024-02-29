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
];

async function permissionGroupSeed() {
  for (let permissionGroup of permissionGroups) {
    await prisma.permissionGroup.create({
      data: permissionGroup,
    });
  }
}

module.exports = { permissionGroupSeed };
