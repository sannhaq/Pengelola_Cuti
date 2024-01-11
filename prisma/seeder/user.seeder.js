const { prisma } = require('./config');
const { faker } = require('@faker-js/faker');

const generateFakeUser = () => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    roleId: 3,
  };
};

async function userSeed() {
  await prisma.user.create({
    data: {
      email: 'superadmin@gmail.com',
      password: 'superadmin',
      roleId: 1,
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      password: 'admin',
      roleId: 2,
    },
  });

  for (let i = 0; i < 50; i++) {
    const fakeUser = generateFakeUser();
    await prisma.user.create({
      data: fakeUser,
    });
  }
}
module.exports = { userSeed };
