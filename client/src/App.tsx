import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import Assignments from "@/pages/assignments";
import AITutor from "@/pages/ai-tutor";
import NotFound from "@/pages/not-found";
import AiChatPanel from "@/components/chat/ai-chat-panel";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/courses" component={Courses} />
            <Route path="/assignments" component={Assignments} />
            <Route path="/ai-tutor" component={AITutor} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      {/* Global AI Chat - only show when authenticated */}
      {!isLoading && isAuthenticated && <AiChatPanel />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
