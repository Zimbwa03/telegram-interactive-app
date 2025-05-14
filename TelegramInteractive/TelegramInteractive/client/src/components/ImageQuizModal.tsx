import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface ImageQuizModalProps {
  open: boolean;
  onClose: () => void;
  imageData: {
    id: string;
    imageUrl: string;
    options: string[];
    category: string;
  } | null;
  onNext: () => void;
}

export default function ImageQuizModal({
  open,
  onClose,
  imageData,
  onNext
}: ImageQuizModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnswer = async (option: string) => {
    if (isAnswered || !imageData) return;
    
    setSelectedOption(option);
    setIsLoading(true);
    
    try {
      const res = await apiRequest('POST', '/api/image-quiz/answer', {
        imageId: imageData.id,
        answer: option
      });
      
      const data = await res.json();
      setFeedback({
        isCorrect: data.isCorrect,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation
      });
      setIsAnswered(true);
      
      // Invalidate stats and progress queries
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setFeedback(null);
    onNext();
  };

  const handleSkip = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setFeedback(null);
    onNext();
  };

  const getOptionClass = (option: string) => {
    if (!isAnswered) {
      return selectedOption === option ? "border-primary-500 ring-2 ring-primary-500" : "";
    }
    
    if (feedback) {
      if (feedback.correctAnswer === option) {
        return "border-green-500 bg-green-50 text-green-700";
      }
      if (selectedOption === option && !feedback.isCorrect) {
        return "border-red-500 bg-red-50 text-red-700";
      }
    }
    
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="bg-accent text-white px-4 py-3 -mx-6 -mt-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg text-white">
              Anatomy Image Quiz
            </DialogTitle>
            <span className="text-xs bg-white bg-opacity-20 text-white px-2 py-1 rounded">
              Identify Structure
            </span>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-base text-gray-800 mb-4">
            Identify the highlighted structure in this {imageData?.category || "anatomy"} image:
          </p>
          
          <div className="relative rounded-lg overflow-hidden mb-6 border border-gray-200">
            {imageData?.imageUrl && (
              <img 
                src={imageData.imageUrl} 
                alt="Anatomical structure to identify" 
                className="w-full h-auto"
              />
            )}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 border-red-500 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            {imageData?.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered || isLoading}
                className={`bg-white border border-gray-300 rounded-md py-3 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition ${getOptionClass(option)}`}
              >
                {option}
              </button>
            ))}
          </div>
          
          {isAnswered && feedback && (
            <div className={`mt-6 p-4 rounded-md ${
              feedback.isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}>
              <p className="font-medium">
                {feedback.isCorrect ? "Correct identification!" : `Incorrect. The correct answer is ${feedback.correctAnswer}.`}
              </p>
              <p className="mt-1 text-sm">
                {feedback.explanation}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="bg-gray-50 px-6 py-3 -mx-6 -mb-6 rounded-b-lg flex justify-end space-x-2">
          {isAnswered ? (
            <Button 
              onClick={handleNext}
              className="bg-accent hover:bg-accent/90"
            >
              Next Image
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
                Skip
              </Button>
              {isLoading && (
                <Button disabled className="bg-accent hover:bg-accent/90">
                  Checking...
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
