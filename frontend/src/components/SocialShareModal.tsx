import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Share2, Copy, Check, Twitter, MessageCircle, Linkedin, Facebook, Sparkles, Award, Leaf, Recycle } from 'lucide-react';
import { toast } from 'sonner';

export interface SocialShareData {
  title?: string;
  description?: string;
  points?: number;
  co2Saved?: number;
  recycledWeight?: number;
  badgeName?: string;
  rank?: number;
  url?: string;
}

export interface SocialShareModalProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  shareData?: SocialShareData;
  title?: string;
  badgeName?: string;
  stats?: {
    recycledKg?: number;
    co2SavedKg?: number;
    pointsEarned?: number;
  };
  shareUrl?: string;
}

export function SocialShareModal({
  open,
  isOpen,
  onOpenChange,
  onClose,
  shareData,
  title,
  badgeName,
  stats,
  shareUrl: customShareUrl,
}: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);

  const isModalOpen = open !== undefined ? open : (isOpen ?? false);
  const handleOpenChange = (openState: boolean) => {
    if (onOpenChange) onOpenChange(openState);
    if (!openState && onClose) onClose();
  };

  const modalTitle = title || shareData?.title || "My E-Waste Recycling Impact";
  const co2 = stats?.co2SavedKg ?? shareData?.co2Saved ?? 128.5;
  const weight = stats?.recycledKg ?? shareData?.recycledWeight ?? 45.2;
  const points = stats?.pointsEarned ?? shareData?.points ?? 2450;
  const badge = badgeName || shareData?.badgeName || "Eco Champion";
  const shareUrl = customShareUrl || shareData?.url || (typeof window !== 'undefined' ? window.location.origin : '');

  const defaultMessage = `🌱 I've prevented ${co2}kg of CO₂ emissions and recycled ${weight}kg of e-waste using EvoBin! Join me in driving the circular economy ♻️✨ ${shareUrl}`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(defaultMessage);
      setCopied(true);
      toast.success("Impact message copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy message");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: modalTitle,
          text: defaultMessage,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyText();
        }
      }
    } else {
      handleCopyText();
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`🌱 I've saved ${co2}kg of CO₂ and responsibly recycled ${weight}kg of e-waste on @EvoBin! Join the green revolution ♻️ #EWaste #Sustainability #CircularEconomy`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(defaultMessage);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=500');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-6 overflow-hidden">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
            {modalTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Inspire your network and encourage responsible e-waste disposal
          </DialogDescription>
        </DialogHeader>

        {/* Impact Visual Badge Preview Card */}
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-5 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                🌱
              </div>
              <div>
                <div className="font-bold text-sm tracking-tight">EvoBin Eco Warrior</div>
                <div className="text-[10px] text-muted-foreground">Certified Impact Record</div>
              </div>
            </div>
            <Badge className="bg-primary/90 text-white text-xs">{badge}</Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/50 text-center">
            <div className="p-2 rounded-lg bg-background/60 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1 text-primary text-xs font-semibold">
                <Leaf className="h-3.5 w-3.5" /> CO₂ Saved
              </div>
              <div className="text-base font-extrabold mt-0.5 text-foreground">{co2} kg</div>
            </div>
            <div className="p-2 rounded-lg bg-background/60 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1 text-accent text-xs font-semibold">
                <Recycle className="h-3.5 w-3.5" /> Recycled
              </div>
              <div className="text-base font-extrabold mt-0.5 text-foreground">{weight} kg</div>
            </div>
            <div className="p-2 rounded-lg bg-background/60 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400 text-xs font-semibold">
                <Award className="h-3.5 w-3.5" /> Eco Points
              </div>
              <div className="text-base font-extrabold mt-0.5 text-foreground">{points.toLocaleString()}</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic mt-3 text-center">
            "Small responsible actions lead to massive planetary conservation."
          </p>
        </div>

        {/* Social Sharing Buttons */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Share directly to
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shareToTwitter}
              className="flex flex-col items-center gap-1 h-auto py-2.5 hover:bg-sky-50 dark:hover:bg-sky-950/30 hover:text-sky-500 hover:border-sky-300"
            >
              <Twitter className="h-4 w-4 text-sky-500" />
              <span className="text-[11px]">X / Twitter</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareToWhatsApp}
              className="flex flex-col items-center gap-1 h-auto py-2.5 hover:bg-green-50 dark:hover:bg-green-950/30 hover:text-green-600 hover:border-green-300"
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-[11px]">WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareToLinkedIn}
              className="flex flex-col items-center gap-1 h-auto py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 hover:border-blue-300"
            >
              <Linkedin className="h-4 w-4 text-blue-600" />
              <span className="text-[11px]">LinkedIn</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareToFacebook}
              className="flex flex-col items-center gap-1 h-auto py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 hover:border-indigo-300"
            >
              <Facebook className="h-4 w-4 text-indigo-600" />
              <span className="text-[11px]">Facebook</span>
            </Button>
          </div>
        </div>

        {/* Copy Text or Native Share */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            className="flex-1 text-xs"
            onClick={handleCopyText}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                Copied Message!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy Text
              </>
            )}
          </Button>
          <Button
            className="flex-1 bg-primary text-xs"
            onClick={handleNativeShare}
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Share Anywhere
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
