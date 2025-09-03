import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Brain, Users, BarChart3, MessageSquare, BookOpen } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="container mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                Learning Buddy
              </h1>
            </div>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI-Powered University Platform for Enhanced Learning
            </p>
            
            <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
              Transform your academic journey with our comprehensive learning platform featuring AI tutoring, 
              course management, and personalized study recommendations designed for university-scale education.
            </p>
            
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              Get Started - Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Academic Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform combines cutting-edge AI technology with comprehensive learning management 
            to create the ultimate educational experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <Card className="card-hover border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">AI Learning Assistant</h3>
              <p className="text-muted-foreground">
                Get personalized help with coursework, concept explanations, and study guidance 
                from our advanced AI tutor available 24/7.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Course Management</h3>
              <p className="text-muted-foreground">
                Comprehensive LMS features including course enrollment, progress tracking, 
                and seamless collaboration between students and instructors.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Progress Analytics</h3>
              <p className="text-muted-foreground">
                Track your academic performance with detailed analytics, study streaks, 
                and personalized insights to optimize your learning journey.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-chart-4" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Interactive Chat</h3>
              <p className="text-muted-foreground">
                Engage in real-time conversations with AI for instant help, practice questions, 
                and concept clarification across all your subjects.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-chart-5/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-chart-5" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Multi-User Support</h3>
              <p className="text-muted-foreground">
                Role-based access for students and instructors with tailored dashboards 
                and features designed for different user needs.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Assignment Tracking</h3>
              <p className="text-muted-foreground">
                Stay organized with comprehensive assignment management, due date tracking, 
                and AI-powered study recommendations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Learning Experience?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students and educators who are already using Learning Buddy 
            to achieve academic excellence with AI-powered assistance.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-cta-login"
          >
            Start Learning Today
          </Button>
        </div>
      </div>
    </div>
  );
}
