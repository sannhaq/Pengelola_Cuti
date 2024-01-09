const { prisma } = require('./config')
const { faker } = require('@faker-js/faker')

const generateRandomBoolean = () => Math.random() < 0.5

async function employeeSeed() {
  const employees = []

  for (let i = 1; i <= 52; i++) {
    const employee = {
      nik: i.toString(),
      name: faker.person.fullName(),
      startWorking: new Date(),
      isWorking: generateRandomBoolean(),
      positionId: faker.number.int({ min: 1, max: 10 }),
      historicalName: faker.person.fullName(),
      historicalNik: i.toString(),
      userId: i,
      typeOfEmployeeId: i,
      created_at: new Date(),
      updated_at: new Date(),
    }

    employees.push(employee)
  }

  for (let employee of employees) {
    await prisma.employee.create({
      data: employee,
    })
  }
}

module.exports = { employeeSeed }
