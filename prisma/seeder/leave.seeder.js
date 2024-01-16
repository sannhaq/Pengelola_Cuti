const { Status } = require('@prisma/client');
const { prisma } = require('./config');
const { faker } = require('@faker-js/faker');

const generateRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateRandomStatus = () => {
  const statuses = [Status.APPROVE, Status.WAITING, Status.REJECT];
  const randomIndex = generateRandomNumber(0, 2);
  return statuses[randomIndex];
};

async function leaveSeed() {
  const leaves = [];

  for (let i = 1; i <= 20; i++) {
    const startLeave = faker.date.recent();
    const endLeave = new Date(startLeave);
    endLeave.setDate(startLeave.getDate() + generateRandomNumber(1, 3));

    const leave = {
      typeOfLeaveId: generateRandomNumber(1, 3),
      startLeave,
      endLeave,
      reason: faker.lorem.sentence(),
      status: generateRandomStatus(),
      employeeNik: generateRandomNumber(1, 52).toString(),
    };

    leaves.push(leave);
  }

  for (let leave of leaves) {
    await prisma.leave.create({
      data: leave,
    });
  }
}

module.exports = { leaveSeed };
