import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AuthProvider from "@/react-app/components/AuthProvider";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";
import Sidebar from "@/react-app/components/Sidebar";
import { NotificationProvider } from "@/react-app/components/NotificationSystem";
import { ThemeProvider, useTheme } from "@/react-app/hooks/useTheme"; // Importar useTheme
import { SessionContextProvider, useSession } from "@/react-app/components/SessionContextProvider";
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
import Login from "@/react-app/pages/Login";
import Home from "@/react-app/pages/Home";
import { UserPermissions } from "@/shared/auth-types";

// Componente interno para lidar com a lógica de redirecionamento
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, isLoading } = useSession();
  const { theme } = useTheme(); // Usar o tema para aplicar classes de fundo

  // --- INÍCIO DA REMOÇÃO TEMPORÁRIA DA LÓGICA DE LOGIN ---
  // Comentando o useEffect que lida com redirecionamentos de autenticação
  /*
  useEffect(() => {
    if (!isLoading) {
      if (session && location.pathname === '/login') {
        navigate('/');
      } else if (!session && location.pathname !== '/login') {
        navigate('/login');
      }
    }
  }, [session, isLoading, location.pathname, navigate]);
  */

  // Comentando o bloco que mostra o loader ou a página de Login
  /*
  if (isLoading) {
    return <Home />;
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }
  */
  // --- FIM DA REMOÇÃO TEMPORÁRIA DA LÓGICA DE LOGIN ---

  // Se a lógica de login estiver comentada, sempre renderizamos o layout completo
  return (
    <div className={`flex h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-background-dark to-slate-900' 
        : 'bg-gradient-to-br from-background-light to-slate-100'
    }`}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
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
            {/* Adicionando a rota de login para que ela ainda exista, mas não seja forçada */}
            <Route path="/login" element={<Login />} />
            {/* Fallback route for authenticated users */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <SessionContextProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </SessionContextProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}