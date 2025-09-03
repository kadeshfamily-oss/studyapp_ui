import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import type { Course } from "@shared/schema";

type CourseWithProgress = Course & { progress: string };

export default function RecentCourses() {
  const { data: courses, isLoading } = useQuery<CourseWithProgress[]>({
    queryKey: ["/api/courses"],
  });

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Recent Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg">
                <div className="w-12 h-12 bg-muted rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-24"></div>
                  <div className="h-2 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentCourses = courses?.slice(0, 3) || [];

  return (
    <Card className="border-border" data-testid="recent-courses-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Courses</CardTitle>
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent>
        {recentCourses.length > 0 ? (
          <div className="space-y-4">
            {recentCourses.map((course) => (
              <div 
                key={course.id} 
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                data-testid={`recent-course-${course.id}`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground" data-testid={`course-title-${course.id}`}>
                    {course.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Instructor Course
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress 
                      value={parseFloat(course.progress)} 
                      className="w-16 h-2"
                      data-testid={`course-progress-${course.id}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {course.progress}%
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground" data-testid="no-courses-message">
              No courses enrolled yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
