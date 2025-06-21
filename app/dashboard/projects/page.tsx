"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Briefcase, Filter, ArrowRight, Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { createProjectAction, getProjectsForOrganizationAction } from "@/app/actions/projects"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case "Completed": return "default";
        case "At Risk": return "destructive";
        default: return "secondary";
    }
}

export default function ProjectsPage() {
  const { user, organizationId } = useAuth();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [projectName, setProjectName] = useState("")
  const [projectDesc, setProjectDesc] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const loadProjects = useCallback(async () => {
    if (!organizationId) return;
    setIsLoading(true);
    const result = await getProjectsForOrganizationAction(organizationId);
    if (result.error) {
        toast.error(result.error);
    } else {
        setProjects(result.data || []);
    }
    setIsLoading(false);
  }, [organizationId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);


  const handleCreateProject = async () => {
    if (!projectName || !dueDate) {
        toast.error("Project Name and Due Date are required.");
        return;
    }
    if (!user || !organizationId) {
        toast.error("You must be logged in to create a project.");
        return;
    }

    setIsCreating(true);
    
    try {
        const result = await createProjectAction({
            organizationId,
            userId: user.id,
            name: projectName,
            description: projectDesc,
            dueDate: dueDate.toISOString(),
        });

        if (result.error) {
            throw new Error(result.error);
        }

        toast.success(`Project "${projectName}" created successfully!`);
        setIsDialogOpen(false); 
        
        setProjectName("")
        setProjectDesc("")
        setDueDate(undefined)
        await loadProjects(); // Refresh the project list
    } catch (error) {
        toast.error((error as Error).message || "An unexpected error occurred.");
    } finally {
        setIsCreating(false);
    }
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
                            <Button variant="outline" disabled={isCreating}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleCreateProject} disabled={isCreating}>
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isCreating ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                    <CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-full" />
                    </CardContent>
                    <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                </Card>
            ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                        <span>{new Date(project.due_date).toLocaleDateString()}</span>
                    </div>
                </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <div className="flex -space-x-2 overflow-hidden">
                        {project.project_members.map((member: any) => (
                            <Avatar key={member.profiles.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                <AvatarImage src={member.profiles.avatar_url} />
                                <AvatarFallback>{member.profiles.full_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    <Link href={`/dashboard/projects/${project.id}`} passHref>
                        <Button variant="ghost" size="sm">
                            View <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
            ))}
        </div>
      )}
    </div>
  )
}