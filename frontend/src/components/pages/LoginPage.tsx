import { Facebook, Github, Mail, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    language: "en",
    role: "user" as "user" | "admin" | "worker" | "organization",
  });
  const [error, setError] = useState("");
  const { login, register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      // Login
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success("Welcome back!", {
          description: "You have successfully logged in.",
        });
        onNavigate("dashboard");
      } else {
        setError(result.error || "Login failed");
        toast.error("Login failed", {
          description: result.error || "Please check your credentials.",
        });
      }
    } else {
      // Register
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        language: formData.language as "en" | "hi" | "te",
        role: formData.role,
      });

      if (result.success) {
        toast.success("Account created!", {
          description: "Welcome to EvoBin. Let's start recycling!",
        });
        onNavigate("dashboard");
      } else {
        setError(result.error || "Registration failed");
        toast.error("Registration failed", {
          description: result.error || "Please try again.",
        });
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-secondary/30 flex items-center justify-center px-4 py-12">
      <div className="max-w-[1440px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2 mb-8">
            {/* <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">E♻</span>
            </div> */}
            <div className="w-12 h-12 flex items-center justify-center">
  <img
    src="/assets/logo.png"
    alt="EvoBin Logo"
    className="w-full h-full object-contain"
  />
</div>
            <span className="text-3xl font-bold text-foreground">EvoBin</span>
          </div>
          <h2 className="mb-6">
            Join the Movement for Sustainable E-Waste Management
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Be part of a community that's making a real difference. Track your impact, earn rewards, and help build a cleaner planet.
          </p>
          <div className="space-y-4">
            {[
              "AI-powered waste identification",
              "Real-time tracking & analytics",
              "Gamification & rewards system",
              "Community leaderboard"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Form */}
        <Card className="shadow-xl border-none">
          <CardHeader className="text-center">
            <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Enter your credentials to access your account" 
                : "Sign up to start your sustainability journey"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="bg-input-background border-border"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-input-background border-border"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="bg-input-background border-border"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="bg-input-background border-border"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="bg-input-background border-border"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                      <SelectTrigger className="bg-input-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                        <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Account Type</Label>
                    <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger className="bg-input-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Individual User</SelectItem>
                        <SelectItem value="worker">Recycling Worker</SelectItem>
                        <SelectItem value="organization">Organization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-muted-foreground">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
              </Button>

              {/* {isLogin && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Demo Accounts:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-secondary rounded">
                      <p className="font-medium">User</p>
                      <p className="text-muted-foreground">karthikreddy@example.com</p>
                      <p className="text-muted-foreground">password123</p>
                    </div>
                    <div className="p-2 bg-secondary rounded">
                      <p className="font-medium">Admin</p>
                      <p className="text-muted-foreground">admin@ewaste.com</p>
                      <p className="text-muted-foreground">admin123</p>
                    </div>
                  </div>
                </div>
              )} */}
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="w-full">
                <Mail className="h-5 w-5" />
              </Button>
              <Button variant="outline" className="w-full">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="outline" className="w-full">
                <Github className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
