import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { 
  Upload, 
  Map, 
  Trophy, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export function OnboardingWizard({ open, onClose, onNavigate }: OnboardingWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to EvoBin!",
      description: "Let's get you started on your sustainability journey",
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            You've joined a community of eco-conscious individuals making a real difference. 
            Here's what you can do:
          </p>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
              <Upload className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Upload & Identify</p>
                <p className="text-sm text-muted-foreground">Use AI to identify your e-waste instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
              <Trophy className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p className="font-medium">Earn Rewards</p>
                <p className="text-sm text-muted-foreground">Get points and redeem for prizes</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
              <Map className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Find Centers</p>
                <p className="text-sm text-muted-foreground">Locate nearby recycling facilities</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Learn About E-Waste",
      description: "Understanding the impact of electronic waste",
      icon: GraduationCap,
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-3xl font-bold text-primary">50M+</p>
              <p className="text-sm text-muted-foreground">Tons of e-waste yearly</p>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <p className="text-3xl font-bold text-accent">2%</p>
              <p className="text-sm text-muted-foreground">Properly recycled</p>
            </div>
            <div className="text-center p-4 bg-orange-100 rounded-lg">
              <p className="text-3xl font-bold text-orange-600">$62B</p>
              <p className="text-sm text-muted-foreground">Worth of materials</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your participation helps recover valuable materials and prevents environmental damage. 
            Every device you recycle makes a difference!
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              onClose();
              onNavigate('education');
            }}
          >
            Learn More
          </Button>
        </div>
      )
    },
    {
      title: "Upload Your First Device",
      description: "Get started with AI-powered device identification",
      icon: Upload,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Our AI can identify devices from a photo and provide:
          </p>
          <div className="space-y-2">
            {[
              "Device type, brand, and model",
              "Estimated recycling value",
              "Material composition",
              "Nearest recycling centers",
              "Environmental impact calculation"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm font-medium mb-2">Pro Tip:</p>
            <p className="text-sm text-muted-foreground">
              Take clear photos with good lighting for best AI accuracy!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "You're All Set!",
      description: "Start making an impact today",
      icon: CheckCircle2,
      content: (
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-accent" />
            </div>
            <p className="text-muted-foreground mb-4">
              You're ready to start your eco-friendly journey!
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Quick Actions:</h4>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                onClose();
                onNavigate('upload');
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Device
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                onClose();
                onNavigate('map');
              }}
            >
              <Map className="h-4 w-4 mr-2" />
              Find Nearby Centers
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                onClose();
                onNavigate('dashboard');
              }}
            >
              <Trophy className="h-4 w-4 mr-2" />
              View Your Dashboard
            </Button>
          </div>

          {user && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-center">
                <span className="font-medium">Welcome bonus:</span> You've earned{' '}
                <Badge variant="secondary" className="ml-1">50 points</Badge>
              </p>
            </div>
          )}
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      onNavigate('dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
    onNavigate('dashboard');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              {currentStepData.title}
            </DialogTitle>
            <Badge variant="secondary">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <DialogDescription>{currentStepData.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Getting Started</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {currentStepData.content}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip Tutorial
            </Button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90"
              >
                {currentStep === steps.length - 1 ? (
                  'Get Started'
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
