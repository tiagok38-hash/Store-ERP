import { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  X
} from 'lucide-react';
import DeleteConfirmModal from '@/react-app/components/DeleteConfirmModal';
import { useNotification } from '@/react-app/components/NotificationSystem';

interface Brand {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Brands() {
  const { showSuccess } = useNotification();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  useEffect(() => {
    setBrands([
      {
        id: '1',
        name: 'Apple',
        description: 'Produtos Apple com inovação e qualidade premium',
        isActive: true,
        createdAt: '2025-01-15T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z'
      },
      {
        id: '2',
        name: 'Samsung',
        description: 'Tecnologia Samsung para todos os perfis',
        isActive: true,
        createdAt: '2025-01-20T00:00:00Z',
        updatedAt: '2025-01-20T00:00:00Z'
      },
      {
        id: '3',
        name: 'Xiaomi',
        description: 'Smartphones com excelente custo-benefício',
        isActive: true,
        createdAt: '2025-02-01T00:00:00Z',
        updatedAt: '2025-02-01T00:00:00Z'
      },
      {
        id: '4',
        name: 'Sony',
        description: 'Eletrônicos e acessórios Sony',
        isActive: true,
        createdAt: '2025-02-05T00:00:00Z',
        updatedAt: '2025-02-05T00:00:00Z'
      },
      {
        id: '5',
        name: 'Roku',
        description: 'Dispositivos de streaming Roku',
        isActive: true,
        createdAt: '2025-02-08T00:00:00Z',
        updatedAt: '2025-02-08T00:00:00Z'
      },
      {
        id: '6',
        name: 'Smart',
        description: 'Produtos Smart TV e acessórios',
        isActive: true,
        createdAt: '2025-02-10T00:00:00Z',
        updatedAt: '2025-02-10T00:00:00Z'
      }
    ]);
  }, []);

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && brand.isActive) ||
                         (selectedStatus === 'inactive' && !brand.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome da marca é obrigatório';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const brandData: Brand = {
      id: selectedBrand?.id || String(Date.now()),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      isActive: true,
      createdAt: selectedBrand?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (selectedBrand) {
      setBrands(brands.map(b => b.id === selectedBrand.id ? brandData : b));
    } else {
      setBrands([...brands, brandData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setSelectedBrand(null);
    setIsAddModalOpen(false);
    setErrors({});
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || ''
    });
    setIsAddModalOpen(true);
  };

  

  const openDeleteModal = (brand: Brand) => {
    setBrandToDelete(brand);
    setIsDeleteModalOpen(true);
  };

  const deleteBrand = () => {
    if (brandToDelete) {
      setBrands(brands.filter(b => b.id !== brandToDelete.id));
      showSuccess('Marca Excluída', `A marca "${brandToDelete.name}" foi excluída com sucesso.`);
      setBrandToDelete(null);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
            <Building2 className="mr-3 text-blue-600" size={32} />
            Marcas
          </h1>
          <p className="text-slate-600">Gerencie as marcas dos seus produtos</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium"
        >
          <Plus className="mr-2" size={20} />
          Nova Marca
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Total de Marcas</h3>
          <p className="text-xl font-bold text-blue-500">{brands.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Marcas Ativas</h3>
          <p className="text-xl font-bold text-green-500">{brands.filter(b => b.isActive).length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Marcas Inativas</h3>
          <p className="text-xl font-bold text-red-500">{brands.filter(b => !b.isActive).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar marcas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos Status</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>
        </div>
      </div>

      {/* Brands List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Selecione a Marca ({brands.length})</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {filteredBrands.map((brand) => (
            <div key={brand.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center mr-3">
                    <Building2 size={20} className="text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-slate-800">{brand.name}</h3>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        brand.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {brand.isActive ? 'ativo' : 'inativo'}
                      </span>
                    </div>
                    {brand.description && (
                      <p className="text-slate-600 text-sm mt-1">{brand.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Editar marca"
                  >
                    <Edit size={16} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(brand)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Excluir marca"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Brand Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">
                {selectedBrand ? 'Editar Marca' : 'Nova Marca'}
              </h2>
              <button
                onClick={resetForm}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nome da Marca *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Digite o nome da marca"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descreva a marca (opcional)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
                >
                  <Save className="mr-2" size={16} />
                  {selectedBrand ? 'Salvar Alterações' : 'Criar Marca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
