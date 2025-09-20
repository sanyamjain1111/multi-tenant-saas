import { prisma } from "@/lib/prisma"

export async function checkNoteLimit(
  tenantId: string,
): Promise<{ canCreate: boolean; currentCount: number; limit: number }> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { _count: { select: { notes: true } } },
  })

  if (!tenant) {
    throw new Error("Tenant not found")
  }

  const currentCount = tenant._count.notes
  const limit = tenant.subscription === "free" ? 3 : Number.POSITIVE_INFINITY
  const canCreate = tenant.subscription === "pro" || currentCount < limit

  return { canCreate, currentCount, limit }
}

export async function upgradeTenant(tenantId: string): Promise<void> {
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { subscription: "pro" },
  })
}
