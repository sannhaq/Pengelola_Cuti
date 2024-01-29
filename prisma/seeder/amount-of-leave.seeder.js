const { prisma } = require('./config');
const { faker } = require('@faker-js/faker');

async function amountOfLeaveSeed() {
    const amountOfLeaves = [];
    
    for (let i = 1; i <= 52; i++) {
      // Generate two entries for each employee for the years 2023 and 2024
      for (const year of [2023, 2024]) {
        const amountOfLeave = {
          amount: faker.number.int({ min: 9, max: 12 }),
          year,
          isActive: true,
          employeeNik: i.toString(),
          created_at: new Date(),
          updated_at: new Date(),
        };
  
        amountOfLeaves.push(amountOfLeave);
      }
    }
  
    for (let amountOfLeave of amountOfLeaves) {
      await prisma.amountOfLeave.create({
        data: amountOfLeave,
      });
    }
  }
  
  module.exports = { amountOfLeaveSeed };