const { prisma } = require('./config');

const specials = [
  {
    leaveTitle: 'Maternity Leave',
    gender: 'P',
    amount: 90,
    typeOfLeaveId: 4,
    leaveInformation: 'Maternity leave for mothers after childbirth.',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    leaveTitle: 'Accompanying wife in childbirth',
    gender: 'L',
    amount: 2,
    typeOfLeaveId: 4,
    leaveInformation: 'Leave for fathers to accompany their wives during childbirth.',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    leaveTitle: 'Miscarriage Leave',
    gender: 'P',
    amount: 45,
    typeOfLeaveId: 4,
    leaveInformation: 'Leave for mothers after miscarriage.',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    leaveTitle: 'Marriage Leave',
    gender: 'LP',
    amount: 3,
    typeOfLeaveId: 4,
    leaveInformation: 'Leave for employees after marriage.',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    leaveTitle: 'Child`s Marriage Leave',
    gender: 'LP',
    amount: 2,
    typeOfLeaveId: 4,
    leaveInformation: "Leave for employees to attend their child's wedding.",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    leaveTitle: 'Circumcision Leave',
    gender: 'LP',
    amount: 2,
    typeOfLeaveId: 4,
    leaveInformation: "Leave for parents after their child's circumcision.",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    leaveTitle: 'Wife Miscarriage Leave',
    gender: 'L',
    amount: 2,
    typeOfLeaveId: 4,
    leaveInformation: "Leave for husbands after their wife's miscarriage.",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    leaveTitle: 'Baptism Leave',
    gender: 'LP',
    amount: 2,
    typeOfLeaveId: 4,
    leaveInformation: "Leave for parents after their child's baptism.",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    leaveTitle: 'Family Bereavement Leave',
    gender: 'LP',
    amount: 2,
    typeOfLeaveId: 4,
    leaveInformation:
      'Leave for employees after the death of a spouse, parent, child, or parent-in-law.',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    leaveTitle: 'Household Bereavement Leave',
    gender: 'LP',
    amount: 1,
    typeOfLeaveId: 4,
    leaveInformation: 'Leave for employees after the death of a household member.',
    created_at: new Date(),
    updated_at: new Date(),
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
