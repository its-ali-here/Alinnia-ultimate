"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  DraftingCompass,
  FileText,
  Key,
  HardHat,
  Paintbrush,
  BrickWall,
  AlertCircle,
  ListTodo,
} from "lucide-react"

// Hardcoded data for a construction project timeline
const timelinePhases = [
    {
      phase: 1,
      title: "Pre-Construction",
      dateRange: "Jan 15, 2026 - Feb 28, 2026",
      status: "Completed",
      tasks: [
        { name: "Architectural Drawings Finalized", completed: true },
        { name: "Structural Engineering Approved", completed: true },
        { name: "City Permits Acquired", completed: true },
      ],
      icon: DraftingCompass,
    },
    {
      phase: 2,
      title: "Foundation & Structure",
      dateRange: "Mar 1, 2026 - Apr 30, 2026",
      status: "In Progress",
      tasks: [
        { name: "Site Excavation & Leveling", completed: true },
        { name: "Foundation Pouring", completed: true },
        { name: "Steel Structure Framing", completed: false },
        { name: "Grey Structure & Blockwork", completed: false },
      ],
      icon: BrickWall,
    },
    {
      phase: 3,
      title: "Exterior & MEP Rough-in",
      dateRange: "May 1, 2026 - Jun 15, 2026",
      status: "Upcoming",
      tasks: [
        { name: "Roofing & Waterproofing", completed: false },
        { name: "Window & Door Frame Installation", completed: false },
        { name: "Electrical & Plumbing Conduits", completed: false },
      ],
      icon: HardHat,
    },
    {
      phase: 4,
      title: "Interior Finishes",
      dateRange: "Jun 16, 2026 - Aug 31, 2026",
      status: "Upcoming",
      tasks: [
        { name: "Plaster & Drywall", completed: false },
        { name: "Tiling & Flooring", completed: false },
        { name: "Painting & Woodwork", completed: false },
        { name: "Fixture Installation", completed: false },
      ],
      icon: Paintbrush,
    },
    {
      phase: 5,
      title: "Completion & Handover",
      dateRange: "Sep 1, 2026 - Sep 15, 2026",
      status: "Upcoming",
      tasks: [
          { name: "Final Inspections", completed: false },
          { name: "Punch List Rectification", completed: false },
          { name: "Project Handover", completed: false },
      ],
      icon: Key,
    },
  ];
  

export default function TimelinePage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Completed</Badge>
      case "In Progress":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
      case "Upcoming":
        return <Badge variant="outline">Upcoming</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPhaseIcon = (Icon, status) => {
    let color = "text-gray-400";
    if (status === "Completed") color = "text-white";
    if (status === "In Progress") color = "text-white";

    let bg = "bg-gray-100 dark:bg-gray-800";
    if (status === "Completed") bg = "bg-emerald-500";
    if (status === "In Progress") bg = "bg-blue-500";

    return (
        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-background ${bg} shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
            <Icon className={`h-6 w-6 ${color}`} />
        </div>
    )
  }

  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Project Timeline</h2>
            <p className="text-muted-foreground">
              Visualize your construction schedule, key milestones, and phase dependencies.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Gantt View
            </Button>
            <Button>
              <ListTodo className="mr-2 h-4 w-4" />
              Manage Tasks
            </Button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">35%</div>
              <Progress value={35} className="h-2 mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Phase</CardTitle>
              <BrickWall className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">Foundation & Structure</div>
              <p className="text-xs text-muted-foreground mt-1">
                Framing in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Completion</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Sep 15, 2026</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                190 days remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
              <AlertCircle className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">0</div>
               <p className="text-xs text-muted-foreground flex items-center mt-1">
                Project is on schedule
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Construction Phases</CardTitle>
            <CardDescription>From groundbreaking to final handover.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {timelinePhases.map((phase) => (
                <div key={phase.phase} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  
                  {getPhaseIcon(phase.icon, phase.status)}
                  
                  <div className="w-[calc(100%-4.5rem)] md:w-[calc(50%-3.5rem)] p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="font-bold text-lg text-primary">{phase.title}</h3>
                            <p className="text-xs text-muted-foreground font-medium">{phase.dateRange}</p>
                        </div>
                        {getStatusBadge(phase.status)}
                    </div>
                    <div className="mt-4 space-y-2">
                        {phase.tasks.map(task => (
                            <div key={task.name} className="flex items-center gap-3 text-sm">
                                {task.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600" />}
                                <span className={`${task.completed ? "text-muted-foreground line-through" : "font-medium"}`}>
                                    {task.name}
                                </span>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}