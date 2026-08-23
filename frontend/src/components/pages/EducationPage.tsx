import { Shield, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState, useEffect } from "react";
import { educationApi } from "../../services/api";

export function EducationPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<any>(null);

  useEffect(() => {
    async function loadEducation() {
      try {
        const [contentRes, guideRes] = await Promise.all([
          educationApi.getContent(),
          educationApi.getDisassemblyGuide("Laptop")
        ]);

        if (contentRes.success && Array.isArray(contentRes.data)) {
          setArticles(contentRes.data);
        }
        if (guideRes.success && guideRes.data) {
          setSelectedGuide(guideRes.data);
        }
      } catch (err) {
        console.error("Error loading education data:", err);
      }
    }

    loadEducation();
  }, []);

  const videos = [
    { id: 1, title: "How E-Waste Recycling Works", duration: "10:24", views: "45K" },
    { id: 2, title: "Safely Remove Battery from Smartphone", duration: "5:12", views: "23K" },
    { id: 3, title: "The Journey of Recycled Electronics", duration: "8:45", views: "67K" },
  ];

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl md:text-3xl font-bold">Education & Safety Hub</h1>
          <p className="text-muted-foreground">
            Learn best practices for e-waste disposal, device disassembly, and environmental awareness.
          </p>
        </div>

        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full max-w-sm grid-cols-3">
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="guides">Disassembly</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          {/* Articles */}
          <TabsContent value="articles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((art) => (
                <Card key={art.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <Badge className="bg-primary text-xs">{art.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {art.readTime || "5 min read"}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold">{art.title}</CardTitle>
                    <CardDescription className="text-sm mt-2">{art.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-3">{art.content}</p>
                    <div className="mt-4 pt-3 border-t text-xs text-primary font-semibold">
                      Author: {art.author}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Disassembly Guide */}
          <TabsContent value="guides" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="p-6">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  {selectedGuide?.title || "Safe Device Disassembly"}
                </CardTitle>
                <CardDescription>Estimated Time: {selectedGuide?.estimatedMinutes || 15} mins | Difficulty: {selectedGuide?.difficulty || "Medium"}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-xs md:text-sm text-red-600 dark:text-red-400 font-medium">
                  <strong>Hazards & Safety Precautions:</strong> {selectedGuide?.hazards?.join(", ") || "Handle batteries carefully."}
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Disassembly Steps:</h4>
                  {selectedGuide?.steps?.map((step: string, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start p-3 bg-secondary/30 rounded-lg text-sm">
                      <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos */}
          <TabsContent value="videos" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {videos.map((vid) => (
                <Card key={vid.id} className="border-none shadow-md">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      ▶
                    </div>
                    <div>
                      <h4 className="font-bold text-base">{vid.title}</h4>
                      <p className="text-xs text-muted-foreground">{vid.duration} | {vid.views} views</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
