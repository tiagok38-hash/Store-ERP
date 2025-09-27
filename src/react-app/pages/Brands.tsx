import { useState, useEffect } from 'react';
import { 
  Building2, 
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/react-app/hooks/useAuth';
import { Link } from 'react-router-dom';

interface Brand {
  id: string;
  user_id: string; // Adicionado para RLS
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Brands() {
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth(); // Obter o usuário logado
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, [user]); // Recarregar marcas quando o usuário muda

  const fetchBrands = async () => {
    if (!user) {
      setIsLoading(false);
      setBrands([]);
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('user_id', user.id); // Filtrar por user_id para RLS

    if (error) {
      showError('Erro ao carregar marcas', error.message);
      console.error('Error fetching brands:', error);
    } else {
      setBrands(data || []);
    }
    setIsLoading(false);
  };

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && brand.is_active) ||
                         (selectedStatus === 'inactive' && !brand.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome da marca é obrigatório';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!user) {
      showError('Erro', 'Usuário não autenticado.');
      return;
    }

    const brandData = {
      user_id: user.id,
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      is_active: true, // Sempre ativo ao criar/editar
    };

    if (selectedBrand) {
      // Update existing brand
      const { data, error } = await supabase
        .from('brands')
        .update(brandData)
        .eq('id', selectedBrand.id)
        .select();

      if (error) {
        showError('Erro ao atualizar marca', error.message);
        console.error('Error updating brand:', error);
      } else {
        setBrands(brands.map(b => b.id === selectedBrand.id ? data[0] : b));
        showSuccess('Marca Atualizada', `A marca "${formData.name}" foi atualizada com sucesso.`);
        resetForm();
      }
    } else {
      // Insert new brand
      const { data, error } = await supabase
        .from('brands')
        .insert(brandData)
        .select();

      if (error) {
        showError('Erro ao criar marca', error.message);
        console.error('Error creating brand:', error);
      } else {
        setBrands([...brands, data[0]]);
        showSuccess('Marca Criada', `A marca "${formData.name}" foi criada com sucesso.`);
        resetForm();
      }
    }
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

  const deleteBrand = async () => {
    if (brandToDelete) {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandToDelete.id);

      if (error) {
        showError('Erro ao excluir marca', error.message);
        console.error('Error deleting brand:', error);
      } else {
        setBrands(brands.filter(b => b.id !== brandToDelete.id));
        showSuccess('Marca Excluída', `A marca "${brandToDelete.name}" foi excluída com sucesso.`);
        setBrandToDelete(null);
        setIsDeleteModalOpen(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
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
          <p className="text-xl font-bold text-green-500">{brands.filter(b => b.is_active).length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Marcas Inativas</h3>
          <p className="text-xl font-bold text-red-500">{brands.filter(b => !b.is_active).length}</p>
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
                        brand.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {brand.is_active ? 'ativo' : 'inativo'}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteBrand}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a marca "${brandToDelete?.name}"? Esta ação não pode ser desfeita.`}
        itemName={brandToDelete?.name}
      />
    </div>
  );
}