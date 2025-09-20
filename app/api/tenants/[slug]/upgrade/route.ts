import type { NextRequest } from "next/server"
import { authenticateRequest, corsHeaders } from "@/lib/auth"
import { upgradeTenant } from "@/lib/subscription"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { user, payload } = await authenticateRequest(request)

    // Check if user is admin
    if (payload.role !== "admin") {
      return Response.json(
        { error: "Only admins can upgrade subscriptions" },
        {
          status: 403,
          headers: corsHeaders(),
        },
      )
    }

    // Check if the tenant slug matches the user's tenant
    if (payload.tenantSlug !== params.slug) {
      return Response.json(
        { error: "Cannot upgrade other tenants" },
        {
          status: 403,
          headers: corsHeaders(),
        },
      )
    }

    // Upgrade the tenant
    await upgradeTenant(payload.tenantId)

    // Get updated tenant info
    const updatedTenant = await prisma.tenant.findUnique({
      where: { id: payload.tenantId },
    })

    return Response.json(
      {
        message: "Subscription upgraded successfully",
        tenant: updatedTenant,
      },
      {
        status: 200,
        headers: corsHeaders(),
      },
    )
  } catch (error) {
    console.error("Upgrade error:", error)
    return Response.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders(),
      },
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  })
}
