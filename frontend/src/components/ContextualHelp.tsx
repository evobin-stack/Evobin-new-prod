import { HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface HelpContent {
  title: string;
  description: string;
  tips: string[];
  videoUrl?: string;
}

const helpContent: Record<string, HelpContent> = {
  upload: {
    title: "How to Upload Devices",
    description: "Get accurate AI identification with these tips",
    tips: [
      "Take clear, well-lit photos of your device",
      "Include any visible labels or brand names",
      "Capture multiple angles if possible",
      "Remove any cases or covers for better visibility",
      "Ensure the device model/serial number is visible if accessible"
    ]
  },
  dashboard: {
    title: "Understanding Your Dashboard",
    description: "Track your environmental impact",
    tips: [
      "Points are earned for each device recycled",
      "CO₂ saved shows your environmental contribution",
      "Level increases with consistent recycling activity",
      "Check badges for special achievements",
      "Monitor your monthly recycling goals"
    ]
  },
  map: {
    title: "Finding Recycling Centers",
    description: "Locate certified facilities near you",
    tips: [
      "Enable location services for accurate results",
      "Filter by accepted device types",
      "Check operating hours before visiting",
      "Look for verified certification badges",
      "Read reviews from other users"
    ]
  },
  rewards: {
    title: "Redeeming Rewards",
    description: "Make the most of your points",
    tips: [
      "Browse available rewards by category",
      "Check expiry dates on vouchers",
      "Combine points for bigger rewards",
      "Donate points to environmental causes",
      "Participate in challenges for bonus points"
    ]
  },
  community: {
    title: "Community Guidelines",
    description: "Connect respectfully with others",
    tips: [
      "Share your recycling experiences",
      "Post photos of successful recycling",
      "Ask questions and help others",
      "Participate in community challenges",
      "Report inappropriate content"
    ]
  },
  leaderboard: {
    title: "Leaderboard Rankings",
    description: "Compete with others sustainably",
    tips: [
      "Rankings update daily",
      "View global or local leaderboards",
      "Filter by different time periods",
      "Join team challenges for group rankings",
      "Consistent activity maintains your rank"
    ]
  }
};

interface ContextualHelpProps {
  page: string;
  className?: string;
}

export function ContextualHelp({ page, className = "" }: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const content = helpContent[page];

  if (!content) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={`text-muted-foreground hover:text-foreground ${className}`}
        title="Get help"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              {content.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">{content.description}</p>
            
            <div>
              <h4 className="font-medium mb-3">Tips & Best Practices:</h4>
              <ul className="space-y-2">
                {content.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {content.videoUrl && (
              <div className="rounded-lg overflow-hidden bg-muted aspect-video">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Video Tutorial Coming Soon
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Need more help?
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Full Guide
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Quick help tooltip component
interface QuickTipProps {
  content: string;
  children: React.ReactNode;
}

export function QuickTip({ content, children }: QuickTipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg border max-w-xs">
          <div className="relative">
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-popover"></div>
          </div>
        </div>
      )}
    </div>
  );
}
