import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Categories from "@/pages/Categories";
import Quiz from "@/pages/Quiz";
import ImageQuiz from "@/pages/ImageQuiz";
import Stats from "@/pages/Stats";
import Login from "@/pages/Login";
import TelegramAuth from "@/pages/TelegramAuth";
import Layout from "@/components/Layout";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

function Router() {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user'],
  });
  
  // Redirect to login if user is not authenticated and not already on login page
  useEffect(() => {
    if (!isLoading && user?.isGuest && location !== '/login' && !location.includes('/telegram-auth')) {
      setLocation('/login');
    }
  }, [user, isLoading, location, setLocation]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/telegram-auth" component={TelegramAuth} />
      <Route path="/redirect" component={() => {
        // This route handles redirects from Telegram deep links
        // It will extract parameters and redirect to the appropriate page
        const params = new URLSearchParams(window.location.search);
        const telegramId = params.get('id');
        const state = params.get('state');
        
        if (telegramId && state) {
          // Redirect to the callback URL
          window.location.href = `/api/telegram/callback?id=${telegramId}&state=${state}`;
        } else {
          // Invalid parameters, redirect to login
          setLocation('/login');
        }
        
        return <TelegramAuth />;
      }} />
      <Route path="/" component={Dashboard} />
      <Route path="/categories" component={Categories} />
      <Route path="/quiz/:category/:subcategory?" component={Quiz} />
      <Route path="/image-quiz" component={ImageQuiz} />
      <Route path="/stats" component={Stats} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Layout>
          <Router />
        </Layout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
