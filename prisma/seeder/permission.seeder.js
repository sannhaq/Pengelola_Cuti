const { prisma } = require('./config');

const permissions = [
  // 1
  {
    name: 'Get Employee',
    created_at: new Date(),
  },

  // 2
  {
    name: 'Get Detail Employee',
    created_at: new Date(),
  },

  // 3
  {
    name: 'Disable Employee',
    created_at: new Date(),
  },

  // 4
  {
    name: 'Enable Employee',
    created_at: new Date(),
  },

  // 5
  {
    name: 'Change Password',
    created_at: new Date(),
  },

  // 6
  {
    name: 'Reset Password',
    created_at: new Date(),
  },

  // 7
  {
    name: 'Update Employee',
    created_at: new Date(),
  },

  // 8
  {
    name: 'Add Employee',
    created_at: new Date(),
  },

  // 9
  {
    name: 'Home',
    created_at: new Date(),
  },

  // 10
  {
    name: 'Positions',
    created_at: new Date(),
  },

  // 11
  {
    name: 'Add Positions',
    created_at: new Date(),
  },

  // 12
  {
    name: 'Update Positions',
    created_at: new Date(),
  },

  // 13
  {
    name: 'Delete Positions',
    created_at: new Date(),
  },

  // 14
  {
    name: 'Update Role',
    created_at: new Date(),
  },

  // 15
  {
    name: 'Create Role',
    created_at: new Date(),
  },

  // 16
  {
    name: 'Delete Role',
    created_at: new Date(),
  },
  {
    // 17
    name: 'View Mandatory Leave',
    created_at: new Date(),
  },
  {
    // 18
    name: 'Get Leave History for Current User',
    created_at: new Date(),
  },
  {
    // 19
    name: 'View Optional Leave',
    created_at: new Date(),
  },
  {
    // 20
    name: 'Reject Optional Leave',
    created_at: new Date(),
  },
  {
    // 21
    name: 'Update Amount Of Leave',
    created_at: new Date(),
  },
  {
    // 22
    name: 'View Special Leave History',
    created_at: new Date(),
  },
  {
    // 23
    name: 'View Leave History by Employee ID',
    created_at: new Date(),
  },
  {
    // 24
    name: 'Create Collective Leave',
    created_at: new Date(),
  },
  {
    // 25
    name: 'Create Personal Leave',
    created_at: new Date(),
  },
  {
    // 26
    name: 'Approve and Reject Personal Leave',
    created_at: new Date(),
  },
  {
    // 27
    name: 'View All Leave History',
    created_at: new Date(),
  },
  {
    // 28
    name: 'View All Special Leave History',
    created_at: new Date(),
  },
  {
    // 29
    name: 'Update Special Leave',
    created_at: new Date(),
  },
  {
    // 30
    name: 'Create Special Leave',
    created_at: new Date(),
  },
  {
    // 31
    name: 'View All Employee Special Leaves',
    created_at: new Date(),
  },
  {
    // 32
    name: 'View Employee Special Leave History by NIK',
    created_at: new Date(),
  },
  {
    // 33
    name: 'Set Employee Special Leave',
    created_at: new Date(),
  },
  {
    // 34
    name: 'Approve and Reject Employee Special Leave',
    created_at: new Date(),
  },
  {
    // 35
    name: 'Get All Role',
    created_at: new Date(),
  },
  {
    // 36
    name: 'Delete Special Leave List',
    created_at: new Date(),
  },
  {
    // 37
    name: 'Receiving Email Requests for Leave',
    created_at: new Date(),
  },
];

async function permissionSeed() {
  for (let permission of permissions) {
    await prisma.permission.create({
      data: permission,
    });
  }
}

module.exports = { permissionSeed };
