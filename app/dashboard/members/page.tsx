"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Mail, MoreHorizontal, UserMinus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  getOrganizationMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  getUserOrganizations,
} from "@/lib/database"
import { Users2 } from "lucide-react" // Import Users2 component
import { toast } from "sonner"

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

export default function MembersPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [userRole, setUserRole] = useState<string>("")
  const [organizationId, setOrganizationId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  useEffect(() => {
    if (user) {
      loadMembers()
    }
  }, [user])

  const loadMembers = async () => {
    try {
      // Get user's organization
      const orgs = await getUserOrganizations(user.id)
      if (orgs.length > 0) {
        const org = orgs[0]
        setOrganizationId(org.organization_id)
        setUserRole(org.role)

        // Load members
        const membersData = await getOrganizationMembers(org.organization_id)
        setMembers(membersData)
      }
    } catch (error) {
      console.error("Error loading members:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async () => {
    try {
      await inviteMember(organizationId, inviteEmail, inviteRole, user.id)
      setInviteEmail("")
      setInviteRole("member")
      setIsInviteOpen(false)
      loadMembers()
      toast.success("Member invited successfully!")
    } catch (error) {
      toast.error("Error inviting member: " + (error as Error).message)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole(memberId, newRole)
      loadMembers()
      toast.success("Role updated successfully!")
    } catch (error) {
      toast.error("Error updating role: " + (error as Error).message)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      try {
        await removeMember(memberId)
        loadMembers()
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
      case "administrator":
        return "bg-red-100 text-red-800"
      case "team_leader":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage your organization members and their roles</p>
        </div>
        {canManageMembers && (
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Member</DialogTitle>
                <DialogDescription>Send an invitation to join your organization</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="team_leader">Team Leader</SelectItem>
                      {userRole === "administrator" && <SelectItem value="administrator">Administrator</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInviteMember} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={member.profiles.avatar_url || "/placeholder.svg"}
                      alt={member.profiles.full_name}
                    />
                    <AvatarFallback>
                      {member.profiles.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.profiles.full_name}</CardTitle>
                    <Badge className={getRoleBadgeColor(member.role)}>{member.role.replace("_", " ")}</Badge>
                  </div>
                </div>
                {canManageMembers && member.profiles.id !== user.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(canManageTeamLeaders || member.role === "member") && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, "member")}
                            disabled={member.role === "member"}
                          >
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, "team_leader")}
                            disabled={member.role === "team_leader"}
                          >
                            Make Team Leader
                          </DropdownMenuItem>
                          {canManageTeamLeaders && (
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(member.id, "administrator")}
                              disabled={member.role === "administrator"}
                            >
                              Make Administrator
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      <DropdownMenuItem onClick={() => handleRemoveMember(member.id)} className="text-red-600">
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Joined {new Date(member.joined_at).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No members yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building your team by inviting members to your organization.
            </p>
            {canManageMembers && (
              <Button onClick={() => setIsInviteOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Invite First Member
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
