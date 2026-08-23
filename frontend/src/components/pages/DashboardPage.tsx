import { useState, useEffect } from "react";
import { TrendingUp, Recycle, Leaf, Package, MapPin, Trophy, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { RoleBasedDashboard } from "../RoleBasedDashboard";
import { ContextualHelp } from "../ContextualHelp";
import { useAuth } from "../../contexts/AuthContext";
import { analyticsApi, deviceApi } from "../../services/api";

interface DashboardPageProps {
  onNavigate?: (page: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashRes, historyRes] = await Promise.all([
          analyticsApi.getDashboard('month'),
          deviceApi.getHistory()
        ]);

        if (dashRes.success && dashRes.data) {
          setDashboardData(dashRes.data);
        }

        if (historyRes.success && Array.isArray(historyRes.data)) {
          setRecentActivities(historyRes.data);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    }

    loadDashboard();
  }, []);

  const totalEWaste = user?.totalRecycled ?? (dashboardData?.totalEWaste ?? 0);
  const co2Saved = user?.co2Saved ?? (dashboardData?.co2Saved ?? 0);
  const points = user?.points ?? (dashboardData?.pointsEarned ?? 0);
  const itemsCount = dashboardData?.itemsProcessed ?? (recentActivities?.length || 0);

  const stats = [
    {
      title: "Total E-Waste Recycled",
      value: `${totalEWaste} kg`,
      change: "+12% from last month",
      icon: <Recycle className="h-5 w-5" />,
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      title: "Carbon Footprint Saved",
      value: `${co2Saved} kg CO₂`,
      change: "+8% from last month",
      icon: <Leaf className="h-5 w-5" />,
      iconBg: "bg-accent/10",
      iconColor: "text-accent"
    },
    {
      title: "Total Points Earned",
      value: `${points.toLocaleString()}`,
      change: "Rank #12 globally",
      icon: <Trophy className="h-5 w-5" />,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    {
      title: "Items Processed",
      value: `${itemsCount}`,
      change: "+5 this week",
      icon: <Package className="h-5 w-5" />,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    }
  ];

  const achievements = [
    { name: "First Steps", icon: "🌱", earned: true },
    { name: "Eco Warrior", icon: "⚡", earned: true },
    { name: "Planet Saver", icon: "🌍", earned: true },
    { name: "Green Champion", icon: "🏆", earned: points > 3000 },
    { name: "Streak Master", icon: "🔥", earned: false },
    { name: "Community Hero", icon: "👥", earned: false }
  ];

  const monthlyGoal = dashboardData?.monthlyGoal || {
    current: Math.min(100, Math.round(totalEWaste)),
    target: 100,
    percentage: Math.min(100, Math.round(totalEWaste))
  };

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Role-Based Dashboard */}
        {user && (
          <div className="mb-8">
            <RoleBasedDashboard onNavigate={onNavigate} />
          </div>
        )}

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-2xl md:text-3xl font-bold">Detailed Analytics</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Your complete environmental impact overview from live backend services.
              </p>
            </div>
            <ContextualHelp page="dashboard" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className={`${stat.iconBg} ${stat.iconColor} p-2 md:p-3 rounded-lg`}>
                    {stat.icon}
                  </div>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Carbon Footprint Tracker */}
          <Card className="lg:col-span-2 border-none shadow-md">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">Carbon Footprint Tracker</CardTitle>
              <CardDescription className="text-sm">Your monthly environmental impact goal</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-4 md:space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="text-xs md:text-sm text-muted-foreground">Monthly Goal Progress</span>
                    <span className="text-xs md:text-sm font-medium">{monthlyGoal.current}kg / {monthlyGoal.target}kg</span>
                  </div>
                  <Progress value={monthlyGoal.percentage} className="h-2 md:h-3" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.max(0, monthlyGoal.target - monthlyGoal.current)}kg more to reach your goal
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-primary">12</div>
                    <div className="text-xs text-muted-foreground">Days Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-accent">8</div>
                    <div className="text-xs text-muted-foreground">Streak Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-yellow-600">{user?.badges?.length || 3}</div>
                    <div className="text-xs text-muted-foreground">Badges</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-none shadow-md">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 md:p-6 pt-0">
              <button 
                onClick={() => onNavigate?.("upload")} 
                className="w-full flex items-center gap-3 p-3 md:p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm md:text-base">Upload E-Waste</div>
                  <div className="text-xs text-muted-foreground">Scan new device</div>
                </div>
              </button>
              <button 
                onClick={() => onNavigate?.("map")} 
                className="w-full flex items-center gap-3 p-3 md:p-4 bg-accent/5 hover:bg-accent/10 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm md:text-base">Find Centers</div>
                  <div className="text-xs text-muted-foreground">Locate nearby</div>
                </div>
              </button>
              <button 
                onClick={() => onNavigate?.("leaderboard")} 
                className="w-full flex items-center gap-3 p-3 md:p-4 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm md:text-base">View Leaderboard</div>
                  <div className="text-xs text-muted-foreground">Check ranking</div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-none shadow-md">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">Recent Activity</CardTitle>
              <CardDescription className="text-sm">Your live e-waste submission history</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-3 md:space-y-4">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No recent activities recorded yet. Upload a device to start!
                  </div>
                ) : (
                  recentActivities.map((activity, idx) => (
                    <div key={activity.id || idx} className="flex items-center justify-between gap-3 p-3 md:p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm md:text-base truncate">{activity.type}</div>
                          <div className="text-xs md:text-sm text-muted-foreground truncate">{activity.location}</div>
                          <div className="text-xs text-muted-foreground">{activity.date}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge 
                          variant={activity.status === "Completed" ? "default" : "secondary"}
                          className={`text-xs ${activity.status === "Completed" ? "bg-accent" : ""}`}
                        >
                          {activity.status}
                        </Badge>
                        <div className="text-xs md:text-sm font-medium text-primary mt-1">+{activity.points} pts</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-none shadow-md">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">Achievements</CardTitle>
              <CardDescription className="text-sm">Your earned badges</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-center p-1.5 md:p-2 ${
                      achievement.earned
                        ? "bg-accent/10 border-2 border-accent"
                        : "bg-secondary/50 opacity-50"
                    }`}
                  >
                    <div className="text-2xl md:text-3xl mb-0.5 md:mb-1">{achievement.icon}</div>
                    <div className="text-[10px] md:text-xs font-medium leading-tight">{achievement.name}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                {achievements.filter(a => a.earned).length} of {achievements.length} badges earned
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
