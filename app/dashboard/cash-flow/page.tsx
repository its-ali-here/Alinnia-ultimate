// app/dashboard/cash-flow/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, ArrowRight, DollarSign, Banknote, Landmark } from "lucide-react"
import { CashFlowChart } from "@/components/cash-flow-chart"

// Mock data - we'll connect this to your database later
const kpiData = {
    netCashFlow: 12530,
    totalIncome: 85200,
    totalExpenses: 72670,
    workingCapital: 35100
};

const recentTransactions = [
    { id: 1, type: "income", description: "Client Payment - Acme Corp", amount: 5000, date: "2025-06-20" },
    { id: 2, type: "expense", description: "Software Subscription - Figma", amount: -150, date: "2025-06-19" },
    { id: 3, type: "expense", description: "Office Supplies", amount: -430.50, date: "2025-06-18" },
    { id: 4, type: "income", description: "Stripe Payout", amount: 12500, date: "2025-06-17" },
];

const receivables = [
    { client: "Tech Solutions", amount: 2500, dueDate: "5d"},
    { client: "Global Inc", amount: 7500, dueDate: "12d"},
];

const payables = [
    { vendor: "Cloud Hosting LLC", amount: 600, dueDate: "8d"},
    { vendor: "Office Rent", amount: 2200, dueDate: "15d"},
]

export default function CashFlowPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Cash Flow</h1>
        <p className="text-muted-foreground">Monitor your income, expenses, and financial health.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${kpiData.netCashFlow.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-500">${kpiData.totalIncome.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">This quarter</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-500">${kpiData.totalExpenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">This quarter</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Working Capital</CardTitle>
                <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${kpiData.workingCapital.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Assets vs Liabilities</p>
            </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Income vs. Expenses</CardTitle>
                <CardDescription>Visualizing your cash flow over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
                <CashFlowChart />
            </CardContent>
        </Card>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-md">Accounts Receivable</CardTitle>
                </CardHeader>
                <CardContent>
                    {receivables.map(r => (
                        <div key={r.client} className="flex justify-between items-center mb-2 text-sm">
                            <p>{r.client}</p>
                            <p className="font-medium">${r.amount.toLocaleString()} <Badge variant="outline" className="ml-2">Due in {r.dueDate}</Badge></p>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-md">Accounts Payable</CardTitle>
                </CardHeader>
                <CardContent>
                    {payables.map(p => (
                        <div key={p.vendor} className="flex justify-between items-center mb-2 text-sm">
                            <p>{p.vendor}</p>
                            <p className="font-medium">${p.amount.toLocaleString()} <Badge variant="secondary" className="ml-2">Due in {p.dueDate}</Badge></p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
      
       {/* Recent Transactions */}
      <Card>
        <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentTransactions.map(t => (
                        <TableRow key={t.id}>
                            <TableCell>{t.description}</TableCell>
                            <TableCell>{t.date}</TableCell>
                            <TableCell className={`text-right font-medium ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {t.amount > 0 ? '+' : ''}${t.amount.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}