import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and manage your profile.",
}

export default async function ProfilePage() {
  const user = await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Your account information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="size-20">
              <AvatarFallback className="text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {user.plan} plan
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Member since {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>
          {user.bio && (
            <div className="mt-6">
              <h3 className="text-sm font-medium">Bio</h3>
              <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
