import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Play, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import QuizModal from '@/components/QuizModal';
import { apiRequest } from '@/lib/api';

export default function Quiz() {
  const { category, subcategory } = useParams();
  const [location, setLocation] = useLocation();
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get all available questions for this category/subcategory
  const { data: quizData, isLoading: isQuizDataLoading, error } = useQuery({
    queryKey: ['/api/quiz', category, subcategory],
    queryFn: async () => {
      const url = subcategory 
        ? `/api/quiz?category=${category}&subcategory=${subcategory}` 
        : `/api/quiz?category=${category}`;
      const res = await fetch(url);
      return res.json();
    }
  });
  
  // Get current question
  const currentQuestion = quizData?.questions[currentQuestionIndex] || null;
  
  const handleStartQuiz = async () => {
    try {
      setIsLoading(true);
      // Start a new quiz session
      await apiRequest('POST', '/api/quiz/start', {
        category,
        subcategory: subcategory || undefined
      });
      
      setIsQuizStarted(true);
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error("Failed to start quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quizData?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz finished
      setIsQuizStarted(false);
      // Redirect to completion page or show completion modal
    }
  };
  
  const handleBackToCategories = () => {
    setLocation('/categories');
  };
  
  if (error) {
    return (
      <Card className="mt-8 max-w-lg mx-auto">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Quiz</h2>
          <p className="text-gray-600 mb-6">
            We couldn't load the quiz questions. Please try again later.
          </p>
          <Button variant="outline" onClick={handleBackToCategories}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={handleBackToCategories}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary-700 px-6 py-8 lg:px-8 text-white">
          <h1 className="text-2xl font-bold">
            {subcategory || category} Quiz
          </h1>
          <p className="mt-2 text-primary-100">
            Test your knowledge of {subcategory || category} with these comprehensive questions
          </p>
        </div>
        
        <div className="p-6">
          {isQuizDataLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading quiz questions...</p>
            </div>
          ) : quizData?.questions.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Questions Available</h2>
              <p className="text-gray-600 mb-6">
                There are currently no questions available for this category.
              </p>
              <Button variant="outline" onClick={handleBackToCategories}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Choose Another Category
              </Button>
            </div>
          ) : (
            <div className="py-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Ready to start?</h2>
              <p className="text-gray-600 mb-6">
                This quiz contains {quizData?.questions.length} questions about {subcategory || category}.
              </p>
              <Button 
                size="lg" 
                onClick={handleStartQuiz}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Start Quiz
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {isQuizStarted && (
        <QuizModal
          open={isQuizStarted}
          onClose={() => setIsQuizStarted(false)}
          question={currentQuestion}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={quizData?.questions.length || 0}
          onNext={handleNextQuestion}
        />
      )}
    </div>
  );
}
