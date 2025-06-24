import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"

export function ProjectSnapshot() {
  // In the future, this data will come from your database.
  const summary = {
    activeProjects: 12,
    tasksOverdue: 3,
    milestonesThisWeek: 2,
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Project Snapshot</CardTitle>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Active Projects</span>
            <span className="font-bold text-lg">{summary.activeProjects}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                Tasks Overdue
            </span>
            <span className="font-bold text-lg text-red-500">{summary.tasksOverdue}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Milestones this week
            </span>
            <span className="font-bold text-lg">{summary.milestonesThisWeek}</span>
          </div>
           <Button variant="outline" className="w-full mt-2" asChild>
                <Link href="/dashboard/projects">
                    View All Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
           </Button>
        </div>
      </CardContent>
    </Card>
  )
}