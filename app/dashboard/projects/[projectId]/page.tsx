"use client"

import { useEffect, useState, useCallback } from 'react';
import { format } from "date-fns";
import { 
  getProjectByIdAction, 
  createTaskAction, 
  updateTaskStatusAction, 
  getOrganizationMembersForProjectInviteAction,
  addMemberToProjectAction,
  deleteTaskAction,
  updateTaskAction
  updateProjectIconAction
} from '@/app/actions/projects';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Clock, Calendar as CalendarIcon, Users, Plus, CheckCircle, Circle, MoreHorizontal, Loader2, UserPlus, Briefcase } from 'lucide-react';
import { IconPicker } from '@/components/projects/icon-picker';

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
    const { user, organizationId } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskAssigneeId, setTaskAssigneeId] = useState<string | undefined>();
    const [taskPriority, setTaskPriority] = useState("medium");
    const [taskDueDate, setTaskDueDate] = useState<Date | undefined>();

    const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
    const [potentialMembers, setPotentialMembers] = useState<any[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>();
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<any>(null);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<any>(null);
    const [isDeletingTask, setIsDeletingTask] = useState(false);
    const [editTaskTitle, setEditTaskTitle] = useState("");
    const [editTaskDescription, setEditTaskDescription] = useState("");
    const [editTaskAssigneeId, setEditTaskAssigneeId] = useState<string | undefined>();
    const [editTaskPriority, setEditTaskPriority] = useState("medium");
    const [editTaskDueDate, setEditTaskDueDate] = useState<Date | undefined>();
    const [isUpdatingTask, setIsUpdatingTask] = useState(false);

    useEffect(() => {
        if (taskToEdit) {
            setEditTaskTitle(taskToEdit.title || "");
            setEditTaskDescription(taskToEdit.description || "");
            setEditTaskAssigneeId(taskToEdit.assignee_id || undefined);
            setEditTaskPriority(taskToEdit.priority || "medium");
            setEditTaskDueDate(taskToEdit.due_date ? new Date(taskToEdit.due_date) : undefined);
        }
    }, [taskToEdit]);

    const loadProject = useCallback(async () => {
        const result = await getProjectByIdAction(params.projectId);
        if (result.error) {
            toast.error(result.error);
            setProject(null);
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

    useEffect(() => {
        const fetchPotentialMembers = async () => {
            if (isMemberDialogOpen && organizationId) {
                const result = await getOrganizationMembersForProjectInviteAction(organizationId, params.projectId);
                if (result.data) {
                    setPotentialMembers(result.data);
                }
            }
        };
        fetchPotentialMembers();
    }, [isMemberDialogOpen, organizationId, params.projectId]);

    const handleCreateTask = async () => {
        if (!taskTitle) {
            toast.error("Task title is required.");
            return;
        }
        if (!user) {
            toast.error("You must be logged in.");
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
            await loadProject(); // Refresh the project data
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsCreatingTask(false);
            setIsTaskDialogOpen(false);
            // Reset form
            setTaskTitle("");
            setTaskDescription("");
            setTaskAssigneeId(undefined);
            setTaskPriority("medium");
            setTaskDueDate(undefined);
        }
    };
    
    const handleStatusChange = async (task: any) => {
        const currentStatus = task.status;
        const newStatus = currentStatus === 'to_do' ? 'in_progress' : currentStatus === 'in_progress' ? 'done' : 'to_do';
    
        try {
            const result = await updateTaskStatusAction({
                projectId: params.projectId,
                taskId: task.id,
                status: newStatus,
            });
            if (result.error) throw new Error(result.error);
            toast.success(`Task status updated to "${newStatus.replace('_', ' ')}".`);
            await loadProject();
        } catch (error) {
            toast.error((error as Error).message);
        }
    };

    const handleAddMember = async () => {
        if (!selectedMemberId) {
            toast.error("Please select a member to add.");
            return;
        }
        setIsAddingMember(true);
        try {
            const result = await addMemberToProjectAction(params.projectId, selectedMemberId);
            if (result.error) throw new Error(result.error);
            toast.success("Member added successfully!");
            setIsMemberDialogOpen(false);
            setSelectedMemberId(undefined);
            await loadProject();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsAddingMember(false);
        }
    };

    // Place these inside the ProjectDetailPage component

const handleOpenEditDialog = (task: any) => {
    setTaskToEdit(task);
    setIsEditTaskOpen(true);
};

// Replace the existing handleUpdateTask function with this

const handleUpdateTask = async () => {
    if (!taskToEdit) return;

    setIsUpdatingTask(true);
    try {
        const updates = {
            title: editTaskTitle,
            description: editTaskDescription,
            assignee_id: editTaskAssigneeId,
            priority: editTaskPriority,
            due_date: editTaskDueDate?.toISOString(),
        };

        const result = await updateTaskAction({
            projectId: params.projectId,
            taskId: taskToEdit.id,
            updates,
        });

        if (result.error) throw new Error(result.error);

        toast.success("Task updated successfully!");
        setIsEditTaskOpen(false);
        setTaskToEdit(null);
        await loadProject();
    } catch (error) {
        toast.error((error as Error).message);
    } finally {
        setIsUpdatingTask(false);
    }
};

const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeletingTask(true);
    try {
        const result = await deleteTaskAction({
            projectId: params.projectId,
            taskId: taskToDelete.id,
        });
        if (result.error) throw new Error(result.error);
        toast.success("Task deleted successfully!");
        setTaskToDelete(null);
        await loadProject();
    } catch (error) {
        toast.error((error as Error).message);
    } finally {
        setIsDeletingTask(false);
    }
};

    if (isLoading) { /* ... (loading skeleton is the same) ... */ }
    
    // BUG FIX: Added this check to prevent crash when project is null
    if (!project) {
        return <div className="p-6 text-center text-lg text-muted-foreground">Project not found or you do not have permission to view it.</div>
    }

    return (
        <div className="flex-1 space-y-6 p-4 lg:p-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <IconPicker
                            currentIcon={project.icon || "Briefcase"}
                            onIconChange={async (iconName) => {
                                await updateProjectIconAction({ projectId: project.id, icon: iconName });
                                await loadProject(); // Refresh to show new icon
                            }}
                        />
                        <div>
                            <CardTitle className="text-2xl">{project.name}</CardTitle>
                            <CardDescription>{project.description || "No description provided."}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    {/* ... CardContent remains the same ... */}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Tasks</CardTitle>
                    <div className="flex items-center gap-2">
                        {/* Add Member Dialog */}
                        <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline"><UserPlus className="mr-2 h-4 w-4" /> Add Member</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add Member to Project</DialogTitle>
                                    <DialogDescription>Select a member from your organization to add to this project.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <Label htmlFor="member-select">Organization Member</Label>
                                    <Select onValueChange={setSelectedMemberId}>
                                        <SelectTrigger id="member-select">
                                            <SelectValue placeholder="Select a member..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {potentialMembers.length > 0 ? potentialMembers.map(member => (
                                                <SelectItem key={member.id} value={member.id}>{member.full_name}</SelectItem>
                                            )) : <div className="p-4 text-sm text-muted-foreground">No new members to add.</div>}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="outline" disabled={isAddingMember}>Cancel</Button></DialogClose>
                                    <Button onClick={handleAddMember} disabled={isAddingMember || !selectedMemberId}>
                                        {isAddingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Add to Project
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Add Task Dialog */}
                        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="mr-2 h-4 w-4" /> Add Task</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Create New Task</DialogTitle>
                                    <DialogDescription>Fill in the details for the new task.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="task-title">Title</Label>
                                        <Input id="task-title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g., Design the homepage" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="task-assignee">Assignee</Label>
                                        <Select onValueChange={setTaskAssigneeId}>
                                            <SelectTrigger id="task-assignee">
                                                <SelectValue placeholder="Select a member" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {project.project_members.map((member: any) => (
                                                    <SelectItem key={member.profiles.id} value={member.profiles.id}>
                                                        {member.profiles.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="task-priority">Priority</Label>
                                        <Select value={taskPriority} onValueChange={setTaskPriority}>
                                            <SelectTrigger id="task-priority">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                    <Button onClick={handleCreateTask} disabled={isCreatingTask}>
                                        {isCreatingTask && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Task
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
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
                            {project.tasks && project.tasks.length > 0 ? project.tasks.map((task: any) => (
                                <TableRow
                                    key={task.id}
                                    className={cn(
                                        "transition-opacity",
                                        task.status === 'done' && "text-muted-foreground opacity-50"
                                )}
                            >
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStatusChange(task)}>
                                            {getStatusIcon(task.status)}
                                        </Button>
                                    </TableCell>
                                    <TableCell className={cn(
                                        "font-medium relative",
                                        task.status === 'done' && "after:absolute after:left-0 after:top-1/2 after:h-[1px] after:w-full after:bg-muted-foreground after:animate-in after:fade-in after:slide-in-from-left-0"
                                    )}>
                                        {task.title}
                                    </TableCell>
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
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleOpenEditDialog(task)}>
                                                    Edit Task
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => setTaskToDelete(task)} className="text-red-600">
                                                    Delete Task
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
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
            {/* Add these dialogs at the end, inside the main div */}
            {taskToEdit && (
                <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Task</DialogTitle>
                            <DialogDescription>Make changes to your task here. Click save when you're done.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-task-title">Title</Label>
                                <Input id="edit-task-title" value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-task-assignee">Assignee</Label>
                                <Select value={editTaskAssigneeId} onValueChange={setEditTaskAssigneeId}>
                                    <SelectTrigger id="edit-task-assignee">
                                        <SelectValue placeholder="Select a member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {project.project_members.map((member: any) => (
                                            <SelectItem key={member.profiles.id} value={member.profiles.id}>
                                                {member.profiles.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-task-priority">Priority</Label>
                                <Select value={editTaskPriority} onValueChange={setEditTaskPriority}>
                                    <SelectTrigger id="edit-task-priority">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-task-due-date">Due Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !editTaskDueDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editTaskDueDate ? format(editTaskDueDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={editTaskDueDate} onSelect={setEditTaskDueDate} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditTaskOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateTask} disabled={isUpdatingTask}>
                                {isUpdatingTask && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task
                            "{taskToDelete?.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTask} disabled={isDeletingTask}>
                            {isDeletingTask && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}