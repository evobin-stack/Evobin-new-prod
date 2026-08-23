import { useEffect } from 'react';
import { useRealtime } from '../contexts/RealtimeContext';
import { toast } from 'sonner';
import { Bell, Award, TrendingUp, Calendar, Users, Shield } from 'lucide-react';

export function RealtimeUpdatesListener() {
  const { updates } = useRealtime();

  useEffect(() => {
    if (updates.length === 0) return;

    const latestUpdate = updates[0];
    if (latestUpdate.isRead) return;

    // Get icon based on update type
    const getIcon = () => {
      switch (latestUpdate.type) {
        case 'achievement_unlocked':
          return <Award className="h-4 w-4" />;
        case 'leaderboard_change':
          return <TrendingUp className="h-4 w-4" />;
        case 'new_event':
          return <Calendar className="h-4 w-4" />;
        case 'new_comment':
        case 'new_follower':
          return <Users className="h-4 w-4" />;
        case 'admin_announcement':
          return <Shield className="h-4 w-4" />;
        default:
          return <Bell className="h-4 w-4" />;
      }
    };

    // Show toast notification for new updates
    toast(latestUpdate.message, {
      icon: getIcon(),
      duration: 5000,
      action: latestUpdate.type === 'admin_announcement' 
        ? {
            label: 'View',
            onClick: () => console.log('Navigate to announcement'),
          }
        : undefined,
    });
  }, [updates]);

  return null; // This component doesn't render anything
}
