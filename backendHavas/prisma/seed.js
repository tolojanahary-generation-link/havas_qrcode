import prisma from "./prismaClient.js";

async function initializeRole() {
  try {
    const roles = await prisma.role.createMany({
      data: [
        { name: "SUPER_ADMIN", description: "" },
        { name: "ADMIN_COLLAB", description: "" },
        { name: "AGENT_COLLAB", description: "" }
      ],
      skipDuplicates: true,
    });
    console.log("Roles inserted", roles.count);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeRole();


// test();