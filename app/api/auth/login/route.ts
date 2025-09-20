import type { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { generateToken, corsHeaders } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        {
          status: 400,
          headers: corsHeaders(),
        },
      )
    }

    // Find user with tenant information
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    })

    if (!user) {
      return Response.json(
        { error: "Invalid credentials" },
        {
          status: 401,
          headers: corsHeaders(),
        },
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return Response.json(
        { error: "Invalid credentials" },
        {
          status: 401,
          headers: corsHeaders(),
        },
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug: user.tenant.slug,
    })

    return Response.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tenant: {
            id: user.tenant.id,
            slug: user.tenant.slug,
            name: user.tenant.name,
            subscription: user.tenant.subscription,
          },
        },
      },
      {
        status: 200,
        headers: corsHeaders(),
      },
    )
  } catch (error) {
    console.error("Login error:", error)
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
