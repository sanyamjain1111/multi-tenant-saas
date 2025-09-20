import type { NextRequest } from "next/server"
import { authenticateRequest, corsHeaders } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, payload } = await authenticateRequest(request)

    // Get note with tenant isolation check
    const note = await prisma.note.findFirst({
      where: {
        id: params.id,
        tenantId: payload.tenantId, // Ensure tenant isolation
      },
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
    })

    if (!note) {
      return Response.json(
        { error: "Note not found" },
        {
          status: 404,
          headers: corsHeaders(),
        },
      )
    }

    return Response.json(
      { note },
      {
        status: 200,
        headers: corsHeaders(),
      },
    )
  } catch (error) {
    console.error("Get note error:", error)
    return Response.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: corsHeaders(),
      },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if note exists and belongs to user's tenant
    const existingNote = await prisma.note.findFirst({
      where: {
        id: params.id,
        tenantId: payload.tenantId, // Ensure tenant isolation
      },
    })

    if (!existingNote) {
      return Response.json(
        { error: "Note not found" },
        {
          status: 404,
          headers: corsHeaders(),
        },
      )
    }

    // Update note
    const note = await prisma.note.update({
      where: { id: params.id },
      data: { title, content },
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
    })

    return Response.json(
      { note },
      {
        status: 200,
        headers: corsHeaders(),
      },
    )
  } catch (error) {
    console.error("Update note error:", error)
    return Response.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders(),
      },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, payload } = await authenticateRequest(request)

    // Check if note exists and belongs to user's tenant
    const existingNote = await prisma.note.findFirst({
      where: {
        id: params.id,
        tenantId: payload.tenantId, // Ensure tenant isolation
      },
    })

    if (!existingNote) {
      return Response.json(
        { error: "Note not found" },
        {
          status: 404,
          headers: corsHeaders(),
        },
      )
    }

    // Delete note
    await prisma.note.delete({
      where: { id: params.id },
    })

    return Response.json(
      { message: "Note deleted successfully" },
      {
        status: 200,
        headers: corsHeaders(),
      },
    )
  } catch (error) {
    console.error("Delete note error:", error)
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
