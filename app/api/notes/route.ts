import type { NextRequest } from "next/server"
import { authenticateRequest, corsHeaders } from "@/lib/auth"
import { checkNoteLimit } from "@/lib/subscription"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { user, payload } = await authenticateRequest(request)

    // Get all notes for the user's tenant only
    const notes = await prisma.note.findMany({
      where: { tenantId: payload.tenantId },
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return Response.json(
      { notes },
      {
        status: 200,
        headers: corsHeaders(),
      },
    )
  } catch (error) {
    console.error("Get notes error:", error)
    return Response.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: corsHeaders(),
      },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, payload } = await authenticateRequest(request)
    const { title, content } = await request.json()

    if (!title || !content) {
      return Response.json(
        { error: "Title and content are required" },
        {
          status: 400,
          headers: corsHeaders(),
        },
      )
    }

    // Check subscription limits
    const { canCreate, currentCount, limit } = await checkNoteLimit(payload.tenantId)

    if (!canCreate) {
      return Response.json(
        {
          error: "Note limit reached",
          message: `Free plan allows maximum ${limit} notes. You currently have ${currentCount} notes.`,
          currentCount,
          limit,
        },
        {
          status: 403,
          headers: corsHeaders(),
        },
      )
    }

    // Create note with tenant isolation
    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: payload.userId,
        tenantId: payload.tenantId,
      },
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
    })

    return Response.json(
      { note },
      {
        status: 201,
        headers: corsHeaders(),
      },
    )
  } catch (error) {
    console.error("Create note error:", error)
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
