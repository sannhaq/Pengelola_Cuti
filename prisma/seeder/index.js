const { amountSeed } = require('./amount-of-leave.seeder');
const { prisma } = require('./config');
const { employeeSeed } = require('./employee.seeder');
const { leaveSeed } = require('./leave.seeder');
const { positionSeed } = require('./position.seeder');
const { roleSeed } = require('./role.seeder');
const { typeOfEmployeeSeed } = require('./type-of-employee.seeder');
const { typeOfLeaveSeed } = require('./type-of-leave.seeder');
const { userSeed } = require('./user.seeder');

async function main() {
  // user seed
  await roleSeed();
  await userSeed();
  await positionSeed();
  await typeOfEmployeeSeed();
  await typeOfLeaveSeed();
  await amountSeed();
  await employeeSeed();
  await leaveSeed();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.log(err);
    await prisma.$disconnect();
    process.exit(1);
  });
