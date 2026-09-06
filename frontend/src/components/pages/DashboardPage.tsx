import { useState, useEffect } from "react";
import { TrendingUp, Recycle, Leaf, Package, MapPin, Trophy, Activity, Share2, Sparkles, Lightbulb, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { RoleBasedDashboard } from "../RoleBasedDashboard";
import { ContextualHelp } from "../ContextualHelp";
import { SocialShareModal } from "../SocialShareModal";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { analyticsApi, deviceApi, educationApi } from "../../services/api";

interface DashboardPageProps {
  onNavigate?: (page: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [sustainabilityTips, setSustainabilityTips] = useState<any[]>([]);
  const [activeTipIdx, setActiveTipIdx] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashRes, historyRes, tipsRes] = await Promise.all([
          analyticsApi.getDashboard('month'),
          deviceApi.getHistory(),
          educationApi.getSustainabilityTips()
        ]);

        if (dashRes.success && dashRes.data) {
          setDashboardData(dashRes.data);
        }

        if (historyRes.success && Array.isArray(historyRes.data)) {
          setRecentActivities(historyRes.data);
        }

        if (tipsRes.success && Array.isArray(tipsRes.data)) {
          setSustainabilityTips(tipsRes.data);
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
      title: t("Total E-Waste Recycled"),
      value: `${totalEWaste} kg`,
      change: "+12% from last month",
      icon: <Recycle className="h-5 w-5" />,
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      title: t("Carbon Footprint Saved"),
      value: `${co2Saved} kg CO₂`,
      change: "+8% from last month",
      icon: <Leaf className="h-5 w-5" />,
      iconBg: "bg-accent/10",
      iconColor: "text-accent"
    },
    {
      title: t("Total Points Earned"),
      value: `${points.toLocaleString()}`,
      change: "Rank #12 globally",
      icon: <Trophy className="h-5 w-5" />,
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400"
    },
    {
      title: t("Items Processed"),
      value: `${itemsCount}`,
      change: "+5 this week",
      icon: <Package className="h-5 w-5" />,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400"
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

  const defaultTips = [
    {
      title: "Optimize Battery Longevity",
      category: "Maintenance",
      impact: "Adds 1-2 years to device lifespan",
      action: "Keep smartphone and laptop charge levels between 20% and 80% to minimize lithium-ion wear."
    },
    {
      title: "Upgrade RAM Before Replacing",
      category: "Hardware",
      impact: "Saves ~180kg CO₂ equivalent",
      action: "Upgrading memory and switching to an SSD gives laptops up to 3 extra productive years."
    },
    {
      title: "Safe E-Waste Storage",
      category: "Safety",
      impact: "Prevents toxic leaks & worker hazards",
      action: "Store depleted batteries in cool, dry plastic containers with terminal tapes before recycling."
    }
  ];

  const activeTips = sustainabilityTips.length > 0 ? sustainabilityTips : defaultTips;
  const currentTip = activeTips[activeTipIdx % activeTips.length];

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Role-Based Dashboard */}
        {user && (
          <div className="mb-8">
            <RoleBasedDashboard onNavigate={onNavigate} />
          </div>
        )}

        {/* Header with Share Button */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="mb-2 text-2xl md:text-3xl font-bold">{t("Detailed Analytics & Impact")}</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t("dashboard.welcomeMessage") || "Your complete environmental footprint overview from live backend services."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsShareModalOpen(true)}
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10 gap-2 shadow-sm"
            >
              <Share2 className="h-4 w-4" />
              {t("Share Impact")}
            </Button>
            <ContextualHelp page="dashboard" />
          </div>
        </div>

        {/* Daily Sustainability Insight Banner */}
        <Card className="border-none shadow-md bg-gradient-to-r from-emerald-900/10 via-primary/5 to-accent/10 border-l-4 border-l-emerald-500 mb-6 md:mb-8">
          <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    {t(currentTip.category || "Sustainability Tip")}
                  </Badge>
                  <span className="text-xs font-semibold text-primary">{t(currentTip.impact)}</span>
                </div>
                <h4 className="font-semibold text-sm md:text-base text-foreground mb-1">{t(currentTip.title)}</h4>
                <p className="text-xs md:text-sm text-muted-foreground">{t(currentTip.action || currentTip.tip)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTipIdx((prev) => (prev + 1) % activeTips.length)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {t("Next Tip") || "Next Tip"}
              </Button>
              <Button
                size="sm"
                onClick={() => onNavigate?.("education")}
                className="text-xs bg-primary hover:bg-primary/90 gap-1.5"
              >
                {t("Learn More")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

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
            <CardHeader className="p-4 md:p-6 flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-accent" />
                  {t("Carbon Footprint Tracker")}
                </CardTitle>
                <CardDescription className="text-sm">{t("dashboard.impactChart") || "Your monthly environmental impact goal & milestones"}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate?.("analytics")}
                className="text-xs gap-1.5"
              >
                {t("Detailed LCA") || "Detailed LCA"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-2">
              <div className="space-y-4 md:space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="text-xs md:text-sm text-muted-foreground">{t("Monthly Goal Progress")}</span>
                    <span className="text-xs md:text-sm font-medium">{monthlyGoal.current}kg / {monthlyGoal.target}kg</span>
                  </div>
                  <Progress value={monthlyGoal.percentage} className="h-2 md:h-3" />
                  <p className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                    <span>{Math.max(0, monthlyGoal.target - monthlyGoal.current)}kg {t("more to reach your goal") || "more to reach your next milestone"}</span>
                    <span className="font-semibold text-accent">{monthlyGoal.percentage}% Completed</span>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-4 pt-4 border-t">
                  <div className="text-center p-3 rounded-xl bg-secondary/30">
                    <div className="text-xl md:text-2xl font-bold text-primary">12</div>
                    <div className="text-xs text-muted-foreground">{t("Days Active")}</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary/30">
                    <div className="text-xl md:text-2xl font-bold text-accent">8</div>
                    <div className="text-xs text-muted-foreground">{t("Streak Days")}</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary/30">
                    <div className="text-xl md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{user?.badges?.length || 3}</div>
                    <div className="text-xs text-muted-foreground">{t("Badges")}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Recommendations */}
          <Card className="border-none shadow-md">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t("Tailored Next Actions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 md:p-6 pt-0">
              <button 
                onClick={() => onNavigate?.("upload")} 
                className="w-full flex items-center gap-3 p-3 md:p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium text-sm md:text-base">{t("Upload E-Waste")}</div>
                  <div className="text-xs text-muted-foreground truncate">{t("Instant AI scan & valuation") || "Instant AI scan & valuation"}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>
              <button 
                onClick={() => onNavigate?.("map")} 
                className="w-full flex items-center gap-3 p-3 md:p-4 bg-accent/5 hover:bg-accent/10 rounded-lg transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium text-sm md:text-base">{t("Find Certified Centers")}</div>
                  <div className="text-xs text-muted-foreground truncate">{t("Locate verified nearby dropoffs") || "Locate verified nearby dropoffs"}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>
              <button 
                onClick={() => onNavigate?.("education")} 
                className="w-full flex items-center gap-3 p-3 md:p-4 bg-blue-500/5 hover:bg-blue-500/10 rounded-lg transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium text-sm md:text-base">{t("Safe Disassembly Guides")}</div>
                  <div className="text-xs text-muted-foreground truncate">{t("Prevent battery and toxic hazards") || "Prevent battery and toxic hazards"}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
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

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share My Environmental Impact"
        badgeName="Planet Saver"
        stats={{
          recycledKg: totalEWaste,
          co2SavedKg: co2Saved,
          pointsEarned: points
        }}
        shareUrl={window.location.origin}
      />
    </div>
  );
}
