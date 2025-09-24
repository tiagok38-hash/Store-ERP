import PaymentMethodsTab from '@/react-app/components/admin/PaymentMethodsTab';
import { useTheme } from '@/react-app/hooks/useTheme';
import { CreditCard } from 'lucide-react';

export default function PaymentMethodsPage() {
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
          <CreditCard className="mr-3 text-blue-600" size={32} />
          Meios de Pagamento
        </h1>
        <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
          Configure os métodos de pagamento aceitos e suas taxas.
        </p>
      </div>
      <div className={`rounded-xl shadow-lg p-6 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      }`}>
        <PaymentMethodsTab />
      </div>
    </div>
  );
}