const { prisma } = require('./config');

const webSettings = [
  {
    picture: 'https://10.10.101.231:8080/public/assets/images/logo_wgs_fullBlack.svg',
    ipAddress: '127.0.0.1:3000',
    webColorCode: '#131720',
  },
];

async function webSettingSeed() {
  try {
    for (let webSetting of webSettings) {
      await prisma.webSetting.create({
        data: webSetting,
      });
    }
    console.log('Web settings seeded successfully.');
  } catch (error) {
    console.error('Failed to seed web settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { webSettingSeed };
