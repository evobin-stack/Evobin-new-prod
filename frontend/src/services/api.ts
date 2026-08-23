import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfile,
  DeviceUploadRequest,
  DeviceAnalysisResult,
  CollectionCenter,
  LeaderboardEntry,
  LeaderboardFilters,
  Reward,
  RewardRedemption,
  Activity,
  UserAnalytics,
  CommunityPost,
  Comment,
  Challenge,
  EducationalContent,
  DisassemblyGuide,
  Event,
  EventRegistration,
  Notification,
  AdminStats,
  ContentManagement,
  SafetyAlert,
  WorkerProfile,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  Badge,
} from '../types';

// Base API Configuration
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");


// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('authToken');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || data.message || 'An error occurred',
      };
    }

    return {
      success: true,
      data: data.data !== undefined ? data.data : data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Helper for multipart/form-data requests
async function apiUpload<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('authToken');
  
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Upload failed',
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload error',
    };
  }
}

// ========================================
// AUTHENTICATION ENDPOINTS
// ========================================

export const authApi = {
  /**
   * POST /auth/login
   * Login with email and password
   */
  login: (credentials: LoginRequest) =>
    apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  /**
   * POST /auth/register
   * Register a new user account
   */
  register: (userData: RegisterRequest) =>
    apiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  /**
   * POST /auth/logout
   * Logout current user
   */
  logout: () =>
    apiCall<void>('/auth/logout', {
      method: 'POST',
    }),

  /**
   * POST /auth/refresh
   * Refresh authentication token
   */
  refreshToken: (refreshToken: string) =>
    apiCall<{ token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  /**
   * POST /auth/forgot-password
   * Request password reset
   */
  forgotPassword: (email: string) =>
    apiCall<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  /**
   * POST /auth/reset-password
   * Reset password with token
   */
  resetPassword: (token: string, newPassword: string) =>
    apiCall<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
};

// ========================================
// USER PROFILE ENDPOINTS
// ========================================

export const userApi = {
  /**
   * GET /users/profile
   * Get current user profile
   */
  getProfile: () =>
    apiCall<UserProfile>('/users/profile', {
      method: 'GET',
    }),

  /**
   * PUT /users/profile
   * Update user profile
   */
  updateProfile: (data: Partial<UserProfile>) =>
    apiCall<UserProfile>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * POST /users/profile/avatar
   * Upload profile avatar
   */
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiUpload<{ avatarUrl: string }>('/users/profile/avatar', formData);
  },

  /**
   * PUT /users/settings/language
   * Update language preference
   */
  updateLanguage: (language: 'en' | 'hi' | 'te') =>
    apiCall<void>('/users/settings/language', {
      method: 'PUT',
      body: JSON.stringify({ language }),
    }),

  /**
   * GET /users/badges
   * Get user badges
   */
  getBadges: () =>
    apiCall<Badge[]>('/users/badges', {
      method: 'GET',
    }),

  /**
   * DELETE /users/account
   * Delete user account
   */
  deleteAccount: () =>
    apiCall<void>('/users/account', {
      method: 'DELETE',
    }),
};

// ========================================
// DEVICE & AI RECOGNITION ENDPOINTS
// ========================================

export const deviceApi = {
  /**
   * POST /devices/upload
   * Upload device image for AI analysis
   */
  uploadDevice: (request: DeviceUploadRequest) => {
    const formData = new FormData();
    formData.append('image', request.image);
    
    if (request.additionalImages) {
      request.additionalImages.forEach((img, index) => {
        formData.append(`additionalImages[${index}]`, img);
      });
    }
    
    if (request.notes) {
      formData.append('notes', request.notes);
    }

    return apiUpload<DeviceAnalysisResult>('/devices/upload', formData);
  },

  /**
   * GET /devices/analysis/:id
   * Get device analysis by ID
   */
  getAnalysis: (id: string) =>
    apiCall<DeviceAnalysisResult>(`/devices/analysis/${id}`, {
      method: 'GET',
    }),

  /**
   * GET /devices/history
   * Get user's device upload history
   */
  getHistory: (params?: PaginationParams) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiCall<PaginatedResponse<DeviceAnalysisResult>>(
      `/devices/history?${queryString}`,
      { method: 'GET' }
    );
  },

  /**
   * POST /devices/:id/confirm-recycle
   * Confirm device has been recycled
   */
  confirmRecycle: (id: string, centerId: string) =>
    apiCall<{ pointsEarned: number }>(`/devices/${id}/confirm-recycle`, {
      method: 'POST',
      body: JSON.stringify({ centerId }),
    }),

  /**
   * GET /devices/recommendations/:id
   * Get personalized recycling recommendations
   */
  getRecommendations: (id: string) =>
    apiCall<{ recommendations: string[]; centers: CollectionCenter[] }>(
      `/devices/${id}/recommendations`,
      { method: 'GET' }
    ),

  /**
   * POST /devices/submit
   * Submit complete device recycling request with pickup/dropoff
   */
  submitDeviceRecycling: (data: any) =>
    apiCall<{ id: string; trackingId: string; estimatedValue: number }>(
      '/devices/submit',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  /**
   * POST /devices/estimate-value
   * Get value estimation for device details
   */
  estimateValue: (deviceDetails: any) =>
    apiCall<{ estimatedMoneyValue: number; pointsValue: number; marketValue: number }>(
      '/devices/estimate-value',
      {
        method: 'POST',
        body: JSON.stringify(deviceDetails),
      }
    ),

  /**
   * POST /devices/schedule-pickup
   * Schedule pickup for device
   */
  schedulePickup: (pickupData: any) =>
    apiCall<{ pickupId: string; scheduledDate: string; trackingId: string }>(
      '/devices/schedule-pickup',
      {
        method: 'POST',
        body: JSON.stringify(pickupData),
      }
    ),
};

