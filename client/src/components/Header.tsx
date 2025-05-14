import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { HeartPulse, Menu, Bell, LogOut, LogIn } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
  });

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Quizzes', path: '/categories' },
    { name: 'Stats', path: '/stats' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Get first letter of user's name for avatar fallback
  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || '?';
  };
  
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/logout', {});
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully"
      });
      
      setLocation('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <HeartPulse className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Docdot</h1>
            </div>
          </Link>
          <span className="ml-3 text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded-md">Web Interface</span>
        </div>
        
        <div className="hidden md:flex space-x-4 items-center">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                location === item.path
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}>
                {item.name}
              </div>
            </Link>
          ))}
        </div>
        
        <div className="flex items-center space-x-3">
          {!isLoading && (
            <>
              {user?.isGuest ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">
                    <div className="flex items-center">
                      <LogIn className="mr-1.5 h-4 w-4" />
                      <span>Login</span>
                    </div>
                  </Link>
                </Button>
              ) : (
                <>
                  <div className="relative">
                    <button className="text-gray-600 hover:text-primary-600 p-2">
                      <Bell className="h-5 w-5" />
                    </button>
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                      2
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                      <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                      {user?.name || 'User'}
                    </span>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-gray-600"
                  >
                    <LogOut className="mr-1.5 h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </>
              )}
            </>
          )}
          
          <button 
            onClick={toggleMenu}
            className="md:hidden text-gray-600 hover:text-primary-600 p-2"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                location === item.path
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              }`}>
                {item.name}
              </div>
            </Link>
          ))}
          {!user?.isGuest && (
            <div 
              onClick={handleLogout}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 cursor-pointer"
            >
              <LogOut className="inline-block mr-1.5 h-4 w-4" />
              <span>Logout</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
