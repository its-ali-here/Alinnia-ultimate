import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, CreditCard, Banknote, Smartphone } from "lucide-react"

const paymentMethods = [
  {
    id: "1",
    type: "Credit Card",
    last4: "4242",
    brand: "Visa",
    isDefault: true,
  },
  {
    id: "2",
    type: "Bank Account",
    last4: "1234",
    brand: "Chase",
    isDefault: false,
  },
]

const recentPayments = [
  {
    id: "1",
    description: "Office Supplies",
    amount: 245.5,
    method: "Visa ****4242",
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "2",
    description: "Software License",
    amount: 99.0,
    method: "Chase ****1234",
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "3",
    description: "Marketing Campaign",
    amount: 1200.0,
    method: "Visa ****4242",
    status: "completed",
    date: "2024-01-13",
  },
]

export default function PaymentsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">Payments</h1>
          <p className="text-muted-foreground">Manage your payment methods and transaction history</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,544.50</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$99.00</div>
            <p className="text-xs text-muted-foreground">1 pending payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Active methods</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Your saved payment methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {method.brand} ****{method.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">{method.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.isDefault && <Badge variant="secondary">Default</Badge>}
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Your latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">{payment.date}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{payment.method}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === "completed" ? "default" : "secondary"}>{payment.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">${payment.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
