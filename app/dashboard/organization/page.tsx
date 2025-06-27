"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { updateOrganizationDetailsAction, updateOrganizationLogoAction } from "@/app/actions/organization"
import { getOrganizationMembers, inviteMember, updateMemberRole, removeMember } from "@/lib/database"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Building, Copy, Edit, Upload, Mail, Phone, Globe, Briefcase, MapPin, Users2, Plus, MoreHorizontal, UserMinus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea";

export default function OrganizationPage() {
  const { user, organization, userRole, loading: authLoading, refreshOrganization } = useAuth();
  
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [isEditOrgOpen, setIsEditOrgOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedDetails, setEditedDetails] = useState<any>({});
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const loadMembers = useCallback(async () => {
    if (!organization) return;
    setLoadingMembers(true);
    try {
      const membersData = await getOrganizationMembers(organization.id);
      setMembers(membersData);
    } catch (error) {
      toast.error("Failed to load team members.");
    } finally {
      setLoadingMembers(false);
    }
  }, [organization]);

  useEffect(() => {
    if (organization) {
        loadMembers();
        setEditedDetails(organization);
    }
  }, [organization, loadMembers]);

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedDetails({ ...editedDetails, [e.target.id]: e.target.value });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const result = await updateOrganizationDetailsAction({ organizationId: organization.id, updates: editedDetails });
      if (result.error) throw new Error(result.error);
      toast.success("Organization details saved!");
      setIsEditOrgOpen(false);
      await refreshOrganization();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const file = event.target.files[0];
      const filePath = `${organization.id}/logo-${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('organization-logos').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('organization-logos').getPublicUrl(filePath);
      await updateOrganizationLogoAction({ organizationId: organization.id, logoUrl: data.publicUrl });
      toast.success("Logo uploaded!");
      await refreshOrganization();
    } catch (error) {
      toast.error("Logo upload failed: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!organization || !user) return;
    try {
      await inviteMember(organization.id, inviteEmail, inviteRole, user.id);
      setIsInviteOpen(false);
      toast.success("Member invite simulation successful.");
    } catch (error) {
      toast.error("Error inviting member: " + (error as Error).message)
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole(memberId, newRole);
      await loadMembers();
      toast.success("Role updated successfully!");
    } catch (error) {
      toast.error("Error updating role: " + (error as Error).message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      try {
        await removeMember(memberId);
        await loadMembers();
        toast.success("Member removed successfully!");
      } catch (error) {
        toast.error("Error removing member: " + (error as Error).message);
      }
    }
  };

  const canManageOrg = userRole === "owner" || userRole === "administrator";
  const canManageTeamLeaders = userRole === "administrator";

  if (authLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }
  
  if (!organization) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[60vh]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Building className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No Organization Found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                It seems you're not part of an organization yet.
            </p>
            <Link href="/onboarding">
                <Button>Set Up or Join an Organization</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border">
                <AvatarImage src={organization.logo_url} alt={organization.name} />
                <AvatarFallback><Building className="h-10 w-10 text-muted-foreground"/></AvatarFallback>
              </Avatar>
              {canManageOrg && (
                <Label htmlFor="logo-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {isUploading ? <div className="h-6 w-6 border-2 rounded-full border-t-transparent animate-spin" /> : <Upload className="h-6 w-6"/>}
                  <Input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} />
                </Label>
              )}
            </div>
            <div>
                <CardTitle className="text-2xl">{organization?.name}</CardTitle>
                <CardDescription>{organization.description || "Add a description for your organization."}</CardDescription>
                 <div className="flex items-center space-x-2 mt-4">
                    <Label>Organization Code:</Label>
                    <Badge variant="outline">{organization?.organization_code}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => {navigator.clipboard.writeText(organization.organization_code); toast.success("Code copied!")}}><Copy className="h-4 w-4" /></Button>
                </div>
            </div>
          </div>
          {canManageOrg && (
            <Dialog open={isEditOrgOpen} onOpenChange={setIsEditOrgOpen}>
              <DialogTrigger asChild><Button variant="outline" size="icon"><Edit className="h-4 w-4"/></Button></DialogTrigger>
              <DialogContent>
                  <DialogHeader><DialogTitle>Edit Organization Details</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                      <div className="space-y-1"><Label htmlFor="name">Name</Label><Input id="name" value={editedDetails.name || ''} onChange={handleDetailChange} /></div>
                      <div className="space-y-1"><Label htmlFor="description">Description</Label><Textarea id="description" value={editedDetails.description || ''} onChange={handleDetailChange} /></div>
                      <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" value={editedDetails.email || ''} onChange={handleDetailChange} /></div>
                      <div className="space-y-1"><Label htmlFor="phone">Phone</Label><Input id="phone" value={editedDetails.phone || ''} onChange={handleDetailChange} /></div>
                      <div className="space-y-1"><Label htmlFor="industry">Industry</Label><Input id="industry" value={editedDetails.industry || ''} onChange={handleDetailChange} /></div>
                      <div className="space-y-1"><Label htmlFor="city">City</Label><Input id="city" value={editedDetails.city || ''} onChange={handleDetailChange} /></div>
                      <div className="space-y-1"><Label htmlFor="country">Country</Label><Input id="country" value={editedDetails.country || ''} onChange={handleDetailChange} /></div>
                  </div>
                  <DialogFooter><Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="border-t pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground"/><span>{organization.email || 'N/A'}</span></div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/><span>{organization.phone || 'N/A'}</span></div>
            <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground"/><span>{organization.industry || 'N/A'}</span></div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground"/><span>{`${organization.city || 'N/A'}, ${organization.country || 'N/A'}`}</span></div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage your organization members and their roles.</CardDescription>
            </div>
            {canManageOrg && (
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Invite Member</Button></DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite New Member</DialogTitle>
                        <DialogDescription>Enter an email to invite a new member to your organization.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" placeholder="name@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}/></div>
                        <div className="space-y-2"><Label htmlFor="role">Role</Label><Select value={inviteRole} onValueChange={setInviteRole}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="member">Member</SelectItem><SelectItem value="team_leader">Team Leader</SelectItem>{canManageTeamLeaders && <SelectItem value="administrator">Administrator</SelectItem>}</SelectContent></Select></div>
                    </div>
                    <DialogFooter><Button onClick={handleInviteMember} className="w-full"><Mail className="h-4 w-4 mr-2" />Send Invitation</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </CardHeader>
        <CardContent>
            {loadingMembers ? <Skeleton className="h-32 w-full"/> : (
                members.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {members.map((member) => (
                        <Card key={member.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center space-x-3"><Avatar className="h-10 w-10"><AvatarImage src={member.profiles.avatar_url} /><AvatarFallback>{member.profiles.full_name?.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback></Avatar><div><p className="font-semibold">{member.profiles.full_name}</p><p className="text-xs text-muted-foreground">{member.profiles.designation || 'Member'}</p></div></div>
                                {canManageOrg && user?.id !== member.profiles.id && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, "member")}>Set as Member</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, "team_leader")}>Set as Team Leader</DropdownMenuItem>
                                            {canManageTeamLeaders && <DropdownMenuItem onClick={() => handleRoleChange(member.id, "administrator")}>Set as Administrator</DropdownMenuItem>}
                                            <DropdownMenuItem className="text-red-500" onClick={() => handleRemoveMember(member.id)}>Remove Member</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </CardHeader>
                            <CardContent>
                                <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="capitalize">{member.role}</Badge>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users2 className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No other members yet</h3>
                        <p className="text-muted-foreground mb-4">Start building your team by inviting members.</p>
                    </div>
                )
            )}
        </CardContent>
      </Card>
    </div>
  )
}