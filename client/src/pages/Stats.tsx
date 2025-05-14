import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, Award, Medal, TrendingUp, Clock, Zap } from 'lucide-react';

export default function Stats() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/stats'],
  });
  
  const { data: categoryStats, isLoading: isCategoryStatsLoading } = useQuery({
    queryKey: ['/api/stats/category', selectedCategory],
    queryFn: async () => {
      const res = await fetch(`/api/stats/category?category=${selectedCategory}`);
      return res.json();
    }
  });
  
  const { data: leaderboard, isLoading: isLeaderboardLoading } = useQuery({
    queryKey: ['/api/leaderboard', selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === 'all' 
        ? '/api/leaderboard' 
        : `/api/leaderboard?category=${selectedCategory}`;
      const res = await fetch(url);
      return res.json();
    }
  });
  
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Prepare data for the pie chart
  const pieChartData = [
    { name: 'Correct', value: stats?.correctAnswers || 0, color: '#10b981' },
    { name: 'Incorrect', value: (stats?.totalQuizzes || 0) - (stats?.correctAnswers || 0), color: '#ef4444' },
  ];
  
  // Prepare data for the bar chart
  const barChartData = categoryStats?.subcategories?.map((subcat: any) => ({
    name: subcat.name,
    accuracy: subcat.accuracy,
    attempts: subcat.attempts,
  })) || [];
  
  // Generate category options for the tabs
  const categoryOptions = ['all']
    .concat(categories ? Object.keys(categories) : [])
    .map(cat => ({
      value: cat.toLowerCase(),
      label: cat === 'all' ? 'All Categories' : cat
    }));
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent px-6 py-8 md:py-12 lg:px-8 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Your Statistics</h1>
            <p className="text-primary-100 mt-2 max-w-2xl">
              Track your progress, view detailed metrics, and see how you compare to others
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white bg-opacity-10 transform skew-x-12 translate-x-1/2" aria-hidden="true"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Quizzes" 
          value={stats?.totalQuizzes || 0} 
          icon={<TrendingUp className="h-5 w-5 text-primary-500" />} 
          isLoading={isStatsLoading} 
        />
        <StatCard 
          title="Accuracy" 
          value={`${stats?.accuracy || 0}%`} 
          icon={<Award className="h-5 w-5 text-yellow-500" />} 
          isLoading={isStatsLoading} 
        />
        <StatCard 
          title="Current Streak" 
          value={`${stats?.currentStreak || 0} days`} 
          icon={<Zap className="h-5 w-5 text-secondary-500" />} 
          isLoading={isStatsLoading} 
        />
        <StatCard 
          title="Best Streak" 
          value={`${stats?.bestStreak || 0} days`} 
          icon={<Trophy className="h-5 w-5 text-amber-500" />} 
          isLoading={isStatsLoading} 
        />
      </div>
      
      <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="mb-6">
          {categoryOptions.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value}>{cat.label}</TabsTrigger>
          ))}
        </TabsList>
        
        {categoryOptions.map(cat => (
          <TabsContent key={cat.value} value={cat.value} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Charts */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Answer Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center h-64">
                    {isStatsLoading ? (
                      <Skeleton className="h-40 w-40 rounded-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subcategory Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    {isCategoryStatsLoading ? (
                      <div className="space-y-3 pt-4">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ) : barChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={barChartData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="accuracy" name="Accuracy (%)" fill="#3b82f6" />
                          <Bar dataKey="attempts" name="Attempts" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-gray-500">No data available for this category</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLeaderboardLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center">
                          <Skeleton className="h-8 w-8 rounded-full mr-3" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <Skeleton className="h-6 w-12" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaderboard?.slice(0, 10).map((user: any, index: number) => (
                        <div key={user.id || index} className="flex items-center">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                            index === 1 ? 'bg-gray-100 text-gray-700' : 
                            index === 2 ? 'bg-amber-100 text-amber-700' : 
                            'bg-gray-50 text-gray-600'
                          } font-semibold text-sm mr-3`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.accuracy}% accuracy</p>
                          </div>
                          <div className="flex items-center">
                            {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 mr-1" />}
                            <span className="text-sm font-medium">{user.score || user.totalQuizzes}</span>
                          </div>
                        </div>
                      ))}
                      
                      {leaderboard?.length === 0 && (
                        <div className="text-center py-6">
                          <p className="text-gray-500">No data available for this category</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {isStatsLoading ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex">
                          <Skeleton className="h-10 w-10 rounded-full mr-4" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-full mb-2" />
                            <Skeleton className="h-3 w-1/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : stats?.recentActivity?.length > 0 ? (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
                      <ul className="space-y-6">
                        {stats.recentActivity.map((activity: any, index: number) => (
                          <li key={index} className="relative pl-10">
                            <div className="absolute left-0 top-2 flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600">
                              {activity.type === 'success' ? (
                                <Trophy className="h-4 w-4" />
                              ) : activity.type === 'attempt' ? (
                                <Clock className="h-4 w-4" />
                              ) : (
                                <Medal className="h-4 w-4" />
                              )}
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-100">
                              <p className="font-medium text-gray-900">{activity.title}</p>
                              <p className="text-sm text-gray-600">{activity.description}</p>
                              <div className="mt-2 flex items-center text-xs text-gray-500">
                                <time dateTime={activity.timestamp}>{new Date(activity.timestamp).toLocaleString()}</time>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No recent activity to display</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isLoading?: boolean;
}

function StatCard({ title, value, icon, isLoading = false }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="mr-4 rounded-full p-2 bg-gray-100">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-xl font-semibold text-gray-900">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
