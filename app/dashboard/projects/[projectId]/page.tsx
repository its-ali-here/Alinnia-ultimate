"use client"

import { useEffect, useState } from 'react';
import { getProjectByIdAction } from '@/app/actions/projects';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Calendar, Users, Plus, CheckCircle, Circle, MoreHorizontal } from 'lucide-react';

// Dummy task data for now
const dummyTasks = [
    { id: '1', title: 'Design the main dashboard view', assignee: { full_name: 'Ali' }, status: 'done', priority: 'high', due_date: '2025-06-25' },
    { id: '2', title: 'Develop the authentication flow', assignee: { full_name: 'Fatima' }, status: 'in_progress', priority: 'high', due_date: '2025-07-01' },
    { id: '3', title: 'Set up the database schema for projects', assignee: { full_name: 'Zainab' }, status: 'todo', priority: 'medium', due_date: '2025-07-05' },
];


export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
    const { user } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProject = async () => {
            setIsLoading(true);
            const result = await getProjectByIdAction(params.projectId);
            if (result.error) {
                toast.error(result.error);
            } else {
                setProject(result.data);
            }
            setIsLoading(false);
        };

        if (params.projectId) {
            loadProject();
        }
    }, [params.projectId]);

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
                        <div className="flex items-center"><Calendar className="mr-2 h-4 w-4" /> Due on {new Date(project.due_date).toLocaleDateString()}</div>
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
                    <Button><Plus className="mr-2 h-4 w-4" /> Add Task</Button>
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
                            {dummyTasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell>
                                        {task.status === 'done' ? <CheckCircle className="h-5 w-5 text-green-500"/> : <Circle className="h-5 w-5 text-muted-foreground"/>}
                                    </TableCell>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell>{task.assignee.full_name}</TableCell>
                                    <TableCell><Badge variant={task.priority === 'high' ? 'destructive' : 'outline'}>{task.priority}</Badge></TableCell>
                                    <TableCell>{new Date(task.due_date).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right"><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}