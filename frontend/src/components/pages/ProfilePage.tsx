import { MapPin, Smartphone, Save, Camera, Shield, Globe, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { deviceApi } from "../../services/api";

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userDevices, setUserDevices] = useState<any[]>([]);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    language: 'en' | 'hi' | 'te';
  }>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    language: (user?.language as 'en' | 'hi' | 'te') || "en",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        language: user.language || "en",
      });
    }

    async function loadDevices() {
      try {
        const res = await deviceApi.getHistory();
        if (res.success && Array.isArray(res.data)) {
          setUserDevices(res.data);
        }
      } catch (err) {
        console.error("Error loading user devices:", err);
      }
    }
    loadDevices();
  }, [user]);

  const handleSaveProfile = () => {
    updateUser(formData);
    setIsEditing(false);
    toast.success("Profile updated successfully in backend!");
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const recyclingPreferences = [
    { id: 1, label: "Environmentally certified facilities only", enabled: true },
    { id: 2, label: "Prefer drop-off over pickup", enabled: false },
    { id: 3, label: "Data destruction guarantee required", enabled: true },
    { id: 4, label: "Receive monetary compensation when available", enabled: false },
    { id: 5, label: "Donate functional devices when possible", enabled: true }
  ];

  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, devices, and recycling preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="devices">My Devices</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* User Stats Card */}
            <Card className="border-none shadow-md bg-gradient-to-r from-primary to-accent text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-6 flex-wrap">
                  <Avatar className="w-20 h-20 border-4 border-white">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-white text-primary text-2xl">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-[200px]">
                    <h3 className="text-white mb-1">{user?.name}</h3>
                    <p className="text-white/80 text-sm mb-2">{user?.email}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/40">
                        {user?.role}
                      </Badge>
                      {user?.level && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/40">
                          Level {user.level}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/40">
                        {user?.points || 0} points
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">{user?.totalRecycled || 0}</p>
                      <p className="text-xs text-white/80">Recycled</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{user?.co2Saved || 0}</p>
                      <p className="text-xs text-white/80">CO₂ Saved</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{user?.badges?.length || 0}</p>
                      <p className="text-xs text-white/80">Badges</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Update your avatar</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Avatar className="w-32 h-32 bg-primary mb-4 border-4 border-primary/20">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-white text-4xl">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    JPG, PNG or GIF. Max 5MB.
                  </p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-none shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your account details</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-input-background" 
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-input-background" 
                        disabled={!isEditing}
                      />
                      {user?.emailVerified && (
                        <Badge variant="secondary" className="bg-accent/10 text-accent">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="bg-input-background" 
                        disabled={!isEditing}
                      />
                      {user?.phoneVerified && (
                        <Badge variant="secondary" className="bg-accent/10 text-accent">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select 
                      value={formData.language} 
                      onValueChange={(value) => setFormData({ ...formData, language: value as 'en' | 'hi' | 'te' })}
                      disabled={!isEditing}
                    >
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
                  {isEditing && (
                    <Button 
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleSaveProfile}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Settings
                </CardTitle>
                <CardDescription>Set your location for personalized recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" placeholder="123 Main St" className="bg-input-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="San Francisco" className="bg-input-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input id="state" placeholder="California" className="bg-input-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP/Postal Code</Label>
                    <Input id="zip" placeholder="94102" className="bg-input-background" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="autoLocation" />
                  <Label htmlFor="autoLocation" className="cursor-pointer">
                    Automatically detect my location
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Electronic Devices</CardTitle>
                    <CardDescription>Manage your registered devices for tracking</CardDescription>
                  </div>
                  <Button onClick={() => window.location.hash = "#upload"} className="bg-primary hover:bg-primary/90">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Add Device
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userDevices.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      No electronic devices registered yet. Click <strong>Add Device</strong> to recycle your first device!
                    </div>
                  ) : (
                    userDevices.map((device, idx) => (
                      <div
                        key={device.id || device.trackingId || idx}
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Smartphone className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{device.deviceDetails?.brand ? `${device.deviceDetails.brand} ${device.deviceDetails.model}` : (device.trackingId || device.name || "Electronic Device")}</div>
                            <div className="text-sm text-muted-foreground">
                              {device.deviceDetails?.deviceType || device.type || "Device"} • {device.createdAt || device.addedDate || "Recently"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className="bg-accent text-white"
                          >
                            {device.status || "Active"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            ₹{device.estimatedValue || 300}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Device Categories</CardTitle>
                <CardDescription>Types of devices you're interested in recycling</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Smartphones", "Laptops", "Tablets", "Wearables", "TVs", "Batteries", "Cables", "Other"].map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                    >
                      <input type="checkbox" className="rounded" defaultChecked={category === "Smartphones" || category === "Laptops"} />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Recycling Preferences</CardTitle>
                <CardDescription>Customize your recycling experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recyclingPreferences.map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <span>{pref.label}</span>
                    <Switch defaultChecked={pref.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what updates you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">Receive updates via email</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">Get instant alerts</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium">Recycling Event Alerts</div>
                    <div className="text-sm text-muted-foreground">Notify about local events</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium">Weekly Summary</div>
                    <div className="text-sm text-muted-foreground">Impact report every week</div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language & Region
                </CardTitle>
                <CardDescription>Set your preferred language</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select id="language" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg">
                    <option>English</option>
                    <option>Hindi (हिंदी)</option>
                    <option>Telugu (తెలుగు)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select id="timezone" className="w-full px-3 py-2 bg-input-background border border-border rounded-lg">
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>UTC+5:30 (IST)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data Privacy & Security
                </CardTitle>
                <CardDescription>Manage your data and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium">Share Usage Data</div>
                    <div className="text-sm text-muted-foreground">Help improve our platform</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium">Public Profile</div>
                    <div className="text-sm text-muted-foreground">Show on leaderboards</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium">Share Achievements</div>
                    <div className="text-sm text-muted-foreground">Allow sharing on social media</div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Manage your account data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Export Recycling History
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
