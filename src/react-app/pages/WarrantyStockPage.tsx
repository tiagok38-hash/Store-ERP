import { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Clock,
  MapPin,
  Package,
  X,
  ChevronLeft
} from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';
import { Link } from 'react-router-dom';

interface WarrantyTerm {
  id: string;
  name: string;
  months: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

interface StockCondition {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

interface StockLocation {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export default function WarrantyStockPage() {
  const { theme } = useTheme();
  const [warranties, setWarranties] = useState<WarrantyTerm[]>([]);
  const [conditions, setConditions] = useState<StockCondition[]>([]);
  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [activeTab, setActiveTab] = useState<'warranty' | 'condition' | 'location'>('warranty');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    months: 0
  });

  useEffect(() => {
    // Mock data
    setWarranties([
      {
        id: '1',
        name: 'Garantia Básica',
        months: 3,
        description: 'Garantia padrão para produtos básicos',
        isActive: true,
        createdAt: '2025-01-01'
      },
      {
        id: '2',
        name: 'Garantia Premium',
        months: 12,
        description: 'Garantia estendida para produtos premium',
        isActive: true,
        createdAt: '2025-01-01'
      },
      {
        id: '3',
        name: 'Garantia de Serviço',
        months: 6,
        description: 'Garantia para serviços técnicos',
        isActive: true,
        createdAt: '2025-01-01'
      }
    ]);

    setConditions([
      {
        id: '1',
        name: 'Novo',
        description: 'Produto novo, lacrado',
        isActive: true,
        createdAt: '2025-01-01'
      },
      {
        id: '2',
        name: 'Usado',
        description: 'Produto usado em bom estado',
        isActive: true,
        createdAt: '2025-01-01'
      },
      {
        id: '3',
        name: 'Recondicionado',
        description: 'Produto recondicionado pela assistência',
        isActive: true,
        createdAt: '2025-01-01'
      },
      {
        id: '4',
        name: 'Defeituoso',
        description: 'Produto com defeito para reparo',
        isActive: true,
        createdAt: '2025-01-01'
      }
    ]);

    setLocations([
      {
        id: '1',
        name: 'Prateleira A1',
        description: 'Produtos principais - setor smartphones',
        isActive: true,
        createdAt: '2025-01-01'
      },
      {
        id: '2',
        name: 'Prateleira B2',
        description: 'Acessórios - cabos e capinhas',
        isActive: true,
        createdAt: '2025-01-01'
      },
      {
        id: '3',
        name: 'Estoque Interno',
        description: 'Estoque interno - produtos reservados',
        isActive: true,
        createdAt: '2025-01-01'
      },
      {
        id: '4',
        name: 'Depósito',
        description: 'Depósito principal - produtos em alta quantidade',
        isActive: true,
        createdAt: '2025-01-01'
      }
    ]);
  }, []);

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({ name: '', description: '', months: 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      months: item.months || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem = {
      id: selectedItem?.id || String(Date.now()),
      name: formData.name,
      description: formData.description,
      ...(activeTab === 'warranty' && { months: formData.months }),
      isActive: true,
      createdAt: selectedItem?.createdAt || new Date().toISOString().split('T')[0]
    };

    if (selectedItem) {
      // Edit
      switch (activeTab) {
        case 'warranty':
          setWarranties(warranties.map(w => w.id === selectedItem.id ? newItem as WarrantyTerm : w));
          break;
        case 'condition':
          setConditions(conditions.map(c => c.id === selectedItem.id ? newItem as StockCondition : c));
          break;
        case 'location':
          setLocations(locations.map(l => l.id === selectedItem.id ? newItem as StockLocation : l));
          break;
      }
    } else {
      // Add
      switch (activeTab) {
        case 'warranty':
          setWarranties([...warranties, newItem as WarrantyTerm]);
          break;
        case 'condition':
          setConditions([...conditions, newItem as StockCondition]);
          break;
        case 'location':
          setLocations([...locations, newItem as StockLocation]);
          break;
      }
    }

    setIsModalOpen(false);
    setFormData({ name: '', description: '', months: 0 });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    switch (activeTab) {
      case 'warranty':
        setWarranties(warranties.filter(w => w.id !== id));
        break;
      case 'condition':
        setConditions(conditions.filter(c => c.id !== id));
        break;
      case 'location':
        setLocations(locations.filter(l => l.id !== id));
        break;
    }
  };

  const toggleStatus = (id: string) => {
    switch (activeTab) {
      case 'warranty':
        setWarranties(warranties.map(w => 
          w.id === id ? { ...w, isActive: !w.isActive } : w
        ));
        break;
      case 'condition':
        setConditions(conditions.map(c => 
          c.id === id ? { ...c, isActive: !c.isActive } : c
        ));
        break;
      case 'location':
        setLocations(locations.map(l => 
          l.id === id ? { ...l, isActive: !l.isActive } : l
        ));
        break;
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'warranty': return warranties;
      case 'condition': return conditions;
      case 'location': return locations;
      default: return [];
    }
  };

  const getTabConfig = () => {
    switch (activeTab) {
      case 'warranty':
        return {
          title: 'Tempos de Garantia',
          icon: Clock,
          description: 'Configure os tempos de garantia disponíveis para produtos',
          addLabel: 'Nova Garantia'
        };
      case 'condition':
        return {
          title: 'Condições de Estoque',
          icon: Package,
          description: 'Defina as condições possíveis para produtos em estoque',
          addLabel: 'Nova Condição'
        };
      case 'location':
        return {
          title: 'Locais de Estoque',
          icon: MapPin,
          description: 'Gerencie os locais físicos de armazenamento',
          addLabel: 'Novo Local'
        };
      default:
        return { title: '', icon: Clock, description: '', addLabel: '' };
    }
  };

  const tabConfig = getTabConfig();
  const TabIcon = tabConfig.icon;

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
          <h1 className={`text-3xl font-bold mb-2 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            <Settings className="mr-3 text-indigo-600" size={32} />
            Garantias e Estoque
          </h1>
          <p className={`text-slate-600 ${theme === 'dark' ? 'text-slate-300' : ''}`}>
            Configure garantias, condições e locais de estoque
          </p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium"
        >
          <Plus className="mr-2" size={20} />
          {tabConfig.addLabel}
        </button>
      </div>

      {/* Tabs and Content */}
      <div className={`rounded-xl shadow-lg ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Tabs */}
        <div className={`border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'warranty', label: 'Garantias', icon: Clock },
              { key: 'condition', label: 'Condições', icon: Package },
              { key: 'location', label: 'Locais', icon: MapPin }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === key
                    ? 'border-indigo-500 text-indigo-600'
                    : `border-transparent ${
                        theme === 'dark' 
                          ? 'text-slate-400 hover:text-slate-300 hover:border-slate-600' 
                          : 'text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      }`
                }`}
              >
                <Icon className="mr-2" size={18} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Header */}
        <div className={`p-6 border-b ${
          theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center mb-2">
            <TabIcon className="mr-2 text-indigo-600" size={24} />
            <h2 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              {tabConfig.title}
            </h2>
          </div>
          <p className={`text-slate-600 ${theme === 'dark' ? 'text-slate-400' : ''}`}>
            {tabConfig.description}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}>
              <tr>
                <th className={`text-left py-3 px-4 font-semibold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}>Nome</th>
                <th className={`text-left py-3 px-4 font-semibold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}>Descrição</th>
                {activeTab === 'warranty' && (
                  <th className={`text-left py-3 px-4 font-semibold ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>Meses</th>
                )}
                <th className={`text-left py-3 px-4 font-semibold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}>Status</th>
                <th className={`text-center py-3 px-4 font-semibold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentData().map((item: any) => (
                <tr key={item.id} className={`border-b ${
                  theme === 'dark' 
                    ? 'border-slate-700 hover:bg-slate-700/50' 
                    : 'border-slate-100 hover:bg-slate-50'
                }`}>
                  <td className={`py-3 px-4 font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    {item.name}
                  </td>
                  <td className={`py-3 px-4 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {item.description}
                  </td>
                  {activeTab === 'warranty' && (
                    <td className={`py-3 px-4 font-semibold ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {item.months} meses
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className={`px-2 py-1 rounded-full text-sm ${
                        item.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.isActive ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
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
                        onClick={() => handleDelete(item.id)}
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl max-w-md w-full ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">
                {selectedItem ? `Editar ${tabConfig.title.slice(0, -1)}` : `Nova ${tabConfig.title.slice(0, -1)}`}
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
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    placeholder="Digite o nome"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    placeholder="Digite uma descrição"
                  />
                </div>

                {activeTab === 'warranty' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                      Meses de Garantia *
                    </label>
                    <input
                      type="number"
                      value={formData.months}
                      onChange={(e) => setFormData({ ...formData, months: parseInt(e.target.value) || 0 })}
                      required
                      min="1"
                      max="60"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      placeholder="12"
                    />
                  </div>
                )}
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
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
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