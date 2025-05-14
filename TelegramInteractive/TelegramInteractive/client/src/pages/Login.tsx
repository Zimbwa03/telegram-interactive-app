import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BsTelegram } from 'react-icons/bs';
import { HeartPulse, MessageCircle, BarChartHorizontal, BookOpenCheck, Smartphone } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();

  const handleTelegramLogin = () => {
    window.location.href = '/api/telegram/login';
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-white to-gray-100">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <HeartPulse className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-400 bg-clip-text text-transparent">
            Welcome to Docdot
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your medical learning companion
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-2">
          <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
            <h3 className="font-medium text-primary-700 mb-2">About Docdot</h3>
            <p className="text-sm text-gray-700">
              Docdot helps you learn medical concepts through interactive quizzes, 
              performance tracking, and AI-powered explanations. 
              Connect with Telegram for a seamless experience.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-center text-gray-700">Sign in with</h3>
            
            <Button
              onClick={handleTelegramLogin}
              className="w-full py-6 text-white bg-[#0088cc] hover:bg-[#0077b5] flex items-center justify-center gap-3"
            >
              <BsTelegram className="h-5 w-5" />
              <span className="text-base font-medium">Continue with Telegram</span>
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>By signing in, you'll get access to:</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div className="bg-gray-50 p-2 rounded flex items-center gap-1.5">
                <BookOpenCheck className="h-3.5 w-3.5 text-primary-600" />
                <span>Personalized Quizzes</span>
              </div>
              <div className="bg-gray-50 p-2 rounded flex items-center gap-1.5">
                <BarChartHorizontal className="h-3.5 w-3.5 text-primary-600" />
                <span>Performance Analytics</span>
              </div>
              <div className="bg-gray-50 p-2 rounded flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-primary-600" />
                <span>Medical AI Assistant</span>
              </div>
              <div className="bg-gray-50 p-2 rounded flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-primary-600" />
                <span>Cross-platform Access</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pt-0">
          <p className="text-xs text-center text-gray-500">
            By continuing, you agree to our <a className="underline hover:text-primary cursor-pointer">Terms of Service</a> and <a className="underline hover:text-primary cursor-pointer">Privacy Policy</a>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}