// src/config/navigation.ts
import type { UserRole } from '../types';
import {
  Home,
  LayoutDashboard,
  Upload,
  Map,
  Trophy,
  Users,
  GraduationCap,
  Calendar,
  Bell,
  Settings,
  ShieldCheck,
  BarChart3,
  Gift,
  Briefcase,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  value: string;
  icon?: LucideIcon;
  description?: string;
  roles?: UserRole[];
  requiresAuth?: boolean;
  badge?: string | number;
  category?: 'primary' | 'secondary' | 'admin' | 'settings';
}

export interface UserJourney {
  title: string;
  description: string;
  steps: {
    label: string;
    page: string;
    icon: LucideIcon;
  }[];
  roles: UserRole[];
}

// ------------------ Navigation ------------------
export const primaryNavigation: NavItem[] = [
  { label: 'Home', value: 'landing', icon: Home, category: 'primary' },
{ label: 'About Us', value: 'about', icon: Briefcase, category: 'primary' },
  { label: 'Dashboard', value: 'dashboard', icon: LayoutDashboard, requiresAuth: true, category: 'primary' },
  { label: 'Upload Device', value: 'upload', icon: Upload, requiresAuth: true, category: 'primary' },
  { label: 'Find Centers', value: 'map', icon: Map, category: 'primary' },
  { label: 'Rewards', value: 'rewards', icon: Gift, requiresAuth: true, category: 'primary' },
  { label: 'Leaderboard', value: 'leaderboard', icon: Trophy, category: 'primary' },
];

export const secondaryNavigation: NavItem[] = [
  { label: 'Community', value: 'community', icon: Users, category: 'secondary' },
  { label: 'Education', value: 'education', icon: GraduationCap, category: 'secondary' },
  { label: 'Events', value: 'events', icon: Calendar, category: 'secondary' },
  { label: 'Analytics', value: 'analytics', icon: BarChart3, requiresAuth: true, category: 'secondary' },
];

export const adminNavigation: NavItem[] = [
  { label: 'Admin Panel', value: 'admin', icon: ShieldCheck, requiresAuth: true, roles: ['admin'], category: 'admin' },
];

export const settingsNavigation: NavItem[] = [
  { label: 'Profile', value: 'profile', icon: Settings, requiresAuth: true, category: 'settings' },
  { label: 'Notifications', value: 'notifications', icon: Bell, requiresAuth: true, category: 'settings' },
];

// ------------------ User Journeys ------------------
export const userJourneys: UserJourney[] = [
  {
    title: 'First Time Recycler',
    description: 'Complete guide for new users',
    roles: ['user', 'organization'],
    steps: [
      { label: 'Learn about e-waste', page: 'education', icon: GraduationCap },
      { label: 'Upload your device', page: 'upload', icon: Upload },
      { label: 'Find a center', page: 'map', icon: Map },
      { label: 'Track your impact', page: 'dashboard', icon: LayoutDashboard },
    ],
  },
  // ...other journeys
];

// ------------------ Page Metadata ------------------
export const pageMetadata: Record<
  string,
  {
    title: string;
    description: string;
    breadcrumb?: string[];
  }
> = {
  landing: { title: 'EvoBin - AI Powered personalized E-Waste Management', description: 'AI-powered platform for sustainable e-waste recycling', breadcrumb: [] },
  dashboard: { title: 'Dashboard - Your Impact Overview', description: 'Track your recycling impact and statistics', breadcrumb: ['Home', 'Dashboard'] },
  upload: { title: 'Upload Device - AI Identification', description: 'Upload your e-waste for AI-powered identification', breadcrumb: ['Home', 'Upload Device'] },
  map: { title: 'Find Centers - Nearby Recycling Locations', description: 'Locate nearby certified recycling centers', breadcrumb: ['Home', 'Find Centers'] },
  rewards: { title: 'Rewards Shop - Redeem Your Points', description: 'Browse and redeem rewards with your points', breadcrumb: ['Home', 'Rewards'] },
  leaderboard: { title: 'Leaderboard - Top Contributors', description: 'See the top recycling contributors', breadcrumb: ['Home', 'Leaderboard'] },
  community: { title: 'Community - Connect & Share', description: 'Connect with the recycling community', breadcrumb: ['Home', 'Community'] },
  education: { title: 'Education - Learn About E-Waste', description: 'Educational resources about e-waste recycling', breadcrumb: ['Home', 'Education'] },
  events: { title: 'Events - Collection Drives & Workshops', description: 'Upcoming recycling events and workshops', breadcrumb: ['Home', 'Events'] },
  analytics: { title: 'Analytics - Detailed Insights', description: 'View detailed analytics and reports', breadcrumb: ['Home', 'Dashboard', 'Analytics'] },
  admin: { title: 'Admin Panel - Platform Management', description: 'Manage users, content, and platform settings', breadcrumb: ['Home', 'Admin'] },
  profile: { title: 'Profile & Settings', description: 'Manage your account and preferences', breadcrumb: ['Home', 'Profile'] },
  notifications: { title: 'Notifications', description: 'View your notifications and updates', breadcrumb: ['Home', 'Notifications'] },
  login: { title: 'Sign In - EvoBin', description: 'Sign in to your account', breadcrumb: ['Home', 'Sign In'] },
  about: {
  title: 'About Us - EvoBin',
  description: 'Learn more about EvoBin’s mission, vision, and team',
  breadcrumb: ['Home', 'About Us'],
},

};
