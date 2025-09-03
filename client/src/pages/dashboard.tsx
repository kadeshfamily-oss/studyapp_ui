import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import StatsGrid from "@/components/dashboard/stats-grid";
import RecentCourses from "@/components/dashboard/recent-courses";
import AiRecommendations from "@/components/dashboard/ai-recommendations";
import UpcomingAssignments from "@/components/dashboard/upcoming-assignments";
import AiChatPanel from "@/components/chat/ai-chat-panel";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const userName = user.firstName || user.email?.split('@')[0] || "Student";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex min-h-screen">
        <Sidebar activeRoute="dashboard" />
        
        <main className="flex-1 bg-background">
          <div className="p-6" data-testid="dashboard-content">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="text-greeting">
                {getGreeting()}, {userName}!
              </h2>
              <p className="text-muted-foreground">
                Ready to continue your learning journey? Here's what's happening today.
              </p>
            </div>
            
            <StatsGrid />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <RecentCourses />
              <AiRecommendations />
            </div>
            
            <UpcomingAssignments />
          </div>
        </main>
        
        <AiChatPanel />
      </div>
    </div>
  );
}
