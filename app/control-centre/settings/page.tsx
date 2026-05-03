"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Laptop, Smartphone, Tablet, Upload, AlertCircle } from "lucide-react"
import { updateProfile } from "@/lib/database"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

const defaultAvatars = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9439775.jpg-4JVJWOjPksd3DtnBYJXoWHA5lc1DU9.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/375238645_11475210.jpg-lU8bOe6TLt5Rv51hgjg8NT8PsDBmvN.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/375238208_11475222.jpg-poEIzVHAGiIfMFQ7EiF8PUG1u0Zkzz.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dd.jpg-4MCwPC2Bec6Ume26Yo1kao3CnONxDg.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9334178.jpg-Y74tW6XFO68g7N36SE5MSNDNVKLQ08.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5295.jpg-fLw0wGGZp8wuTzU5dnyfjZDwAHN98a.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9720029.jpg-Yf9h2a3kT7rYyCb648iLIeHThq5wEy.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/27470341_7294795.jpg-XE0zf7R8tk4rfA1vm4fAHeZ1QoVEOo.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/799.jpg-0tEi4Xvg5YsFoGoQfQc698q4Dygl1S.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9334228.jpg-eOsHCkvVrVAwcPHKYSs5sQwVKsqWpC.jpeg",
]

export default function SettingsPage() {
  const { user, isSupabaseConfigured: configured } = useAuth()
  const { settings, updateSettings } = useSettings()

  const [selectedAvatar, setSelectedAvatar] = useState(settings.avatar)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  const userId = user?.id || "demo-user-id"
  const userEmail = user?.email || "demo@example.com"

  useEffect(() => {
    if (settings) {
      setSelectedAvatar(settings.avatar)
      setLoading(false)
    }
  }, [settings])

  const handleSaveAccount = async () => {
    if (!configured) {
      setSaveMessage("Cannot save: Database not configured")
      return
    }

    try {
      await updateProfile(userId, {
        full_name: settings.fullName,
        avatar_url: selectedAvatar,
        phone: settings.phone,
        timezone: settings.timezone,
      })
      updateSettings({ avatar: selectedAvatar })
      setSaveMessage("Account settings saved successfully!")
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (error) {
      setSaveMessage("Error saving settings: " + (error as Error).message)
      setTimeout(() => setSaveMessage(""), 5000)
    }
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!configured) {
      setSaveMessage("Cannot upload: Database not configured")
      return
    }

    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.")
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      setSelectedAvatar(data.publicUrl)
    } catch (error) {
      setSaveMessage("Error uploading avatar: " + (error as Error).message)
      setTimeout(() => setSaveMessage(""), 5000)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {!configured && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Database not configured. Settings will not be saved. Please configure your Supabase environment variables.
          </AlertDescription>
        </Alert>
      )}

      {saveMessage && (
        <Alert className={`mb-6 ${saveMessage.includes("Error") ? "border-red-500" : "border-green-500"}`}>
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Current Avatar</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedAvatar || "/placeholder.svg"} alt={settings.fullName} />
                    <AvatarFallback>
                      {settings.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <Label>Choose a new avatar</Label>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {defaultAvatars.map((avatar, index) => (
                    <Avatar
                      key={index}
                      className={`h-20 w-20 rounded-lg cursor-pointer hover:ring-2 hover:ring-primary shrink-0 ${
                        selectedAvatar === avatar ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedAvatar(avatar)}
                    >
                      <AvatarImage
                        src={avatar || "/placeholder.svg"}
                        alt={`Avatar ${index + 1}`}
                        className="object-cover"
                      />
                      <AvatarFallback>{index + 1}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div>
                  <Label htmlFor="custom-avatar">Or upload a custom avatar</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Input
                      id="custom-avatar"
                      type="file"
                      accept="image/*"
                      onChange={uploadAvatar}
                      disabled={uploading || !configured}
                    />
                    {uploading && (
                      <div className="flex items-center space-x-2">
                        <Upload className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Uploading...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={settings.fullName}
                  onChange={(e) => updateSettings({ fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={userEmail} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => updateSettings({ phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => updateSettings({ timezone: value })}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select Timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-12">International Date Line West (UTC-12)</SelectItem>
                    <SelectItem value="utc-11">Samoa Standard Time (UTC-11)</SelectItem>
                    <SelectItem value="utc-10">Hawaii-Aleutian Standard Time (UTC-10)</SelectItem>
                    <SelectItem value="utc-9">Alaska Standard Time (UTC-9)</SelectItem>
                    <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
                    <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                    <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="utc-4">Atlantic Time (UTC-4)</SelectItem>
                    <SelectItem value="utc-3">Argentina Standard Time (UTC-3)</SelectItem>
                    <SelectItem value="utc-2">South Georgia Time (UTC-2)</SelectItem>
                    <SelectItem value="utc-1">Azores Time (UTC-1)</SelectItem>
                    <SelectItem value="utc+0">Greenwich Mean Time (UTC+0)</SelectItem>
                    <SelectItem value="utc+1">Central European Time (UTC+1)</SelectItem>
                    <SelectItem value="utc+2">Eastern European Time (UTC+2)</SelectItem>
                    <SelectItem value="utc+3">Moscow Time (UTC+3)</SelectItem>
                    <SelectItem value="utc+4">Gulf Standard Time (UTC+4)</SelectItem>
                    <SelectItem value="utc+5">Pakistan Standard Time (UTC+5)</SelectItem>
                    <SelectItem value="utc+5.5">Indian Standard Time (UTC+5:30)</SelectItem>
                    <SelectItem value="utc+6">Bangladesh Standard Time (UTC+6)</SelectItem>
                    <SelectItem value="utc+7">Indochina Time (UTC+7)</SelectItem>
                    <SelectItem value="utc+8">China Standard Time (UTC+8)</SelectItem>
                    <SelectItem value="utc+9">Japan Standard Time (UTC+9)</SelectItem>
                    <SelectItem value="utc+10">Australian Eastern Standard Time (UTC+10)</SelectItem>
                    <SelectItem value="utc+11">Solomon Islands Time (UTC+11)</SelectItem>
                    <SelectItem value="utc+12">New Zealand Standard Time (UTC+12)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAccount} disabled={!configured}>
                Save Account Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Other tabs remain the same */}
        <TabsContent value="security">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account's security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" placeholder="Enter Your Current Password" type="password" disabled={!configured} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" placeholder="Enter Your New Password" type="password" disabled={!configured} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" placeholder="Confirm Your New Password" type="password" disabled={!configured} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="two-factor" disabled={!configured} />
                  <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button disabled={!configured}>Save Security Settings</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Login History</CardTitle>
                <CardDescription>Recent login activities on your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { date: "2023-07-20", time: "14:30 UTC", ip: "192.168.1.1", location: "New York, USA" },
                  { date: "2023-07-19", time: "09:15 UTC", ip: "10.0.0.1", location: "London, UK" },
                  { date: "2023-07-18", time: "22:45 UTC", ip: "172.16.0.1", location: "Tokyo, Japan" },
                ].map((login, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>
                      {login.date} {login.time}
                    </span>
                    <span>{login.ip}</span>
                    <span>{login.location}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Currently active sessions on your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { device: "Laptop", browser: "Chrome", os: "Windows 10", icon: Laptop },
                  { device: "Smartphone", browser: "Safari", os: "iOS 15", icon: Smartphone },
                  { device: "Tablet", browser: "Firefox", os: "Android 12", icon: Tablet },
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <session.icon className="mr-2 h-4 w-4" />
                      {session.device}
                    </span>
                    <span>{session.browser}</span>
                    <span>{session.os}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" disabled={!configured}>
                  Log Out All Other Sessions
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your dashboard experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSettings({ language: value })}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => updateSettings({ currency: value })}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aud">Australian Dollar</SelectItem>
                      <SelectItem value="gbp">British Pound Sterling</SelectItem>
                      <SelectItem value="cad">Canadian Dollar</SelectItem>
                      <SelectItem value="eur">Euro</SelectItem>
                      <SelectItem value="usd">United States Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Separator Style</Label>
                  <RadioGroup 
                    value={settings.separatorStyle} 
                    onValueChange={(value) => updateSettings({ separatorStyle: value as any })}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="comma" id="sep-comma" />
                      <Label htmlFor="sep-comma">1,234.56</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dot" id="sep-dot" />
                      <Label htmlFor="sep-dot">1.234,56</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Currency Label Style</Label>
                  <RadioGroup 
                    value={settings.currencyLabelStyle} 
                    onValueChange={(value) => updateSettings({ currencyLabelStyle: value as any })}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="symbol" id="style-symbol" />
                      <Label htmlFor="style-symbol">Symbol</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="code" id="style-code" />
                      <Label htmlFor="style-code">Code</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="name" id="style-name" />
                      <Label htmlFor="style-name">Name</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-style">Date Style</Label>
                  <Select value={settings.dateStyle} onValueChange={(value) => updateSettings({ dateStyle: value as any })}>
                    <SelectTrigger id="date-style">
                      <SelectValue placeholder="Select Date Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                      <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csv-date-format">Date Format</Label>
                  <Input 
                    id="csv-date-format" 
                    value={settings.csvDateFormat}
                    onChange={(e) => updateSettings({ csvDateFormat: e.target.value })}
                    placeholder="e.g., DD-MM-YYYY"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Time Format</Label>
                  <RadioGroup 
                    value={settings.timeFormat} 
                    onValueChange={(value) => updateSettings({ timeFormat: value as any })}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="12h" id="time-12h" />
                      <Label htmlFor="time-12h">12-hour</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="24h" id="time-24h" />
                      <Label htmlFor="time-24h">24-hour</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>First Day of the Week</Label>
                  <RadioGroup 
                    value={settings.firstDayOfWeek} 
                    onValueChange={(value) => updateSettings({ firstDayOfWeek: value as any })}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sunday" id="day-sunday" />
                      <Label htmlFor="day-sunday">Sunday</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monday" id="day-monday" />
                      <Label htmlFor="day-monday">Monday</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="space-y-2 pt-4">
                <Label>Theme</Label>
                <RadioGroup value={settings.theme} onValueChange={(value) => updateSettings({ theme: value as any })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system">System</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Notification Channels</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-notifications" defaultChecked />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="push-notifications" defaultChecked />
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sms-notifications" />
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notification Types</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="account-activity" defaultChecked />
                    <Label htmlFor="account-activity">Account Activity</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="new-features" defaultChecked />
                    <Label htmlFor="new-features">New Features and Updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="marketing" />
                    <Label htmlFor="marketing">Marketing and Promotions</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification-frequency">Notification Frequency</Label>
                <Select defaultValue="real-time">
                  <SelectTrigger id="notification-frequency">
                    <SelectValue placeholder="Select Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real-time">Real-time</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-hours-start">Quiet Hours</Label>
                <div className="flex items-center space-x-2">
                  <Input id="quiet-hours-start" type="time" defaultValue="22:00" />
                  <span>to</span>
                  <Input id="quiet-hours-end" type="time" defaultValue="07:00" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Notification Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
