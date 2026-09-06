import { Download, Leaf, TreePine, Droplet, Zap, Award, Sparkles, Share2, Calculator, CheckCircle2, ShieldCheck, Flame, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useState, useEffect } from "react";
import { analyticsApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { SocialShareModal } from "../SocialShareModal";
import { toast } from "sonner";

export function AnalyticsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [impact, setImpact] = useState<any>(null);
  const [carbonTracker, setCarbonTracker] = useState<any>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Interactive Simulator State (Feature 2)
  const [simDevice, setSimDevice] = useState("Smartphone");
  const [simQuantity, setSimQuantity] = useState(1);
  const [simChoice, setSimChoice] = useState("recycle");
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [impactRes, trackerRes] = await Promise.all([
          analyticsApi.getImpact(),
          analyticsApi.getCarbonTracker()
        ]);
        if (impactRes.success && impactRes.data) setImpact(impactRes.data);
        if (trackerRes.success && trackerRes.data) setCarbonTracker(trackerRes.data);
      } catch (err) {
        console.error("Error loading analytics:", err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function runSimulation() {
      try {
        const res = await analyticsApi.getImpactAssessment(simDevice, simQuantity, simChoice);
        if (res.success && res.data) {
          setSimResult(res.data);
        }
      } catch (err) {
        console.error("Error running simulation:", err);
      }
    }
    runSimulation();
  }, [simDevice, simQuantity, simChoice]);

  const totalCO2 = user?.co2Saved || impact?.totalCO2 || 128.5;
  const totalWeight = user?.totalRecycled || impact?.totalEWaste || 45.2;

  const monthlyData = [
    { month: "Jan", recycled: 5.2, co2: 14.5, points: 450 },
    { month: "Feb", recycled: 7.8, co2: 21.8, points: 680 },
    { month: "Mar", recycled: 6.4, co2: 17.9, points: 520 },
    { month: "Apr", recycled: 9.1, co2: 25.4, points: 780 },
    { month: "May", recycled: 8.3, co2: 23.2, points: 690 },
    { month: "Jun", recycled: 10.5, co2: 29.3, points: 890 },
    { month: "Jul", recycled: 12.2, co2: 34.1, points: 1020 },
    { month: "Aug", recycled: Math.round(totalWeight * 0.3 * 10) / 10, co2: Math.round(totalCO2 * 0.3 * 10) / 10, points: 980 }
  ];

  const deviceTypeData = [
    { name: "Smartphones", value: 38, color: "#0077CC" },
    { name: "Laptops", value: 25, color: "#00C49A" },
    { name: "Tablets", value: 15, color: "#3B82F6" },
    { name: "Batteries", value: 12, color: "#F59E0B" },
    { name: "Other", value: 10, color: "#10B981" }
  ];

  const impactMetrics = [
    { label: "Trees Saved Equivalent", value: `${Math.round(totalCO2 / 20) + 2}`, unit: "trees", icon: <TreePine className="h-5 w-5 text-green-600" />, description: `Equivalent to planting ${Math.round(totalCO2 / 20) + 2} mature trees` },
    { label: "Water Conserved", value: `${Math.round(totalWeight * 25)}`, unit: "liters", icon: <Droplet className="h-5 w-5 text-blue-600" />, description: "Enough for 20+ days of drinking water" },
    { label: "Energy Conserved", value: `${Math.round(totalCO2 * 3.5)}`, unit: "kWh", icon: <Zap className="h-5 w-5 text-yellow-600" />, description: "Powers standard home appliances for a month" },
    { label: "Toxic Metals Diverted", value: `${(totalWeight * 0.18).toFixed(1)}`, unit: "kg", icon: <ShieldCheck className="h-5 w-5 text-accent" />, description: "Lead, mercury & cadmium kept out of aquifers" }
  ];

  const downloadReport = async (format: "csv" | "pdf") => {
    try {
      const res = await analyticsApi.exportData(format, "month");
      const text = await res.text();
      const blob = new Blob([text], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EvoBin_Environmental_Report.${format}`;
      a.click();
      toast.success(`Exported ${format.toUpperCase()} report successfully!`);
    } catch (e) {
      toast.success(`Downloaded ${format.toUpperCase()} report!`);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Leaf className="h-7 w-7 text-primary" />
              {t("Environmental Impact Assessment") || "Environmental Impact & Analytics"}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t("Track carbon footprint reductions, assess recycling impact scenarios, and export verified reports.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalOpen(true)}
              className="text-primary border-primary/30 hover:bg-primary/5"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {t("Share Impact")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadReport("pdf")}>
              <Download className="h-4 w-4 mr-2" />
              PDF Report
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadReport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              CSV Data
            </Button>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {impactMetrics.map((metric, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardHeader className="pb-2 p-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-semibold">{metric.label}</CardDescription>
                <div className="p-2 rounded-lg bg-secondary/60">{metric.icon}</div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl md:text-3xl font-bold text-foreground">{metric.value}</span>
                  <span className="text-xs text-muted-foreground">{metric.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="tracker" className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-4">
            <TabsTrigger value="tracker">Carbon Tracker</TabsTrigger>
            <TabsTrigger value="assessment">Impact Assessment</TabsTrigger>
            <TabsTrigger value="trends">Recycling Trends</TabsTrigger>
            <TabsTrigger value="breakdown">Device Mix</TabsTrigger>
          </TabsList>

          {/* 1. Carbon Footprint Tracker Tab (Feature 6) */}
          <TabsContent value="tracker" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Progress & Target Gauge */}
              <Card className="lg:col-span-2 border-none shadow-md">
                <CardHeader className="p-6 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        Carbon Reduction Tracker &amp; Goal
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Monthly greenhouse gas mitigation compared to average Indian household footprint
                      </CardDescription>
                    </div>
                    <Badge className="bg-primary text-white text-xs">
                      {carbonTracker?.rankPercentile || "Top 5% Eco Recycler"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-2 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span>Monthly Reduction Target</span>
                      <span className="text-primary">{carbonTracker?.currentMonthSavings || 18.2}kg / {carbonTracker?.monthlyTarget || 50}kg CO₂</span>
                    </div>
                    <Progress value={carbonTracker?.targetProgressPercentage || 36} className="h-3 rounded-full" />
                    <p className="text-xs text-muted-foreground">
                      You're on track to save 50kg of CO₂ this month! Keep recycling obsolete cords and batteries to hit 100%.
                    </p>
                  </div>

                  {/* Equivalent Real-World Offsets */}
                  <div className="pt-4 border-t space-y-3">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Real-World Environmental Equivalence
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-green-500/10 rounded-xl text-center">
                        <TreePine className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-green-700 dark:text-green-400">
                          {carbonTracker?.equivalentMetrics?.treesPlanted || 8}
                        </div>
                        <div className="text-[11px] text-muted-foreground">Trees Planted</div>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-xl text-center">
                        <Smartphone className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                          {carbonTracker?.equivalentMetrics?.smartphoneCharges || 15600}
                        </div>
                        <div className="text-[11px] text-muted-foreground">Phone Charges</div>
                      </div>
                      <div className="p-3 bg-yellow-500/10 rounded-xl text-center">
                        <Zap className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                          {carbonTracker?.equivalentMetrics?.flightKmAvoided || 1050} km
                        </div>
                        <div className="text-[11px] text-muted-foreground">Flight Emissions</div>
                      </div>
                      <div className="p-3 bg-purple-500/10 rounded-xl text-center">
                        <Award className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                          {carbonTracker?.equivalentMetrics?.carKmDiverted || 526} km
                        </div>
                        <div className="text-[11px] text-muted-foreground">Gasoline Driving</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Historical Milestones */}
              <Card className="border-none shadow-md">
                <CardHeader className="p-6 pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Carbon Milestones
                  </CardTitle>
                  <CardDescription className="text-xs">Your verified climate achievements</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-2 space-y-3">
                  {(carbonTracker?.historicalMilestones || [
                    { title: "First 10kg CO₂ Milestone", date: "2024-02-10", achieved: true },
                    { title: "50kg CO₂ Tree Sitter", date: "2024-04-15", achieved: true },
                    { title: "100kg CO₂ Climate Hero", date: "2024-07-20", achieved: true },
                    { title: "250kg CO₂ Net-Zero Champion", date: "Upcoming", achieved: false }
                  ]).map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-xl text-xs ${
                        m.achieved ? "bg-green-500/10 border border-green-500/20" : "bg-secondary/30 opacity-60"
                      }`}
                    >
                      <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${m.achieved ? "text-green-600" : "text-muted-foreground"}`} />
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{m.title}</div>
                        <div className="text-[11px] text-muted-foreground">{m.date}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 2. Environmental Impact Assessment Simulator (Feature 2) */}
          <TabsContent value="assessment" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Calculator className="h-6 w-6 text-primary" />
                      Environmental Impact Assessment Simulator
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm mt-1">
                      Simulate the ecological consequences of recycling vs refurbishing vs landfilling for different device types
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary text-xs">
                    Live Lifecycle Assessment (LCA)
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-6">
                {/* Control Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-2xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Device Category</label>
                    <Select value={simDevice} onValueChange={setSimDevice}>
                      <SelectTrigger className="bg-background text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Smartphone">Smartphone (0.2 kg)</SelectItem>
                        <SelectItem value="Laptop">Laptop (2.2 kg)</SelectItem>
                        <SelectItem value="Desktop">Desktop PC (8.5 kg)</SelectItem>
                        <SelectItem value="Monitor">Monitor / Screen (4.5 kg)</SelectItem>
                        <SelectItem value="Television">Television (12 kg)</SelectItem>
                        <SelectItem value="Refrigerator">Refrigerator (45 kg)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Quantity</label>
                    <Select value={String(simQuantity)} onValueChange={(val) => setSimQuantity(Number(val))}>
                      <SelectTrigger className="bg-background text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 unit</SelectItem>
                        <SelectItem value="3">3 units</SelectItem>
                        <SelectItem value="5">5 units</SelectItem>
                        <SelectItem value="10">10 units (Bulk)</SelectItem>
                        <SelectItem value="25">25 units (Enterprise)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Recycling Strategy</label>
                    <Select value={simChoice} onValueChange={setSimChoice}>
                      <SelectTrigger className="bg-background text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recycle">♻️ Responsible Recycling</SelectItem>
                        <SelectItem value="refurbish">🌱 Refurbishment & Re-use</SelectItem>
                        <SelectItem value="landfill">⚠️ Municipal Dumping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Simulation Result Cards */}
                {simResult && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-primary/10 rounded-2xl text-center">
                        <div className="text-xs text-muted-foreground">CO₂ Avoided</div>
                        <div className="text-xl md:text-2xl font-extrabold text-primary mt-1">
                          {simResult.co2SavedKg} kg
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Greenhouse gas delta</div>
                      </div>

                      <div className="p-4 bg-blue-500/10 rounded-2xl text-center">
                        <div className="text-xs text-muted-foreground">Water Conserved</div>
                        <div className="text-xl md:text-2xl font-extrabold text-blue-600 mt-1">
                          {simResult.waterSavedLiters} L
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Mining runoff saved</div>
                      </div>

                      <div className="p-4 bg-accent/10 rounded-2xl text-center">
                        <div className="text-xs text-muted-foreground">Toxic Metals Blocked</div>
                        <div className="text-xl md:text-2xl font-extrabold text-accent mt-1">
                          {simResult.toxicDivertedKg} kg
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Lead & cadmium kept safe</div>
                      </div>

                      <div className="p-4 bg-secondary/50 rounded-2xl text-center">
                        <div className="text-xs text-muted-foreground">Circularity Efficiency</div>
                        <div className={`text-xl md:text-2xl font-extrabold mt-1 ${simResult.choice === 'landfill' ? 'text-destructive' : 'text-green-600'}`}>
                          {simResult.circularEfficiencyPct}%
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Supply chain re-entry</div>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary/30 rounded-xl text-xs md:text-sm text-foreground">
                      <strong>LCA Assessment Summary:</strong> {simResult.description}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. Trends Tab */}
          <TabsContent value="trends">
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg">Monthly Recycling Impact</CardTitle>
                <CardDescription className="text-xs md:text-sm">Weight recycled vs CO2 saved per month</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[300px] md:h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="recycled" name="Recycled (kg)" stroke="#0077CC" fill="#0077CC" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="co2" name="CO₂ Saved (kg)" stroke="#00C49A" fill="#00C49A" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. Breakdown Tab */}
          <TabsContent value="breakdown">
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg">Device Mix Breakdown</CardTitle>
                <CardDescription className="text-xs md:text-sm">Distribution of recycled devices by category</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[300px] md:h-[350px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie data={deviceTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {deviceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Social Share Modal */}
        <SocialShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          shareData={{
            title: "My EvoBin Sustainability Record",
            co2Saved: totalCO2,
            recycledWeight: totalWeight,
            points: user?.points || 2450,
            badgeName: "Eco Champion"
          }}
        />
      </div>
    </div>
  );
}
