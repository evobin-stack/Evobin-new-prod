import { MessageSquare, Heart, Trophy, Send, Share2, Sparkles, Award, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import { communityApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { SocialShareModal } from "../SocialShareModal";
import { toast } from "sonner";

export function CommunityPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Recycling Story");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isPosting, setIsPosting] = useState(false);
  
  // Comments state
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([]);

  // Share modal state
  const [shareData, setShareData] = useState<any | null>(null);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      const [postsRes, chalRes] = await Promise.all([
        communityApi.getPosts(),
        communityApi.getChallenges()
      ]);

      if (postsRes.success && Array.isArray(postsRes.data)) {
        setPosts(postsRes.data);
      }
      if (chalRes.success && Array.isArray(chalRes.data)) {
        setChallenges(chalRes.data);
      }
    } catch (e) {
      console.error("Error loading community data:", e);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast.error("Please enter some text to share.");
      return;
    }
    setIsPosting(true);
    try {
      const formattedContent = `[${selectedCategory}] ${newPostContent.trim()}`;
      const res = await communityApi.createPost(formattedContent);
      if (res.success && res.data) {
        toast.success("Story published to community!");
        setNewPostContent("");
        loadCommunityData();
      } else {
        toast.error(res.error || "Failed to post");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    await communityApi.likePost(postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
  };

  const toggleComments = async (postId: string) => {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
      return;
    }
    setOpenCommentsPostId(postId);
    try {
      const res = await communityApi.getComments(postId);
      if (res.success && Array.isArray(res.data)) {
        setCommentsMap(prev => ({ ...prev, [postId]: res.data as any[] }));
      }
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      const res = await communityApi.addComment(postId, text);
      if (res.success && res.data) {
        setCommentsMap(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data]
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
        toast.success("Comment added!");
      }
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (joinedChallenges.includes(challengeId)) {
      toast.info("You have already joined this challenge!");
      return;
    }
    try {
      const res = await communityApi.joinChallenge(challengeId);
      setJoinedChallenges(prev => [...prev, challengeId]);
      toast.success(res.message || "Challenge Joined! Track your e-waste uploads to claim bonus points.");
      loadCommunityData();
    } catch {
      setJoinedChallenges(prev => [...prev, challengeId]);
      toast.success("Joined challenge successfully!");
    }
  };

  const categories = ["All", "Recycling Story", "DIY Tips & Tricks", "Milestone & Achievement"];

  const filteredPosts = activeFilter === "All"
    ? posts
    : posts.filter(p => p.content?.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Users className="h-7 w-7 text-primary" />
              {t("Community & Stories") || "EvoBin Eco Community"}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t("Share recycling stories, DIY repair tips, celebrate milestones, and participate in sustainability sprints.")}
            </p>
          </div>
          <Badge className="bg-primary text-white text-xs px-3 py-1.5 w-fit">
            🌍 12,400+ Active Eco Members
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Creator */}
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Share an achievement, story, or repair tip
                  </CardTitle>
                  <div className="flex gap-1">
                    {["Recycling Story", "DIY Tips", "Milestone"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                          selectedCategory === cat
                            ? "bg-primary text-white"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3">
                <Textarea
                  placeholder={`What e-waste item did you recycle or repair today? Share your experience with the community...`}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[90px] text-xs md:text-sm bg-input-background"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Posting as <strong>{user?.name || "Eco Member"}</strong>
                  </span>
                  <Button
                    size="sm"
                    onClick={handleCreatePost}
                    disabled={isPosting}
                    className="bg-primary text-xs"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    {isPosting ? "Publishing..." : "Publish Post"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Filter:</span>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeFilter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(cat)}
                  className={`text-xs rounded-full h-7 ${activeFilter === cat ? "bg-primary" : ""}`}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="border-none shadow-md">
                  <CardContent className="p-4 md:p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border">
                          <AvatarImage src={post.authorAvatar} />
                          <AvatarFallback>{post.authorName ? post.authorName.slice(0, 2).toUpperCase() : "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-sm">{post.authorName}</div>
                          <div className="text-[11px] text-muted-foreground">{post.createdAt}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-secondary/50">
                        {post.content?.startsWith("[") ? post.content.split("]")[0].replace("[", "") : "Eco Story"}
                      </Badge>
                    </div>

                    <p className="text-xs md:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {post.content?.startsWith("[") ? post.content.replace(/^\[.*?\]\s*/, "") : post.content}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-1.5 hover:text-red-500 transition-colors"
                        >
                          <Heart className="h-4 w-4 text-red-500 fill-red-500/20" />
                          <span>{post.likes || 0} Likes</span>
                        </button>
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-1.5 hover:text-primary transition-colors"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.commentsCount || (commentsMap[post.id]?.length || 0)} Comments</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setShareData({
                          title: `${post.authorName}'s Recycling Milestone`,
                          co2Saved: 15.0,
                          recycledWeight: 5.0,
                          points: 300,
                          badgeName: "Community Hero"
                        })}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </button>
                    </div>

                    {/* Expandable Comments Drawer */}
                    {openCommentsPostId === post.id && (
                      <div className="pt-3 border-t space-y-3 bg-secondary/20 p-3 rounded-xl mt-2">
                        <div className="text-xs font-semibold text-foreground">Community Discussion:</div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {(commentsMap[post.id] || []).length === 0 ? (
                            <div className="text-xs text-muted-foreground italic py-1">
                              No comments yet. Be the first to reply!
                            </div>
                          ) : (
                            (commentsMap[post.id] || []).map((c, i) => (
                              <div key={i} className="p-2 bg-background rounded-lg text-xs space-y-0.5 border border-border/50">
                                <div className="font-semibold text-primary">{c.authorName || "Anonymous Recycler"}</div>
                                <div className="text-muted-foreground">{c.content}</div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add Comment Input */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Write a supportive reply..."
                            value={commentInputs[post.id] || ""}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            className="text-xs h-8 bg-background"
                          />
                          <Button size="sm" onClick={() => handleAddComment(post.id)} className="h-8 bg-primary text-xs">
                            Reply
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Active Community Challenges */}
          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Active Community Challenges
                </CardTitle>
                <CardDescription className="text-xs">Join weekly sprints &amp; earn bonus eco points</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-4">
                {challenges.map((c) => {
                  const hasJoined = joinedChallenges.includes(c.id);
                  return (
                    <div key={c.id} className="p-4 bg-secondary/30 rounded-xl space-y-2 border border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-foreground">{c.title}</div>
                        <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-300 text-xs">
                          +{c.rewardPoints} pts
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
                      
                      <div className="flex items-center justify-between pt-2 text-xs">
                        <span className="text-muted-foreground">{c.participantsCount + (hasJoined ? 1 : 0)} Participants</span>
                        <Button
                          size="sm"
                          onClick={() => handleJoinChallenge(c.id)}
                          disabled={hasJoined}
                          className={`text-xs h-7 ${hasJoined ? "bg-green-600 text-white" : "bg-primary"}`}
                        >
                          {hasJoined ? "✓ Joined" : "Join Challenge"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Eco Warrior Spotlight */}
            <Card className="border-none shadow-md bg-gradient-to-br from-primary/10 to-accent/10">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Eco-Hero Spotlight
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2 text-xs text-muted-foreground">
                <p>
                  <strong>Karthik Reddy</strong> recycled 8 vintage desktops &amp; diverted 45kg of e-waste from landfill this week!
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShareData({
                      title: "My EvoBin Sustainability Journey",
                      co2Saved: 128.5,
                      recycledWeight: 45.2,
                      points: 2450,
                      badgeName: "Platform Pioneer"
                    })}
                    className="w-full text-xs text-primary"
                  >
                    <Share2 className="h-3.5 w-3.5 mr-1.5" />
                    Share Your Own Accomplishments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Share Modal */}
        <SocialShareModal
          open={!!shareData}
          onOpenChange={(open) => !open && setShareData(null)}
          shareData={shareData || {}}
        />
      </div>
    </div>
  );
}
