import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, Video, Plus } from "lucide-react"

const upcomingMeetings = [
  {
    id: "1",
    title: "Quarterly Review",
    date: "2024-01-20",
    time: "10:00 AM",
    duration: "1 hour",
    attendees: 5,
    type: "video",
    status: "scheduled",
  },
  {
    id: "2",
    title: "Client Presentation",
    date: "2024-01-22",
    time: "2:00 PM",
    duration: "45 minutes",
    attendees: 3,
    type: "video",
    status: "scheduled",
  },
  {
    id: "3",
    title: "Team Standup",
    date: "2024-01-23",
    time: "9:00 AM",
    duration: "30 minutes",
    attendees: 8,
    type: "video",
    status: "scheduled",
  },
]

const todaysMeetings = [
  {
    id: "4",
    title: "Budget Planning",
    time: "11:00 AM",
    duration: "2 hours",
    attendees: 4,
    status: "in-progress",
  },
  {
    id: "5",
    title: "Project Kickoff",
    time: "3:00 PM",
    duration: "1 hour",
    attendees: 6,
    status: "upcoming",
  },
]

export default function MeetingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">Meetings</h1>
          <p className="text-muted-foreground">Schedule and manage your meetings</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">meetings scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">meetings scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.25</div>
            <p className="text-xs text-muted-foreground">hours this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendees</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26</div>
            <p className="text-xs text-muted-foreground">total participants</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Meetings</CardTitle>
            <CardDescription>Your meetings for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaysMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{meeting.title}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {meeting.time}
                    </span>
                    <span className="flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      {meeting.attendees} attendees
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={meeting.status === "in-progress" ? "default" : "secondary"}>
                    {meeting.status === "in-progress" ? "Live" : "Upcoming"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>Your scheduled meetings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{meeting.title}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {meeting.date}
                    </span>
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {meeting.time}
                    </span>
                    <span className="flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      {meeting.attendees}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Scheduled</Badge>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
