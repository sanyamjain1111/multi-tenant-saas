import { corsHeaders } from "@/lib/auth"

export async function GET() {
  return Response.json(
    { status: "ok" },
    {
      status: 200,
      headers: corsHeaders(),
    },
  )
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  })
}
