import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Building2, Printer, UserCheck, CreditCard, Package, Clock, History } from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';

const adminSections = [
  { key: 'company', label: 'Dados da Empresa', icon: Building2, path: '/administration/company-settings' },
  { key: 'parameters', label: 'Termos de Compra e Impressão', icon: Printer, path: '/administration/system-parameters' },
  { key: 'users', label: 'Gestão de Usuários', icon: UserCheck, path: '/administration/users-management' },
  { key: 'payment-methods', label: 'Meios de Pagamento', icon: CreditCard, path: '/administration/payment-methods' },
  { key: 'product-structure', label: 'Marcas, Categorias e Variações', icon: Package, path: '/administration/product-structure' },
  { key: 'warranty-stock', label: 'Garantias e Estoque', icon: Clock, path: '/administration/warranty-stock' },
  { key: 'audit', label: 'Auditoria do Sistema', icon: History, path: '/administration/audit' }
];

export default function Administration() {
  const { theme } = useTheme();

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 flex items-center ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          <SettingsIcon className="mr-3 text-blue-600" size={32} />
          Administração
        </h1>
        <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
          Selecione uma seção para gerenciar as configurações do sistema.
        </p>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link 
              key={section.key} 
              to={section.path}
              className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-200 
                ${theme === 'dark' 
                  ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white' 
                  : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-800'
                } hover:scale-105`}
            >
              <Icon size={48} className={`mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className="text-xl font-semibold text-center">{section.label}</h2>
            </Link>
          );
        })}
      </div>
    </div>
  );
}