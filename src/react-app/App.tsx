import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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
import CompanySettingsPage from "@/react-app/pages/CompanySettingsPage";
import SystemParametersPage from "@/react-app/pages/SystemParametersPage";
import UsersManagementPage from "@/react-app/pages/UsersManagementPage";
import PaymentMethodsPage from "@/react-app/pages/PaymentMethodsPage";
import ProductStructurePage from "@/react-app/pages/ProductStructurePage";
import WarrantyStockPage from "@/react-app/pages/WarrantyStockPage";
import AuditPage from "@/react-app/pages/AuditPage";
import { UserPermissions } from "@/shared/auth-types";

export default function App() {
  const location = useLocation(); // Hook para obter a localização atual

  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              {/* Removendo a chave para evitar re-renderização forçada e a classe de animação */}
              <div key={location.pathname}>
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
                  {/* New Administration Sub-Routes */}
                  <Route 
                    path="/administration/company-settings" 
                    element={
                      <ProtectedRoute permission={UserPermissions.SETTINGS_VIEW}>
                        <CompanySettingsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/administration/system-parameters" 
                    element={
                      <ProtectedRoute permission={UserPermissions.SETTINGS_VIEW}>
                        <SystemParametersPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/administration/users-management" 
                    element={
                      <ProtectedRoute permission={UserPermissions.USERS_VIEW}>
                        <UsersManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/administration/payment-methods" 
                    element={
                      <ProtectedRoute permission={UserPermissions.SECTION_PAYMENT_METHODS}>
                        <PaymentMethodsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/administration/product-structure" 
                    element={
                      <ProtectedRoute permission={UserPermissions.SECTION_BRANDS_CATEGORIES}>
                        <ProductStructurePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/administration/warranty-stock" 
                    element={
                      <ProtectedRoute permission={UserPermissions.SECTION_WARRANTY_STOCK}>
                        <WarrantyStockPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/administration/audit" 
                    element={
                      <ProtectedRoute permission={UserPermissions.AUDIT_VIEW}>
                        <AuditPage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </div>
            </main>
          </div>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}