// ========================================
// COLLECTION CENTER ENDPOINTS
// ========================================

export const centerApi = {
  /**
   * GET /centers/nearby
   * Get nearby collection centers
   */
  getNearby: (latitude: number, longitude: number, radius: number = 10) =>
    apiCall<CollectionCenter[]>(
      `/centers/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`,
      { method: 'GET' }
    ),

  /**
   * GET /centers/:id
   * Get collection center details
   */
  getDetails: (id: string) =>
    apiCall<CollectionCenter>(`/centers/${id}`, {
      method: 'GET',
    }),

  /**
   * GET /centers/search
   * Search collection centers
   */
  search: (query: string, filters?: Record<string, any>) => {
    const params = new URLSearchParams({ query, ...filters }).toString();
    return apiCall<CollectionCenter[]>(`/centers/search?${params}`, {
      method: 'GET',
    });
  },

  /**
   * POST /centers/:id/review
   * Submit review for collection center
   */
  submitReview: (centerId: string, rating: number, comment?: string) =>
    apiCall<void>(`/centers/${centerId}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }),
};

// ========================================
// LEADERBOARD ENDPOINTS
// ========================================

export const leaderboardApi = {
  /**
   * GET /leaderboard
   * Get leaderboard rankings
   */
  getLeaderboard: (filters?: LeaderboardFilters) => {
    const params = new URLSearchParams(filters as any).toString();
    return apiCall<LeaderboardEntry[]>(`/leaderboard?${params}`, {
      method: 'GET',
    });
  },

  /**
   * GET /leaderboard/user/:userId
   * Get user's rank and position
   */
  getUserRank: (userId: string, filters?: LeaderboardFilters) => {
    const params = new URLSearchParams(filters as any).toString();
    return apiCall<LeaderboardEntry>(`/leaderboard/user/${userId}?${params}`, {
      method: 'GET',
    });
  },
};

// ========================================
// REWARDS & GAMIFICATION ENDPOINTS
// ========================================

export const rewardsApi = {
  /**
   * GET /rewards
   * Get available rewards
   */
  getRewards: (params?: PaginationParams) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiCall<PaginatedResponse<Reward>>(`/rewards?${queryString}`, {
      method: 'GET',
    });
  },

  /**
   * POST /rewards/:id/redeem
   * Redeem a reward
   */
  redeemReward: (rewardId: string) =>
    apiCall<RewardRedemption>(`/rewards/${rewardId}/redeem`, {
      method: 'POST',
    }),

  /**
   * GET /rewards/redemptions
   * Get user's reward redemptions
   */
  getRedemptions: () =>
    apiCall<RewardRedemption[]>('/rewards/redemptions', {
      method: 'GET',
    }),

  /**
   * GET /rewards/points
   * Get user's current points balance
   */
  getPoints: () =>
    apiCall<{ points: number; pending: number }>('/rewards/points', {
      method: 'GET',
    }),
};

// ========================================
// ACTIVITY & TRACKING ENDPOINTS
// ========================================

export const activityApi = {
  /**
   * GET /activities
   * Get user activities
   */
  getActivities: (params?: PaginationParams) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiCall<PaginatedResponse<Activity>>(`/activities?${queryString}`, {
      method: 'GET',
    });
  },

  /**
   * GET /activities/:id
   * Get activity details
   */
  getActivity: (id: string) =>
    apiCall<Activity>(`/activities/${id}`, {
      method: 'GET',
    }),
};

// ========================================
// ANALYTICS ENDPOINTS
// ========================================

export const analyticsApi = {
  /**
   * GET /analytics/dashboard
   * Get dashboard analytics
   */
  getDashboard: (period: 'week' | 'month' | 'year') =>
    apiCall<UserAnalytics>(`/analytics/dashboard?period=${period}`, {
      method: 'GET',
    }),

  /**
   * GET /analytics/impact
   * Get environmental impact metrics
   */
  getImpact: () =>
    apiCall<{
      totalCO2: number;
      totalEWaste: number;
      trees: number;
      energy: number;
    }>('/analytics/impact', {
      method: 'GET',
    }),

  /**
   * GET /analytics/export
   * Export analytics data
   */
  exportData: (format: 'csv' | 'pdf', period: string) =>
    fetch(
      `${API_BASE_URL}/analytics/export?format=${format}&period=${period}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      }
    ),
};

