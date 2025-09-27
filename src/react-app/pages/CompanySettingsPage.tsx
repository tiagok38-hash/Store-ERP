import CompanyInfoSection from '@/react-app/components/admin/CompanyInfoSection';
import { useTheme } from '@/react-app/hooks/useTheme';
import { Building2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompanySettingsPage() {
  const { theme } = useTheme();
  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      <div className="mb-6">
        <Link 
          to="/administration" 
          className={`inline-flex items-center text-sm font-medium mb-4 transition-colors ${
            theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
          }`}
        >
          <ChevronLeft size={16} className="mr-1" />
          Voltar para Administração
        </Link>
        <h1 className={`text-3xl font-bold mb-2 flex items-center ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          <Building2 className="mr-3 text-blue-600" size={32} />
          Dados da Empresa
        </h1>
        <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
          Gerencie as informações básicas e o logo da sua empresa.
        </p>
      </div>
      <div className={`rounded-xl shadow-lg p-6 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      }`}>
        <CompanyInfoSection />
      </div>
    </div>
  );
}