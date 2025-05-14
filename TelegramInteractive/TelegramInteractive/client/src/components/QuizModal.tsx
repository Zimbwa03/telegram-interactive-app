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

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  question: {
    id: number;
    question: string;
    category: string;
    subcategory: string;
  } | null;
  currentQuestion: number;
  totalQuestions: number;
  onNext: () => void;
}

export default function QuizModal({
  open,
  onClose,
  question,
  currentQuestion,
  totalQuestions,
  onNext
}: QuizModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnswer = async (answer: boolean) => {
    if (isAnswered || !question) return;
    
    setSelectedAnswer(answer);
    setIsLoading(true);
    
    try {
      const res = await apiRequest('POST', '/api/quiz/answer', {
        questionId: question.id,
        answer
      });
      
      const data = await res.json();
      setFeedback({
        isCorrect: data.isCorrect,
        explanation: data.explanation
      });
      setIsAnswered(true);
      
      // Invalidate stats and progress queries
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
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
    setSelectedAnswer(null);
    setIsAnswered(false);
    setFeedback(null);
    onNext();
  };

  const handleSkip = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setFeedback(null);
    onNext();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="bg-primary text-white px-4 py-3 -mx-6 -mt-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg text-white">
              {question?.subcategory || question?.category} Quiz
            </DialogTitle>
            <span className="text-xs bg-white bg-opacity-20 text-white px-2 py-1 rounded">
              Question {currentQuestion}/{totalQuestions}
            </span>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-base text-gray-800 mb-6">
            {question?.question}
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button
              variant={selectedAnswer === true ? "default" : "outline"}
              className={`w-24 ${
                isAnswered && selectedAnswer === true
                  ? feedback?.isCorrect
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                  : ""
              }`}
              onClick={() => handleAnswer(true)}
              disabled={isAnswered || isLoading}
            >
              True
            </Button>
            <Button
              variant={selectedAnswer === false ? "default" : "outline"}
              className={`w-24 ${
                isAnswered && selectedAnswer === false
                  ? feedback?.isCorrect
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                  : ""
              }`}
              onClick={() => handleAnswer(false)}
              disabled={isAnswered || isLoading}
            >
              False
            </Button>
          </div>
          
          {isAnswered && feedback && (
            <div className={`mt-6 p-4 rounded-md ${
              feedback.isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}>
              <p className="font-medium">
                {feedback.isCorrect ? "Correct!" : "Incorrect!"}
              </p>
              <p className="mt-1 text-sm">
                {feedback.explanation}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="bg-gray-50 px-6 py-3 -mx-6 -mb-6 rounded-b-lg flex justify-end space-x-2">
          {isAnswered ? (
            <Button onClick={handleNext}>
              Next Question
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
                Skip Question
              </Button>
              {isLoading && (
                <Button disabled>
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
