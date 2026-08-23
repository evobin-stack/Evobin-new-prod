import { ShoppingBag, Zap, Award, Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { useState, useEffect } from "react";
import { rewardsApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

export function RewardsPage() {
  const { user, updateUser } = useAuth();
  const [rewardsList, setRewardsList] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const userPoints = user?.points || 2450;
  const nextTier = 3000;
  const tierProgress = Math.min(100, (userPoints / nextTier) * 100);

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    try {
      const [rewRes, redRes] = await Promise.all([
        rewardsApi.getRewards(),
        rewardsApi.getRedemptions()
      ]);

      if (rewRes.success && Array.isArray(rewRes.data)) {
        setRewardsList(rewRes.data);
      }
      if (redRes.success && Array.isArray(redRes.data)) {
        setRedemptions(redRes.data);
      }
    } catch (err) {
      console.error("Error loading rewards:", err);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    setRedeemingId(rewardId);
    try {
      const res = await rewardsApi.redeemReward(rewardId);
      if (res.success && res.data) {
        toast.success("Reward Redeemed!", {
          description: `Voucher Code: ${res.data.code}`
        });
        if (user) {
          updateUser({ points: Math.max(0, (user.points || 0) - ((res.data as any).pointsSpent || 500)) });
        }
        loadRewardsData();
      } else {
        toast.error("Redemption Failed", {
          description: res.error || "Please check your points balance."
        });
      }
    } catch (e: any) {
      toast.error("Redemption Error", {
        description: e.message || "Something went wrong."
      });
    } finally {
      setRedeemingId(null);
    }
  };

  const tiers = [
    { name: "Bronze", min: 0, color: "bg-orange-600", benefits: ["5% partner discounts", "Basic rewards access"] },
    { name: "Silver", min: 1000, color: "bg-gray-400", benefits: ["10% partner discounts", "Priority support", "Exclusive rewards"] },
    { name: "Gold", min: 3000, color: "bg-yellow-500", benefits: ["15% partner discounts", "VIP events", "Premium rewards", "Free shipping"] },
    { name: "Platinum", min: 5000, color: "bg-purple-500", benefits: ["20% partner discounts", "Personal advisor", "All rewards", "Partner perks"] }
  ];

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl md:text-3xl font-bold">Rewards & Gamification</h1>
          <p className="text-muted-foreground">
            Redeem your eco-points for real vouchers, merchandise, and environmental contributions.
          </p>
        </div>

        {/* Points Banner */}
        <Card className="border-none shadow-md bg-gradient-to-r from-primary to-accent text-white mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-6 w-6 text-yellow-300" />
                  <span className="font-semibold text-lg">Eco-Points Balance</span>
                </div>
                <div className="text-4xl md:text-5xl font-extrabold mb-2">
                  {userPoints.toLocaleString()} <span className="text-xl font-normal opacity-90">pts</span>
                </div>
                <p className="text-sm opacity-90">You are on track for Silver tier benefits</p>
              </div>
              <div className="w-full md:w-72 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span>Silver Tier</span>
                  <span>{userPoints}/{nextTier} pts</span>
                </div>
                <Progress value={tierProgress} className="h-2 bg-white/20" />
                <p className="text-[11px] mt-2 opacity-80">{Math.max(0, nextTier - userPoints)} pts left to unlock Gold Tier</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="catalogue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="catalogue">Reward Catalogue</TabsTrigger>
            <TabsTrigger value="history">Redemptions</TabsTrigger>
            <TabsTrigger value="tiers">Tier Perks</TabsTrigger>
          </TabsList>

          {/* Catalogue */}
          <TabsContent value="catalogue" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rewardsList.map((reward) => (
                <Card key={reward.id} className="border-none shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
                  <CardHeader className="p-4">
                    <div className="aspect-video w-full rounded-lg bg-secondary overflow-hidden mb-3 relative">
                      <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
                      <Badge className="absolute top-2 right-2 bg-primary">{reward.category}</Badge>
                    </div>
                    <CardTitle className="text-lg font-bold">{reward.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between mt-2 pt-3 border-t">
                      <div className="font-extrabold text-primary text-lg">{reward.pointsRequired} pts</div>
                      <Button
                        size="sm"
                        disabled={userPoints < reward.pointsRequired || redeemingId === reward.id}
                        onClick={() => handleRedeem(reward.id)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {redeemingId === reward.id ? "Redeeming..." : "Redeem"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Redemptions */}
          <TabsContent value="history" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Your Redemptions</CardTitle>
                <CardDescription>History of claimed vouchers and rewards</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {redemptions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6 text-sm">No past redemptions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {redemptions.map((red) => (
                      <div key={red.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <ShoppingBag className="h-6 w-6 text-primary" />
                          <div>
                            <div className="font-semibold text-sm">{red.rewardTitle}</div>
                            <div className="text-xs text-muted-foreground">Code: <span className="font-mono font-bold text-foreground">{red.code}</span></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-accent">{red.status}</Badge>
                          <div className="text-xs text-muted-foreground mt-1">{red.pointsSpent} pts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tiers */}
          <TabsContent value="tiers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiers.map((tier, index) => (
                <Card key={index} className="border-none shadow-md">
                  <CardHeader>
                    <div className={`w-12 h-12 ${tier.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-center text-lg">{tier.name}</CardTitle>
                    <CardDescription className="text-center text-xs">{tier.min}+ points</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-xs">
                      {tier.benefits.map((b, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5 text-accent" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
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
