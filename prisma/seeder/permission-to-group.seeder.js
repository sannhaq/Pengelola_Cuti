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
  // End Home (1)

  // Start Dashboard (2)
  // 1
  {
    permissionGroupId: 2,
    permissionId: 1,
  },
  // 2
  {
    permissionGroupId: 2,
    permissionId: 21,
  },
  // 3
  {
    permissionGroupId: 2,
    permissionId: 24,
  },
  // 4
  {
    permissionGroupId: 2,
    permissionId: 42,
  },
  // 5
  {
    permissionGroupId: 2,
    permissionId: 25,
  },
  // 6
  {
    permissionGroupId: 2,
    permissionId: 8,
  },
  // 7
  {
    permissionGroupId: 2,
    permissionId: 33,
  },
  // 8
  {
    permissionGroupId: 2,
    permissionId: 2,
  },
  // 9
  {
    permissionGroupId: 2,
    permissionId: 4,
  },
  // 10
  {
    permissionGroupId: 2,
    permissionId: 3,
  },
  // 11
  {
    permissionGroupId: 2,
    permissionId: 23,
  },
  // 12
  {
    permissionGroupId: 2,
    permissionId: 32,
  },
  // 13
  {
    permissionGroupId: 2,
    permissionId: 7,
  },
  // 14
  {
    permissionGroupId: 2,
    permissionId: 6,
  },
  // End Dashboard (2)

  // Start List Of Leave (3)
  // 1
  {
    permissionGroupId: 3,
    permissionId: 27,
  },
  // 2
  {
    permissionGroupId: 3,
    permissionId: 26,
  },
  // 3
  {
    permissionGroupId: 3,
    permissionId: 31,
  },
  // 4
  {
    permissionGroupId: 3,
    permissionId: 34,
  },
  // End List Of Leave (3)

  // Start Email Organizer
  // 1
  {
    permissionGroupId: 4,
    permissionId: 38,
  },
  // End Email Organizer

  // Start List Of Position
  // 1
  {
    permissionGroupId: 5,
    permissionId: 10,
  },
  // 2
  {
    permissionGroupId: 5,
    permissionId: 11,
  },
  // 3
  {
    permissionGroupId: 5,
    permissionId: 12,
  },
  // 4
  {
    permissionGroupId: 5,
    permissionId: 13,
  },
  // End List Of Position
];

async function permissionToGroupSeed() {
  for (let permissionToGroup of permissionToGroups) {
    await prisma.permissionToGroup.create({
      data: permissionToGroup,
    });
  }
}

module.exports = { permissionToGroupSeed };
