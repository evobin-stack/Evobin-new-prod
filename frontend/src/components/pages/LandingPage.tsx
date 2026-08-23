import { ArrowRight, Cpu, Map, Trophy, Recycle, CheckCircle2, AlertTriangle, Droplets, Wind, Skull, TreePine, Globe, Heart, ShieldAlert } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { userJourneys } from "../../config/navigation";
import { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
 
interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const images = [
  "/assets/hero1.jpg",
  "/assets/hero2.jpg",
  "/assets/hero3.jpg",
];

const [currentIndex, setCurrentIndex] = useState(0);
const [platformStats, setPlatformStats] = useState({
  users: "1,450+",
  recycled: "14.5 tons",
  centers: "18",
  accuracy: "98%"
});

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }, 3000);

  async function loadStats() {
    try {
      const res = await adminApi.getStats();
      if (res.success && res.data) {
        setPlatformStats({
          users: `${res.data.totalUsers || 1450}+`,
          recycled: `${((res.data.totalEWasteRecycled || 14520) / 1000).toFixed(1)} tons`,
          centers: `${res.data.activeCenters || 18}`,
          accuracy: "98%"
        });
      }
    } catch (e) {
      // Fallback already set
    }
  }
  loadStats();

  return () => clearInterval(interval);
}, []);

const handleFeatureClick = (page: string, _featureName?: string) => {
  if (!isAuthenticated && page !== "landing") {
    onNavigate("login");
  } else {
    onNavigate(page);
  }
};
  
  // Environmental Impact Statistics
  const environmentalImpacts = [
    {
      icon: <Droplets className="h-6 w-6 text-red-500" />,
      stat: "70%",
      label: "Toxic Waste",
      description: "E-waste accounts for 70% of toxic waste in landfills"
    },
    {
      icon: <Wind className="h-6 w-6 text-orange-500" />,
      stat: "50M tons",
      label: "Annual E-Waste",
      description: "Global e-waste generation per year and growing"
    },
    {
      icon: <Skull className="h-6 w-6 text-red-600" />,
      stat: "1000+",
      label: "Toxic Substances",
      description: "Harmful chemicals released from improper disposal"
    },
    {
      icon: <Globe className="h-6 w-6 text-blue-600" />,
      stat: "Only 17%",
      label: "Recycled",
      description: "Of all e-waste is properly recycled worldwide"
    }
  ];

  const features = [
    {
      icon: <Cpu className="h-8 w-8 text-primary" />,
      title: "AI Recognition",
      description: "Advanced AI technology identifies and classifies e-waste instantly with 95% accuracy. Upload images for smart categorization.",
      bgColor: "bg-blue-50"
    },
    {
      icon: <Map className="h-8 w-8 text-accent" />,
      title: "Smart Map Locator",
      description: "Find the nearest e-waste collection centers and recycling facilities in your area. Real-time availability updates.",
      bgColor: "bg-emerald-50"
    },
    {
      icon: <Trophy className="h-8 w-8 text-primary" />,
      title: "Gamification & Rewards",
      description: "Earn points, badges, and rewards for responsible e-waste disposal. Compete with others on the leaderboard.",
      bgColor: "bg-blue-50"
    }
  ];

  const stats = [
    { value: platformStats.users, label: t('landing.stats.users') },
    { value: platformStats.recycled, label: t('landing.stats.recycled') },
    { value: platformStats.centers, label: t('landing.stats.centers') },
    { value: platformStats.accuracy, label: t('landing.stats.accuracy') }
  ];

  //sliding photos
  

  return (
    <div className="w-full">
      {/* Hero Section */}
      {/* <section className="max-w-[1440px] mx-auto px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"> */}
        <section className="max-w-[1440px] mx-auto px-6 py-2 lg:py-4">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          <div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-2">
        <span className="text-sm text-muted-foreground uppercase">Sponsored by</span>
        <img
          src="/assets/logomsme.jpg"
          alt="Incubator Logo"
          className="h-16 sm:h-40 object-contain"
        />
      </div>
      <div className="mb-12"> {/* Increased gap to next section */}
  <span className="text-sm font-semibold text-foreground">
    Incubatee Name: Syeda Sumaiya Afreen
  </span>
</div>
            <div className="inline-block bg-accent/10 text-accent px-4 py-2 rounded-full mb-6">
              <span className="flex items-center gap-2">
                <Recycle className="h-4 w-4" />
                {t('landing.hero.badge')}
              </span>
            </div>
            <h1 className="mb-6">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90"
                onClick={() => handleFeatureClick("login", "Get Started")}
              >
                {t('landing.hero.getStarted')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => handleFeatureClick("upload", "AI Recognition")}
              >
                {t('landing.hero.tryAI')}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* <div className="aspect-square bg-secondary rounded-2xl overflow-hidden">
              <ImageWithFallback
                src="/assets/heroimage.jpg"
                alt="E-Waste Recycling"
                className="w-full h-full object-cover"
              />
            </div> */}
            {/* <div className="w-full aspect-square overflow-hidden rounded-2xl bg-secondary"> */}
            <div className="w-full aspect-video overflow-hidden rounded-2xl bg-secondary">
  <div
    className="flex h-full transition-transform duration-700"
    style={{
      transform: `translateX(-${currentIndex * 100}%)`,
    }}
  >
    {images.map((img, i) => (
      <div key={i} className="w-full h-full flex-shrink-0">
        <ImageWithFallback
          src={img}
          alt="slide"
          className="w-full h-full object-cover"
        />
      </div>
    ))}
  </div>
