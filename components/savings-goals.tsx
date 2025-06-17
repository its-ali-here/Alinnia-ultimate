"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getUserSavingsGoals } from "@/lib/database"

interface SavingsGoal {
  id: string
  goal_name: string
  target_amount: number
  current_amount: number
  target_date: string | null
}

export function SavingsGoals() {
  const { user } = useAuth()
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSavingsGoals()
    }
  }, [user])

  const loadSavingsGoals = async () => {
    if (!user) return

    try {
      const goals = await getUserSavingsGoals(user.id)
      setSavingsGoals(goals)
    } catch (error) {
      console.error("Error loading savings goals:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading savings goals...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">Savings Goals</CardTitle>
        <Button variant="outline" size="icon">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only">Add new savings goal</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {savingsGoals.length > 0 ? (
            savingsGoals.map((goal) => {
              const percentage =
                Number(goal.target_amount) > 0 ? (Number(goal.current_amount) / Number(goal.target_amount)) * 100 : 0
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{goal.goal_name}</span>
                    <span>
                      ${Number(goal.current_amount).toLocaleString()} / ${Number(goal.target_amount).toLocaleString()}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-right text-muted-foreground">{percentage.toFixed(1)}% complete</p>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground">No savings goals set up</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
