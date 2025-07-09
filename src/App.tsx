
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import FarmerDashboard from "./pages/dashboard/FarmerDashboard";
import BrokerDashboard from "./pages/dashboard/BrokerDashboard";
import MNCDashboard from "./pages/dashboard/MNCDashboard";
import RetailerDashboard from "./pages/dashboard/RetailerDashboard";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";

const queryClient = new QueryClient();

// Component to handle authenticated redirects
const AuthenticatedRedirect = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (user && profile) {
    return <Navigate to={`/dashboard/${profile.role}`} replace />;
  }

  return <Navigate to="/auth" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthenticatedRedirect />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard/farmer"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/broker"
        element={
          <ProtectedRoute allowedRoles={['broker']}>
            <BrokerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/mnc"
        element={
          <ProtectedRoute allowedRoles={['mnc']}>
            <MNCDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/retailer"
        element={
          <ProtectedRoute allowedRoles={['retailer']}>
            <RetailerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/customer"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
