import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  X,
  Percent,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'money' | 'pix' | 'debit_card' | 'credit_card' | 'promissory' | 'device_exchange';
  isActive: boolean;
  requiresApproval: boolean;
  feePercentage: number;
  installmentRates?: { [key: number]: number }; // Para cartão de crédito: parcela -> taxa %
  createdAt: string;
  updatedAt: string;
}

const paymentTypes = [
  { value: 'money', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'promissory', label: 'Promissória' },
  { value: 'device_exchange', label: 'Troca de Aparelho' }
];

export default function PaymentMethodsTab() {
  const { theme } = useTheme();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'money' as PaymentMethod['type'],
    requiresApproval: false,
    feePercentage: 0,
    installmentRates: {} as { [key: number]: number }
  });

  useEffect(() => {
    // Mock data
    setPaymentMethods([
      {
        id: '1',
        name: 'Dinheiro',
        type: 'money',
        isActive: true,
        requiresApproval: false,
        feePercentage: 0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'PIX',
        type: 'pix',
        isActive: true,
        requiresApproval: false,
        feePercentage: 0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: 'Cartão de Débito',
        type: 'debit_card',
        isActive: true,
        requiresApproval: false,
        feePercentage: 2.5,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '4',
        name: 'Cartão de Crédito',
        type: 'credit_card',
        isActive: true,
        requiresApproval: false,
        feePercentage: 3.5,
        installmentRates: {
          1: 3.5,
          2: 4.2,
          3: 4.8,
          4: 5.5,
          5: 6.2,
          6: 6.8
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '5',
        name: 'Promissória',
        type: 'promissory',
        isActive: true,
        requiresApproval: true,
        feePercentage: 0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: '6',
        name: 'Troca de Aparelho',
        type: 'device_exchange',
        isActive: true,
        requiresApproval: false,
        feePercentage: 0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ]);
  }, []);

  const filteredMethods = paymentMethods.filter(method =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    return paymentTypes.find(t => t.value === type)?.label || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      money: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pix: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      debit_card: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      credit_card: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      promissory: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      device_exchange: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const openModal = (method?: PaymentMethod) => {
    setSelectedMethod(method || null);
    setFormData({
      name: method?.name || '',
      type: method?.type || 'money',
      requiresApproval: method?.requiresApproval || false,
      feePercentage: method?.feePercentage || 0,
      installmentRates: method?.installmentRates || {}
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const methodData: PaymentMethod = {
      id: selectedMethod?.id || String(Date.now()),
      name: formData.name,
      type: formData.type,
      isActive: true,
      requiresApproval: formData.requiresApproval,
      feePercentage: formData.feePercentage,
      installmentRates: formData.type === 'credit_card' ? formData.installmentRates : undefined,
      createdAt: selectedMethod?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (selectedMethod) {
      setPaymentMethods(methods => 
        methods.map(m => m.id === selectedMethod.id ? methodData : m)
      );
    } else {
      setPaymentMethods(methods => [...methods, methodData]);
    }

    setIsModalOpen(false);
    setFormData({ name: '', type: 'money', requiresApproval: false, feePercentage: 0, installmentRates: {} });
  };

  const toggleStatus = (id: string) => {
    setPaymentMethods(methods =>
      methods.map(m => 
        m.id === id ? { ...m, isActive: !m.isActive } : m
      )
    );
  };

  const deleteMethod = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este meio de pagamento?')) {
      setPaymentMethods(methods => methods.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-400'
          }`} size={20} />
          <input
            type="text"
            placeholder="Buscar meios de pagamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              theme === 'dark'
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium"
        >
          <Plus className="mr-2" size={20} />
          Novo Meio de Pagamento
        </button>
      </div>

      {/* Payment Methods Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}>
            <tr>
              <th className={`text-left py-3 px-4 font-semibold ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>Nome</th>
              <th className={`text-left py-3 px-4 font-semibold ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>Tipo</th>
              <th className={`text-left py-3 px-4 font-semibold ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>Taxa</th>
              <th className={`text-left py-3 px-4 font-semibold ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>Aprovação</th>
              <th className={`text-left py-3 px-4 font-semibold ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>Status</th>
              <th className={`text-center py-3 px-4 font-semibold ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredMethods.map((method) => (
              <tr key={method.id} className={`border-b transition-colors ${
                theme === 'dark' 
                  ? 'border-slate-700 hover:bg-slate-700/50' 
                  : 'border-slate-100 hover:bg-slate-50'
              }`}>
                <td className={`py-3 px-4 font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  {method.name}
                </td>
                
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(method.type)}`}>
                    {getTypeLabel(method.type)}
                  </span>
                </td>
                
                <td className={`py-3 px-4 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {method.type === 'credit_card' && method.installmentRates ? (
                    <div className="space-y-1">
                      <div className="text-xs font-medium">Taxa por parcela:</div>
                      <div className="text-xs">
                        {Object.entries(method.installmentRates).slice(0, 3).map(([parcela, taxa]) => (
                          <div key={parcela}>{parcela}x: {taxa}%</div>
                        ))}
                        {Object.keys(method.installmentRates).length > 3 && <div>...</div>}
                      </div>
                    </div>
                  ) : method.feePercentage > 0 ? (
                    <div className="flex items-center">
                      <Percent size={14} className="mr-1" />
                      {method.feePercentage}%
                    </div>
                  ) : (
                    'Sem taxa'
                  )}
                </td>
                
                <td className="py-3 px-4">
                  {method.requiresApproval ? (
                    <div className="flex items-center text-yellow-600">
                      <CheckCircle size={16} className="mr-1" />
                      Requerida
                    </div>
                  ) : (
                    <div className={`flex items-center ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                      <XCircle size={16} className="mr-1" />
                      Automática
                    </div>
                  )}
                </td>
                
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleStatus(method.id)}
                    className={`px-2 py-1 rounded-full text-sm ${
                      method.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    {method.isActive ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openModal(method)}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'hover:bg-blue-900/50' 
                          : 'hover:bg-blue-100'
                      }`}
                      title="Editar"
                    >
                      <Edit size={16} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => deleteMethod(method.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'hover:bg-red-900/50' 
                          : 'hover:bg-red-100'
                      }`}
                      title="Excluir"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl max-w-md w-full ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">
                {selectedMethod ? 'Editar Meio de Pagamento' : 'Novo Meio de Pagamento'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    placeholder="Digite o nome do meio de pagamento"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as PaymentMethod['type'] })}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {paymentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    Taxa (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.feePercentage}
                    onChange={(e) => setFormData({ ...formData, feePercentage: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    placeholder="0.00"
                  />
                </div>

                {formData.type === 'credit_card' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                    }`}>
                      Taxa de Juros por Parcela (%)
                    </label>
                    <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(parcela => (
                        <div key={parcela} className="flex items-center space-x-2">
                          <label className={`text-sm w-8 ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {parcela}x:
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.installmentRates[parcela] || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              installmentRates: {
                                ...formData.installmentRates,
                                [parcela]: parseFloat(e.target.value) || 0
                              }
                            })}
                            className={`flex-1 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                              theme === 'dark'
                                ? 'bg-slate-700 border-slate-600 text-white'
                                : 'bg-white border-slate-300 text-slate-900'
                            }`}
                            placeholder="0.00"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <label htmlFor="requiresApproval" className={`ml-2 text-sm ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    Requer aprovação manual
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'border border-slate-600 text-slate-300 hover:bg-slate-700'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
                >
                  <Save className="mr-2" size={16} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
