"use client"

import { useEffect, useState, useCallback } from 'react';
import { format } from "date-fns";
// 1. IMPORT THE NEW ACTION
import { getProjectByIdAction, createTaskAction, updateTaskStatusAction } from '@/app/actions/projects';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
// ... (all other imports remain the same)
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

const getStatusIcon = (status: string) => { /* ... (no changes here) ... */ };
const getPriorityBadge = (priority: string) => { /* ... (no changes here) ... */ };

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

    const loadProject = useCallback(async () => { /* ... (no changes here) ... */ }, [params.projectId]);

    useEffect(() => { /* ... (no changes here) ... */ }, [params.projectId, loadProject]);

    const handleCreateTask = async () => { /* ... (no changes here) ... */ };

    // 2. ADD THIS NEW HANDLER FOR UPDATING TASK STATUS
    const handleStatusChange = async (task: any) => {
        const currentStatus = task.status;
        const nextStatus = currentStatus === 'todo' ? 'in_progress' : currentStatus === 'in_progress' ? 'done' : 'todo';
        
        // Optimistic UI update (optional, but makes the UI feel faster)
        setProject((prevProject: any) => ({
            ...prevProject,
            tasks: prevProject.tasks.map((t: any) => t.id === task.id ? { ...t, status: nextStatus } : t)
        }));

        const result = await updateTaskStatusAction({
            projectId: params.projectId,
            taskId: task.id,
            status: nextStatus,
        });

        if (result.error) {
            toast.error(result.error);
            // Revert optimistic update on error
             setProject((prevProject: any) => ({
                ...prevProject,
                tasks: prevProject.tasks.map((t: any) => t.id === task.id ? { ...t, status: currentStatus } : t)
            }));
        } else {
             toast.success("Task status updated!");
        }
    };


    if (isLoading) { /* ... (no changes here) ... */ }
    if (!project) { /* ... (no changes here) ... */ }

    return (
        <div className="flex-1 space-y-6 p-4 lg:p-6">
            {/* ... (Project Details Card is the same) ... */}

            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    {/* ... (CardHeader content is the same, including the Dialog for adding tasks) ... */}
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                           {/* ... (TableHeader content is the same) ... */}
                        </TableHeader>
                        <TableBody>
                            {project.tasks.length > 0 ? project.tasks.map((task: any) => (
                                <TableRow key={task.id}>
                                    <TableCell>
                                        {/* 3. MAKE THE STATUS ICON A CLICKABLE BUTTON */}
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStatusChange(task)}>
                                            {getStatusIcon(task.status)}
                                        </Button>
                                    </TableCell>
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