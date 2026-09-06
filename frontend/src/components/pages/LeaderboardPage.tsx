import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useState, useEffect } from "react";
import { leaderboardApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { SocialShareModal } from "../SocialShareModal";
import { Share2 } from "lucide-react";

export function LeaderboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedUserShare, setSelectedUserShare] = useState<any>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const res = await leaderboardApi.getLeaderboard();
        if (res.success && Array.isArray(res.data)) {
          setLeaderboard(res.data);
        }
      } catch (err) {
        console.error("Error loading leaderboard:", err);
      }
    }
    loadLeaderboard();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const userRank = leaderboard.findIndex(e => e.id === user?.id || e.name === user?.name) + 1 || 12;

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-2xl md:text-3xl font-bold">{t("Global Leaderboard")}</h1>
            <p className="text-muted-foreground">
              {t("See how your environmental impact ranks against eco-champions worldwide.")}
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedUserShare({
                name: user?.name || "Eco Champion",
                rank: userRank,
                points: user?.points || 2450,
                co2Saved: user?.co2Saved || 85,
                badge: "Eco Warrior"
              });
              setIsShareModalOpen(true);
            }}
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10 gap-2 self-start md:self-auto"
          >
            <Share2 className="h-4 w-4" />
            {t("Share My Ranking")} (#{userRank})
          </Button>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {top3.map((entry, idx) => (
            <Card key={entry.id || idx} className={`border-none shadow-lg relative overflow-hidden ${idx === 0 ? "bg-gradient-to-b from-yellow-500/10 to-transparent border-t-4 border-t-yellow-500" : ""}`}>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-600 font-bold text-lg mb-3">
                  #{entry.rank}
                </div>
                <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-yellow-400">
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback>{entry.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg mb-1">{entry.name}</h3>
                <Badge variant="secondary" className="mb-3">{entry.badge || "Top Recycler"}</Badge>
                <div className="text-2xl font-bold text-primary mb-1">{entry.points.toLocaleString()} pts</div>
                <p className="text-xs text-muted-foreground mb-3">{entry.co2Saved} kg CO₂ saved</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedUserShare(entry);
                    setIsShareModalOpen(true);
                  }}
                  className="text-xs text-muted-foreground hover:text-primary gap-1"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share Rank
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Leaderboard Table */}
        <Card className="border-none shadow-md mb-8">
          <CardHeader className="p-6">
            <CardTitle className="text-xl">Leaderboard Rankings</CardTitle>
            <CardDescription>Live real-time user point rankings</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {leaderboard.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg w-8 text-center text-muted-foreground">#{entry.rank}</span>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback>{entry.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm md:text-base">{entry.name}</div>
                      <div className="text-xs text-muted-foreground">{entry.co2Saved} kg CO₂ saved</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-primary text-sm md:text-base">{entry.points.toLocaleString()} pts</div>
                      <Badge variant="outline" className="text-xs">{entry.recycledItems} items</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedUserShare(entry);
                        setIsShareModalOpen(true);
                      }}
                      className="hidden sm:inline-flex text-muted-foreground hover:text-primary"
                      title="Share ranking"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={selectedUserShare ? `${selectedUserShare.name} is ranked #${selectedUserShare.rank} on EvoBin!` : "My EvoBin Ranking"}
        badgeName={selectedUserShare?.badge || "Leaderboard Champion"}
        stats={{
          pointsEarned: selectedUserShare?.points || user?.points || 2450,
          co2SavedKg: selectedUserShare?.co2Saved || user?.co2Saved || 85
        }}
      />
    </div>
  );
}
