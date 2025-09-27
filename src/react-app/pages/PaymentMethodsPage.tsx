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
  Settings,
  ChevronLeft
} from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';
import { Link } from 'react-router-dom';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'money' | 'pix' | 'debit' | 'credit';
  isActive: boolean;
  requiresApproval: boolean;
  feePercentage: number;
  creditOptions?: {
    allowInterestFree: boolean;
    maxInterestFreeInstallments: number;
    interestRates: { [installments: number]: number };
  };
  createdAt: string;
  updatedAt: string;
}

export default function PaymentMethodsPage() {
  const { theme } = useTheme();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'money' as 'money' | 'pix' | 'debit' | 'credit',
    feePercentage: '0',
    requiresApproval: false,
    // Credit card specific
    allowInterestFree: true,
    maxInterestFreeInstallments: 3,
    interestRates: {} as { [key: number]: number }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        createdAt: '2025-01-15T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z'
      },
      {
        id: '2',
        name: 'PIX',
        type: 'pix',
        isActive: true,
        requiresApproval: false,
        feePercentage: 0,
        createdAt: '2025-01-15T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z'
      },
      {
        id: '3',
        name: 'Cartão de Débito',
        type: 'debit',
        isActive: true,
        requiresApproval: false,
        feePercentage: 2.5,
        createdAt: '2025-01-15T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z'
      },
      {
        id: '4',
        name: 'Cartão de Crédito',
        type: 'credit',
        isActive: true,
        requiresApproval: false,
        feePercentage: 3.5,
        creditOptions: {
          allowInterestFree: true,
          maxInterestFreeInstallments: 3,
          interestRates: {
            4: 2.5,
            5: 3.0,
            6: 3.5,
            7: 4.0,
            8: 4.5,
            9: 5.0,
            10: 5.5,
            11: 6.0,
            12: 6.5
          }
        },
        createdAt: '2025-01-15T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z'
      }
    ]);
  }, []);

  const filteredMethods = paymentMethods.filter(method => {
    const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || method.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome do método é obrigatório';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const methodData: PaymentMethod = {
      id: selectedMethod?.id || String(Date.now()),
      name: formData.name.trim(),
      type: formData.type,
      isActive: true,
      requiresApproval: formData.requiresApproval,
      feePercentage: parseFloat(formData.feePercentage) || 0,
      creditOptions: formData.type === 'credit' ? {
        allowInterestFree: formData.allowInterestFree,
        maxInterestFreeInstallments: formData.maxInterestFreeInstallments,
        interestRates: formData.interestRates
      } : undefined,
      createdAt: selectedMethod?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (selectedMethod) {
      setPaymentMethods(paymentMethods.map(m => m.id === selectedMethod.id ? methodData : m));
    } else {
      setPaymentMethods([...paymentMethods, methodData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'money',
      feePercentage: '0',
      requiresApproval: false,
      allowInterestFree: true,
      maxInterestFreeInstallments: 3,
      interestRates: {}
    });
    setSelectedMethod(null);
    setIsAddModalOpen(false);
    setErrors({});
  };

  const handleEdit = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      feePercentage: method.feePercentage.toString(),
      requiresApproval: method.requiresApproval,
      allowInterestFree: method.creditOptions?.allowInterestFree || true,
      maxInterestFreeInstallments: method.creditOptions?.maxInterestFreeInstallments || 3,
      interestRates: method.creditOptions?.interestRates || {}
    });
    setIsAddModalOpen(true);
  };

  const deleteMethod = (methodId: string) => {
    if (confirm('Tem certeza que deseja excluir este método de pagamento?')) {
      setPaymentMethods(paymentMethods.filter(m => m.id !== methodId));
    }
  };

  const toggleMethodStatus = (methodId: string) => {
    setPaymentMethods(paymentMethods.map(m => 
      m.id === methodId ? { ...m, isActive: !m.isActive } : m
    ));
  };

  const updateInterestRate = (installments: number, rate: number) => {
    setFormData(prev => ({
      ...prev,
      interestRates: {
        ...prev.interestRates,
        [installments]: rate
      }
    }));
  };

  const getTypeLabel = (type: string) => {
    const types = {
      money: 'Dinheiro',
      pix: 'PIX',
      debit: 'Débito',
      credit: 'Crédito'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link 
            to="/administration" 
            className={`inline-flex items-center text-sm font-medium mb-4 transition-colors ${
              theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            <ChevronLeft size={16} className="mr-1" />
            Voltar para Administração
          </Link>
          <h1 className={`text-3xl font-bold text-slate-800 mb-2 flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            <CreditCard className="mr-3 text-blue-600" size={32} />
            Meios de Pagamento
          </h1>
          <p className={`text-slate-600 ${theme === 'dark' ? 'text-slate-300' : ''}`}>Configure os métodos de pagamento aceitos</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium"
        >
          <Plus className="mr-2" size={20} />
          Novo Método
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`rounded-lg p-4 shadow-md ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Total de Métodos</h3>
          <p className="text-xl font-bold text-blue-500">{paymentMethods.length}</p>
        </div>
        <div className={`rounded-lg p-4 shadow-md ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Métodos Ativos</h3>
          <p className="text-xl font-bold text-green-500">{paymentMethods.filter(m => m.isActive).length}</p>
        </div>
        <div className={`rounded-lg p-4 shadow-md ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Com Taxa</h3>
          <p className="text-xl font-bold text-orange-500">{paymentMethods.filter(m => m.feePercentage > 0).length}</p>
        </div>
        <div className={`rounded-lg p-4 shadow-md ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Cartões de Crédito</h3>
          <p className="text-xl font-bold text-purple-500">{paymentMethods.filter(m => m.type === 'credit').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`rounded-xl shadow-lg p-6 mb-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} size={20} />
            <input
              type="text"
              placeholder="Buscar métodos de pagamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === 'dark'
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              theme === 'dark'
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="all">Todos os Tipos</option>
            <option value="money">Dinheiro</option>
            <option value="pix">PIX</option>
            <option value="debit">Débito</option>
            <option value="credit">Crédito</option>
          </select>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className={`rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            Métodos de Pagamento ({filteredMethods.length})
          </h3>
        </div>
        
        <div className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-100'}`}>
          {filteredMethods.map((method) => (
            <div key={method.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center mr-4">
                    <CreditCard size={24} className="text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{method.name}</h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {getTypeLabel(method.type)}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        method.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {method.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center">
                        <Percent size={14} className="mr-1" />
                        Taxa: {method.feePercentage}%
                      </span>
                      {method.requiresApproval && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                          Requer Aprovação
                        </span>
                      )}
                      {method.type === 'credit' && method.creditOptions && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          Até {method.creditOptions.maxInterestFreeInstallments}x sem juros
                        </span>
                      )}
                    </div>

                    {method.type === 'credit' && method.creditOptions && (
                      <div className={`mt-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`}>
                        <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>Configurações do Cartão:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {Object.entries(method.creditOptions.interestRates).map(([installments, rate]) => (
                            <div key={installments} className={`p-2 rounded border ${theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-200'}`}>
                              <span className="font-medium">{installments}x:</span> {rate}%
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(method)}
                    className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-blue-900/50' : 'hover:bg-blue-100'}`}
                    title="Editar método"
                  >
                    <Edit size={16} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => toggleMethodStatus(method.id)}
                    className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-yellow-900/50' : 'hover:bg-yellow-100'}`}
                    title={method.isActive ? 'Desativar' : 'Ativar'}
                  >
                    <Settings size={16} className="text-yellow-600" />
                  </button>
                  <button
                    onClick={() => deleteMethod(method.id)}
                    className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-red-900/50' : 'hover:bg-red-100'}`}
                    title="Excluir método"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Payment Method Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">
                {selectedMethod ? 'Editar Método' : 'Novo Método de Pagamento'}
              </h2>
              <button
                onClick={resetForm}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                      Nome do Método *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name 
                          ? 'border-red-300' 
                          : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 text-slate-900')
                      }`}
                      placeholder="Ex: Cartão de Crédito Visa"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                      Tipo *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="money">Dinheiro</option>
                      <option value="pix">PIX</option>
                      <option value="debit">Cartão de Débito</option>
                      <option value="credit">Cartão de Crédito</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                      Taxa (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.feePercentage}
                      onChange={(e) => setFormData({ ...formData, feePercentage: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.requiresApproval}
                        onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Requer aprovação</span>
                    </label>
                  </div>
                </div>

                {/* Credit Card Specific Options */}
                {formData.type === 'credit' && (
                  <div className={`border-t pt-6 ${theme === 'dark' ? 'border-slate-700' : ''}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Configurações do Cartão de Crédito</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.allowInterestFree}
                            onChange={(e) => setFormData({ ...formData, allowInterestFree: e.target.checked })}
                            className="rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Permitir parcelamento sem juros</span>
                        </label>

                        {formData.allowInterestFree && (
                          <div className="flex items-center gap-2">
                            <label className={`text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Até:</label>
                            <input
                              type="number"
                              min="1"
                              max="12"
                              value={formData.maxInterestFreeInstallments}
                              onChange={(e) => setFormData({ ...formData, maxInterestFreeInstallments: parseInt(e.target.value) })}
                              className={`w-16 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-blue-500 ${
                                theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                            <span className={`text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>parcelas</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Taxa de Juros por Parcela:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Array.from({ length: 16 }, (_, i) => i + 3).map(installments => (
                            <div key={installments} className="flex items-center gap-2">
                              <label className={`text-sm w-8 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{installments}x:</label>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="20"
                                value={formData.interestRates[installments] || ''}
                                onChange={(e) => updateInterestRate(installments, parseFloat(e.target.value) || 0)}
                                className={`flex-1 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 ${
                                  theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                                placeholder="0.0"
                              />
                              <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={`flex justify-end gap-3 mt-8 pt-6 border-t ${theme === 'dark' ? 'border-slate-700' : ''}`}>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-6 py-2 border rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
                >
                  <Save className="mr-2" size={16} />
                  {selectedMethod ? 'Salvar Alterações' : 'Criar Método'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}