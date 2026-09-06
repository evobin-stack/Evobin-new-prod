import { Users, Package, TrendingUp, AlertCircle, Phone, MapPin, Truck, Building2, BarChart3, Shield, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

export function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [userList, setUserList] = useState<any[]>([]);
  const [taskList, setTaskList] = useState<any[]>([]);
  const [selectedSafetyTask, setSelectedSafetyTask] = useState<any | null>(null);

  const isAdmin = user?.role === 'admin';
  const isWorker = user?.role === 'worker';
  const isOrganization = user?.role === 'organization';

  useEffect(() => {
    async function loadData() {
      try {
        // All roles load tasks
        const tasksRes = await adminApi.getWorkerTasks();
        if (tasksRes.success && Array.isArray(tasksRes.data)) {
          setTaskList(tasksRes.data);
        }

        // Only admin loads stats and user list
        if (isAdmin) {
          const [statsRes, usersRes] = await Promise.all([
            adminApi.getStats(),
            adminApi.getUsers(),
          ]);
          if (statsRes.success && statsRes.data) setStats(statsRes.data);
          if (usersRes.success && Array.isArray(usersRes.data)) setUserList(usersRes.data);
        }

        // Worker and organization load stats for their dashboard
        if (isWorker || isOrganization) {
          const statsRes = await adminApi.getStats();
          if (statsRes.success && statsRes.data) setStats(statsRes.data);
        }
      } catch (err) {
        console.error("Error loading portal data:", err);
      }
    }
    loadData();
  }, [isAdmin, isWorker, isOrganization]);

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      setTaskList(prev => prev.map(t =>
        (t.id === taskId || t.trackingId === taskId || t._id === taskId)
          ? { ...t, status: newStatus }
          : t
      ));
      await adminApi.updateWorkerTaskStatus(taskId, newStatus);
      toast.success(`Status updated to "${newStatus}"`, {
        description: `Pickup #${taskId}`
      });
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const getAddressStr = (t: any) => {
    if (typeof t.address === 'string' && t.address) return t.address;
    const p = t.pickupAddress;
    if (p && typeof p === 'object') {
      return [p.addressLine1, p.city, p.state].filter(Boolean).join(', ') || 'Hyderabad';
    }
    return 'N/A';
  };

  const getPhoneStr = (t: any) => {
    if (typeof t.userPhone === 'string' && t.userPhone) return t.userPhone;
    const p = t.pickupAddress;
    if (p && typeof p === 'object' && p.phone) return p.phone;
    return 'N/A';
  };

  const getNameStr = (t: any) => {
    if (typeof t.userName === 'string' && t.userName) return t.userName;
    const p = t.pickupAddress;
    if (p && typeof p === 'object' && p.fullName) return p.fullName;
    return 'Customer';
  };

  const getDeviceStr = (t: any) => {
    const d = t.deviceDetails;
    if (d && typeof d === 'object') {
      if (d.brand) return `${d.brand} ${d.model || ''}`.trim();
      if (typeof d.deviceType === 'string') return d.deviceType;
    }
    return typeof t.type === 'string' ? t.type : 'Device';
  };

  const getSafetyTag = (t: any) => {
    const d = (t.deviceDetails?.deviceType || t.type || '').toLowerCase();
    if (d.includes('laptop') || d.includes('phone') || d.includes('battery') || d.includes('tablet')) {
      return { level: 'Battery Risk', color: 'bg-orange-500 text-white', ppe: ['Fire-Resistant ESD Gloves', 'Safety Goggles'], protocol: 'Inspect for swelling; isolate in fireproof box if pierced.' };
    }
    if (d.includes('tv') || d.includes('monitor') || d.includes('crt')) {
      return { level: 'High Voltage / Glass', color: 'bg-red-600 text-white', ppe: ['High-Voltage Gloves', 'Face Shield'], protocol: 'Discharge capacitor charge; do not crush funnel.' };
    }
    if (d.includes('microwave') || d.includes('refrigerator')) {
      return { level: 'Refrigerant / Heavy', color: 'bg-purple-600 text-white', ppe: ['Heavy Leather Gloves', 'Respirator'], protocol: 'Evacuate gas before shredding; 2-person lift.' };
    }
    return { level: 'Standard Risk', color: 'bg-green-600 text-white', ppe: ['Cut-Resistant Work Gloves'], protocol: 'Standard electronic waste intake.' };
  };

  const statusBadgeClass = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'completed': return 'bg-accent text-white';
      case 'in-transit': return 'bg-purple-600 text-white';
      case 'collected': return 'bg-blue-600 text-white';
      case 'scheduled': return 'bg-yellow-500 text-white';
      default: return 'bg-secondary text-foreground';
    }
  };

  // ─── Pickup Tasks Table (shared by all roles) ────────────────────────────────
  const PickupTasksTable = () => (
    <Card className="border-none shadow-md">
      <CardHeader className="p-4 md:p-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            {isWorker ? 'My Assigned Pickup Tasks' : isOrganization ? 'Corporate Device Submissions' : 'All Pickup Tasks & Submissions'}
          </CardTitle>
          <CardDescription className="text-xs">
            {isWorker
              ? 'Live pickup requests assigned to your route with automated worker safety alerts'
              : isOrganization
              ? 'Track your organization\'s submitted devices and their processing status'
              : 'All platform device pickup requests with automated worker safety triage'}
          </CardDescription>
        </div>
        {isWorker && (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-200">
            Dispatch Portal
          </Badge>
        )}
        {isOrganization && (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
            Corporate View
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Customer Details</TableHead>
              <TableHead>Pickup Address</TableHead>
              <TableHead>Device Info</TableHead>
              <TableHead>Safety Hazard (AI)</TableHead>
              <TableHead>Est. Value</TableHead>
              <TableHead>Status</TableHead>
              {/* Action column only for admin and worker */}
              {(isAdmin || isWorker) && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(taskList || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin || isWorker ? 8 : 7} className="text-center py-8 text-muted-foreground text-sm">
                  No active pickup submissions found.
                  {!isWorker && !isOrganization && ' Users can submit devices via the Upload page.'}
                </TableCell>
              </TableRow>
            ) : (
              (taskList || []).map((t, idx) => {
                const taskId = String(t.trackingId || t.id || t._id || `task-${idx}`);
                const safety = getSafetyTag(t);
                return (
                  <TableRow key={taskId}>
                    <TableCell className="font-mono text-sm font-bold text-primary">{taskId}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{getNameStr(t)}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        {getPhoneStr(t)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs max-w-[180px]">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="truncate">{getAddressStr(t)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      <div>{getDeviceStr(t)}</div>
                      <div className="text-xs text-muted-foreground capitalize">{t.deliveryMethod || 'pickup'}</div>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setSelectedSafetyTask({ ...t, safety })}
                        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                      >
                        <Badge className={`${safety.color} text-[10px] cursor-pointer`}>
                          {safety.level}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-accent">₹{t.estimatedValue || 300}</TableCell>
                    <TableCell>
                      <Badge className={statusBadgeClass(t.status)}>
                        {t.status || 'Scheduled'}
                      </Badge>
                    </TableCell>
                    {/* Action buttons: only admin and worker can update status */}
                    {(isAdmin || isWorker) && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" className="h-7 text-xs px-2"
                            onClick={() => handleUpdateTaskStatus(taskId, 'In-Transit')}>
                            In-Transit
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-blue-600 border-blue-200"
                            onClick={() => handleUpdateTaskStatus(taskId, 'Collected')}>
                            Collected
                          </Button>
                          <Button size="sm" className="h-7 text-xs px-2 bg-accent text-white hover:bg-accent/90"
                            onClick={() => handleUpdateTaskStatus(taskId, 'Completed')}>
                            Complete
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  // ─── Admin Stats Cards ───────────────────────────────────────────────────────
  const adminStats = [
    { title: 'Total Users', value: `${stats?.totalUsers ?? 0}`, icon: <Users className="h-5 w-5" />, color: 'text-primary' },
    { title: 'E-Waste Processed', value: `${stats?.totalEWasteRecycled ?? 0} kg`, icon: <Package className="h-5 w-5" />, color: 'text-accent' },
    { title: 'Active Centers', value: `${stats?.activeCenters ?? 0}`, icon: <TrendingUp className="h-5 w-5" />, color: 'text-blue-600' },
    { title: 'Pending Pickups', value: `${stats?.pendingPickups ?? taskList.length}`, icon: <AlertCircle className="h-5 w-5" />, color: 'text-orange-600' },
  ];

  // ─── Worker Stats Cards ──────────────────────────────────────────────────────
  const workerStats = [
    { title: 'Assigned Pickups', value: `${taskList.filter(t => !['Completed'].includes(t.status)).length}`, icon: <Truck className="h-5 w-5" />, color: 'text-orange-500' },
    { title: 'Completed Today', value: `${taskList.filter(t => t.status === 'Completed').length}`, icon: <Package className="h-5 w-5" />, color: 'text-accent' },
    { title: 'In-Transit', value: `${taskList.filter(t => t.status === 'In-Transit').length}`, icon: <TrendingUp className="h-5 w-5" />, color: 'text-purple-600' },
    { title: 'My Points', value: `${user?.points ?? 0}`, icon: <Shield className="h-5 w-5" />, color: 'text-primary' },
  ];

  // ─── Organization Stats Cards ────────────────────────────────────────────────
  const orgStats = [
    { title: 'Submissions Made', value: `${taskList.length}`, icon: <Package className="h-5 w-5" />, color: 'text-primary' },
    { title: 'Completed', value: `${taskList.filter(t => t.status === 'Completed').length}`, icon: <TrendingUp className="h-5 w-5" />, color: 'text-accent' },
    { title: 'Processing', value: `${taskList.filter(t => t.status !== 'Completed').length}`, icon: <AlertCircle className="h-5 w-5" />, color: 'text-orange-600' },
    { title: 'CO₂ Saved', value: `${stats?.totalCO2Saved ?? 0} kg`, icon: <Building2 className="h-5 w-5" />, color: 'text-blue-600' },
  ];

  const currentStats = isWorker ? workerStats : isOrganization ? orgStats : adminStats;

  // ─── WORKER PORTAL (Feature 5: Worker Safety Automation) ─────────────────────
  if (isWorker) {
    return (
      <div className="w-full">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
          <div>
            <h1 className="mb-2 text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Truck className="h-7 w-7 text-orange-500" />
              Worker Dispatch &amp; Safety Automation Hub
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Automated hazardous device triage, required PPE verification, and real-time dispatch management.
            </p>
          </div>

          {/* Worker Safety Automation Alert Card */}
          <div className="p-5 bg-gradient-to-r from-orange-500/10 via-background to-primary/5 rounded-2xl border border-orange-500/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-orange-600" />
                <span className="font-bold text-sm md:text-base text-foreground">Worker Safety Automation Protocol Active</span>
              </div>
              <Badge className="bg-orange-500 text-white text-xs">AI Hazard Triage 100% Online</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Devices classified as <strong>Battery Risk</strong> or <strong>High Voltage</strong> must be placed in secondary insulated bins before transit. Always verify zero battery leakage before vehicle loading.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline" className="text-xs bg-background">🛡️ Fireproof Sand Container</Badge>
              <Badge variant="outline" className="text-xs bg-background">🧤 ESD Insulated Gloves</Badge>
              <Badge variant="outline" className="text-xs bg-background">🥽 Impact Safety Goggles</Badge>
            </div>
          </div>

          {/* Worker Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {currentStats.map((s, i) => (
              <Card key={i} className="border-none shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${s.color} bg-secondary p-2 rounded-lg`}>{s.icon}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{s.title}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pickup Tasks */}
          <PickupTasksTable />

          {/* Safety Inspector Dialog */}
          <Dialog open={!!selectedSafetyTask} onOpenChange={(open) => !open && setSelectedSafetyTask(null)}>
            <DialogContent className="sm:max-w-md p-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  <ShieldAlert className="h-5 w-5 text-orange-500" />
                  Worker Safety Protocol #{selectedSafetyTask?.trackingId}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Automated handling protocol for {getDeviceStr(selectedSafetyTask)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="p-3 bg-secondary/40 rounded-xl space-y-1 text-xs">
                  <div className="font-semibold text-foreground">Identified Hazard Classification:</div>
                  <Badge className={`${selectedSafetyTask?.safety?.color} text-xs mt-1`}>
                    {selectedSafetyTask?.safety?.level}
                  </Badge>
                </div>

                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-orange-700 dark:text-orange-400">Handling Protocol:</div>
                  <p className="text-muted-foreground">{selectedSafetyTask?.safety?.protocol}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-foreground">Mandatory Worker PPE:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSafetyTask?.safety?.ppe?.map((p: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        🛡️ {p}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button onClick={() => setSelectedSafetyTask(null)} className="w-full bg-primary text-xs mt-2">
                  Acknowledge & Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // ─── ORGANIZATION PORTAL ─────────────────────────────────────────────────────
  if (isOrganization) {
    return (
      <div className="w-full">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-7 w-7 text-blue-600" />
              Corporate Sustainability Portal
            </h1>
            <p className="text-muted-foreground">
              Track your organization's e-waste submissions, monitor processing status, and view environmental impact.
            </p>
          </div>

          {/* Org Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {currentStats.map((s, i) => (
              <Card key={i} className="border-none shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${s.color} bg-secondary p-2 rounded-lg`}>{s.icon}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{s.title}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Organization sees only THEIR submissions — NO user list, NO status update buttons */}
          <PickupTasksTable />
        </div>
      </div>
    );
  }

  // ─── ADMIN PORTAL (full access) ──────────────────────────────────────────────
  return (
    <div className="w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            Admin Management Dashboard
          </h1>
          <p className="text-muted-foreground">
            Full platform control — manage users, content, pickup tasks, and system status.
          </p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {currentStats.map((s, i) => (
            <Card key={i} className="border-none shadow-md">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${s.color} bg-secondary p-3 rounded-lg`}>{s.icon}</div>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">{s.title}</p>
                <p className="text-xl md:text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Tabs: Pickup Tasks + Registered Users + System Status */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="tasks">
              Pickup Tasks ({(taskList || []).length})
            </TabsTrigger>
            <TabsTrigger value="users">
              Registered Users ({(userList || []).length})
            </TabsTrigger>
            <TabsTrigger value="system">System Status</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <PickupTasksTable />
          </TabsContent>

          {/* Registered Users — ADMIN ONLY */}
          <TabsContent value="users">
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Registered User Accounts ({(userList || []).length})
                </CardTitle>
                <CardDescription className="text-xs">
                  All users registered in the MongoDB Atlas database
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Recycled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(userList || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                          No users found in database.
                        </TableCell>
                      </TableRow>
                    ) : (
                      (userList || []).map((u, idx) => (
                        <TableRow key={String(u.id || u._id || idx)}>
                          <TableCell className="font-medium text-sm">{u.name || 'User'}</TableCell>
                          <TableCell className="text-sm">{u.email || '—'}</TableCell>
                          <TableCell>
                            <Badge className={
                              u.role === 'admin' ? 'bg-primary text-white' :
                              u.role === 'worker' ? 'bg-orange-500 text-white' :
                              u.role === 'organization' ? 'bg-blue-600 text-white' :
                              'bg-secondary text-foreground'
                            }>
                              {u.role || 'user'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-bold text-primary">{u.points ?? 0} pts</TableCell>
                          <TableCell className="text-sm">{u.totalRecycled ?? 0} kg</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Status — ADMIN ONLY */}
          <TabsContent value="system">
            <Card className="border-none shadow-md">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  System Health &amp; Backend Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-3">
                <div className="p-4 bg-secondary/30 rounded-lg flex justify-between items-center text-sm">
                  <span>FastAPI Backend Server:</span>
                  <Badge className="bg-accent">Running (127.0.0.1:8000)</Badge>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg flex justify-between items-center text-sm">
                  <span>MongoDB Atlas Cluster:</span>
                  <Badge className="bg-accent">Connected (evobin_db)</Badge>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg flex justify-between items-center text-sm">
                  <span>YOLO Vision Model:</span>
                  <Badge className="bg-primary">Loaded (best10.pt)</Badge>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg flex justify-between items-center text-sm">
                  <span>Total Registered Users:</span>
                  <Badge variant="outline">{stats?.totalUsers ?? userList.length}</Badge>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg flex justify-between items-center text-sm">
                  <span>Total Pickup Tasks:</span>
                  <Badge variant="outline">{taskList.length}</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