// ========================================
// COMMUNITY ENDPOINTS
// ========================================

export const communityApi = {
  /**
   * GET /community/posts
   * Get community posts
   */
  getPosts: (params?: PaginationParams) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiCall<PaginatedResponse<CommunityPost>>(
      `/community/posts?${queryString}`,
      { method: 'GET' }
    );
  },

  /**
   * POST /community/posts
   * Create a new post
   */
  createPost: (content: string, images?: File[]) => {
    const formData = new FormData();
    formData.append('content', content);
    
    if (images) {
      images.forEach((img, index) => {
        formData.append(`images[${index}]`, img);
      });
    }

    return apiUpload<CommunityPost>('/community/posts', formData);
  },

  /**
   * POST /community/posts/:id/like
   * Like a post
   */
  likePost: (postId: string) =>
    apiCall<void>(`/community/posts/${postId}/like`, {
      method: 'POST',
    }),

  /**
   * GET /community/posts/:id/comments
   * Get post comments
   */
  getComments: (postId: string) =>
    apiCall<Comment[]>(`/community/posts/${postId}/comments`, {
      method: 'GET',
    }),

  /**
   * POST /community/posts/:id/comments
   * Add comment to post
   */
  addComment: (postId: string, content: string) =>
    apiCall<Comment>(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  /**
   * GET /community/challenges
   * Get active challenges
   */
  getChallenges: () =>
    apiCall<Challenge[]>('/community/challenges', {
      method: 'GET',
    }),

  /**
   * POST /community/challenges/:id/join
   * Join a challenge
   */
  joinChallenge: (challengeId: string) =>
    apiCall<void>(`/community/challenges/${challengeId}/join`, {
      method: 'POST',
    }),
};

// ========================================
// EDUCATION ENDPOINTS
// ========================================

export const educationApi = {
  /**
   * GET /education/content
   * Get educational content
   */
  getContent: (params?: { category?: string; language?: string }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiCall<EducationalContent[]>(
      `/education/content?${queryString}`,
      { method: 'GET' }
    );
  },

  /**
   * GET /education/content/:id
   * Get content by ID
   */
  getContentById: (id: string) =>
    apiCall<EducationalContent>(`/education/content/${id}`, {
      method: 'GET',
    }),

  /**
   * GET /education/guides/:deviceType
   * Get disassembly guide for device
   */
  getDisassemblyGuide: (deviceType: string) =>
    apiCall<DisassemblyGuide>(`/education/guides/${deviceType}`, {
      method: 'GET',
    }),

  /**
   * POST /education/content/:id/view
   * Track content view
   */
  trackView: (contentId: string) =>
    apiCall<void>(`/education/content/${contentId}/view`, {
      method: 'POST',
    }),
};

// ========================================
// EVENTS ENDPOINTS
// ========================================

