import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Brain, Calendar } from "lucide-react";
import { Link } from "wouter";
import type { Assignment, Course } from "@shared/schema";

type AssignmentWithCourse = Assignment & { status: string; course: Course };

export default function UpcomingAssignments() {
  const { data: assignments, isLoading } = useQuery<AssignmentWithCourse[]>({
    queryKey: ["/api/assignments"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-accent/10 text-accent border-accent/20" data-testid="badge-completed">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20" data-testid="badge-in-progress">In Progress</Badge>;
      case "overdue":
        return <Badge variant="destructive" data-testid="badge-overdue">Overdue</Badge>;
      default:
        return <Badge variant="secondary" data-testid="badge-not-started">Not Started</Badge>;
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

  const sortedAssignments = assignments ? [...assignments]
    .filter(a => a.status !== "completed")
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5) : [];

  if (isLoading) {
    return (
      <Card className="border-border mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-24"></div>
                </div>
                <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border mt-8" data-testid="upcoming-assignments-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Upcoming Assignments</CardTitle>
          <Link href="/assignments">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent>
        {sortedAssignments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground font-medium">Assignment</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Course</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Due Date</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium">AI Help</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAssignments.map((assignment) => (
                  <TableRow 
                    key={assignment.id} 
                    className="border-border hover:bg-muted/50 transition-colors"
                    data-testid={`assignment-row-${assignment.id}`}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground" data-testid={`assignment-title-${assignment.id}`}>
                            {assignment.title}
                          </p>
                          {assignment.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {assignment.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground" data-testid={`assignment-course-${assignment.id}`}>
                        {assignment.course.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground" data-testid={`assignment-due-date-${assignment.id}`}>
                          {formatDate(assignment.dueDate ? assignment.dueDate.toString() : null)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(assignment.status)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary/80 transition-colors"
                        data-testid={`button-ai-help-${assignment.id}`}
                      >
                        <Brain className="w-3 h-3 mr-1" />
                        Get Help
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="no-assignments-title">
              All caught up!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto" data-testid="no-assignments-message">
              You don't have any upcoming assignments at the moment. Great job staying on top of your work!
            </p>
            <Link href="/assignments">
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-view-all-assignments"
              >
                View All Assignments
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
