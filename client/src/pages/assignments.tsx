import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, FileText, Brain } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Assignment, Course } from "@shared/schema";

type AssignmentWithCourse = Assignment & { status: string; course: Course };

export default function Assignments() {
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

  const { data: assignments, isLoading: assignmentsLoading, error } = useQuery<AssignmentWithCourse[]>({
    queryKey: ["/api/assignments"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (isLoading || assignmentsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-accent text-accent-foreground">Completed</Badge>;
      case "in_progress":
        return <Badge variant="default" className="bg-chart-4 text-white">In Progress</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const sortedAssignments = assignments ? [...assignments].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex min-h-screen">
        <Sidebar activeRoute="assignments" />
        
        <main className="flex-1 bg-background">
          <div className="p-6" data-testid="assignments-content">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="text-assignments-title">
                Assignments
              </h2>
              <p className="text-muted-foreground">
                Track your assignments across all courses and get AI assistance when needed.
              </p>
            </div>

            {sortedAssignments && sortedAssignments.length > 0 ? (
              <div className="space-y-6">
                {sortedAssignments.map((assignment) => (
                  <Card key={assignment.id} className="border-border" data-testid={`card-assignment-${assignment.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1" data-testid={`text-assignment-title-${assignment.id}`}>
                              {assignment.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mb-2" data-testid={`text-course-${assignment.id}`}>
                              {assignment.course.title}
                            </p>
                            {assignment.description && (
                              <p className="text-sm text-muted-foreground">
                                {assignment.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          {getStatusBadge(assignment.status)}
                          <div className="flex items-center text-xs text-muted-foreground">
                            <CalendarDays className="w-3 h-3 mr-1" />
                            <span data-testid={`text-due-date-${assignment.id}`}>
                              {formatDate(assignment.dueDate ? assignment.dueDate.toString() : null)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Max Points: {assignment.maxPoints || 100}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            data-testid={`button-ai-help-${assignment.id}`}
                          >
                            <Brain className="w-4 h-4 mr-1" />
                            Get AI Help
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            data-testid={`button-work-on-${assignment.id}`}
                          >
                            {assignment.status === "completed" ? "Review" : "Work On It"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-assignments">
                    No assignments yet
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    You don't have any assignments at the moment. Check back later or contact your instructor.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
