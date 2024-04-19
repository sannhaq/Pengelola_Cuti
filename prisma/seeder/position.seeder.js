const { prisma } = require('./config');
const { faker } = require('@faker-js/faker');

const positions = [
  {
    name: 'Software Engineer',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Data Scientist',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Product Manager',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'UI/UX Designer',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Marketing Specialist',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Financial Analyst',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'HR Manager',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Sales Representative',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Operations Manager',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: 'Customer Support Specialist',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

async function positionSeed() {
  for (let position of positions) {
    await prisma.positions.create({
      data: position,
    });
  }
}

module.exports = { positionSeed };
