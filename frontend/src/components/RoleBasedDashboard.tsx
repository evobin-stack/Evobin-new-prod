import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Shield, 
  Wrench, 
  Building2, 
  Award,
  Target,
  BarChart3,
  FileText,
  AlertTriangle
} from "lucide-react";

import { useState, useEffect } from "react";
import { adminApi } from "../services/api";

interface RoleBasedDashboardProps {
  onNavigate?: (page: string) => void;
}

export function RoleBasedDashboard({ onNavigate }: RoleBasedDashboardProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [adminStats, setAdminStats] = useState<any>(null);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'worker')) {
      adminApi.getStats().then(res => {
        if (res.success && res.data) {
          setAdminStats(res.data);
        }
      }).catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  // User Dashboard
  if (user.role === 'user') {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-lg text-white">
          <h2 className="mb-2">{t("dashboard.welcome") || "Welcome back"}, {user.name}! 👋</h2>
          <p className="text-white/90">{t("You're making a real difference for the environment.") || "You're making a real difference for the environment."}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t("Total Points")}</CardDescription>
              <CardTitle className="text-2xl text-primary">{user.points || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span>Level {user.level || 1}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t("Devices Recycled")}</CardDescription>
              <CardTitle className="text-2xl">{user.totalRecycled || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>{t("Total recycled")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t("CO2 Saved") || "CO₂ Saved"}</CardDescription>
              <CardTitle className="text-2xl text-accent">{user.co2Saved || 0} kg</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span>{t("Environmental impact")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t("Badges Earned")}</CardDescription>
              <CardTitle className="text-2xl">{user.badges?.length || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>{t("Achievements")}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Quick Actions")}</CardTitle>
            <CardDescription>{t("What would you like to do today?")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button onClick={() => onNavigate?.("upload")} className="h-auto flex flex-col gap-2 py-4">
                <Activity className="h-6 w-6" />
                <span>{t("Upload Device")}</span>
              </Button>
              <Button onClick={() => onNavigate?.("map")} variant="outline" className="h-auto flex flex-col gap-2 py-4">
                <Target className="h-6 w-6" />
                <span>{t("Find Centers")}</span>
              </Button>
              <Button onClick={() => onNavigate?.("rewards")} variant="outline" className="h-auto flex flex-col gap-2 py-4">
                <Award className="h-6 w-6" />
                <span>{t("View Rewards")}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  if (user.role === 'admin') {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6" />
            <h2>Admin Dashboard</h2>
          </div>
          <p className="text-white/90">Manage and monitor the entire platform</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-2xl">{adminStats?.totalUsers || 1450}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-accent">
                <TrendingUp className="h-4 w-4" />
                <span>+18% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active E-Waste Recycled</CardDescription>
              <CardTitle className="text-2xl">{adminStats?.totalEWasteRecycled || "14.5 tons"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Being processed</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Pickups</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{adminStats?.pendingPickups || 42}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>Requires attention</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Collection Centers</CardDescription>
              <CardTitle className="text-2xl">{adminStats?.activeCenters || 18}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>Active locations</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Management</CardTitle>
              <CardDescription>Manage users, content, and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => onNavigate?.("admin")} className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button onClick={() => onNavigate?.("admin")} className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Content Management
              </Button>
              <Button onClick={() => onNavigate?.("map")} className="w-full justify-start" variant="outline">
                <Building2 className="h-4 w-4 mr-2" />
                Collection Centers
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>View platform statistics and insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => onNavigate?.("analytics")} className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Platform Analytics
              </Button>
              <Button onClick={() => onNavigate?.("analytics")} className="w-full justify-start" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Growth Metrics
              </Button>
              <Button onClick={() => onNavigate?.("analytics")} className="w-full justify-start" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Activity Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Worker Dashboard
  if (user.role === 'worker') {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-lg text-white">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-6 w-6" />
            <h2>Worker Dashboard - {user.name}</h2>
          </div>
          <p className="text-white/90">Manage collections and safety protocols</p>
        </div>

        {/* Worker Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Assigned Pickups</CardDescription>
              <CardTitle className="text-2xl">{adminStats?.pendingPickups || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Devices in queue</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Dispatch</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{adminStats?.pendingPickups || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>Requires action</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Safety Score</CardDescription>
              <CardTitle className="text-2xl text-accent">98%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-accent">
                <Shield className="h-4 w-4" />
                <span>Certified Rating</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Reward Points</CardDescription>
              <CardTitle className="text-2xl">{user.points || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>Worker balance</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Worker Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Collection Tasks</CardTitle>
              <CardDescription>Manage your daily collection routes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => onNavigate?.("admin")} className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                View Pending Pickups
              </Button>
              <Button onClick={() => onNavigate?.("map")} className="w-full justify-start" variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Route Optimization
              </Button>
              <Button onClick={() => onNavigate?.("admin")} className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Collection History
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Safety & Training</CardTitle>
              <CardDescription>Access safety resources and certifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => onNavigate?.("education")} className="w-full justify-start" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Safety Protocols
              </Button>
              <Button onClick={() => onNavigate?.("education")} className="w-full justify-start" variant="outline">
                <Award className="h-4 w-4 mr-2" />
                Training Modules
              </Button>
              <Button onClick={() => onNavigate?.("admin")} className="w-full justify-start" variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Organization Dashboard
  if (user.role === 'organization') {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 rounded-lg text-white">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-6 w-6" />
            <h2>Organization Dashboard - {user.name}</h2>
          </div>
          <p className="text-white/90">Track your organization's environmental impact</p>
        </div>

        {/* Organization Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Recycled</CardDescription>
              <CardTitle className="text-2xl">{user.totalRecycled || 0} kg</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-accent">
                <TrendingUp className="h-4 w-4" />
                <span>Verified Impact</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>CO₂ Saved</CardDescription>
              <CardTitle className="text-2xl text-accent">{user.co2Saved || 0} kg</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Environmental impact</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Eco Badges</CardDescription>
              <CardTitle className="text-2xl">{user.badges?.length || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Active Certifications</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rewards Points</CardDescription>
              <CardTitle className="text-2xl">{user.points || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>Available to redeem</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organization Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Management</CardTitle>
              <CardDescription>Manage your team and activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => onNavigate?.("admin")} className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Team Accounts
              </Button>
              <Button onClick={() => onNavigate?.("upload")} className="w-full justify-start" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Bulk Upload Devices
              </Button>
              <Button onClick={() => onNavigate?.("upload")} className="w-full justify-start" variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Schedule Pickups
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reports & Compliance</CardTitle>
              <CardDescription>View reports and certifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => onNavigate?.("analytics")} className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Impact Reports
              </Button>
              <Button onClick={() => onNavigate?.("education")} className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Compliance Documents
              </Button>
              <Button onClick={() => onNavigate?.("rewards")} className="w-full justify-start" variant="outline">
                <Award className="h-4 w-4 mr-2" />
                Certifications & Vouchers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
