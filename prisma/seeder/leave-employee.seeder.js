const { prisma } = require('./config');

const leaveEmployees = [
  {
    leaveId: 15,
    employeeNik: '12',
  },
  {
    leaveId: 14,
    employeeNik: '27',
  },
  {
    leaveId: 13,
    employeeNik: '49',
  },
  {
    leaveId: 12,
    employeeNik: '45',
  },
  {
    leaveId: 11,
    employeeNik: '30',
  },
  {
    leaveId: 10,
    employeeNik: '51',
  },
  {
    leaveId: 9,
    employeeNik: '6',
  },
  {
    leaveId: 8,
    employeeNik: '2',
  },
  {
    leaveId: 7,
    employeeNik: '2',
  },
  {
    leaveId: 6,
    employeeNik: '2',
  },
  {
    leaveId: 5,
    employeeNik: '8',
  },
  {
    leaveId: 4,
    employeeNik: '4',
  },
  {
    leaveId: 3,
    employeeNik: '10',
  },
  {
    leaveId: 2,
    employeeNik: '13',
  },
  {
    leaveId: 1,
    employeeNik: '13',
  },
  {
    leaveId: 16,
    employeeNik: '8',
  },
  {
    leaveId: 17,
    employeeNik: '27',
  },
  {
    leaveId: 18,
    employeeNik: '10',
  },
  {
    leaveId: 19,
    employeeNik: '20',
  },
  {
    leaveId: 20,
    employeeNik: '33',
  },
];

async function leaveEmployeeSeed() {
  for (let leaveEmployee of leaveEmployees) {
    await prisma.leaveEmployee.create({
      data: leaveEmployee,
    });
  }
}

module.exports = { leaveEmployeeSeed };
