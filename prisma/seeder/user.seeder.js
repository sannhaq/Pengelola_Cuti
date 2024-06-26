const { prisma } = require('./config');
const { faker } = require('@faker-js/faker');

const generateFakeUser = () => {
  return {
    email: faker.internet.email(),
    password: '$2b$10$CfyAJ93EMuDJBhNdEnn5n.hhOa8/5RnZ.XHjbylgU/97hcxP3l5Yi',
    roleId: 3,
    isFirst: faker.datatype.boolean(),
  };
};

async function userSeed() {
  await prisma.user.create({
    data: {
      email: 'superadmin@gmail.com',
      password: '$2b$10$CfyAJ93EMuDJBhNdEnn5n.hhOa8/5RnZ.XHjbylgU/97hcxP3l5Yi',
      roleId: 1,
      isFirst: false,
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      password: '$2b$10$CfyAJ93EMuDJBhNdEnn5n.hhOa8/5RnZ.XHjbylgU/97hcxP3l5Yi',
      roleId: 2,
      isFirst: false,
    },
  });

  await prisma.user.create({
    data: {
      email: 'user@gmail.com',
      password: '$2b$10$CfyAJ93EMuDJBhNdEnn5n.hhOa8/5RnZ.XHjbylgU/97hcxP3l5Yi',
      roleId: 3,
      isFirst: false,
    },
  });

  for (let i = 0; i < 49; i++) {
    const fakeUser = generateFakeUser();
    await prisma.user.create({
      data: fakeUser,
    });
  }
}
module.exports = { userSeed };
