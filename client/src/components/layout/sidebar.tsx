import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  BookOpen, 
  FileText, 
  TrendingUp, 
  Brain, 
  HelpCircle, 
  CircleHelp,
  Calendar,
  Folder,
  Settings,
} from "lucide-react";

interface SidebarProps {
  activeRoute?: string;
}

export default function Sidebar({ activeRoute }: SidebarProps) {
  const [location] = useLocation();

  const navigationItems = [
    { path: "/", icon: Home, label: "Dashboard", route: "dashboard" },
    { path: "/courses", icon: BookOpen, label: "My Courses", route: "courses" },
    { path: "/assignments", icon: FileText, label: "Assignments", route: "assignments" },
    { path: "/progress", icon: TrendingUp, label: "Progress", route: "progress" },
  ];

  const aiFeatures = [
    { path: "/ai-tutor", icon: Brain, label: "AI Tutor", route: "ai-tutor" },
    { path: "/study-help", icon: HelpCircle, label: "Study Help", route: "study-help" },
    { path: "/quiz-generator", icon: CircleHelp, label: "Quiz Generator", route: "quiz-generator" },
  ];

  const tools = [
    { path: "/calendar", icon: Calendar, label: "Calendar", route: "calendar" },
    { path: "/resources", icon: Folder, label: "Resources", route: "resources" },
    { path: "/settings", icon: Settings, label: "Settings", route: "settings" },
  ];

  const isActiveRoute = (route: string) => {
    return activeRoute === route || location === (route === "dashboard" ? "/" : `/${route}`);
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border sidebar-transition" data-testid="sidebar">
      <nav className="p-4 space-y-2">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link key={item.route} href={item.path}>
              <a 
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  isActiveRoute(item.route)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                data-testid={`link-${item.route}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
        
        {/* AI Features */}
        <div className="pt-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            AI Assistant
          </h3>
          <div className="space-y-1">
            {aiFeatures.map((item) => (
              <Link key={item.route} href={item.path}>
                <a 
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    isActiveRoute(item.route)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  data-testid={`link-${item.route}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Tools */}
        <div className="pt-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Tools
          </h3>
          <div className="space-y-1">
            {tools.map((item) => (
              <Link key={item.route} href={item.path}>
                <a 
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    isActiveRoute(item.route)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  data-testid={`link-${item.route}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
