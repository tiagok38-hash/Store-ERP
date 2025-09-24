import { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';

// Import tab components
import CompanySettings from '@/react-app/components/admin/CompanySettings';
import SystemParameters from '@/react-app/components/admin/SystemParameters';
import UsersManagement from '@/react-app/components/admin/UsersManagement';
import PaymentMethodsTab from '@/react-app/components/admin/PaymentMethodsTab';
import ProductStructureTab from '@/react-app/components/admin/ProductStructureTab';
import WarrantyStockTab from '@/react-app/components/admin/WarrantyStockTab';
import AuditTab from '@/react-app/components/admin/AuditTab';

type AdminTab = 'company' | 'parameters' | 'users' | 'payment-methods' | 'product-structure' | 'warranty-stock' | 'audit';

const adminTabs = [
  { key: 'company' as AdminTab, label: 'Dados da Empresa' },
  { key: 'parameters' as AdminTab, label: 'Parâmetros' },
  { key: 'users' as AdminTab, label: 'Usuários' },
  { key: 'payment-methods' as AdminTab, label: 'Meios de Pagamentos' },
  { key: 'product-structure' as AdminTab, label: 'Marcas e Categorias' },
  { key: 'warranty-stock' as AdminTab, label: 'Garantias e Estoque' },
  { key: 'audit' as AdminTab, label: 'Auditoria' }
];

export default function Administration() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('company');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return <CompanySettings />;
      case 'parameters':
        return <SystemParameters />;
      case 'users':
        return <UsersManagement />;
      case 'payment-methods':
        return <PaymentMethodsTab />;
      case 'product-structure':
        return <ProductStructureTab />;
      case 'warranty-stock':
        return <WarrantyStockTab />;
      case 'audit':
        return <AuditTab />;
      default:
        return <CompanySettings />;
    }
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 flex items-center ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          <SettingsIcon className="mr-3 text-blue-600" size={32} />
          Administração
        </h1>
        <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
          Configure as informações da empresa e preferências do sistema
        </p>
      </div>

      {/* Tab Container */}
      <div className={`rounded-xl shadow-lg ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Tab Navigation */}
        <div className={`border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <nav className="flex flex-wrap">
            {adminTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : `border-transparent ${
                        theme === 'dark' 
                          ? 'text-slate-300 hover:text-white hover:bg-slate-700/50' 
                          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                      }`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
