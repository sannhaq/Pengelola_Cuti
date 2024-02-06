const { prisma } = require('./config');
const { faker } = require('@faker-js/faker');

const status = ['APPROVE', 'WAITING', 'REJECT'];
const generateFakerEmployeeSpecial = () => {
  return {
    employeeNik: faker.number.int({ min: 2, max: 52 }).toString(),
    specialLeaveId: faker.number.int({ min: 1, max: 10 }),
    status: status[Math.floor(Math.random() * status.length)],
    startLeave: faker.date.recent(),
    endLeave: faker.date.recent({ days: 2 }),
  };
};

async function employeeSpecialSeed() {
  for (let i = 0; i < 15; i++) {
    const fake = generateFakerEmployeeSpecial();
    await prisma.employeeSpecialLeave.create({
      data: fake,
    });
  }
}

module.exports = { employeeSpecialSeed };
