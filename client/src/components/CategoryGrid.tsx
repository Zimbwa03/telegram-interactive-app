import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { PlayCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryGrid() {
  const [activeTab, setActiveTab] = useState('Anatomy');
  
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Get user progress for each subcategory
  const { data: progress } = useQuery({
    queryKey: ['/api/progress'],
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quiz Categories</h3>
        <Link href="/categories">
          <a className="text-sm font-medium text-primary-600 hover:text-primary-700">View All</a>
        </Link>
      </div>
      
      {/* Categories Tabs */}
      <Tabs defaultValue="Anatomy" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 border-b border-gray-200 w-full justify-start">
          <TabsTrigger value="Anatomy" className="rounded-none px-3 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600">
            Anatomy
          </TabsTrigger>
          <TabsTrigger value="Physiology" className="rounded-none px-3 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600">
            Physiology
          </TabsTrigger>
          <TabsTrigger value="ImageQuiz" className="rounded-none px-3 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600">
            Image Quiz
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <TabsContent value="Anatomy" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories?.Anatomy?.map((category: string) => {
                  const categoryProgress = progress?.[`Anatomy-${category}`] || { attempts: 0, correct: 0 };
                  const accuracyPercentage = categoryProgress.attempts > 0
                    ? Math.round((categoryProgress.correct / categoryProgress.attempts) * 100)
                    : 0;
                  
                  return (
                    <Link key={category} href={`/quiz/Anatomy/${category}`}>
                      <a className="bg-gray-50 rounded-lg p-4 hover:bg-primary-50 transition cursor-pointer group">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800 group-hover:text-primary-700">{category}</span>
                          {categoryProgress.attempts > 0 ? (
                            <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">{accuracyPercentage}%</span>
                          ) : (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">New</span>
                          )}
                        </div>
                        <div className="mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full rounded-full" 
                            style={{ width: `${accuracyPercentage}%` }}
                          ></div>
                        </div>
                      </a>
                    </Link>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="Physiology" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories?.Physiology?.map((category: string) => {
                  const categoryProgress = progress?.[`Physiology-${category}`] || { attempts: 0, correct: 0 };
                  const accuracyPercentage = categoryProgress.attempts > 0
                    ? Math.round((categoryProgress.correct / categoryProgress.attempts) * 100)
                    : 0;
                  
                  return (
                    <Link key={category} href={`/quiz/Physiology/${category}`}>
                      <a className="bg-gray-50 rounded-lg p-4 hover:bg-primary-50 transition cursor-pointer group">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800 group-hover:text-primary-700">{category}</span>
                          {categoryProgress.attempts > 0 ? (
                            <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">{accuracyPercentage}%</span>
                          ) : (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">New</span>
                          )}
                        </div>
                        <div className="mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full rounded-full" 
                            style={{ width: `${accuracyPercentage}%` }}
                          ></div>
                        </div>
                      </a>
                    </Link>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="ImageQuiz" className="mt-0">
              <div className="text-center py-8">
                <h4 className="text-lg font-medium mb-4">Image Identification Quiz</h4>
                <p className="text-gray-600 mb-6">
                  Test your knowledge by identifying anatomical structures in medical images
                </p>
                <Button asChild>
                  <Link href="/image-quiz">
                    Start Image Quiz
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
      
      <Button variant="outline" asChild className="mt-6 w-full">
        <Link href={`/quiz/${activeTab}`}>
          <PlayCircle className="mr-2 h-4 w-4" />
          Start Random Quiz
        </Link>
      </Button>
    </div>
  );
}
