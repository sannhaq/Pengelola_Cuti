const { prisma } = require('./config');
const { faker } = require('@faker-js/faker');

const generateFakeTypeOfEmployee = () => {
  return {
    isContract: faker.datatype.boolean(),
    newContract: faker.datatype.boolean(),
    startContract: faker.date.between({ from: "2023-01-01", to: "2023-12-31" }),
    endContract: faker.date.between({ from: "2024-01-01", to: "2025-12-31" }),
    created_at: new Date(),
    updated_at: new Date(),
  };
};

async function typeOfEmployeeSeed() {
  for (let i = 0; i < 52; i++) {
    const dummyData = generateFakeTypeOfEmployee();
    await prisma.typeOfEmployee.create({
      data: dummyData,
    });
  }
}

module.exports = { typeOfEmployeeSeed };
