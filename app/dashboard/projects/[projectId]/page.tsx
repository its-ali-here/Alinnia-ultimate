// app/dashboard/projects/[projectId]/page.tsx
"use client"

import { useEffect, useState, useCallback } from 'react';
import { format } from "date-fns";
import { getProjectByIdAction, createTaskAction } from '@/app/actions/projects';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Clock, Calendar as CalendarIcon, Users, Plus, CheckCircle, Circle, MoreHorizontal, Loader2 } from 'lucide-react';

const getStatusIcon = (status: string) => {
    switch(status) {
        case 'done': return <CheckCircle className="h-5 w-5 text-green-500"/>;
        case 'in_progress': return <Clock className="h-5 w-5 text-blue-500"/>
        default: return <Circle className="h-5 w-5 text-muted-foreground"/>;
    }
}

const getPriorityBadge = (priority: string) => {
    switch(priority) {
        case 'high': return <Badge variant="destructive">High</Badge>;
        case 'low': return <Badge variant="outline">Low</Badge>;
        default: return <Badge variant="secondary">Medium</Badge>;
    }
}

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
    const { user } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskAssigneeId, setTaskAssigneeId] = useState<string | undefined>();
    const [taskPriority, setTaskPriority] = useState("medium");
    const [taskDueDate, setTaskDueDate] = useState<Date | undefined>();

    // We restored the full data fetching logic in the server action, so this now works
    const loadProject = useCallback(async () => {
        const result = await getProjectByIdAction(params.projectId);
        if (result.error) {
            toast.error(result.error);
        } else {
            setProject(result.data);
        }
        setIsLoading(false);
    }, [params.projectId]);

    useEffect(() => {
        if (params.projectId) {
            setIsLoading(true);
            loadProject();
        }
    }, [params.projectId, loadProject]);

    const handleCreateTask = async () => {
        if (!taskTitle) {
            toast.error("Task title is required.");
            return;
        }
        if (!user) {
            toast.error("You must be logged in to create a task.");
            return;
        }

        setIsCreatingTask(true);
        try {
            const result = await createTaskAction({
                projectId: params.projectId,
                userId: user.id,
                title: taskTitle,
                description: taskDescription,
                assigneeId: taskAssigneeId,
                priority: taskPriority,
                dueDate: taskDueDate?.toISOString(),
            });

            if (result.error) throw new Error(result.error);
            
            toast.success("Task created successfully!");
            
            setTaskTitle("");
            setTaskDescription("");
            setTaskAssigneeId(undefined);
            setTaskPriority("medium");
            setTaskDueDate(undefined);
            setIsTaskDialogOpen(false);
            
            await loadProject();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsCreatingTask(false);
        }
    };


    if (isLoading) {
        return (
            <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
                <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
            </div>
        );
    }
    
    if (!project) {
        return <div className="p-6">Project not found.</div>
    }

    return (
        <div className="flex-1 space-y-6 p-4 lg:p-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{project.name}</CardTitle>
                            <CardDescription className="mt-2">{project.description}</CardDescription>
                        </div>
                        <Badge variant="secondary">{project.status}</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground pt-4">
                        <div className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4" /> Due on {new Date(project.due_date).toLocaleDateString()}</div>
                        <div className="flex items-center"><Users className="mr-2 h-4 w-4" /> {project.project_members.length} Members</div>
                        <div className="flex items-center -space-x-2">
                            {project.project_members.map((member: any) => (
                                <Avatar key={member.profiles.id} className="h-6 w-6 border-2 border-background">
                                    <AvatarImage src={member.profiles.avatar_url} />
                                    <AvatarFallback>{member.profiles.full_name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Tasks</CardTitle>
                    <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Add Task</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px]">
                            <DialogHeader>
                                <DialogTitle>Add New Task</DialogTitle>
                                <DialogDescription>Fill in the details for the new task in the "{project.name}" project.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="task-title">Task Title</Label>
                                    <Input id="task-title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g., Finalize UI mockups" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="task-description">Description (Optional)</Label>
                                    <Textarea id="task-description" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Add more details about the task..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="task-assignee">Assign To</Label>
                                        <Select value={taskAssigneeId} onValueChange={setTaskAssigneeId}>
                                            <SelectTrigger><SelectValue placeholder="Select a member" /></SelectTrigger>
                                            <SelectContent>
                                                {project.project_members.map((member: any) => (
                                                    <SelectItem key={member.profiles.id} value={member.profiles.id}>{member.profiles.full_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="task-priority">Priority</Label>
                                        <Select value={taskPriority} onValueChange={setTaskPriority}>
                                            <SelectTrigger><SelectValue placeholder="Set priority" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                     <Label htmlFor="task-due-date">Due Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !taskDueDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {taskDueDate ? format(taskDueDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={taskDueDate} onSelect={setTaskDueDate} initialFocus /></PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline" disabled={isCreatingTask}>Cancel</Button></DialogClose>
                                <Button onClick={handleCreateTask} disabled={isCreatingTask}>
                                    {isCreatingTask && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isCreatingTask ? 'Adding Task...' : 'Add Task'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Task</TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* THIS IS THE KEY CHANGE: We now map over project.tasks */}
                            {project.tasks.length > 0 ? project.tasks.map((task: any) => (
                                <TableRow key={task.id}>
                                    <TableCell>{getStatusIcon(task.status)}</TableCell>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell>
                                        {task.assignee ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6"><AvatarImage src={task.assignee.avatar_url} /><AvatarFallback>{task.assignee.full_name?.charAt(0)}</AvatarFallback></Avatar>
                                                <span>{task.assignee.full_name}</span>
                                            </div>
                                        ) : <span className="text-muted-foreground">Unassigned</span>}
                                    </TableCell>
                                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                                    <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell className="text-right"><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No tasks yet. Create one to get started!</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}