import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import AiChatPanel from "@/components/chat/ai-chat-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, MessageSquare, HelpCircle, BookOpen, Calculator, Atom } from "lucide-react";

export default function AITutor() {
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
          <p className="text-muted-foreground">Loading AI Tutor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const quickPrompts = [
    {
      icon: Calculator,
      title: "Math Help",
      description: "Get help with calculus, algebra, statistics, and more",
      prompt: "Can you help me understand derivatives and the chain rule?",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Atom,
      title: "Science Concepts",
      description: "Explore physics, chemistry, biology concepts",
      prompt: "Explain the concept of atomic structure and electron orbitals",
      color: "bg-secondary/10 text-secondary"
    },
    {
      icon: BookOpen,
      title: "Study Strategies",
      description: "Learn effective study techniques and methods",
      prompt: "What are the best study techniques for retaining information?",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: HelpCircle,
      title: "General Questions",
      description: "Ask any academic question across subjects",
      prompt: "I need help understanding this concept from my textbook",
      color: "bg-chart-4/10 text-chart-4"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex min-h-screen">
        <Sidebar activeRoute="ai-tutor" />
        
        <main className="flex-1 bg-background">
          <div className="p-6" data-testid="ai-tutor-content">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="text-ai-tutor-title">
                AI Learning Assistant
              </h2>
              <p className="text-muted-foreground">
                Get personalized help with your studies. Ask questions, get explanations, and receive study guidance.
              </p>
            </div>

            {/* AI Assistant Introduction */}
            <Card className="border-border mb-8">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Welcome to your AI Learning Assistant!
                    </h3>
                    <p className="text-muted-foreground">
                      I'm here to help you understand concepts, solve problems, and improve your study habits. 
                      You can ask me questions about any subject, request explanations, or get study recommendations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Start Prompts */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Start</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickPrompts.map((prompt, index) => (
                  <Card key={index} className="border-border card-hover cursor-pointer" data-testid={`card-prompt-${index}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${prompt.color}`}>
                          <prompt.icon className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-base">{prompt.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">{prompt.description}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-left justify-start"
                        data-testid={`button-prompt-${index}`}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Try this prompt
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span>Tips for Better AI Assistance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Be Specific</h4>
                      <p className="text-sm text-muted-foreground">
                        Instead of "I don't understand math," try "Can you explain how to solve quadratic equations?"
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Ask Follow-ups</h4>
                      <p className="text-sm text-muted-foreground">
                        Don't hesitate to ask for clarification or more examples if something isn't clear.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Provide Context</h4>
                      <p className="text-sm text-muted-foreground">
                        Mention your course level or specific topics you're studying for better tailored help.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Practice Together</h4>
                      <p className="text-sm text-muted-foreground">
                        Ask for practice problems or quiz questions to test your understanding.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <AiChatPanel />
      </div>
    </div>
  );
}
