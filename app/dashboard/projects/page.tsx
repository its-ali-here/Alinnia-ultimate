"use client"

import { useState, useEffect, useCallback } from "react" // 1. ADD useCallback
import { format } from "date-fns"
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
import { Skeleton } from "@/components/ui/skeleton" // 2. ADD Skeleton import
import { cn } from "@/lib/utils"
import { createProjectAction, getProjectsForOrganizationAction } from "@/app/actions/projects" // 3. IMPORT get action
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

// We no longer need the dummy data array

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case "Completed": return "default";
        case "At Risk": return "destructive";
        default: return "secondary";
    }
}

export default function ProjectsPage() {
  const { user, organizationId } = useAuth();
  
  // 4. ADD state for projects list and loading states
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [projectName, setProjectName] = useState("")
  const [projectDesc, setProjectDesc] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // 5. ADD function to load projects from the database
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

  // 6. ADD useEffect to load projects when the page loads
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
        {/* ... Header remains the same ... */}
        <div>...</div>
        <div className="flex items-center gap-2">...</div>
      </div>

      {/* 7. ADD loading state UI */}
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
        // 8. UPDATE the grid to use the live 'projects' state
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
                    <Button variant="ghost" size="sm">
                        View <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
            ))}
        </div>
      )}
    </div>
  )
}