</div>


            {/* Floating Badge */}
            
          </div>
        </div>
      </section>

      {/* Environmental Crisis Section - NEW */}
      <section className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-20">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">Environmental Crisis</span>
            </div>
            <h2 className="mb-4">The Hidden Danger of E-Waste</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every year, millions of tons of electronic waste end up in landfills, leaching toxic chemicals into our soil, water, and air. The impact of improper e-waste disposal threatens our environment and future generations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {environmentalImpacts.map((impact, index) => (
              <Card key={index} className="border-none shadow-lg text-center hover:shadow-xl transition-all">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white shadow-md flex items-center justify-center">
                    {impact.icon}
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">{impact.stat}</div>
                  <div className="text-sm font-semibold text-foreground mb-2">{impact.label}</div>
                  <p className="text-sm text-muted-foreground">{impact.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Environmental Dangers Detailed */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-red-500 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-red-500" />
                  Water Contamination
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Heavy metals like lead, mercury, and cadmium from e-waste seep into groundwater, contaminating drinking water sources and harming aquatic ecosystems.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wind className="h-5 w-5 text-orange-500" />
                  Air Pollution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Burning e-waste releases toxic fumes and dioxins into the atmosphere, contributing to respiratory diseases and climate change.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-600 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-green-600" />
                  Soil Degradation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Toxic chemicals leach into soil, destroying fertility, killing beneficial organisms, and making land unusable for agriculture.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Environmental Responsibility Section - NEW */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnZpcm9ubWVudCUyMHByb3RlY3Rpb258ZW58MXx8fHwxNzYwNDMxMTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Environmental Protection"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Take Action</div>
                    <div className="text-sm text-muted-foreground">Join 50K+ users</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
                <ShieldAlert className="h-5 w-5" />
                <span className="font-semibold">Your Environmental Responsibility</span>
              </div>
              <h2 className="mb-6">Every Action Counts: Be Part of the Solution</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Understanding the impact of e-waste is the first step. Taking responsible action is the next. Together, we can reduce environmental harm and create a sustainable future.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Protect Our Water</h3>
                    <p className="text-muted-foreground">
                      Proper e-waste disposal prevents toxic metals from contaminating water supplies that millions depend on.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Preserve Our Air</h3>
                    <p className="text-muted-foreground">
                      Recycling instead of burning reduces harmful emissions and helps combat climate change.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Restore Our Earth</h3>
                    <p className="text-muted-foreground">
                      Responsible recycling recovers valuable materials and reduces the need for harmful mining operations.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Secure Our Future</h3>
                    <p className="text-muted-foreground">
                      Your actions today create a healthier planet for future generations to inherit.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="mt-8 bg-green-600 hover:bg-green-700"
                onClick={() => handleFeatureClick("education", "Learn More")}
              >
                Learn More About E-Waste Impact
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/30 py-20">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">{t('landing.features.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Journeys */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="text-center mb-12">
              <h2 className="mb-4">Choose Your Journey</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Whether you're an individual, organization, or recycling professional, 
                we have the perfect path for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {userJourneys.slice(0, 2).map((journey, index) => {
                const FirstIcon = journey.steps[0]?.icon;
                return (
                  <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {FirstIcon && <FirstIcon className="h-5 w-5 text-primary" />}
                        {journey.title}
                      </CardTitle>
                      <CardDescription>{journey.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {journey.steps.map((step, stepIndex) => {
                        const StepIcon = step.icon;
                        return (
                          <div key={stepIndex} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-primary">{stepIndex + 1}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              <StepIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{step.label}</span>
                            </div>
                          </div>
                        );
                      })}
                      <Button 
                        className="w-full mt-4" 
                        variant="outline"
                        onClick={() => handleFeatureClick('dashboard', journey.title)}
                      >
                        Start This Journey
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple steps to start making a difference today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Sign Up", desc: "Create your free account" },
              { step: "02", title: "Upload", desc: "Scan your e-waste" },
              { step: "03", title: "Locate", desc: "Find nearby centers" },
              { step: "04", title: "Earn", desc: "Get rewards & badges" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-[1440px] mx-auto px-8 text-center">
          <h2 className="mb-6">{t('landing.cta.title')}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {t('landing.cta.subtitle')}
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90"
            onClick={() => handleFeatureClick("login", "Sign Up")}
          >
            {t('landing.cta.signup')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}