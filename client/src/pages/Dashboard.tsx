import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { PlayCircle, MessageSquareLock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CategoryGrid from '@/components/CategoryGrid';
import ActivityFeed from '@/components/ActivityFeed';
import Leaderboard from '@/components/Leaderboard';
import AskAITutor from '@/components/AskAITutor';
import StatsCard from '@/components/StatsCard';

export default function Dashboard() {
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/user'],
  });
  
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats'],
  });
  
  const { data: currentSession, isLoading: isLoadingSession } = useQuery({
    queryKey: ['/api/session/current'],
  });
  
  return (
    <>
      {/* Welcome Section */}
      <section className="mb-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary to-accent px-6 py-8 md:py-12 lg:px-8 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Welcome back, {isLoadingUser ? '...' : user?.name || 'Medical Student'}!
              </h2>
              <p className="text-primary-100 mt-2 max-w-2xl">
                Continue your medical learning journey with Docdot. Your personal progress is synced between Telegram and web.
              </p>
              
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="default" className="bg-white text-primary-700 hover:bg-primary-50">
                  <Link href="/categories">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Resume Learning
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-primary-800 bg-opacity-30 text-white hover:bg-opacity-40 border-0">
                  <a href="https://t.me/docdotbot" target="_blank" rel="noopener noreferrer">
                    <MessageSquareLock className="mr-2 h-4 w-4" />
                    Open in Telegram
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white bg-opacity-10 transform skew-x-12 translate-x-1/2" aria-hidden="true"></div>
            <div className="absolute right-16 bottom-0 text-white text-opacity-20">
              <svg className="w-40 h-40 opacity-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.5 12.5719L12 16.5L4.5 12.5719M19.5 8.57187L12 12.5L4.5 8.57187L12 4.5L19.5 8.57187Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.5 16.5719L12 20.5L4.5 16.5719" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          
          {/* Stats Summary */}
          <StatsCard stats={stats} isLoading={isLoadingStats} />
        </div>
      </section>
      
      {/* Main Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz Categories Section */}
        <section className="lg:col-span-2 space-y-6">
          <CategoryGrid />
          <ActivityFeed />
        </section>
        
        {/* Sidebar */}
        <section className="space-y-6">
          {/* Current Quiz Session */}
          {currentSession && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Continue Learning</h3>
                <p className="text-sm text-gray-500 mt-1">Your current active quiz session</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">{currentSession.title}</span>
                      <span className="text-xs text-gray-500">{currentSession.completed}/{currentSession.total} completed</span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full" 
                        style={{ width: `${(currentSession.completed / currentSession.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link href={`/quiz/${currentSession.category}/${currentSession.subcategory}`}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Resume Quiz
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <Leaderboard />
          <AskAITutor />
        </section>
      </div>
    </>
  );
}
