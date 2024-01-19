const { prisma } = require('./config');
const { faker } = require('@faker-js/faker');

const generateRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const startLeave = faker.date.recent();
const endLeave = new Date(startLeave);
endLeave.setDate(startLeave.getDate() + generateRandomNumber(1, 3));

const leaves = [
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'vocation',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'holiday',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'sick leave',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'family event',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'personal reasons',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'vacation',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'study leave',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'personal development',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'sick leave',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'family vacation',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'business trip',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'holiday',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'sick leave',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'family event',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'personal reasons',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'vacation',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'study leave',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'personal development',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'sick leave',
  },
  {
    typeOfLeaveId: 3,
    startLeave,
    endLeave,
    reason: 'family vacation',
  },
];

async function leaveSeed() {
  for (let leave of leaves) {
    await prisma.leave.create({
      data: leave,
    });
  }
}

module.exports = { leaveSeed };
