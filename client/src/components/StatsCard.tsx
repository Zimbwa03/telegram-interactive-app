import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardProps {
  stats?: {
    totalQuizzes: number;
    accuracy: number;
    currentStreak: number;
    bestStreak: number;
  };
  isLoading?: boolean;
}

export default function StatsCard({ stats, isLoading = false }: StatsCardProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 bg-gray-50 border-b border-gray-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-sm font-medium text-gray-500">Total Quizzes</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mx-auto mt-1" />
          ) : (
            <p className="mt-1 text-xl font-semibold text-gray-900">{stats?.totalQuizzes || 0}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Accuracy</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mx-auto mt-1" />
          ) : (
            <p className="mt-1 text-xl font-semibold text-gray-900">{stats?.accuracy || 0}%</p>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Current Streak</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mx-auto mt-1" />
          ) : (
            <p className="mt-1 text-xl font-semibold text-secondary-600">{stats?.currentStreak || 0} days</p>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Best Streak</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mx-auto mt-1" />
          ) : (
            <p className="mt-1 text-xl font-semibold text-gray-900">{stats?.bestStreak || 0} days</p>
          )}
        </div>
      </div>
    </div>
  );
}
