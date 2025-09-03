import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FileText, Flame, Brain } from "lucide-react";

interface UserStats {
  activeCourses: number;
  pendingAssignments: number;
  studyStreak: number;
  aiInteractions: number;
}

export default function StatsGrid() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/analytics/stats"],
  });

  const statCards = [
    {
      title: "Active Courses",
      value: stats?.activeCourses ?? 0,
      icon: BookOpen,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Pending Assignments",
      value: stats?.pendingAssignments ?? 0,
      icon: FileText,
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Study Streak",
      value: `${stats?.studyStreak ?? 0} days`,
      icon: Flame,
      color: "bg-accent/10 text-accent",
    },
    {
      title: "AI Interactions",
      value: stats?.aiInteractions ?? 0,
      icon: Brain,
      color: "bg-chart-4/10 text-chart-4",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-8 bg-muted rounded animate-pulse w-16"></div>
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="stats-grid">
      {statCards.map((stat, index) => (
        <Card key={index} className="card-hover border-border" data-testid={`stat-card-${index}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground" data-testid={`stat-title-${index}`}>
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground" data-testid={`stat-value-${index}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
