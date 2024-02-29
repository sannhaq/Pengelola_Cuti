const { prisma } = require('./config');

const permissionToGroups = [
  // Start Home (1)
  // 1
  {
    permissionGroupId: 1,
    permissionId: 9,
  },
  // 2
  {
    permissionGroupId: 1,
    permissionId: 18,
  },
  // 3
  {
    permissionGroupId: 1,
    permissionId: 22,
  },
  // 4
  {
    permissionGroupId: 1,
    permissionId: 17,
  },
  // 5
  {
    permissionGroupId: 1,
    permissionId: 19,
  },
  // 6
  {
    permissionGroupId: 1,
    permissionId: 20,
  },
  // 7
  {
    permissionGroupId: 1,
    permissionId: 41,
  },
  // 8
  {
    permissionGroupId: 1,
    permissionId: 42,
  },
  // 9
  {
    permissionGroupId: 1,
    permissionId: 40,
  },
  // 10
  {
    permissionGroupId: 1,
    permissionId: 2,
  },
  // 11
  {
    permissionGroupId: 1,
    permissionId: 5,
  },
  // End Home (1)

  // Start Dashboard (2)
  // 12
  //   {
  //     permissionGroupId: 2,
  //     permissionId: ,
  //   }
  // End Dashboard (2)
];

async function permissionToGroupSeed() {
  for (let permissionToGroup of permissionToGroups) {
    await prisma.permissionToGroup.create({
      data: permissionToGroup,
    });
  }
}

module.exports = { permissionToGroupSeed };
