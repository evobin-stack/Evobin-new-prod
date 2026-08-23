import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trophy, Leaf, Users, Shield, Building2 } from "lucide-react";

export function UserWelcome() {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleInfo = () => {
    switch (user.role) {
      case 'admin':
        return {
          icon: Shield,
          title: "Admin Dashboard",
          description: "Manage the platform, users, and content",
          color: "text-red-500",
          bgColor: "bg-red-50 dark:bg-red-950",
          borderColor: "border-red-200 dark:border-red-800"
        };
      case 'worker':
        return {
          icon: Users,
          title: "Worker Portal",
          description: "Access safety guidelines and collection schedules",
          color: "text-blue-500",
          bgColor: "bg-blue-50 dark:bg-blue-950",
          borderColor: "border-blue-200 dark:border-blue-800"
        };
      case 'organization':
        return {
          icon: Building2,
          title: "Organization Hub",
          description: "Manage your team's recycling initiatives",
          color: "text-purple-500",
          bgColor: "bg-purple-50 dark:bg-purple-950",
          borderColor: "border-purple-200 dark:border-purple-800"
        };
      default:
        return {
          icon: Leaf,
          title: "User Dashboard",
          description: "Track your environmental impact and earn rewards",
          color: "text-green-500",
          bgColor: "bg-green-50 dark:bg-green-950",
          borderColor: "border-green-200 dark:border-green-800"
        };
    }
  };

  const roleInfo = getRoleInfo();
  const Icon = roleInfo.icon;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <Card className={`${roleInfo.bgColor} ${roleInfo.borderColor} border-2`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-6 w-6 ${roleInfo.color}`} />
              <h2 className="text-2xl">
                {getGreeting()}, {user.name}!
              </h2>
            </div>
            <p className="text-muted-foreground mb-3">
              {roleInfo.description}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Level {user.level || 1}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Leaf className="h-3 w-3" />
                {user.points || 0} Points
              </Badge>
              {user.totalRecycled !== undefined && user.totalRecycled > 0 && (
                <Badge variant="secondary">
                  {user.totalRecycled} Devices Recycled
                </Badge>
              )}
              {user.co2Saved !== undefined && user.co2Saved > 0 && (
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  {user.co2Saved.toFixed(1)} kg CO₂ Saved
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Role-specific quick stats */}
        {user.role === 'admin' && (
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">1,234</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">45</p>
              <p className="text-xs text-muted-foreground">Pending Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">98.5%</p>
              <p className="text-xs text-muted-foreground">System Health</p>
            </div>
          </div>
        )}

        {user.role === 'organization' && (
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{user.totalRecycled || 0}</p>
              <p className="text-xs text-muted-foreground">Team Devices</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">15</p>
              <p className="text-xs text-muted-foreground">Team Members</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">Gold</p>
              <p className="text-xs text-muted-foreground">Partner Status</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
