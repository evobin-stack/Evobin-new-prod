// User Types
export type UserRole = 'user' | 'admin' | 'worker' | 'organization';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  language: 'en' | 'hi' | 'te';
  points?: number;
  level?: number;
  totalRecycled?: number;
  co2Saved?: number;
  joinedDate?: string;
  badges?: (string | Badge)[];
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends Omit<User, 'badges'> {
  totalEWasteRecycled: number;
  carbonFootprintSaved: number;
  totalPoints: number;
  rank: number;
  badges: (Badge | string)[];
  streak: number;
  level: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  phone?: string;
  language?: 'en' | 'hi' | 'te';
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Device & Upload Types
export interface DeviceUploadRequest {
  image: File;
  additionalImages?: File[];
  notes?: string;
}

export interface DeviceDetailsForm {
  deviceType: string;
  brand: string;
  model: string;
  yearOfPurchase?: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  functionalStatus: 'Working' | 'Partially Working' | 'Not Working';
  accessories?: string[];
  additionalNotes?: string;
}

export interface PickupAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  addressType: 'Home' | 'Office' | 'Other';
}

export interface PickupRequest {
  deviceId: string;
  pickupAddress: PickupAddress;
  preferredDate: string;
  preferredTime: 'Morning (9AM-12PM)' | 'Afternoon (12PM-3PM)' | 'Evening (3PM-6PM)';
  specialInstructions?: string;
}

export interface DropoffRequest {
  deviceId: string;
  centerId: string;
  plannedDate?: string;
}

export interface DeviceSubmission {
  deviceDetails: DeviceDetailsForm;
  analysisResult?: DeviceAnalysisResult;
  deliveryMethod: 'pickup' | 'dropoff';
  pickupRequest?: PickupRequest;
  dropoffRequest?: DropoffRequest;
}

export interface DeviceAnalysisResult {
  id: string;
  deviceType: string;
  brand: string;
  model: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  recyclable: boolean;
  estimatedValue: number;
  estimatedMoneyValue?: number; // Approximate cash value in local currency
  confidence: number;
  materials: Material[];
  recommendations: string[];
  carbonImpact: number;
  nearestCenters: number;
  userId: string;
  createdAt: string;
}

export interface Material {
  name: string;
  percentage: number;
  recyclable: boolean;
  hazardous?: boolean;
}

// Collection Center Types
export interface CollectionCenter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  operatingHours: OperatingHours;
  acceptedItems: string[];
  rating: number;
  reviewCount: number;
  distance?: number;
  certifications: string[];
  facilities: string[];
}

export interface OperatingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  totalPoints: number;
  totalEWaste: number;
  carbonSaved: number;
  badge?: string;
  country?: string;
  state?: string;
}

export interface LeaderboardFilters {
  period: 'daily' | 'weekly' | 'monthly' | 'allTime';
  scope: 'global' | 'country' | 'state' | 'city';
  category?: 'points' | 'ewaste' | 'carbon';
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
  requirement: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  progress: number;
  target: number;
  completed: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'discount' | 'voucher' | 'product' | 'donation';
  imageUrl: string;
  stock: number;
  expiryDate?: string;
  redeemed?: boolean;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  userId: string;
  redeemedAt: string;
  code: string;
  status: 'active' | 'used' | 'expired';
}

// Activity Types
export interface Activity {
  id: string;
  userId: string;
  type: string;
  date: string;
  points: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Rejected';
  location: string;
  deviceId?: string;
  centerId?: string;
}

// Analytics Types
export interface UserAnalytics {
  userId: string;
  period: 'week' | 'month' | 'year';
  eWasteByCategory: CategoryData[];
  carbonTrend: TrendData[];
  recyclingRate: number;
  topDevices: DeviceCount[];
  monthlyComparison: MonthlyData[];
  impactMetrics: ImpactMetrics;
}

export interface CategoryData {
  category: string;
  weight: number;
  percentage: number;
  count: number;
}

export interface TrendData {
  date: string;
  value: number;
}

export interface DeviceCount {
  device: string;
  count: number;
}

export interface MonthlyData {
  month: string;
  current: number;
  previous: number;
}

export interface ImpactMetrics {
  totalCO2Saved: number;
  treesEquivalent: number;
  energySaved: number;
  waterSaved: number;
}

// Community Types
export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  liked?: boolean;
  tags?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: number;
  progress: number;
  participants: number;
  endDate: string;
  reward: number;
  category: string;
  status: 'active' | 'upcoming' | 'completed';
}

// Education Types
export interface EducationalContent {
  id: string;
  title: string;
  description: string;
  category: 'article' | 'video' | 'guide' | 'infographic';
  content: string;
  videoUrl?: string;
  duration?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  author: string;
  views: number;
  likes: number;
  createdAt: string;
  language: 'en' | 'hi' | 'te';
}

export interface DisassemblyGuide {
  id: string;
  deviceType: string;
  steps: DisassemblyStep[];
  tools: string[];
  safetyWarnings: string[];
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  videoUrl?: string;
}

export interface DisassemblyStep {
  stepNumber: number;
  title: string;
  description: string;
  imageUrl?: string;
  warnings?: string[];
}

// Events Types
export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'collection-drive' | 'workshop' | 'webinar' | 'cleanup';
  startDate: string;
  endDate: string;
  location: string;
  latitude?: number;
  longitude?: number;
  organizer: string;
  capacity: number;
  registered: number;
  imageUrl?: string;
  tags: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
  attended: boolean;
  feedback?: EventFeedback;
}

export interface EventFeedback {
  rating: number;
  comment?: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'achievement' | 'reward' | 'event' | 'system' | 'community';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  imageUrl?: string;
  createdAt: string;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  activeUsers?: number;
  totalEWasteCollected?: number;
  totalEWasteRecycled?: number;
  totalCO2Saved: number;
  collectionCenters?: number;
  activeCenters?: number;
  pendingApprovals?: number;
  recentActivity?: Activity[];
}

export interface ContentManagement {
  id: string;
  type: 'blog' | 'guide' | 'faq' | 'announcement';
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Worker Safety Types
export interface SafetyAlert {
  id: string;
  centerId: string;
  type: 'hazard' | 'equipment' | 'incident' | 'training';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  reportedBy: string;
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  centerId: string;
  role: string;
  certifications: string[];
  trainingCompleted: string[];
  safetyScore: number;
  incidentCount: number;
  lastTraining?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Filters
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
}
