const { prisma } = require('./config')
const { faker } = require('@faker-js/faker')

const generateFakerAmount = () => {
  return {
    amount: faker.number.int({ min: 9, max: 20 }),
  }
}

async function amountSeed() {
  for (let i = 0; i < 15; i++) {
    const dummyData = generateFakerAmount()
    await prisma.amountOfLeave.create({
      data: dummyData,
    })
  }
}

module.exports = { amountSeed }
