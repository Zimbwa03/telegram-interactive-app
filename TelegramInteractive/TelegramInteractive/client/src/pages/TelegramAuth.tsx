import { HeartPulse } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TelegramAuth() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-white to-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <HeartPulse className="h-10 w-10 text-primary animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Authenticating with Telegram</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Please wait, we're connecting your Telegram account...
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-1.5 animate-progress" 
                     style={{
                       width: '100%',
                       animation: 'progress 1.5s ease-in-out infinite'
                     }} />
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>Don't see anything happening?</p>
            <p className="mt-1">
              Try <a href="/" className="text-primary hover:underline">returning to the homepage</a> and logging in again.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}