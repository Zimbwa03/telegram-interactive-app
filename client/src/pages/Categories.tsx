import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Play } from 'lucide-react';
import StatsCard from '@/components/StatsCard';

export default function Categories() {
  const [activeTab, setActiveTab] = useState('Anatomy');
  
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: progress } = useQuery({
    queryKey: ['/api/progress'],
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent px-6 py-8 md:py-12 lg:px-8 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Quiz Categories</h1>
            <p className="text-primary-100 mt-2 max-w-2xl">
              Select a category to start practicing and test your medical knowledge
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white bg-opacity-10 transform skew-x-12 translate-x-1/2" aria-hidden="true"></div>
        </div>

        <StatsCard stats={stats} isLoading={isStatsLoading} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <Tabs defaultValue="Anatomy" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="Anatomy">Anatomy</TabsTrigger>
            <TabsTrigger value="Physiology">Physiology</TabsTrigger>
            <TabsTrigger value="ImageQuiz">Image Quiz</TabsTrigger>
          </TabsList>

          {isCategoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="Anatomy" className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories?.Anatomy?.map((category: string) => {
                    const categoryProgress = progress?.[`Anatomy-${category}`] || { attempts: 0, correct: 0 };
                    const accuracyPercentage = categoryProgress.attempts > 0
                      ? Math.round((categoryProgress.correct / categoryProgress.attempts) * 100)
                      : 0;
                    
                    return (
                      <div key={category} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow duration-200">
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{category}</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            {getCategoryDescription('Anatomy', category)}
                          </p>
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">{accuracyPercentage}%</span>
                          </div>
                          
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
                            <div 
                              className="bg-primary h-full rounded-full" 
                              style={{ width: `${accuracyPercentage}%` }}
                            ></div>
                          </div>
                          
                          <Button asChild className="w-full">
                            <Link href={`/quiz/Anatomy/${category}`}>
                              <Play className="mr-2 h-4 w-4" />
                              Start Quiz
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="Physiology" className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories?.Physiology?.map((category: string) => {
                    const categoryProgress = progress?.[`Physiology-${category}`] || { attempts: 0, correct: 0 };
                    const accuracyPercentage = categoryProgress.attempts > 0
                      ? Math.round((categoryProgress.correct / categoryProgress.attempts) * 100)
                      : 0;
                    
                    return (
                      <div key={category} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow duration-200">
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{category}</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            {getCategoryDescription('Physiology', category)}
                          </p>
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">{accuracyPercentage}%</span>
                          </div>
                          
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
                            <div 
                              className="bg-primary h-full rounded-full" 
                              style={{ width: `${accuracyPercentage}%` }}
                            ></div>
                          </div>
                          
                          <Button asChild className="w-full">
                            <Link href={`/quiz/Physiology/${category}`}>
                              <Play className="mr-2 h-4 w-4" />
                              Start Quiz
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="ImageQuiz" className="w-full">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm p-8 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Image Identification Quiz</h3>
                  <p className="text-gray-600 max-w-lg mx-auto mb-6">
                    Test your knowledge by identifying anatomical structures in medical images. Select different body regions and identify the highlighted structures.
                  </p>
                  
                  <div className="flex justify-center">
                    <Button asChild size="lg">
                      <Link href="/image-quiz">
                        <Play className="mr-2 h-4 w-4" />
                        Start Image Quiz
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}

// Helper function to provide descriptions for each category
function getCategoryDescription(mainCategory: string, subCategory: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    Anatomy: {
      'Head and Neck': 'Study the complex structures of the skull, facial features, and cervical region.',
      'Upper Limb': 'Learn about the bones, muscles, nerves, and vessels of the arm and hand.',
      'Thorax': 'Explore the chest cavity, including the heart, lungs, and associated structures.',
      'Lower Limb': 'Understand the anatomy of the leg, foot, and associated structures.',
      'Pelvis and Perineum': 'Study the pelvic cavity, reproductive organs, and surrounding structures.',
      'Neuroanatomy': 'Examine the brain, spinal cord, and peripheral nervous system.',
      'Abdomen': 'Learn about the digestive organs, kidneys, and associated structures.'
    },
    Physiology: {
      'Cell': 'Explore cellular functions, membrane transport, and signaling mechanisms.',
      'Nerve and Muscle': 'Understand neural conduction, synaptic transmission, and muscle contraction.',
      'Blood': 'Study blood components, clotting mechanisms, and immune functions.',
      'Endocrine': 'Learn about hormones, their regulation, and systemic effects.',
      'Reproductive': 'Explore reproductive hormones, gametogenesis, and reproductive cycles.',
      'Gastrointestinal Tract': 'Understand digestion, absorption, and gut motility.',
      'Renal': 'Study kidney function, filtration, and regulation of body fluids.',
      'Cardiovascular System': 'Examine cardiac function, blood pressure regulation, and circulation.',
      'Respiration': 'Learn about gas exchange, respiratory mechanics, and control of breathing.',
      'Medical Genetics': 'Understand inheritance patterns, genetic disorders, and genetic testing.',
      'Neurophysiology': 'Explore sensory processing, motor control, and higher brain functions.'
    }
  };
  
  return descriptions[mainCategory]?.[subCategory] || `Quiz on ${subCategory} concepts in ${mainCategory}.`;
}
