import WarrantyStock from '@/react-app/pages/WarrantyStock';
import { useTheme } from '@/react-app/hooks/useTheme';
import { Settings } from 'lucide-react';

export default function WarrantyStockPage() {
  const { theme } = useTheme();
  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 flex items-center ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          <Settings className="mr-3 text-indigo-600" size={32} />
          Garantias e Estoque
        </h1>
        <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
          Configure os termos de garantia, condições e locais de armazenamento.
        </p>
      </div>
      <div className={`rounded-xl shadow-lg p-6 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      }`}>
        <WarrantyStock />
      </div>
    </div>
  );
}