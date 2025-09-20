"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Crown, Check, X, Zap, Shield, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SubscriptionPage() {
  const { user, token } = useAuth()
  const [noteCount, setNoteCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const { toast } = useToast()
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
      setNoteCount(response.notes.length)
    } catch (error) {
      console.error("Failed to load stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    if (user?.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "Only admins can upgrade subscriptions",
        variant: "destructive",
      })
      return
    }

    setUpgrading(true)
    try {
      await apiClient.upgradeTenant(user.tenant.slug)
      toast({
        title: "Success!",
        description: "Your subscription has been upgraded to Pro",
      })
      // Refresh the page to update user data
      window.location.reload()
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: error instanceof Error ? error.message : "Failed to upgrade subscription",
        variant: "destructive",
      })
    } finally {
      setUpgrading(false)
    }
  }

  if (!user) return null

  const isProPlan = user.tenant.subscription === "pro"
  const noteLimit = 3
  const usagePercentage = isProPlan ? 0 : Math.min((noteCount / noteLimit) * 100, 100)

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription and usage for {user.tenant.name}</p>
        </div>

        {/* Current Plan */}
        <Card className="glass mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Current Plan</span>
                    <Badge variant={isProPlan ? "default" : "secondary"}>
                      {user.tenant.subscription.toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{isProPlan ? "Unlimited features and notes" : "Limited to 3 notes"}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isProPlan && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Notes Used</span>
                  <span>
                    {noteCount} of {noteLimit}
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
                {noteCount >= noteLimit && (
                  <p className="text-sm text-destructive">
                    You've reached your note limit. Upgrade to Pro to create unlimited notes.
                  </p>
                )}
              </div>
            )}
            {isProPlan && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-accent" />
                <span>Unlimited notes and features</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className={`glass ${!isProPlan ? "ring-2 ring-primary" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Free Plan</span>
                {!isProPlan && <Badge>Current</Badge>}
              </CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-3xl font-bold">
                $0<span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-accent" />
                  <span className="text-sm">Up to 3 notes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-accent" />
                  <span className="text-sm">Basic note management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-accent" />
                  <span className="text-sm">Search functionality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Unlimited notes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Priority support</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`glass ${isProPlan ? "ring-2 ring-primary" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pro Plan</span>
                {isProPlan && <Badge>Current</Badge>}
              </CardTitle>
              <CardDescription>For power users and teams</CardDescription>
              <div className="text-3xl font-bold">
                $9<span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-accent" />
                  <span className="text-sm">Unlimited notes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-accent" />
                  <span className="text-sm">Advanced note management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-accent" />
                  <span className="text-sm">Enhanced search</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-accent" />
                  <span className="text-sm">Team collaboration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-accent" />
                  <span className="text-sm">Priority support</span>
                </div>
              </div>

              {!isProPlan && (
                <Button onClick={handleUpgrade} disabled={upgrading || user.role !== "admin"} className="w-full">
                  {upgrading ? (
                    "Upgrading..."
                  ) : user.role !== "admin" ? (
                    "Admin Access Required"
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Upgrade to Pro
                    </>
                  )}
                </Button>
              )}

              {isProPlan && (
                <div className="flex items-center justify-center space-x-2 text-sm text-accent">
                  <Shield className="h-4 w-4" />
                  <span>You're on the Pro plan</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {user.role !== "admin" && (
          <Card className="glass mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Admin Access Required</p>
                  <p className="text-xs text-muted-foreground">
                    Only tenant administrators can manage subscriptions. Contact your admin to upgrade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
