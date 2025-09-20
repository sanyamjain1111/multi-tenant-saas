import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create tenants
  const acmeTenant = await prisma.tenant.create({
    data: {
      slug: "acme",
      name: "Acme Corporation",
      subscription: "free",
    },
  })

  const globexTenant = await prisma.tenant.create({
    data: {
      slug: "globex",
      name: "Globex Corporation",
      subscription: "free",
    },
  })

  // Hash password
  const hashedPassword = await bcrypt.hash("password", 10)

  // Create users for Acme
  await prisma.user.create({
    data: {
      email: "admin@acme.test",
      password: hashedPassword,
      role: "admin",
      tenantId: acmeTenant.id,
    },
  })

  await prisma.user.create({
    data: {
      email: "user@acme.test",
      password: hashedPassword,
      role: "member",
      tenantId: acmeTenant.id,
    },
  })

  // Create users for Globex
  await prisma.user.create({
    data: {
      email: "admin@globex.test",
      password: hashedPassword,
      role: "admin",
      tenantId: globexTenant.id,
    },
  })

  await prisma.user.create({
    data: {
      email: "user@globex.test",
      password: hashedPassword,
      role: "member",
      tenantId: globexTenant.id,
    },
  })

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
