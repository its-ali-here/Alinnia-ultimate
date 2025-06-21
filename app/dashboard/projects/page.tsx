// app/dashboard/projects/page.tsx
"use client" // 1. ADD THIS to make the page interactive

import { useState } from "react" // 2. ADD a state import
import { format } from "date-fns" // 3. ADD date formatting import
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Briefcase, Filter, ArrowRight, Calendar as CalendarIcon } from "lucide-react" // 4. ADD CalendarIcon
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog" // 5. ADD Dialog imports
import { Input } from "@/components/ui/input" // 6. ADD Input import
import { Label } from "@/components/ui/label" // 7. ADD Label import
import { Textarea } from "@/components/ui/textarea" // 8. ADD Textarea import
import { Calendar } from "@/components/ui/calendar" // 9. ADD Calendar import
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover" // 10. ADD Popover imports
import { cn } from "@/lib/utils" // 11. ADD cn utility import

// Dummy data to represent your projects (remains the same)
const projects = [
  {
    id: "PROJ-001",
    name: "Alinnia Mobile App Launch",
    description: "Coordinate all tasks for the upcoming Q3 mobile app launch.",
    status: "In Progress",
    progress: 65,
    dueDate: "2025-09-30",
    members: [
      { name: "Ali", avatar: "/avatars/01.png" },
      { name: "Fatima", avatar: "/avatars/02.png" },
      { name: "Usman", avatar: "/avatars/03.png" },
    ],
  },
  {
    id: "PROJ-002",
    name: "Q3 Marketing Campaign",
    description: "Plan and execute the marketing strategy for the third quarter.",
    status: "On Track",
    progress: 40,
    dueDate: "2025-09-15",
    members: [
      { name: "Aisha", avatar: "/avatars/04.png" },
      { name: "Bilal", avatar: "/avatars/05.png" },
    ],
  },
  {
    id: "PROJ-003",
    name: "Database Migration",
    description: "Migrate the legacy database to the new Supabase infrastructure.",
    status: "At Risk",
    progress: 80,
    dueDate: "2025-07-31",
    members: [
      { name: "Ali", avatar: "/avatars/01.png" },
      { name: "Zainab", avatar: "/avatars/06.png" },
    ],
  },
  {
    id: "PROJ-004",
    name: "Website Redesign",
    description: "Complete overhaul of the public-facing website.",
    status: "Completed",
    progress: 100,
    dueDate: "2025-06-01",
    members: [
        { name: "Aisha", avatar: "/avatars/04.png" },
    ],
  },
];

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case "Completed": return "default";
        case "At Risk": return "destructive";
        default: return "secondary";
    }
}

export default function ProjectsPage() {
  // 12. ADD state management for the form fields
  const [projectName, setProjectName] = useState("")
  const [projectDesc, setProjectDesc] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // 13. ADD a handler function for creating the project
  const handleCreateProject = () => {
    if (!projectName || !dueDate) {
        alert("Project Name and Due Date are required.");
        return;
    }
    const newProject = {
        name: projectName,
        description: projectDesc,
        dueDate: format(dueDate, "yyyy-MM-dd"),
    };
    console.log("New Project Created:", newProject); // For now, we just log it
    setIsDialogOpen(false); // Close the dialog
    // Reset form fields
    setProjectName("")
    setProjectDesc("")
    setDueDate(undefined)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl flex items-center">
            <Briefcase className="mr-3 h-6 w-6" />
            Projects
          </h1>
          <p className="text-muted-foreground">
            Organize, track, and manage your team's work from start to finish.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
            </Button>
            {/* 14. WRAP the button in the DialogTrigger */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to start a new project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="col-span-3" placeholder="e.g., Q4 Marketing Campaign" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Textarea id="description" value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} className="col-span-3" placeholder="A brief description of the project."/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="due-date" className="text-right">Due Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "col-span-3 justify-start text-left font-normal",
                                            !dueDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleCreateProject}>Create Project</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* The project card mapping remains the same */}
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-semibold">{project.name}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge>
                </div>
              <CardDescription className="text-sm">{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} aria-label={`${project.progress}% complete`} />
                <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
                    <span>Due Date</span>
                    <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <div className="flex -space-x-2 overflow-hidden">
                    {project.members.map(member => (
                        <Avatar key={member.name} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
                <Button variant="ghost" size="sm">
                    View <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}