import { DatabaseTest } from "@/components/database-test"
import { EnvStatus } from "@/components/env-status"

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-y-6">
        <EnvStatus />
        <DatabaseTest />
        {/* ... rest of your existing components */}
      </div>
    </div>
  )
}
