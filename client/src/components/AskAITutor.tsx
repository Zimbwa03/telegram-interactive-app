import { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AskAITutor() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast({
        title: "Question is required",
        description: "Please enter a question to ask the AI tutor",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const res = await apiRequest('POST', '/api/ask', { 
        question: question.trim() 
      });
      
      const data = await res.json();
      setResponse(data.response);
      setQuestion('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI tutor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (text: string) => {
    setQuestion(text);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Ask AI Tutor</h3>
        <p className="text-sm text-gray-500 mt-1">Get quick answers to medical questions</p>
      </div>
      
      <div className="p-6">
        <div className="flex space-x-3 mb-4">
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary-100">
              <Bot className="h-5 w-5 text-primary-600" />
            </span>
          </div>
          <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              {response || "How can I help with your medical studies today?"}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex rounded-md shadow-sm">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Ask about anatomy, physiology, etc..."
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="rounded-l-none" 
              disabled={isLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              Ask
            </Button>
          </div>
        </form>
        
        <div className="mt-4">
          <p className="text-xs text-gray-500">Popular questions:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickQuestion("Explain the cardiac cycle")}
              className="text-xs h-auto py-1"
            >
              Explain the cardiac cycle
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickQuestion("Brachial plexus branches")}
              className="text-xs h-auto py-1"
            >
              Brachial plexus branches
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
