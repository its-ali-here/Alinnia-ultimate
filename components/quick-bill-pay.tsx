"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { getUserBills, markBillAsPaid } from "@/lib/database"

interface Bill {
  id: string
  bill_name: string
  amount: number
  due_date: string
  category: string
}

export function QuickBillPay() {
  const { user } = useAuth()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadBills()
    }
  }, [user])

  const loadBills = async () => {
    if (!user) return

    try {
      const billsData = await getUserBills(user.id)
      setBills(billsData)
    } catch (error) {
      console.error("Error loading bills:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayBill = async (billId: string) => {
    try {
      await markBillAsPaid(billId)
      setBills(bills.filter((bill) => bill.id !== billId))
      alert("Bill marked as paid!")
    } catch (error) {
      console.error("Error paying bill:", error)
      alert("Failed to pay bill")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading bills...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Bill Pay</CardTitle>
      </CardHeader>
      <CardContent>
        {bills.length > 0 ? (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{bill.bill_name}</p>
                  <p className="text-sm text-muted-foreground">Due: {new Date(bill.due_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold">${Number(bill.amount).toFixed(2)}</span>
                  <Button variant="outline" size="sm" onClick={() => handlePayBill(bill.id)}>
                    Pay
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No pending bills</p>
        )}
      </CardContent>
    </Card>
  )
}
