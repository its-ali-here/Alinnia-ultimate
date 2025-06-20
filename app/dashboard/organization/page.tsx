"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Mail, MoreHorizontal, UserMinus, Users2, Building, Copy } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getOrganizationMembers, inviteMember, updateMemberRole, removeMember, getUserOrganizations } from "@/lib/database"
import { toast } from "sonner"

// We can define our types here for clarity
interface Member {
  id: string
  role: string
  joined_at: string
  profiles: {
    id: string
    full_name: string
    avatar_url: string
  }
}

interface Organization {
    id: string;
    name: string;
    organization_code: string;
}

export default function OrganizationPage() {
  const { user } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([])
  const [userRole, setUserRole] = useState<string>("")
  
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  // Corrected function in app/dashboard/organization/page.tsx
  const loadData = async () => {
    setLoading(true);
    try {
      // This one call now gets us the role and the full organization object
      const orgMembership = await getUserOrganizations(user.id);

      // Check that we got back a valid membership and organization
      if (orgMembership && orgMembership.organization) {
        setUserRole(orgMembership.role);
        setOrganization(orgMembership.organization); // We already have the org details! No second query needed.

        // Now, load the members for that organization
        const membersData = await getOrganizationMembers(orgMembership.organization.id);
        setMembers(membersData);
      }
    } catch (error) {
      console.error("Error loading organization data:", error);
      toast.error("Failed to load organization data.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyCode = () => {
    if(!organization?.organization_code) return;
    navigator.clipboard.writeText(organization.organization_code);
    toast.success("Organization code copied to clipboard!");
  }

  // --- Member management functions (copied from members/page.tsx) ---
  const handleInviteMember = async () => {
    if (!organization) return;
    try {
      await inviteMember(organization.id, inviteEmail, inviteRole, user.id)
      setInviteEmail("")
      setInviteRole("member")
      setIsInviteOpen(false)
      loadData() // Reload all data
      toast.success("Member invited successfully!")
    } catch (error) {
      toast.error("Error inviting member: " + (error as Error).message)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole(memberId, newRole)
      loadData()
      toast.success("Role updated successfully!")
    } catch (error) {
      toast.error("Error updating role: " + (error as Error).message)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      try {
        await removeMember(memberId)
        loadData()
        toast.success("Member removed successfully!")
      } catch (error) {
        toast.error("Error removing member: " + (error as Error).message)
      }
    }
  }

  const canManageMembers = userRole === "administrator" || userRole === "team_leader"
  const canManageTeamLeaders = userRole === "administrator"

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "administrator": return "bg-red-100 text-red-800";
      case "team_leader": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* --- Section 1: Organization Details --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
                <AvatarFallback>
                    <Building className="h-8 w-8 text-muted-foreground"/>
                </AvatarFallback>
            </Avatar>
            <div>
                <CardTitle className="text-2xl">{organization?.name || "Organization"}</CardTitle>
                <CardDescription>Manage your organization details and members.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-center space-x-2">
                <Label>Organization Code:</Label>
                <Badge variant="outline">{organization?.organization_code}</Badge>
                <Button variant="ghost" size="icon" onClick={handleCopyCode}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </CardContent>
      </Card>
      
      {/* --- Section 2: Members Management --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage your organization members and their roles.</CardDescription>
            </div>
            {canManageMembers && (
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Invite Member</Button></DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite New Member</DialogTitle>
                        <DialogDescription>Send an invitation to join your organization.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" placeholder="Enter email address" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}/></div>
                        <div className="space-y-2"><Label htmlFor="role">Role</Label><Select value={inviteRole} onValueChange={setInviteRole}><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent><SelectItem value="member">Member</SelectItem><SelectItem value="team_leader">Team Leader</SelectItem>{userRole === "administrator" && <SelectItem value="administrator">Administrator</SelectItem>}</SelectContent></Select></div>
                        <Button onClick={handleInviteMember} className="w-full"><Mail className="h-4 w-4 mr-2" />Send Invitation</Button>
                    </div>
                    </DialogContent>
                </Dialog>
            )}
        </CardHeader>
        <CardContent>
            {members.length > 0 ? (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {members.map((member) => (
                    <Card key={member.id}>
                        <CardHeader className="pb-3"><div className="flex items-center justify-between"><div className="flex items-center space-x-3"><Avatar className="h-12 w-12"><AvatarImage src={member.profiles.avatar_url || "/placeholder.svg"} alt={member.profiles.full_name} /><AvatarFallback>{member.profiles.full_name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar><div><CardTitle className="text-lg">{member.profiles.full_name}</CardTitle><Badge className={getRoleBadgeColor(member.role)}>{member.role.replace("_", " ")}</Badge></div></div>{canManageMembers && member.profiles.id !== user.id && (<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{(canManageTeamLeaders || member.role === "member") && (<><DropdownMenuItem onClick={() => handleRoleChange(member.id, "member")} disabled={member.role === "member"}>Make Member</DropdownMenuItem><DropdownMenuItem onClick={() => handleRoleChange(member.id, "team_leader")} disabled={member.role === "team_leader"}>Make Team Leader</DropdownMenuItem>{canManageTeamLeaders && (<DropdownMenuItem onClick={() => handleRoleChange(member.id, "administrator")} disabled={member.role === "administrator"}>Make Administrator</DropdownMenuItem>)}</>)}<DropdownMenuItem onClick={() => handleRemoveMember(member.id)} className="text-red-600"><UserMinus className="h-4 w-4 mr-2" />Remove Member</DropdownMenuItem></DropdownMenuContent></DropdownMenu>)}</div></CardHeader>
                        <CardContent><p className="text-sm text-muted-foreground">Joined {new Date(member.joined_at).toLocaleDateString()}</p></CardContent>
                    </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No members yet</h3>
                    <p className="text-muted-foreground mb-4">Start building your team by inviting members.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}