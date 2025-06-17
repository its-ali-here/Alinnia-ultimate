"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Eye, Edit, Trash2 } from "lucide-react"
import { getOrganizationMembers, getUserPermissions, updatePermission, getUserOrganizations } from "@/lib/database"

interface Member {
  id: string
  role: string
  profiles: {
    id: string
    full_name: string
    avatar_url: string
  }
}

interface Permission {
  permission_type: string
  can_read: boolean
  can_write: boolean
  can_delete: boolean
}

const permissionTypes = [
  { key: "accounts", label: "Accounts", description: "Manage financial accounts" },
  { key: "transactions", label: "Transactions", description: "View and manage transactions" },
  { key: "budgets", label: "Budgets", description: "Create and manage budgets" },
  { key: "reports", label: "Reports", description: "Generate and view reports" },
  { key: "settings", label: "Settings", description: "Modify organization settings" },
]

export default function PermissionsPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [userRole, setUserRole] = useState<string>("")
  const [organizationId, setOrganizationId] = useState<string>("")
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
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

        // Load permissions for each member
        const permissionsData: Record<string, Permission[]> = {}
        for (const member of membersData) {
          const memberPermissions = await getUserPermissions(org.organization_id, member.profiles.id)
          permissionsData[member.profiles.id] = memberPermissions
        }
        setPermissions(permissionsData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = async (
    memberId: string,
    permissionType: string,
    field: "can_read" | "can_write" | "can_delete",
    value: boolean,
  ) => {
    try {
      const currentPermission = permissions[memberId]?.find((p) => p.permission_type === permissionType) || {
        can_read: false,
        can_write: false,
        can_delete: false,
      }

      await updatePermission(
        organizationId,
        memberId,
        permissionType,
        {
          ...currentPermission,
          [field]: value,
        },
        user.id,
      )

      // Update local state
      setPermissions((prev) => ({
        ...prev,
        [memberId]: prev[memberId]?.map((p) =>
          p.permission_type === permissionType ? { ...p, [field]: value } : p,
        ) || [
          { permission_type: permissionType, can_read: false, can_write: false, can_delete: false, [field]: value },
        ],
      }))

      alert("Permission updated successfully!")
    } catch (error) {
      alert("Error updating permission: " + error.message)
    }
  }

  const getPermission = (memberId: string, permissionType: string, field: "can_read" | "can_write" | "can_delete") => {
    return permissions[memberId]?.find((p) => p.permission_type === permissionType)?.[field] || false
  }

  const canManagePermissions = userRole === "administrator" || userRole === "team_leader"
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

  if (!canManagePermissions) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground text-center">You don't have permission to manage user permissions.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Permissions Management</h1>
        <p className="text-muted-foreground">Control what team members can access and modify</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {members.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
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
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {permissionTypes.map((permType) => (
                      <div key={permType.key} className="space-y-2">
                        <Label className="text-sm font-medium">{permType.label}</Label>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span
                              className={
                                getPermission(member.profiles.id, permType.key, "can_read")
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }
                            >
                              Read
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Edit className="h-3 w-3" />
                            <span
                              className={
                                getPermission(member.profiles.id, permType.key, "can_write")
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }
                            >
                              Write
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Trash2 className="h-3 w-3" />
                            <span
                              className={
                                getPermission(member.profiles.id, permType.key, "can_delete")
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }
                            >
                              Delete
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          {members.map((member) =>
            !canManageTeamLeaders && member.role === "team_leader" ? null : (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {permissionTypes.map((permType) => (
                      <div key={permType.key} className="space-y-3">
                        <div>
                          <h4 className="font-medium">{permType.label}</h4>
                          <p className="text-sm text-muted-foreground">{permType.description}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`${member.id}-${permType.key}-read`}
                              checked={getPermission(member.profiles.id, permType.key, "can_read")}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(member.profiles.id, permType.key, "can_read", checked)
                              }
                              disabled={member.profiles.id === user.id}
                            />
                            <Label htmlFor={`${member.id}-${permType.key}-read`} className="text-sm">
                              <Eye className="h-4 w-4 inline mr-1" />
                              Read
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`${member.id}-${permType.key}-write`}
                              checked={getPermission(member.profiles.id, permType.key, "can_write")}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(member.profiles.id, permType.key, "can_write", checked)
                              }
                              disabled={member.profiles.id === user.id}
                            />
                            <Label htmlFor={`${member.id}-${permType.key}-write`} className="text-sm">
                              <Edit className="h-4 w-4 inline mr-1" />
                              Write
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`${member.id}-${permType.key}-delete`}
                              checked={getPermission(member.profiles.id, permType.key, "can_delete")}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(member.profiles.id, permType.key, "can_delete", checked)
                              }
                              disabled={member.profiles.id === user.id}
                            />
                            <Label htmlFor={`${member.id}-${permType.key}-delete`} className="text-sm">
                              <Trash2 className="h-4 w-4 inline mr-1" />
                              Delete
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
