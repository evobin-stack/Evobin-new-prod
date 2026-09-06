import { Shield, Clock, BookOpen, Wrench, Sparkles, HelpCircle, CheckCircle2, AlertTriangle, BatteryCharging, Fan, Cpu, Terminal, Play, Check, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Progress } from "../ui/progress";
import { useState, useEffect } from "react";
import { educationApi } from "../../services/api";
import { useLanguage } from "../../contexts/LanguageContext";
import { toast } from "sonner";

export function EducationPage() {
  const { t } = useLanguage();
  const [articles, setArticles] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>("Laptop");
  const [disassemblyGuide, setDisassemblyGuide] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sustainabilityTips, setSustainabilityTips] = useState<any[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  
  // Quiz State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Video Preview Modal
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  useEffect(() => {
    async function loadEducation() {
      try {
        const [contentRes, tipsRes, quizRes] = await Promise.all([
          educationApi.getContent(),
          educationApi.getSustainabilityTips(),
          educationApi.getQuiz()
        ]);

        if (contentRes.success && Array.isArray(contentRes.data)) {
          setArticles(contentRes.data);
        }
        if (tipsRes.success && Array.isArray(tipsRes.data)) {
          setSustainabilityTips(tipsRes.data);
        }
        if (quizRes.success && Array.isArray(quizRes.data)) {
          setQuizQuestions(quizRes.data);
        }
      } catch (err) {
        console.error("Error loading education data:", err);
      }
    }
    loadEducation();
  }, []);

  useEffect(() => {
    async function loadGuide() {
      try {
        const guideRes = await educationApi.getDisassemblyGuide(selectedDeviceType);
        if (guideRes.success && guideRes.data) {
          setDisassemblyGuide(guideRes.data);
          setCompletedSteps([]);
        }
      } catch (err) {
        console.error("Error loading guide:", err);
      }
    }
    loadGuide();
  }, [selectedDeviceType]);

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(optionIdx);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === quizQuestions[currentQuestionIdx].correctAnswer) {
      setScore(prev => prev + 1);
      toast.success("Correct answer! +50 Eco IQ");
    } else {
      toast.error("Not quite! Check the explanation below.");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx + 1 < quizQuestions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  const categories = ["All", "Awareness", "Data Security", "Recycling Process", "Safety"];
  const filteredArticles = activeCategory === "All"
    ? articles
    : articles.filter(a => a.category?.toLowerCase() === activeCategory.toLowerCase());

  const videos = [
    {
      id: 1,
      title: "How Urban Mining & E-Waste Recycling Works",
      duration: "10:24",
      views: "45K",
      thumbnail: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
      description: "Take an inside tour of high-tech hydrometallurgical recycling facilities isolating gold, copper, and palladium safely."
    },
    {
      id: 2,
      title: "Safely Remove Swollen Battery from Smartphone",
      duration: "5:12",
      views: "28K",
      thumbnail: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
      description: "Essential safety precautions to discharge static and prevent thermal runaway when handling damaged batteries."
    },
    {
      id: 3,
      title: "The Lifecycle Journey of Recycled Electronics",
      duration: "8:45",
      views: "67K",
      thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
      description: "Explore how 92% of old circuit boards and plastic casings return to active industrial manufacturing."
    },
  ];

  const deviceTypes = ["Laptop", "Smartphone", "Desktop", "Monitor"];

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header Banner */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="mb-2 text-2xl md:text-3xl font-bold flex items-center gap-2">
                <BookOpen className="h-7 w-7 text-primary" />
                {t("Education & Guides") || "Education & Safety Hub"}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                {t("Interactive e-waste awareness, safe disassembly guides, sustainability tips, and knowledge quizzes.")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-accent text-white px-3 py-1.5 text-xs flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> 40+ Certified Guides
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="guides">Disassembly</TabsTrigger>
            <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
            <TabsTrigger value="quiz">Eco Quiz</TabsTrigger>
          </TabsList>

          {/* 1. Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs rounded-full ${activeCategory === cat ? "bg-primary" : ""}`}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map((art) => (
                <Card key={art.id} className="border-none shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
                  <CardHeader className="p-6 pb-3">
                    <div className="flex justify-between items-center mb-2">
                      <Badge className="bg-primary/90 text-white text-xs">{art.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {art.readTime || "5 min read"}
                      </span>
                    </div>
                    <CardTitle className="text-lg md:text-xl font-bold">{art.title}</CardTitle>
                    <CardDescription className="text-xs md:text-sm mt-2">{art.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-3">
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-4 leading-relaxed">{art.content}</p>
                    <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">{art.author}</span>
                      <span>👁️ {art.views || 450} views</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Educational Video Library */}
            <div className="mt-10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-accent" />
                Video Masterclasses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {videos.map((vid) => (
                  <Card
                    key={vid.id}
                    onClick={() => setActiveVideo(vid)}
                    className="border-none shadow-md overflow-hidden cursor-pointer group hover:shadow-xl transition-all"
                  >
                    <div className="relative aspect-video overflow-hidden bg-black">
                      <img
                        src={vid.thumbnail}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          ▶
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white font-semibold">
                        {vid.duration}
                      </span>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-bold text-sm line-clamp-1 mb-1">{vid.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{vid.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 2. Disassembly Guides Tab (Feature 3) */}
          <TabsContent value="guides" className="space-y-6">
            {/* Device Switcher */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-semibold text-muted-foreground mr-2">Select Device:</span>
              {deviceTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedDeviceType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDeviceType(type)}
                  className={`text-xs ${selectedDeviceType === type ? "bg-primary" : ""}`}
                >
                  <Wrench className="h-3.5 w-3.5 mr-1.5" />
                  {type}
                </Button>
              ))}
            </div>

            {disassemblyGuide && (
              <Card className="border-none shadow-md">
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        {disassemblyGuide.title}
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm mt-1">
                        Estimated Time: <strong>{disassemblyGuide.estimatedMinutes} mins</strong> | Difficulty: <strong>{disassemblyGuide.difficulty}</strong>
                      </CardDescription>
                    </div>
                    <Badge className="bg-primary text-white text-xs">
                      {completedSteps.length} of {disassemblyGuide.steps?.length || 0} Steps Complete
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-6">
                  {/* Safety Hazards Box */}
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs md:text-sm text-red-600 dark:text-red-400 space-y-2">
                    <div className="font-bold flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      Critical Hazards & Safety Precautions:
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {disassemblyGuide.hazards?.map((hazard: string, idx: number) => (
                        <li key={idx}>{hazard}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Tools */}
                  {disassemblyGuide.toolsRequired && (
                    <div className="p-4 bg-secondary/30 rounded-xl space-y-2">
                      <div className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Required Disassembly Tools
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {disassemblyGuide.toolsRequired.map((tool: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-background py-1">
                            🔧 {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disassembly Interactive Step Checklist */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-base">Step-by-Step Procedure:</h4>
                    {disassemblyGuide.steps?.map((step: string, idx: number) => {
                      const isChecked = completedSteps.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleStep(idx)}
                          className={`flex gap-3 items-start p-4 rounded-xl cursor-pointer transition-all ${
                            isChecked
                              ? "bg-green-500/10 border border-green-500/30"
                              : "bg-secondary/30 hover:bg-secondary/50 border border-transparent"
                          }`}
                        >
                          <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isChecked ? "bg-green-600 text-white" : "bg-primary text-white"
                          }`}>
                            {isChecked ? <Check className="h-4 w-4" /> : idx + 1}
                          </span>
                          <div className="flex-1">
                            <span className={`text-sm md:text-base leading-relaxed ${
                              isChecked ? "line-through text-muted-foreground" : "text-foreground font-medium"
                            }`}>
                              {step}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {disassemblyGuide.safetyTips && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs md:text-sm text-yellow-800 dark:text-yellow-300">
                      💡 <strong>Pro Tip:</strong> {disassemblyGuide.safetyTips}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 3. Sustainability Tips & Longevity Insights (Feature 10) */}
          <TabsContent value="sustainability" className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-transparent rounded-2xl border border-primary/20">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Device Lifespan & Longevity Insights
              </h3>
              <p className="text-sm text-muted-foreground">
                Extending your electronics lifespan by just 2 years reduces overall lifecycle greenhouse gas emissions by over 50%.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sustainabilityTips.map((tip) => (
                <Card key={tip.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="p-6 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                        {tip.category}
                      </Badge>
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {tip.icon === "BatteryCharging" && <BatteryCharging className="h-4 w-4" />}
                        {tip.icon === "Fan" && <Fan className="h-4 w-4" />}
                        {tip.icon === "Cpu" && <Cpu className="h-4 w-4" />}
                        {tip.icon === "Terminal" && <Terminal className="h-4 w-4" />}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold">{tip.title}</CardTitle>
                    <CardDescription className="text-xs md:text-sm mt-1">{tip.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed bg-secondary/20 p-3 rounded-lg">
                      {tip.details}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Upgrade vs Replace Decision Matrix */}
            <Card className="border-none shadow-md">
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-bold">Upgrade vs Replace Decision Framework</CardTitle>
                <CardDescription className="text-xs md:text-sm">Quick rule-of-thumb before replacing sluggish hardware</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs md:text-sm space-y-1">
                    <div className="font-bold text-green-700 dark:text-green-400">Keep & Upgrade If:</div>
                    <p className="text-muted-foreground">Boot times are slow, RAM usage is &gt;85%, or battery drains fast. Upgrading to SSD + new battery costs &lt;₹3,000.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-xs md:text-sm space-y-1">
                    <div className="font-bold text-yellow-700 dark:text-yellow-400">Donate & Refurbish If:</div>
                    <p className="text-muted-foreground">Device is still fully functional but unsupported by latest apps. Community programs convert them for student schooling.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs md:text-sm space-y-1">
                    <div className="font-bold text-red-700 dark:text-red-400">Recycle With EvoBin If:</div>
                    <p className="text-muted-foreground">Motherboard shorted, cracked CRT/LCD with chemical leaks, swollen lithium cell, or beyond economic repair.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. Interactive E-Waste Knowledge Quiz (Feature 4) */}
          <TabsContent value="quiz" className="space-y-6">
            <Card className="border-none shadow-md max-w-2xl mx-auto">
              <CardHeader className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold">E-Waste Knowledge Quiz</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Test your e-waste & circular economy expertise to earn bonus eco badges
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0">
                {!quizFinished && quizQuestions.length > 0 ? (
                  <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Question {currentQuestionIdx + 1} of {quizQuestions.length}</span>
                        <span>Score: {score} / {quizQuestions.length}</span>
                      </div>
                      <Progress value={((currentQuestionIdx + 1) / quizQuestions.length) * 100} className="h-2" />
                    </div>

                    {/* Question Title */}
                    <div className="text-base md:text-lg font-bold text-foreground">
                      {quizQuestions[currentQuestionIdx].question}
                    </div>

                    {/* Option Buttons */}
                    <div className="space-y-2.5">
                      {quizQuestions[currentQuestionIdx].options.map((opt: string, idx: number) => {
                        let btnStyle = "bg-secondary/40 hover:bg-secondary border border-border/60 text-foreground";
                        if (isAnswerSubmitted) {
                          if (idx === quizQuestions[currentQuestionIdx].correctAnswer) {
                            btnStyle = "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300 font-semibold";
                          } else if (idx === selectedOption) {
                            btnStyle = "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300 font-semibold";
                          }
                        } else if (selectedOption === idx) {
                          btnStyle = "bg-primary text-white font-semibold";
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectAnswer(idx)}
                            className={`w-full text-left p-3.5 rounded-xl text-xs md:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {isAnswerSubmitted && idx === quizQuestions[currentQuestionIdx].correctAnswer && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {isAnswerSubmitted && (
                      <div className="p-4 bg-primary/10 rounded-xl text-xs md:text-sm text-foreground space-y-1">
                        <div className="font-bold">Explanation:</div>
                        <p className="text-muted-foreground">{quizQuestions[currentQuestionIdx].explanation}</p>
                      </div>
                    )}

                    {/* Action Button */}
                    <div>
                      {!isAnswerSubmitted ? (
                        <Button
                          onClick={handleSubmitAnswer}
                          disabled={selectedOption === null}
                          className="w-full bg-primary"
                        >
                          Check Answer
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNextQuestion}
                          className="w-full bg-accent text-white"
                        >
                          {currentQuestionIdx + 1 < quizQuestions.length ? "Next Question →" : "View Results"}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-yellow-500/20 text-yellow-600 rounded-full flex items-center justify-center mx-auto">
                      <Award className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold">Quiz Completed!</h3>
                    <p className="text-muted-foreground text-sm">
                      You scored <strong>{score}</strong> out of <strong>{quizQuestions.length}</strong>!
                    </p>
                    <Badge className="bg-primary text-white text-sm py-1 px-4">
                      Badge Earned: {score >= 3 ? "Certified E-Waste Guardian" : "Eco Explorer"}
                    </Badge>
                    <div className="pt-4">
                      <Button onClick={resetQuiz} variant="outline" className="w-full">
                        Retake Quiz
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Video Preview Modal */}
        <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
          <DialogContent className="sm:max-w-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">{activeVideo?.title}</DialogTitle>
              <DialogDescription className="text-xs">{activeVideo?.duration} • {activeVideo?.views} views</DialogDescription>
            </DialogHeader>
            <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
              <img
                src={activeVideo?.thumbnail}
                alt={activeVideo?.title}
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3 shadow-xl cursor-pointer hover:scale-110 transition-transform">
                  ▶
                </div>
                <p className="text-xs md:text-sm font-medium max-w-md">{activeVideo?.description}</p>
              </div>
            </div>
            <Button onClick={() => setActiveVideo(null)} className="w-full mt-2">
              Close Preview
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
