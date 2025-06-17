"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { getUserBudgetCategories } from "@/lib/database"

interface BudgetCategory {
  id: string
  category_name: string
  monthly_limit: number
  current_spent: number
  color: string
}

export function BudgetTracker() {
  const { user } = useAuth()
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadBudgetCategories()
    }
  }, [user])

  const loadBudgetCategories = async () => {
    if (!user) return

    try {
      const categories = await getUserBudgetCategories(user.id)
      setBudgetCategories(categories)
    } catch (error) {
      console.error("Error loading budget categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalBudget = budgetCategories.reduce((sum, category) => sum + Number(category.monthly_limit), 0)
  const totalSpent = budgetCategories.reduce((sum, category) => sum + Number(category.current_spent), 0)
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading budget...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Spent</span>
            <span className="text-sm font-medium">
              ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
            </span>
          </div>
          <Progress value={overallPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground text-right">{overallPercentage.toFixed(1)}% of budget used</p>

          {budgetCategories.length > 0 ? (
            <div className="space-y-2">
              {budgetCategories.map((category) => {
                const percentage =
                  Number(category.monthly_limit) > 0
                    ? (Number(category.current_spent) / Number(category.monthly_limit)) * 100
                    : 0
                return (
                  <div key={category.id} className="grid grid-cols-3 gap-2 items-center">
                    <span className="text-sm font-medium">{category.category_name}</span>
                    <Progress value={percentage} className="h-1.5" />
                    <span className="text-sm text-muted-foreground text-right">{percentage.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No budget categories set up</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
