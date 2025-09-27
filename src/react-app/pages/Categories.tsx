import { useState, useEffect } from 'react';
import { 
  Tag, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  X,
  ChevronLeft
} from 'lucide-react';
import DeleteConfirmModal from '@/react-app/components/DeleteConfirmModal';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function Categories() {
  const { showSuccess } = useNotification();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brandId: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    // Mock brands
    setBrands([
      { id: '1', name: 'Apple' },
      { id: '2', name: 'Samsung' },
      { id: '3', name: 'Xiaomi' },
      { id: '4', name: 'Sony' },
      { id: '5', name: 'Roku' },
      { id: '6', name: 'Smart' }
    ]);

    // Mock categories with brand relationship
    setCategories([
      {
        id: '1',
        name: 'Rastreador',
        brandId: '3',
        brandName: 'Xiaomi',
        description: 'Dispositivos de rastreamento',
        isActive: true,
        createdAt: '2025-01-15T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z'
      },
      {
        id: '2',
        name: 'Roteador',
        brandId: '3',
        brandName: 'Xiaomi',
        description: 'Roteadores de internet',
        isActive: true,
        createdAt: '2025-01-20T00:00:00Z',
        updatedAt: '2025-01-20T00:00:00Z'
      },
      {
        id: '3',
        name: 'Smartphone',
        brandId: '3',
        brandName: 'Xiaomi',
        description: 'Smartphones Xiaomi',
        isActive: true,
        createdAt: '2025-02-01T00:00:00Z',
        updatedAt: '2025-02-01T00:00:00Z'
      },
      {
        id: '4',
        name: 'Tablet',
        brandId: '3',
        brandName: 'Xiaomi',
        description: 'Tablets Xiaomi',
        isActive: true,
        createdAt: '2025-02-05T00:00:00Z',
        updatedAt: '2025-02-05T00:00:00Z'
      },
      {
        id: '5',
        name: 'TV Box',
        brandId: '3',
        brandName: 'Xiaomi',
        description: 'TV Box para streaming',
        isActive: true,
        createdAt: '2025-02-10T00:00:00Z',
        updatedAt: '2025-02-10T00:00:00Z'
      }
    ]);
  }, []);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBrand = selectedBrand === '' || category.brandId === selectedBrand;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && category.isActive) ||
                         (selectedStatus === 'inactive' && !category.isActive);
    
    return matchesSearch && matchesBrand && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome da categoria é obrigatório';
    }
    if (!formData.brandId) {
      newErrors.brandId = 'Marca é obrigatória';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const brand = brands.find(b => b.id === formData.brandId);
    const categoryData: Category = {
      id: selectedCategory?.id || String(Date.now()),
      name: formData.name.trim(),
      brandId: formData.brandId,
      brandName: brand?.name || '',
      description: formData.description.trim() || undefined,
      isActive: true,
      createdAt: selectedCategory?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (selectedCategory) {
      setCategories(categories.map(c => c.id === selectedCategory.id ? categoryData : c));
    } else {
      setCategories([...categories, categoryData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brandId: '',
      description: ''
    });
    setSelectedCategory(null);
    setIsAddModalOpen(false);
    setErrors({});
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      brandId: category.brandId,
      description: category.description || ''
    });
    setIsAddModalOpen(true);
  };

  

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const deleteCategory = () => {
    if (categoryToDelete) {
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      showSuccess('Categoria Excluída', `A categoria "${categoryToDelete.name}" foi excluída com sucesso.`);
      setCategoryToDelete(null);
    }
  };

  const selectedBrandData = brands.find(b => b.id === selectedBrand);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link 
            to="/administration" 
            className={`inline-flex items-center text-sm font-medium mb-4 transition-colors ${
              false ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            <ChevronLeft size={16} className="mr-1" />
            Voltar para Administração
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
            <Tag className="mr-3 text-blue-600" size={32} />
            Categorias
          </h1>
          <p className="text-slate-600">Gerencie as categorias por marca</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium"
        >
          <Plus className="mr-2" size={20} />
          Nova Categoria
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Total de Categorias</h3>
          <p className="text-xl font-bold text-blue-500">{categories.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Categorias Ativas</h3>
          <p className="text-xl font-bold text-green-500">{categories.filter(c => c.isActive).length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Marcas com Categorias</h3>
          <p className="text-xl font-bold text-purple-500">{new Set(categories.map(c => c.brandId)).size}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as Marcas</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
          
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

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            Categorias de {selectedBrandData ? selectedBrandData.name : 'Todas as Marcas'} ({filteredCategories.length})
          </h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {filteredCategories.map((category) => (
            <div key={category.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mr-3">
                    <Tag size={20} className="text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-slate-800">{category.name}</h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {category.brandName}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'ativo' : 'inativo'}
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-slate-600 text-sm mt-1">{category.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Editar categoria"
                  >
                    <Edit size={16} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(category)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Excluir categoria"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">
                {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
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
                    Marca *
                  </label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.brandId ? 'border-red-300' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Selecione uma marca</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                  {errors.brandId && <p className="text-red-600 text-sm mt-1">{errors.brandId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Digite o nome da categoria"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descreva a categoria (opcional)"
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
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
                >
                  <Save className="mr-2" size={16} />
                  {selectedCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}