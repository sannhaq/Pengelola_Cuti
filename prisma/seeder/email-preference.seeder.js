const { prisma } = require('./config');

const emailPrefereces = [
  {
    userId: 2,
    receiveEmail: true,
  },
];

async function emailPrefereceSeed() {
  for (let emailPreferece of emailPrefereces) {
    await prisma.emailPreference.create({
      data: emailPreferece,
    });
  }
}

module.exports = { emailPrefereceSeed };
