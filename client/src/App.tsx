import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./lib/auth";
import Login from "@/pages/Login";
import TeacherDashboard from "@/pages/TeacherDashboard";
import AdminPanel from "@/pages/AdminPanel";
import TestInterface from "@/pages/TestInterface";
import NotFound from "@/pages/not-found";

function AuthenticatedRoutes() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={user.role === 'admin' ? AdminPanel : TeacherDashboard} />
      <Route path="/test" component={TestInterface} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/dashboard" component={TeacherDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  return (
    <AuthProvider>
      <AuthenticatedRoutes />
    </AuthProvider>
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
