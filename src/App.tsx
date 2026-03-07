import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import LogsMonitor from "./pages/LogsMonitor";
import AnomalyDetection from "./pages/AnomalyDetection";
import AlertsPage from "./pages/AlertsPage";
import HealingPage from "./pages/HealingPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SystemHealth from "./pages/SystemHealth";
import ReportsPage from "./pages/ReportsPage";
import UserManagement from "./pages/UserManagement";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/logs" element={<LogsMonitor />} />
            <Route path="/anomalies" element={<AnomalyDetection />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/healing" element={<HealingPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/health" element={<SystemHealth />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
