import { BrowserRouter as Router, Routes, Route } from "react-router";
import AuthProvider from "@/react-app/components/AuthProvider";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";
import Sidebar from "@/react-app/components/Sidebar";
import { NotificationProvider } from "@/react-app/components/NotificationSystem";
import { ThemeProvider } from "@/react-app/hooks/useTheme";
import Dashboard from "@/react-app/pages/Dashboard";
import Sales from "@/react-app/pages/Sales";
import Inventory from "@/react-app/pages/Inventory";
import ServiceOrders from "@/react-app/pages/ServiceOrders";
import Financial from "@/react-app/pages/Financial";
import Credit from "@/react-app/pages/Credit";
import Registrations from "@/react-app/pages/Registrations";
import Reports from "@/react-app/pages/Reports";
import Administration from "@/react-app/pages/Administration";
import { UserPermissions } from "@/shared/auth-types";

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <ProtectedRoute>
              <div className="flex h-screen">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route 
                      path="/" 
                      element={
                        <ProtectedRoute permission={UserPermissions.DASHBOARD_VIEW}>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/sales" 
                      element={
                        <ProtectedRoute permission={UserPermissions.SALES_VIEW}>
                          <Sales />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/inventory" 
                      element={
                        <ProtectedRoute permission={UserPermissions.INVENTORY_VIEW}>
                          <Inventory />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/registrations" 
                      element={
                        <ProtectedRoute permission={UserPermissions.CUSTOMERS_VIEW}>
                          <Registrations />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/reports" 
                      element={
                        <ProtectedRoute permission={UserPermissions.REPORTS_VIEW}>
                          <Reports />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/administration" 
                      element={
                        <ProtectedRoute permission={UserPermissions.SETTINGS_VIEW}>
                          <Administration />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
