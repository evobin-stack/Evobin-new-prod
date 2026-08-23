import { MessageSquare, Heart, Trophy, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import { useState, useEffect } from "react";
import { communityApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

export function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

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
      toast.error("Please enter some text to post.");
      return;
    }
    setIsPosting(true);
    try {
      const res = await communityApi.createPost(newPostContent);
      if (res.success && res.data) {
        toast.success("Post published!");
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
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const res = await communityApi.joinChallenge(challengeId);
      toast.success(res.message || "Joined challenge successfully!");
      loadCommunityData();
    } catch (e) {
      toast.error("Failed to join challenge.");
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl md:text-3xl font-bold">EvoBin Eco Community</h1>
          <p className="text-muted-foreground">
            Share recycling tips, celebrate milestones, and participate in sustainability challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Creator */}
            <Card className="border-none shadow-md">
              <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold">Share your recycling story</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <Textarea
                  placeholder="What e-waste item did you recycle today?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[90px]"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Posting as {user?.name || "Eco Member"}</span>
                  <Button size="sm" onClick={handleCreatePost} disabled={isPosting} className="bg-primary">
                    <Send className="h-4 w-4 mr-1.5" />
                    {isPosting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="border-none shadow-md">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.authorAvatar} />
                        <AvatarFallback>{post.authorName ? post.authorName.slice(0, 2).toUpperCase() : "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm">{post.authorName}</div>
                        <div className="text-xs text-muted-foreground">{post.createdAt}</div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
                    <div className="flex items-center gap-4 pt-3 border-t text-xs text-muted-foreground">
                      <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <Heart className="h-4 w-4 text-red-500 fill-red-500/20" />
                        <span>{post.likes} Likes</span>
                      </button>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.commentsCount} Comments</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Challenges */}
          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Active Challenges
                </CardTitle>
                <CardDescription className="text-xs">Earn bonus eco-points</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                {challenges.map((c) => (
                  <div key={c.id} className="p-4 bg-secondary/30 rounded-lg space-y-2">
                    <div className="font-semibold text-sm">{c.title}</div>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <Badge variant="outline" className="text-xs">+{c.rewardPoints} pts</Badge>
                      <Button size="sm" onClick={() => handleJoinChallenge(c.id)} className="bg-primary text-xs">
                        Join ({c.participantsCount})
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
