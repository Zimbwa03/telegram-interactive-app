import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Play } from "lucide-react";

interface QuizCardProps {
  category: string;
  subcategory: string;
  showProgress?: boolean;
}

export default function QuizCard({ category, subcategory, showProgress = true }: QuizCardProps) {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['/api/progress'],
  });

  const getCategoryDescription = (): string => {
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
    
    return descriptions[category]?.[subcategory] || `Quiz on ${subcategory} concepts in ${category}.`;
  };

  const categoryProgress = progress?.[`${category}-${subcategory}`] || { attempts: 0, correct: 0 };
  const accuracyPercentage = categoryProgress.attempts > 0
    ? Math.round((categoryProgress.correct / categoryProgress.attempts) * 100)
    : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{subcategory}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          {getCategoryDescription()}
        </p>
        
        {showProgress && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              {isLoading ? (
                <Skeleton className="h-5 w-12" />
              ) : (
                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                  {accuracyPercentage}%
                </span>
              )}
            </div>
            
            {isLoading ? (
              <Skeleton className="h-2 w-full mb-4" />
            ) : (
              <Progress
                value={accuracyPercentage}
                className="h-2 mb-4"
              />
            )}
          </>
        )}
        
        <Button asChild className="w-full">
          <Link href={`/quiz/${category}/${subcategory}`}>
            <Play className="mr-2 h-4 w-4" />
            Start Quiz
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
