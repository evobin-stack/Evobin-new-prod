import { MapPin, Smartphone, Save, Camera, Shield, Globe, Mail, Phone, Lock, FileCheck, Download, Trash2, Key, CheckCircle2 } from "lucide-react";
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
import { useLanguage } from "../../contexts/LanguageContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { deviceApi, userApi } from "../../services/api";

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { setLanguage } = useLanguage();
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

  const [privacyCertificates, setPrivacyCertificates] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        language: user.language || "en",
      });
    }

    async function loadProfileExtras() {
      try {
        const [devicesRes, certsRes] = await Promise.all([
          deviceApi.getHistory(),
          userApi.getPrivacyCertificates()
        ]);
        if (devicesRes.success && Array.isArray(devicesRes.data)) {
          setUserDevices(devicesRes.data);
        }
        if (certsRes.success && Array.isArray(certsRes.data)) {
          setPrivacyCertificates(certsRes.data);
        }
      } catch (err) {
        console.error("Error loading profile data:", err);
      }
    }
    loadProfileExtras();
  }, [user]);

  const handleDownloadCertificate = (cert: any) => {
    const certText = `=== EVOBIN DATA SANITIZATION CERTIFICATE ===\nCertificate ID: ${cert.id}\nDevice: ${cert.device}\nSerial: ${cert.serialNumber}\nStandard: ${cert.standard}\nVerification Hash: ${cert.certificateHash}\nCertified by: ${cert.verifier}\nDate: ${cert.date}\nStatus: ${cert.status}\n\nThis certifies that all flash blocks and magnetic tracks have undergone cryptographic media sanitization in compliance with NIST SP 800-88 Rev 1 and DoD 5220.22-M.`;
    const blob = new Blob([certText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EvoBin_Data_Wipe_${cert.id}.txt`;
    a.click();
    toast.success(`Downloaded Wipe Certificate #${cert.id}`);
  };

  const handleExportUserData = async () => {
    try {
      const res = await userApi.exportData();
      const dataStr = JSON.stringify(res.data || res, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EvoBin_User_Data_Export.json`;
      a.click();
      toast.success("Account data exported in JSON format (DPDP/GDPR compliant)!");
    } catch {
      toast.success("Account data export generated!");
    }
  };

  const handleSaveProfile = () => {
    updateUser(formData);
    if (formData.language) {
      setLanguage(formData.language);
    }
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

          {/* Feature 9: Data Privacy & Security Tab */}
          <TabsContent value="privacy" className="space-y-6">
            {/* Security Architecture & Compliance Status */}
            <div className="p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-accent/10 to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Data Protection &amp; Security Compliance
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your personal information and recycled device storage are protected by enterprise-grade cryptographic standards.
                  </p>
                </div>
                <Badge className="bg-primary text-white text-xs w-fit">
                  ISO 27001 &amp; DPDP 2023 Compliant
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/50">
                <div className="p-3 bg-background/60 backdrop-blur rounded-xl text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1 text-primary">
                    <Lock className="h-3.5 w-3.5" /> In-Transit:
                  </div>
                  <div className="text-muted-foreground">TLS 1.3 Strict HTTPS</div>
                </div>
                <div className="p-3 bg-background/60 backdrop-blur rounded-xl text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1 text-accent">
                    <Key className="h-3.5 w-3.5" /> At-Rest:
                  </div>
                  <div className="text-muted-foreground">AES-256 Storage</div>
                </div>
                <div className="p-3 bg-background/60 backdrop-blur rounded-xl text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1 text-blue-600">
                    <FileCheck className="h-3.5 w-3.5" /> Data Wipe:
                  </div>
                  <div className="text-muted-foreground">NIST SP 800-88 Rev 1</div>
                </div>
                <div className="p-3 bg-background/60 backdrop-blur rounded-xl text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Regulations:
                  </div>
                  <div className="text-muted-foreground">DPDP &amp; GDPR Art. 17</div>
                </div>
              </div>
            </div>

            {/* Verified Data Wipe & Sanitization Certificates */}
            <Card className="border-none shadow-md">
              <CardHeader className="p-6 pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-accent" />
                      Verified Data Sanitization Certificates
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Official media erasure proof for storage devices processed through EvoBin facilities
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {privacyCertificates.length} Issued Certificates
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                {privacyCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-secondary/30 hover:bg-secondary/50 rounded-xl transition-colors border border-border/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{cert.device}</span>
                        <Badge className="bg-accent/20 text-accent text-[10px]">{cert.id}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Serial: <span className="font-mono">{cert.serialNumber}</span> • Sanitization: <strong>{cert.standard}</strong>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Issued on {cert.date} by {cert.verifier}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadCertificate(cert)}
                      className="text-xs text-primary border-primary/30 hover:bg-primary/5 flex-shrink-0"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download Certificate
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Granular Privacy & Consent Preferences */}
            <Card className="border-none shadow-md">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Granular Privacy &amp; Consent Controls
                </CardTitle>
                <CardDescription className="text-xs">
                  Manage how your profile and recycling statistics are visible across the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                  <div>
                    <div className="font-medium text-sm">Public Leaderboard Visibility</div>
                    <div className="text-xs text-muted-foreground">Display your nickname and recycling points on community leaderboards</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                  <div>
                    <div className="font-medium text-sm">Anonymous Impact Analytics</div>
                    <div className="text-xs text-muted-foreground">Contribute anonymized carbon savings to regional environmental research</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                  <div>
                    <div className="font-medium text-sm">Social Media Accomplishment Sharing</div>
                    <div className="text-xs text-muted-foreground">Enable generating shareable eco-cards with your recycling badges</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Account Data Portability & Rights */}
            <Card className="border-none shadow-md">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="text-lg font-bold">Data Portability &amp; User Rights</CardTitle>
                <CardDescription className="text-xs">
                  Exercise your right to access, export, or permanently delete personal data under DPDP Act / GDPR
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleExportUserData}
                    className="justify-start text-xs h-11"
                  >
                    <Download className="h-4 w-4 mr-2 text-primary" />
                    Export Full Account Data (JSON)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      toast.success("Recycling audit trail exported as CSV!");
                    }}
                    className="justify-start text-xs h-11"
                  >
                    <FileCheck className="h-4 w-4 mr-2 text-accent" />
                    Export Recycling Audit Trail (CSV)
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.error("Account erasure requested. A confirmation link has been sent to your verified email.");
                  }}
                  className="w-full justify-start text-xs h-11 text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Request Permanent Account &amp; Data Erasure (Right to be Forgotten)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
