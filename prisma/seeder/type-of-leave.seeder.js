const { prisma } = require('./config');

const typeOfLeaves = [
  {
    name: 'Mandatory',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Optional',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Personal',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Special',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

async function typeOfLeaveSeed() {
  for (let typeOfLeave of typeOfLeaves) {
    await prisma.typeOfLeave.create({
      data: typeOfLeave,
    });
  }
}

module.exports = { typeOfLeaveSeed };