export const eventsApi = {
  /**
   * GET /events
   * Get events list
   */
  getEvents: (params?: { status?: string; type?: string }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiCall<Event[]>(`/events?${queryString}`, {
      method: 'GET',
    });
  },

  /**
   * GET /events/:id
   * Get event details
   */
  getEvent: (id: string) =>
    apiCall<Event>(`/events/${id}`, {
      method: 'GET',
    }),

  /**
   * POST /events/:id/register
   * Register for event
   */
  registerForEvent: (eventId: string) =>
    apiCall<EventRegistration>(`/events/${eventId}/register`, {
      method: 'POST',
    }),

  /**
   * DELETE /events/:id/register
   * Cancel event registration
   */
  cancelRegistration: (eventId: string) =>
    apiCall<void>(`/events/${eventId}/register`, {
      method: 'DELETE',
    }),

  /**
   * POST /events/:id/feedback
   * Submit event feedback
   */
  submitFeedback: (eventId: string, rating: number, comment?: string) =>
    apiCall<void>(`/events/${eventId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }),
};

// ========================================
// NOTIFICATIONS ENDPOINTS
// ========================================

export const notificationsApi = {
  /**
   * GET /notifications
   * Get user notifications
   */
  getNotifications: (params?: { unreadOnly?: boolean }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiCall<Notification[]>(`/notifications?${queryString}`, {
      method: 'GET',
    });
  },

  /**
   * PUT /notifications/:id/read
   * Mark notification as read
   */
  markAsRead: (id: string) =>
    apiCall<void>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  /**
   * PUT /notifications/read-all
   * Mark all notifications as read
   */
  markAllAsRead: () =>
    apiCall<void>('/notifications/read-all', {
      method: 'PUT',
    }),

  /**
   * DELETE /notifications/:id
   * Delete notification
   */
  deleteNotification: (id: string) =>
    apiCall<void>(`/notifications/${id}`, {
      method: 'DELETE',
    }),
};

// ========================================
// ADMIN ENDPOINTS
// ========================================

export const adminApi = {
  /**
   * GET /admin/stats
   * Get admin dashboard statistics
   */
  getStats: () =>
    apiCall<AdminStats>('/admin/stats', {
      method: 'GET',
    }),

  /**
   * GET /admin/users
   * Get users list
   */
  getUsers: (params?: PaginationParams) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiCall<PaginatedResponse<UserProfile>>(`/admin/users?${queryString}`, {
      method: 'GET',
    });
  },

  /**
   * GET /admin/content
   * Get content management items
   */
  getContent: () =>
    apiCall<ContentManagement[]>('/admin/content', {
      method: 'GET',
    }),

  /**
   * POST /admin/content
   * Create new content
   */
  createContent: (data: Partial<ContentManagement>) =>
    apiCall<ContentManagement>('/admin/content', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * PUT /admin/content/:id
   * Update content
   */
  updateContent: (id: string, data: Partial<ContentManagement>) =>
    apiCall<ContentManagement>(`/admin/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * DELETE /admin/content/:id
   * Delete content
   */
  deleteContent: (id: string) =>
    apiCall<void>(`/admin/content/${id}`, {
      method: 'DELETE',
    }),

  /**
   * PUT /admin/activities/:id/approve
   * Approve activity
   */
  approveActivity: (id: string) =>
    apiCall<void>(`/admin/activities/${id}/approve`, {
      method: 'PUT',
    }),

  /**
   * PUT /admin/activities/:id/reject
   * Reject activity
   */
  rejectActivity: (id: string, reason: string) =>
    apiCall<void>(`/admin/activities/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  /**
   * GET /admin/worker/tasks
   * Get pickup tasks and device submissions for workers & admins
   */
  getWorkerTasks: () =>
    apiCall<any[]>('/admin/worker/tasks', {
      method: 'GET',
    }),

  /**
   * PUT /admin/worker/tasks/:id/status
   * Update task status (In-Transit, Collected, Completed)
   */
  updateWorkerTaskStatus: (taskId: string, status: string) =>
    apiCall<any>(`/admin/worker/tasks/${taskId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// ========================================
// WORKER SAFETY ENDPOINTS
// ========================================

export const safetyApi = {
  /**
   * GET /safety/alerts
   * Get safety alerts
   */
  getAlerts: (params?: { centerId?: string; severity?: string }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiCall<SafetyAlert[]>(`/safety/alerts?${queryString}`, {
      method: 'GET',
    });
  },

  /**
   * POST /safety/alerts
   * Create safety alert
   */
  createAlert: (data: Partial<SafetyAlert>) =>
    apiCall<SafetyAlert>('/safety/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * PUT /safety/alerts/:id/resolve
   * Resolve safety alert
   */
  resolveAlert: (id: string, resolution: string) =>
    apiCall<void>(`/safety/alerts/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ resolution }),
    }),

  /**
   * GET /safety/workers/:id
   * Get worker profile
   */
  getWorkerProfile: (id: string) =>
    apiCall<WorkerProfile>(`/safety/workers/${id}`, {
      method: 'GET',
    }),

  /**
   * POST /safety/training/:workerId
   * Record training completion
   */
  recordTraining: (workerId: string, trainingId: string) =>
    apiCall<void>(`/safety/training/${workerId}`, {
      method: 'POST',
      body: JSON.stringify({ trainingId }),
    }),
};

// Export all API modules
export const api = {
  auth: authApi,
  user: userApi,
  device: deviceApi,
  center: centerApi,
  leaderboard: leaderboardApi,
  rewards: rewardsApi,
  activity: activityApi,
  analytics: analyticsApi,
  community: communityApi,
  education: educationApi,
  events: eventsApi,
  notifications: notificationsApi,
  admin: adminApi,
  safety: safetyApi,
};

export default api;
