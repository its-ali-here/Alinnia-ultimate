// components/analytics/dashboard-comment-sidebar.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MessageSquare, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { addCommentAction, getCommentsAction } from '@/app/actions/analytics';

// Define the type for a comment, derived from our server action's return type
type Comment = Awaited<ReturnType<typeof getCommentsAction>>['data'][number];

export function DashboardCommentSidebar({ dashboardId }: { dashboardId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    const result = await getCommentsAction({ dashboardId });
    if (result.error) {
      toast.error(result.error);
    } else {
      setComments(result.data || []);
    }
    setIsLoading(false);
  }, [dashboardId]);

  useEffect(() => {
    if (dashboardId) {
      fetchComments();
    }
  }, [dashboardId, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const result = await addCommentAction({ dashboardId, content: newComment });
    
    if (result.error) {
      toast.error(result.error);
    } else {
      setNewComment('');
      // Re-fetch comments to show the new one
      await fetchComments();
    }
    setIsSubmitting(false);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" />
          Comments
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Dashboard Comments</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-[calc(100%-4rem)] py-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No comments yet. Be the first to start a discussion!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={comment.author.avatar_url} />
                      <AvatarFallback>{comment.author.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{comment.author.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="mb-2"
              disabled={isSubmitting}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {isSubmitting ? 'Submitting...' : 'Submit Comment'}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}