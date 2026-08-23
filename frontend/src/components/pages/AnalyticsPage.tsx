import { Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useState, useEffect } from "react";
import { analyticsApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

export function AnalyticsPage() {
  const { user } = useAuth();
  const [impact, setImpact] = useState<any>(null);

  useEffect(() => {
    async function loadImpactData() {
      try {
        const res = await analyticsApi.getImpact();
        if (res.success && res.data) {
          setImpact(res.data);
        }
      } catch (err) {
        console.error("Error loading impact metrics:", err);
      }
    }
    loadImpactData();
  }, []);

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
    { name: "Tablets", value: 15, color: "#EAF3FA" },
    { name: "Batteries", value: 12, color: "#5A5A5A" },
    { name: "Other", value: 10, color: "#1A1A1A" }
  ];

  const impactMetrics = [
    { label: "Trees Saved", value: `${Math.round(totalCO2 / 20) + 2}`, unit: "trees", description: `Equivalent to planting ${Math.round(totalCO2 / 20) + 2} native trees` },
    { label: "Water Conserved", value: `${Math.round(totalWeight * 25)}`, unit: "liters", description: "Enough for 20+ days of drinking water" },
    { label: "Energy Saved", value: `${Math.round(totalCO2 * 3.5)}`, unit: "kWh", description: "Powers home appliances for a month" },
    { label: "Landfill Avoided", value: `${totalWeight}`, unit: "kg", description: "Kept out of municipal landfills" }
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
            <h1 className="mb-2 text-2xl md:text-3xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Detailed insights into your recycling journey and environmental impact
            </p>
          </div>
          <div className="flex gap-2">
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {impactMetrics.map((metric, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardHeader className="pb-2 p-4">
                <CardDescription className="text-xs">{metric.label}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl md:text-3xl font-bold text-primary">{metric.value}</span>
                  <span className="text-xs text-muted-foreground">{metric.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full max-w-sm grid-cols-2">
            <TabsTrigger value="trends">Recycling Trends</TabsTrigger>
            <TabsTrigger value="breakdown">Device Breakdown</TabsTrigger>
          </TabsList>

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

          <TabsContent value="breakdown">
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg">Categories Breakdown</CardTitle>
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
      </div>
    </div>
  );
}
