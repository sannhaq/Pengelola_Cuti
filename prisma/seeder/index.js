const { amountOfLeaveSeed } = require('./amount-of-leave.seeder');
const { prisma } = require('./config');
const { emailPrefereceSeed } = require('./email-preference.seeder');
const { employeeSpecialSeed } = require('./employee-special-leave.seeder');
const { employeeSeed } = require('./employee.seeder');
const { leaveEmployeeSeed } = require('./leave-employee.seeder');
const { leaveSeed } = require('./leave.seeder');
const { permissionSeed } = require('./permission.seeder');
const { positionSeed } = require('./position.seeder');
const { roleSeed } = require('./role.seeder');
const { rolePermissionSeed } = require('./rolePermission.seeder');
const { specialLeaveSeed } = require('./special-leave.seeder');
const { typeOfEmployeeSeed } = require('./type-of-employee.seeder');
const { typeOfLeaveSeed } = require('./type-of-leave.seeder');
const { userSeed } = require('./user.seeder');
const { webSettingSeed } = require('./web-setting.seeder');

async function main() {
  // user seed
  await roleSeed();
  await userSeed();
  await positionSeed();
  await typeOfEmployeeSeed();
  await typeOfLeaveSeed();
  await employeeSeed();
  await leaveSeed();
  await leaveEmployeeSeed();
  await amountOfLeaveSeed();
  await specialLeaveSeed();
  await employeeSpecialSeed();
  await permissionSeed();
  await rolePermissionSeed();
  await emailPrefereceSeed();
  await webSettingSeed();
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
