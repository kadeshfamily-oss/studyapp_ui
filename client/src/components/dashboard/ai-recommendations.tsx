import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, Clock, Trophy } from "lucide-react";
import type { AiRecommendation } from "@shared/schema";

export default function AiRecommendations() {
  const { data: recommendations, isLoading } = useQuery<AiRecommendation[]>({
    queryKey: ["/api/recommendations"],
  });

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "study":
        return Lightbulb;
      case "schedule":
        return Clock;
      case "achievement":
        return Trophy;
      default:
        return Lightbulb;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case "study":
        return "bg-primary/5 border-primary/20";
      case "schedule":
        return "bg-secondary/5 border-secondary/20";
      case "achievement":
        return "bg-accent/5 border-accent/20";
      default:
        return "bg-primary/5 border-primary/20";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "study":
        return "bg-primary text-primary-foreground";
      case "schedule":
        return "bg-secondary text-secondary-foreground";
      case "achievement":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  const getButtonColor = (type: string) => {
    switch (type) {
      case "study":
        return "text-primary hover:text-primary/80";
      case "schedule":
        return "text-secondary hover:text-secondary/80";
      case "achievement":
        return "text-accent hover:text-accent/80";
      default:
        return "text-primary hover:text-primary/80";
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <span>AI Recommendations</span>
            <Brain className="w-5 h-5 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayRecommendations = recommendations?.slice(0, 3) || [];

  return (
    <Card className="border-border" data-testid="ai-recommendations-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <span>AI Recommendations</span>
          <Brain className="w-5 h-5 text-primary" />
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {displayRecommendations.length > 0 ? (
          <div className="space-y-4">
            {displayRecommendations.map((recommendation) => {
              const IconComponent = getRecommendationIcon(recommendation.type);
              return (
                <div 
                  key={recommendation.id} 
                  className={`p-4 rounded-lg border ${getRecommendationColor(recommendation.type)}`}
                  data-testid={`recommendation-${recommendation.id}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(recommendation.type)}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1" data-testid={`recommendation-title-${recommendation.id}`}>
                        {recommendation.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2" data-testid={`recommendation-description-${recommendation.id}`}>
                        {recommendation.description}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`p-0 h-auto font-normal ${getButtonColor(recommendation.type)} transition-colors`}
                        data-testid={`recommendation-action-${recommendation.id}`}
                      >
                        {recommendation.type === "achievement" ? "View All" : 
                         recommendation.type === "schedule" ? "Schedule Now" : "Start Review"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground" data-testid="no-recommendations-message">
              No AI recommendations available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete some coursework to receive personalized suggestions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
