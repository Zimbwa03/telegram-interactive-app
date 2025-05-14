import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';

export interface Question {
  id: number;
  question: string;
  category: string;
  subcategory?: string;
}

export interface QuizState {
  isLoading: boolean;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  isQuizStarted: boolean;
  isAnswered: boolean;
  selectedAnswer: boolean | null;
  feedback: {
    isCorrect: boolean;
    explanation: string;
  } | null;
}

export interface UseQuizReturnType {
  quizState: QuizState;
  startQuiz: (category: string, subcategory?: string) => Promise<void>;
  handleAnswer: (answer: boolean) => Promise<void>;
  handleNextQuestion: () => void;
  handleSkipQuestion: () => void;
  endQuiz: () => void;
}

export function useQuiz(): UseQuizReturnType {
  const [quizState, setQuizState] = useState<QuizState>({
    isLoading: false,
    currentQuestion: null,
    currentQuestionIndex: 0,
    totalQuestions: 0,
    isQuizStarted: false,
    isAnswered: false,
    selectedAnswer: null,
    feedback: null
  });
  const { toast } = useToast();

  const startQuiz = async (category: string, subcategory?: string) => {
    try {
      setQuizState(prev => ({ ...prev, isLoading: true }));
      
      // Fetch questions
      const url = subcategory 
        ? `/api/quiz?category=${category}&subcategory=${subcategory}` 
        : `/api/quiz?category=${category}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!data || !data.questions || data.questions.length === 0) {
        toast({
          title: "No Questions Available",
          description: "There are no questions available for this category.",
          variant: "destructive"
        });
        setQuizState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      // Start a new quiz session
      await apiRequest('POST', '/api/quiz/start', {
        category,
        subcategory: subcategory || undefined
      });
      
      setQuizState({
        isLoading: false,
        currentQuestion: data.questions[0],
        currentQuestionIndex: 0,
        totalQuestions: data.questions.length,
        isQuizStarted: true,
        isAnswered: false,
        selectedAnswer: null,
        feedback: null
      });
    } catch (error) {
      toast({
        title: "Error Starting Quiz",
        description: "There was a problem starting the quiz. Please try again.",
        variant: "destructive"
      });
      setQuizState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleAnswer = async (answer: boolean) => {
    if (quizState.isAnswered || !quizState.currentQuestion) return;
    
    try {
      setQuizState(prev => ({ 
        ...prev, 
        isLoading: true,
        selectedAnswer: answer 
      }));
      
      const res = await apiRequest('POST', '/api/quiz/answer', {
        questionId: quizState.currentQuestion.id,
        answer
      });
      
      const data = await res.json();
      
      setQuizState(prev => ({ 
        ...prev, 
        isLoading: false,
        isAnswered: true,
        feedback: {
          isCorrect: data.isCorrect,
          explanation: data.explanation
        }
      }));
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive"
      });
      setQuizState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestionIndex >= quizState.totalQuestions - 1) {
      // Quiz is complete
      endQuiz();
      return;
    }
    
    // Move to next question
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      currentQuestion: null, // Will be fetched
      isAnswered: false,
      selectedAnswer: null,
      feedback: null
    }));
    
    // Fetch the next question
    fetchQuestion(quizState.currentQuestionIndex + 1);
  };

  const handleSkipQuestion = () => {
    // Similar to next but mark as skipped
    apiRequest('POST', '/api/quiz/skip', {
      questionId: quizState.currentQuestion?.id
    }).catch(() => {
      // Silent failure for skips
    });
    
    handleNextQuestion();
  };

  const fetchQuestion = async (index: number) => {
    try {
      const res = await fetch(`/api/quiz/question/${index}`);
      const data = await res.json();
      
      setQuizState(prev => ({
        ...prev,
        currentQuestion: data
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load the next question.",
        variant: "destructive"
      });
    }
  };

  const endQuiz = () => {
    // End the quiz session
    apiRequest('POST', '/api/quiz/end', {}).catch(() => {
      // Silent failure for quiz end
    });
    
    setQuizState({
      isLoading: false,
      currentQuestion: null,
      currentQuestionIndex: 0,
      totalQuestions: 0,
      isQuizStarted: false,
      isAnswered: false,
      selectedAnswer: null,
      feedback: null
    });
  };

  return {
    quizState,
    startQuiz,
    handleAnswer,
    handleNextQuestion,
    handleSkipQuestion,
    endQuiz
  };
}
