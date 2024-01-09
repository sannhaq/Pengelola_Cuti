const { prisma } = require("./config")
const { faker } = require('@faker-js/faker')

const generateFakePositions = () => {
  return {
    name: faker.person.jobType(),
  }
}

async function positionSeed() {
  for (let i = 0; i < 10; i++) {
    const fakePosition = generateFakePositions()
    await prisma.positions.create({
      data: fakePosition,
    })
  }
}

module.exports = { positionSeed }
