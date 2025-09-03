import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Search, Bell } from "lucide-react";

export default function Header() {
  const { user } = useAuth();

  const getInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "User";
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50" data-testid="header">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">
              Learning Buddy
            </h1>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground">
            AI-Powered University Platform
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-2 bg-muted rounded-lg px-3 py-2 min-w-[300px]">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search courses, assignments, or ask AI..." 
              className="bg-transparent border-none outline-none flex-1 text-sm text-foreground placeholder-muted-foreground p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              data-testid="input-search"
            />
          </div>
          
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative rounded-lg hover:bg-muted"
            data-testid="button-notifications"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
              3
            </span>
          </Button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-foreground" data-testid="text-user-name">
                {getDisplayName()}
              </div>
              <div className="text-xs text-muted-foreground" data-testid="text-user-role">
                {user?.role === 'instructor' ? 'Instructor' : 'Student'}
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center p-0 hover:bg-secondary/80"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-user-profile"
            >
              <span className="text-secondary-foreground font-medium text-sm" data-testid="text-user-initials">
                {getInitials(user)}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
