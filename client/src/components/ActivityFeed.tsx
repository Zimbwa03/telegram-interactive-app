import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActivityFeed() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/activity'],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failure':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'image':
        return <ImageIcon className="h-6 w-6 text-primary-500" />;
      default:
        return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
  };

  const getActivityBadge = (type: string, value: string) => {
    switch (type) {
      case 'success':
        return <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">{value}</span>;
      case 'failure':
        return <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">{value}</span>;
      case 'image':
        return <span className="text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded">{value}</span>;
      default:
        return <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">{value}</span>;
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else if (diffInSeconds < 172800) {
      return 'Yesterday';
    } else {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700">View All</a>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start p-4 border border-gray-100 rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full mr-4" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activities?.map((activity: any) => (
            <div key={activity.id} className="flex items-start p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
              <div className="flex-shrink-0 mr-4">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
                  {getActivityIcon(activity.type)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.description}</p>
                <div className="mt-1 flex items-center">
                  {getActivityBadge(activity.type, activity.badge)}
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
