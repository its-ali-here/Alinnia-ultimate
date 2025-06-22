"use client"

import { useEffect, useState, useCallback } from 'react';
import { format } from "date-fns";
import { 
  getProjectByIdAction, 
  createTaskAction, 
  updateTaskStatusAction, 
  getOrganizationMembersForProjectInviteAction,
  addMemberToProjectAction
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Clock, Calendar as CalendarIcon, Users, Plus, CheckCircle, Circle, MoreHorizontal, Loader2, UserPlus } from 'lucide-react';

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

    const handleCreateTask = async () => { /* ... (no changes here) ... */ };
    const handleStatusChange = async (task: any) => { /* ... (no changes here) ... */ };

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

    if (isLoading) { /* ... (loading skeleton is the same) ... */ }
    
    // BUG FIX: Added this check to prevent crash when project is null
    if (!project) {
        return <div className="p-6 text-center text-lg text-muted-foreground">Project not found or you do not have permission to view it.</div>
    }

    return (
        <div className="flex-1 space-y-6 p-4 lg:p-6">
            <Card>
                <CardHeader>
                    {/* ... (Project header content is the same) ... */}
                </CardHeader>
            </Card>

            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Tasks</CardTitle>
                    <div className="flex items-center gap-2">
                        {/* ADD MEMBER DIALOG TRIGGER */}
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
                        {/* ADD TASK DIALOG TRIGGER */}
                        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                           {/* ... (Add Task Dialog remains the same) ... */}
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
                            {/* BUG FIX: Check if project.tasks exists before mapping */}
                            {project.tasks && project.tasks.length > 0 ? project.tasks.map((task: any) => (
                                <TableRow key={task.id}>
                                    <TableCell>
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