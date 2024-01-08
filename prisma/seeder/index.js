const { prisma } = require("./config");
const { roleSeed } = require("./role.seeder");

async function main() {
    // user seed
    await roleSeed();
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
