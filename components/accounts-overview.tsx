"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Plus, Send, CreditCard, MoreHorizontal } from "lucide-react"
import { AddMoneyModal } from "./add-money-modal"
import { SendMoneyModal } from "./send-money-modal"
import { RequestMoneyModal } from "./request-money-modal"
import { useAuth } from "@/contexts/auth-context"
import { getUserAccounts, updateAccountBalance } from "@/lib/database"

interface Account {
  id: string
  account_name: string
  account_type: string
  balance: number
}

export function AccountsOverview() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false)
  const [isSendMoneyModalOpen, setIsSendMoneyModalOpen] = useState(false)
  const [isRequestMoneyModalOpen, setIsRequestMoneyModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      loadAccounts()
    }
  }, [user])

  const loadAccounts = async () => {
    if (!user) return

    try {
      const accountsData = await getUserAccounts(user.id)
      setAccounts(accountsData)
    } catch (error) {
      console.error("Error loading accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0)

  const handleAddMoney = async (amount: number) => {
    if (!user || accounts.length === 0) return

    // Add to first account (checking account)
    const checkingAccount = accounts.find((acc) => acc.account_type === "checking") || accounts[0]
    const newBalance = Number(checkingAccount.balance) + amount

    try {
      await updateAccountBalance(checkingAccount.id, newBalance)
      await loadAccounts() // Reload accounts
    } catch (error) {
      console.error("Error adding money:", error)
      alert("Failed to add money")
    }
  }

  const handleSendMoney = async (amount: number, fromAccountId: string) => {
    try {
      const account = accounts.find((acc) => acc.id === fromAccountId)
      if (!account) return

      const newBalance = Number(account.balance) - amount
      if (newBalance < 0) {
        alert("Insufficient funds")
        return
      }

      await updateAccountBalance(fromAccountId, newBalance)
      await loadAccounts() // Reload accounts
    } catch (error) {
      console.error("Error sending money:", error)
      alert("Failed to send money")
    }
  }

  const handleRequestMoney = (amount: number, contact: any) => {
    console.log(`Requested $${amount} from ${contact.name}`)
    alert(`Request sent for $${amount}`)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading accounts...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Accounts Overview</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">Total balance across all accounts</p>

        {accounts.length > 0 ? (
          <div className="mt-4 space-y-2">
            {accounts.map((account) => (
              <div key={account.id} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground capitalize">{account.account_name}</span>
                <span className="text-sm font-medium">${Number(account.balance).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-4">No accounts found</p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button size="sm" onClick={() => setIsAddMoneyModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
          <Button size="sm" onClick={() => setIsSendMoneyModalOpen(true)}>
            <Send className="mr-2 h-4 w-4" /> Send
          </Button>
          <Button size="sm" onClick={() => setIsRequestMoneyModalOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" /> Request
          </Button>
          <Button size="sm" variant="outline">
            <MoreHorizontal className="mr-2 h-4 w-4" /> More
          </Button>
        </div>
      </CardContent>

      <AddMoneyModal
        isOpen={isAddMoneyModalOpen}
        onClose={() => setIsAddMoneyModalOpen(false)}
        onAddMoney={handleAddMoney}
      />
      <SendMoneyModal
        isOpen={isSendMoneyModalOpen}
        onClose={() => setIsSendMoneyModalOpen(false)}
        onSendMoney={handleSendMoney}
        accounts={accounts}
      />
      <RequestMoneyModal
        isOpen={isRequestMoneyModalOpen}
        onClose={() => setIsRequestMoneyModalOpen(false)}
        onRequestMoney={handleRequestMoney}
      />
    </Card>
  )
}
