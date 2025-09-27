import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; // Importar useNavigate
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Wrench,
  DollarSign,
  CreditCard,
  Users,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft, // Importar ChevronLeft
  ChevronUp, // Importar ChevronUp
  UserCheck,
  Building2,
  History,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Printer,
  Clock
} from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useTheme } from '@/react-app/hooks/useTheme';
import { UserPermissions } from '@/shared/auth-types';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  permission?: string;
  
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
    permission: UserPermissions.DASHBOARD_VIEW
  },
  {
    id: 'inventory',
    label: 'Estoque',
    icon: Package,
    path: '/inventory',
    permission: UserPermissions.INVENTORY_VIEW
  },
  {
    id: 'sales',
    label: 'Vendas',
    icon: ShoppingCart,
    path: '/sales',
    permission: UserPermissions.SALES_VIEW
  },
  {
    id: 'registrations',
    label: 'Clientes e Fornecedores',
    icon: Users,
    path: '/registrations',
    permission: UserPermissions.CUSTOMERS_VIEW
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: FileText,
    path: '/reports',
    permission: UserPermissions.REPORTS_VIEW
  },
  {
    id: 'admin',
    label: 'Administração',
    icon: Settings,
    path: '/administration', // O item pai também tem um path
    permission: UserPermissions.SETTINGS_VIEW,
    children: [
      { id: 'admin-company', label: 'Dados da Empresa', icon: Building2, path: '/administration/company-settings', permission: UserPermissions.SETTINGS_VIEW },
      { id: 'admin-parameters', label: 'Parâmetros do Sistema', icon: Printer, path: '/administration/system-parameters', permission: UserPermissions.SETTINGS_VIEW },
      { id: 'admin-users', label: 'Gestão de Usuários', icon: UserCheck, path: '/administration/users-management', permission: UserPermissions.USERS_VIEW },
      { id: 'admin-payment-methods', label: 'Meios de Pagamento', icon: CreditCard, path: '/administration/payment-methods', permission: UserPermissions.SECTION_PAYMENT_METHODS },
      { id: 'admin-product-structure', label: 'Marcas e Categorias', icon: Package, path: '/administration/product-structure', permission: UserPermissions.SECTION_BRANDS_CATEGORIES },
      { id: 'admin-warranty-stock', label: 'Garantias e Estoque', icon: Clock, path: '/administration/warranty-stock', permission: UserPermissions.SECTION_WARRANTY_STOCK },
      { id: 'admin-audit', label: 'Auditoria do Sistema', icon: History, path: '/administration/audit', permission: UserPermissions.AUDIT_VIEW },
    ]
  }
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate(); // Usar useNavigate
  const { user, logout, hasPermission } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [expandedItems, setExpandedItems] = useState<string[]>(['admin']); // Keep admin expanded by default
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    if (item.permission && !hasPermission(item.permission as any)) {
      return null;
    }

    const isActive = item.path === location.pathname || (item.children && item.children.some(child => location.pathname.startsWith(child.path || '')));
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    const ItemIcon = item.icon;
    const baseClasses = `flex items-center w-full px-4 py-3 text-left transition-all duration-200 group ${
      level > 0 && !isCollapsed ? 'pl-12' : ''
    }`;
    
    const activeClasses = isActive
      ? `${theme === 'dark' 
          ? 'bg-primary-dark text-primary-light border-r-2 border-primary' 
          : 'bg-primary-light/20 text-primary-dark border-r-2 border-primary'}`
      : `${theme === 'dark' 
          ? 'text-text-dark hover:bg-card-dark hover:text-white' 
          : 'text-text-light hover:bg-background-light hover:text-slate-900'}`;

    const handleClick = (e: React.MouseEvent) => {
      setIsMobileOpen(false); // Fechar sidebar mobile em qualquer clique

      if (item.path) {
        navigate(item.path);
      }
      
      if (hasChildren) {
        toggleExpanded(item.id);
      }
    };

    return (
      <div key={item.id}>
        <button
          onClick={handleClick}
          className={`${baseClasses} ${activeClasses}`}
        >
          <ItemIcon 
            size={20} 
            className={`${isCollapsed ? 'mx-auto' : 'mr-3'} ${
              isActive 
                ? theme === 'dark' ? 'text-primary-light' : 'text-primary'
                : theme === 'dark' ? 'text-text-dark' : 'text-text-light'
            }`} 
          />
          {!isCollapsed && (
            <>
              <span className="font-medium flex-1">{item.label}</span>
              {hasChildren && (
                // Apenas o ícone de expansão, o clique é tratado pelo botão pai
                <span className={`p-1 rounded transition-colors ${
                  theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
                }`}>
                  {isExpanded ? (
                    <ChevronUp size={16} className={theme === 'dark' ? 'text-slate-300' : 'text-slate-500'} />
                  ) : (
                    <ChevronDown size={16} className={theme === 'dark' ? 'text-slate-300' : 'text-slate-500'} />
                  )}
                </span>
              )}
            </>
          )}
        </button>
        
        {hasChildren && isExpanded && !isCollapsed && (
          <div className={theme === 'dark' ? 'bg-card-dark/50' : 'bg-background-light/50'}>
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-soft-md transition-colors ${
          theme === 'dark' 
            ? 'bg-card-dark text-text-dark' 
            : 'bg-card-light text-text-light'
        }`}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative z-40 ${isCollapsed ? 'w-16' : 'w-72'} h-full shadow-soft-lg transition-all duration-300 ease-in-out
        flex flex-col ${theme === 'dark' ? 'bg-background-dark' : 'bg-card-light'}
      `}>
        {/* Header */}
        <div className={`border-b ${isCollapsed ? 'p-3' : 'p-6'} ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    StoreFlow
                  </h1>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Pro
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`hidden lg:block p-1 rounded transition-colors ${
                theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-200'
              }`}
            >
              {isCollapsed ? (
                <ChevronRight size={20} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} />
              ) : (
                <ChevronLeft size={20} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navigationItems.map(item => renderNavItem(item))}
        </nav>

        {/* Theme Toggle and Logout */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} space-y-2`}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'text-yellow-400 hover:bg-card-dark' 
                : 'text-slate-600 hover:bg-background-light'
            }`}
            title={isCollapsed ? `Tema ${theme === 'dark' ? 'claro' : 'escuro'}` : ""}
          >
            {theme === 'dark' ? (
              <Sun size={20} className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
            ) : (
              <Moon size={20} className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
            )}
            {!isCollapsed && (
              <span className="font-medium">
                Tema {theme === 'dark' ? 'Claro' : 'Escuro'}
              </span>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'text-red-400 hover:bg-red-900/30' 
                : 'text-red-600 hover:bg-red-50'
            }`}
            title={isCollapsed ? "Sair" : ""}
          >
            <LogOut size={20} className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
            {!isCollapsed && <span className="font-medium">Sair</span>}
          </button>
        </div>

        {/* User Info */}
        <div className={`p-4 border-t ${
          theme === 'dark' 
            ? 'border-slate-700 bg-card-dark' 
            : 'border-slate-200 bg-background-light'
        }`}>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {!isCollapsed && (
              <div className="ml-3 flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  {user?.name}
                </p>
                <p className={`text-xs capitalize ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {user?.role}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}