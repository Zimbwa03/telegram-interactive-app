import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['/api/leaderboard'],
  });

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-4 w-4 mr-1 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 mr-1 text-gray-400" />;
      case 3:
        return <Medal className="h-4 w-4 mr-1 text-amber-700" />;
      default:
        return null;
    }
  };

  const getBadgeColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
        <p className="text-sm text-gray-500 mt-1">Top performers this week</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          Array(3).fill(0).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="w-8 h-8 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          ))
        ) : (
          leaderboard?.slice(0, 3).map((user: any, index: number) => (
            <div key={user.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${index === 0 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'} font-semibold text-sm`}>
                    {index + 1}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.accuracy}% accuracy • {user.totalQuizzes} quizzes</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(index + 1)}`}>
                  {getRankIcon(index + 1)}
                  {index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'}
                </span>
              </div>
            </div>
          ))
        )}
        
        <div className="p-4 text-center">
          <a href="/stats" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View Full Leaderboard
          </a>
        </div>
      </div>
    </div>
  );
}
