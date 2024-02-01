const { prisma } = require('./config');

const specials = [
  {
    leaveTitle: 'Maternity Leave',
    gender: 'P',
    amount: 90,
    typeOfLeaveId: 4,
    leaveInformation: 'Maternity leave for mothers after childbirth.',
  },
  {
    leaveTitle: 'Paternity Leave',
    gender: 'L',
    amount: 2,
    typeOfLeaveId: 4,
    leaveInformation: 'Paternity leave for fathers to accompany their wives during childbirth.',
  },
  {
    leaveTitle: 'Miscarriage Leave',
    gender: 'P',
    amount: 45,
    typeOfLeaveId: 4,
    leaveInformation: 'Leave for mothers after miscarriage.',
  },
  {
    leaveTitle: 'Marriage Leave',
    gender: 'LP',
    amount: 3,
    typeOfLeaveId: 4,
    leaveInformation: 'Leave for employees after marriage.',
  },
  {
    leaveTitle: 'Child`s Marriage Leave',
    gender: 'LP',
    amount: 2,
    typeOfLeaveId: 4,
    leaveInformation: "Leave for employees to attend their child's wedding.",
  },
  {
    leaveTitle: 'Circumcision Leave',
    gender: 'LP',
    amount: 2,
    typeOfLeaveId: 4,
    leaveInformation: "Leave for parents after their child's circumcision.",
  },
  {
    leaveTitle: 'Wife Miscarriage Leave',
    gender: 'L',
    amount: 2,
    typeOfLeaveId: 4,
    leaveInformation: "Leave for husbands after their wife's miscarriage.",
  },
  {
    leaveTitle: 'Baptism Leave',
    gender: 'LP',
    amount: 2,
    typeOfLeaveId: 4,
    leaveInformation: "Leave for parents after their child's baptism.",
  },
  {
    leaveTitle: 'Family Bereavement Leave',
    gender: 'LP',
    amount: 2,
    typeOfLeaveId: 4,
    leaveInformation:
      'Leave for employees after the death of a spouse, parent, child, or parent-in-law.',
  },
  {
    leaveTitle: 'Household Bereavement Leave',
    gender: 'LP',
    amount: 1,
    typeOfLeaveId: 4,
    leaveInformation: 'Leave for employees after the death of a household member.',
  },
];

async function specialLeaveSeed() {
  for (let special of specials) {
    await prisma.specialLeave.create({
      data: special,
    });
  }
}

module.exports = { specialLeaveSeed };
