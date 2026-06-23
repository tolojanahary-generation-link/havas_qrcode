import prisma from "./prismaClient.js";
import bcrypt from "bcrypt";

async function initializeRole() {
  const roles = [
    { name: "SUPER_ADMIN", description: "" },
    { name: "ADMIN_COLLAB", description: "" },
    { name: "AGENT_COLLAB", description: "" },
  ];

  try {
    const result = await prisma.role.createMany({
      data: roles,
      skipDuplicates: true,
    });
    console.log("Roles inserted", result.count);
  } catch (error) {
    console.error("Role initialization error:", error);
  }
}

async function initializeSuperAdmin() {
  const collaborator = await prisma.collaborator.upsert({
    where: { email: "superadmin-collab@app.com" },
    update: {},
    create: {
      companyName: "Super Admin Company",
      email: "superadmin-collab@app.com",
      phone: "+33000000000",
      address: "1 Admin Way",
      city: "Paris",
      country: "France",
      logo: null,
    },
  });

  const superAdminData = {
    email: "superadmin@app.com",
    password: "SuperAdmin2026!",
    firstname: "Super",
    lastname: "Admin",
    phone: "+33000000001",
    isActive: true,
    roleId: 1,
    collaboratorId: collaborator.id,
  };

  const hashedPassword = await bcrypt.hash(superAdminData.password, 12);

  try {
    const createdSuperAdmin = await prisma.user.upsert({
      where: { email: superAdminData.email },
      update: {
        firstname: superAdminData.firstname,
        lastname: superAdminData.lastname,
        password: hashedPassword,
        phone: superAdminData.phone,
        isActive: superAdminData.isActive,
        roleId: superAdminData.roleId,
        collaboratorId: superAdminData.collaboratorId,
      },
      create: {
        ...superAdminData,
        password: hashedPassword,
      },
    });
    console.log("Super Admin inserted/updated", createdSuperAdmin.email);
  } catch (error) {
    console.error("Super admin initialization error:", error);
  }
}

async function main() {
  try {
    await initializeRole();
    await initializeSuperAdmin();
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Seed execution error:", error);
  prisma.$disconnect();
});

// test();