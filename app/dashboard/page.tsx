"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NotebookPen, Users, Crown, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DashboardStats {
  totalNotes: number
  noteLimit: number
  canCreateMore: boolean
}

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (token) {
      apiClient.setToken(token)
      loadStats()
    }
  }, [user, token, router])

  const loadStats = async () => {
    try {
      const response = await apiClient.getNotes()
      const totalNotes = response.notes.length
      const noteLimit = user?.tenant.subscription === "free" ? 3 : Number.POSITIVE_INFINITY
      const canCreateMore = user?.tenant.subscription === "pro" || totalNotes < noteLimit

      setStats({
        totalNotes,
        noteLimit,
        canCreateMore,
      })
    } catch (error) {
      console.error("Failed to load stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Welcome back, {user.email.split("@")[0]}</h1>
          <p className="text-muted-foreground">Manage your notes and workspace settings for {user.tenant.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Notes Stats */}
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
              <NotebookPen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats?.totalNotes || 0}</div>
              <p className="text-xs text-muted-foreground">
                {user.tenant.subscription === "free"
                  ? `${stats?.totalNotes || 0} of ${stats?.noteLimit || 3} used`
                  : "Unlimited notes available"}
              </p>
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant={user.tenant.subscription === "pro" ? "default" : "secondary"}>
                  {user.tenant.subscription.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {user.tenant.subscription === "free" ? "Limited to 3 notes" : "Unlimited features"}
              </p>
            </CardContent>
          </Card>

          {/* Role */}
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Role</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{user.role}</div>
              <p className="text-xs text-muted-foreground">
                {user.role === "admin" ? "Full access to all features" : "Can manage notes"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <NotebookPen className="h-5 w-5" />
                <span>Notes Management</span>
              </CardTitle>
              <CardDescription>Create, edit, and organize your notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-3">
                <Button asChild className="flex-1">
                  <Link href="/notes">
                    View All Notes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {stats?.canCreateMore && (
                  <Button asChild variant="outline">
                    <Link href="/notes?create=true">
                      <Plus className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
              {!stats?.canCreateMore && (
                <p className="text-sm text-muted-foreground mt-2">Note limit reached. Upgrade to create more notes.</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5" />
                <span>Subscription</span>
              </CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/subscription">
                  Manage Subscription
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
