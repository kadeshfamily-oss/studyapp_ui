import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Brain, Minus, User, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ChatMessage, Course } from "@shared/schema";

export default function AiChatPanel() {
  const [message, setMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
    refetchInterval: false,
  });

  // Fetch user courses for RAG context
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Use RAG if a course is selected and contains documents
      if (selectedCourse) {
        const response = await apiRequest("POST", "/api/chat/rag", { 
          message: content,
          courseId: selectedCourse 
        });
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/chat/message", { content });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setMessage("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate(message.trim());
  };

  const handleQuickAction = (prompt: string) => {
    if (sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(prompt);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
          data-testid="button-expand-chat"
        >
          <Brain className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-card border border-border rounded-lg shadow-xl flex flex-col" data-testid="ai-chat-panel">
      {/* Chat Header */}
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="font-medium text-foreground" data-testid="text-chat-title">
                AI Learning Assistant
              </h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <p className="text-xs text-muted-foreground">Online • Ready to help</p>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6"
            data-testid="button-minimize-chat"
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" data-testid="chat-messages">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-muted-foreground">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-message">
              <div className="flex items-start space-x-2">
                <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-3 h-3 text-secondary-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2 max-w-[80%]">
                  <p className="text-sm text-foreground">
                    Hello! I'm your AI learning assistant. I can help you with coursework, explain concepts, 
                    generate practice questions, and much more. Select a course below to get answers based on your course materials!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Just now</p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="chat-message" data-testid={`message-${msg.id}`}>
                {msg.type === "ai" ? (
                  <div className="flex items-start space-x-2">
                    <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="w-3 h-3 text-secondary-foreground" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2 max-w-[80%]">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {msg.createdAt ? formatTime(msg.createdAt) : 'Now'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2 justify-end">
                    <div className="bg-primary rounded-lg px-3 py-2 max-w-[80%]">
                      <p className="text-sm text-primary-foreground whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs text-primary-foreground/70 mt-1">
                        {msg.createdAt ? formatTime(msg.createdAt) : 'Now'}
                      </p>
                    </div>
                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-xs font-medium">
                        {getInitials()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* AI Typing Indicator */}
          {sendMessageMutation.isPending && (
            <div className="chat-message">
              <div className="flex items-start space-x-2">
                <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-3 h-3 text-secondary-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Chat Input */}
      <CardContent className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="space-y-3">
          {/* Course Selection for RAG */}
          {courses.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Ask about course materials:</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue placeholder="Select course for context..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" data-testid="select-no-course">General questions</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id} data-testid={`select-course-${course.id}`}>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-3 h-3" />
                        <span>{course.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCourse && (
                <p className="text-xs text-muted-foreground">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Answers will be based on course materials
                </p>
              )}
            </div>
          )}
          
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={selectedCourse ? "Ask about course materials..." : "Ask me anything about your courses..."}
              className="flex-1 bg-muted border border-input text-sm"
              disabled={sendMessageMutation.isPending}
              data-testid="input-chat-message"
            />
            <Button 
              type="submit"
              size="icon"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className={selectedCourse ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {selectedCourse ? (
              <>
                <Badge 
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleQuickAction("Summarize the key concepts from the course materials")}
                  data-testid="button-quick-summarize"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Summarize materials
                </Badge>
                <Badge 
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleQuickAction("Generate practice questions from the course content")}
                  data-testid="button-quick-practice"
                >
                  Practice questions
                </Badge>
                <Badge 
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleQuickAction("What are the most important topics to review?")}
                  data-testid="button-quick-review"
                >
                  Study guide
                </Badge>
              </>
            ) : (
              <>
                <Badge 
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleQuickAction("Can you explain this concept to me?")}
                  data-testid="button-quick-explain"
                >
                  Explain concept
                </Badge>
                <Badge 
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleQuickAction("Can you create a practice quiz for me?")}
                  data-testid="button-quick-quiz"
                >
                  Practice quiz
                </Badge>
                <Badge 
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleQuickAction("Can you help me create a study plan?")}
                  data-testid="button-quick-study-plan"
                >
                  Study plan
                </Badge>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </div>
  );
}
