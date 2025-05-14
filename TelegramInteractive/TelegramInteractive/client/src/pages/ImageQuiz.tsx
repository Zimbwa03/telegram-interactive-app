import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Play, 
  ImageIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import ImageQuizModal from '@/components/ImageQuizModal';
import { apiRequest } from '@/lib/api';

export default function ImageQuiz() {
  const [location, setLocation] = useLocation();
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get available image categories
  const { data: imageCategories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/image-quiz/categories'],
  });
  
  // Get images for quiz
  const { data: imageQuizData, isLoading: isImagesLoading, refetch } = useQuery({
    queryKey: ['/api/image-quiz/images'],
    enabled: false, // Don't fetch automatically
  });
  
  const handleStartQuiz = async () => {
    try {
      setIsLoading(true);
      
      // Fetch the images
      await refetch();
      
      // Start a new image quiz session
      await apiRequest('POST', '/api/image-quiz/start', {});
      
      setIsQuizStarted(true);
      setCurrentImageIndex(0);
    } catch (error) {
      console.error("Failed to start image quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNextImage = () => {
    if (currentImageIndex < (imageQuizData?.images.length || 0) - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // Quiz finished
      setIsQuizStarted(false);
      // Redirect to completion page or show completion modal
    }
  };
  
  const handleBackToDashboard = () => {
    setLocation('/');
  };

  // Current image being shown in the quiz
  const currentImage = imageQuizData?.images[currentImageIndex] || null;
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={handleBackToDashboard}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-accent to-accent-700 px-6 py-8 lg:px-8 text-white">
          <h1 className="text-2xl font-bold">
            Anatomy Image Quiz
          </h1>
          <p className="mt-2 opacity-90">
            Test your knowledge by identifying anatomical structures in medical images
          </p>
        </div>
        
        <div className="p-6">
          {isCategoriesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3 mx-auto" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
              <Skeleton className="h-32 w-full rounded-lg mx-auto mt-4" />
            </div>
          ) : (
            <div className="py-8 text-center">
              <ImageIcon className="h-16 w-16 text-accent-600 mx-auto mb-4 opacity-80" />
              <h2 className="text-xl font-semibold mb-2">Medical Structure Identification</h2>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                This quiz will test your ability to identify anatomical structures in medical images. 
                You will be shown an image with a highlighted structure and asked to identify it.
              </p>
              
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-3">Available Categories</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {imageCategories?.map((category: string) => (
                    <span 
                      key={category}
                      className="inline-block px-3 py-1 bg-accent-50 text-accent-800 rounded-full text-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              
              <Button 
                size="lg" 
                onClick={handleStartQuiz}
                disabled={isLoading}
                className="bg-accent hover:bg-accent/90"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Start Image Quiz
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {isQuizStarted && (
        <ImageQuizModal
          open={isQuizStarted}
          onClose={() => setIsQuizStarted(false)}
          imageData={currentImage}
          onNext={handleNextImage}
        />
      )}
    </div>
  );
}
