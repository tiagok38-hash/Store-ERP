import { useState, useEffect } from 'react';
import { 
  Building2, 
  Tag, 
  Package,
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';
import { Link } from 'react-router-dom';

interface Brand {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  brandId: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Variation {
  id: string;
  name: string;
  subcategoryId: string;
  categoryId: string;
  brandId: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProductStructurePage() {
  const { theme } = useTheme();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  
  const [searchTerms, setSearchTerms] = useState({
    brands: '',
    categories: '',
    subcategories: '',
    variations: ''
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'brand' | 'category' | 'subcategory' | 'variation'>('brand');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brandId: '',
    categoryId: '',
    subcategoryId: ''
  });

  useEffect(() => {
    // Mock data
    setBrands([
      { id: '1', name: 'Apple', description: 'Produtos Apple com inovação e qualidade premium', isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
      { id: '2', name: 'Samsung', description: 'Tecnologia Samsung para todos os perfis', isActive: true, createdAt: '2025-01-20T00:00:00Z', updatedAt: '2025-01-20T00:00:00Z' },
      { id: '3', name: 'Xiaomi', description: 'Smartphones com excelente custo-benefício', isActive: true, createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z' },
      { id: '4', name: 'Genérica', description: 'Acessórios e produtos genéricos', isActive: true, createdAt: '2025-02-05T00:00:00Z', updatedAt: '2025-02-05T00:00:00Z' }
    ]);

    setCategories([
      { id: '1', name: 'iPhone', brandId: '1', brandName: 'Apple', description: 'Linha de smartphones iPhone', isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
      { id: '2', name: 'iPad', brandId: '1', brandName: 'Apple', description: 'Tablets iPad', isActive: true, createdAt: '2025-01-16T00:00:00Z', updatedAt: '2025-01-16T00:00:00Z' },
      { id: '3', name: 'MacBook', brandId: '1', brandName: 'Apple', description: 'Laptops MacBook', isActive: true, createdAt: '2025-01-17T00:00:00Z', updatedAt: '2025-01-17T00:00:00Z' },
      { id: '4', name: 'Galaxy S', brandId: '2', brandName: 'Samsung', description: 'Linha premium Galaxy S', isActive: true, createdAt: '2025-01-20T00:00:00Z', updatedAt: '2025-01-20T00:00:00Z' },
      { id: '5', name: 'Galaxy A', brandId: '2', brandName: 'Samsung', description: 'Linha intermediária Galaxy A', isActive: true, createdAt: '2025-01-21T00:00:00Z', updatedAt: '2025-01-21T00:00:00Z' },
      { id: '6', name: 'Redmi', brandId: '3', brandName: 'Xiaomi', description: 'Linha Redmi', isActive: true, createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z' },
      { id: '7', name: 'Capinhas', brandId: '4', brandName: 'Genérica', description: 'Capinhas e cases', isActive: true, createdAt: '2025-02-05T00:00:00Z', updatedAt: '2025-02-05T00:00:00Z' },
      { id: '8', name: 'Películas', brandId: '4', brandName: 'Genérica', description: 'Películas de proteção', isActive: true, createdAt: '2025-02-06T00:00:00Z', updatedAt: '2025-02-06T00:00:00Z' }
    ]);

    setSubcategories([
      { id: '1', name: 'iPhone 15 Pro Max', categoryId: '1', brandId: '1', description: 'iPhone 15 Pro Max', isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
      { id: '2', name: 'iPhone 15 Pro', categoryId: '1', brandId: '1', description: 'iPhone 15 Pro', isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
      { id: '3', name: 'iPhone 15', categoryId: '1', brandId: '1', description: 'iPhone 15', isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
      { id: '4', name: 'iPhone 14', categoryId: '1', brandId: '1', description: 'iPhone 14', isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
      { id: '5', name: 'Galaxy S24 Ultra', categoryId: '4', brandId: '2', description: 'Galaxy S24 Ultra', isActive: true, createdAt: '2025-01-20T00:00:00Z', updatedAt: '2025-01-20T00:00:00Z' },
      { id: '6', name: 'Galaxy S24', categoryId: '4', brandId: '2', description: 'Galaxy S24', isActive: true, createdAt: '2025-01-20T00:00:00Z', updatedAt: '2025-01-20T00:00:00Z' },
      { id: '7', name: 'Capinha Silicone', categoryId: '7', brandId: '4', description: 'Capinha de silicone', isActive: true, createdAt: '2025-02-05T00:00:00Z', updatedAt: '2025-02-05T00:00:00Z' },
      { id: '8', name: 'Capinha Transparente', categoryId: '7', brandId: '4', description: 'Capinha transparente', isActive: true, createdAt: '2025-02-05T00:00:00Z', updatedAt: '2025-02-05T00:00:00Z' }
    ]);

    setVariations([
      { id: '1', name: '256GB - Titânio Natural', subcategoryId: '1', categoryId: '1', brandId: '1', description: '256GB Titânio Natural', isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
      { id: '2', name: '512GB - Titânio Azul', subcategoryId: '1', categoryId: '1', brandId: '1', description: '512GB Titânio Azul', isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
      { id: '3', name: '128GB - Titânio Natural', subcategoryId: '2', categoryId: '1', brandId: '1', description: '128GB Titânio Natural', isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
      { id: '4', name: '256GB - Titânio Branco', subcategoryId: '2', categoryId: '1', brandId: '1', description: '256GB Titânio Branco', isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
      { id: '5', name: 'iPhone 15 Pro Max - Transparente', subcategoryId: '7', categoryId: '7', brandId: '4', description: 'Compatível com iPhone 15 Pro Max', isActive: true, createdAt: '2025-02-05T00:00:00Z', updatedAt: '2025-02-05T00:00:00Z' },
      { id: '6', name: 'iPhone 15 Pro - Transparente', subcategoryId: '8', categoryId: '7', brandId: '4', description: 'Compatível com iPhone 15 Pro', isActive: true, createdAt: '2025-02-05T00:00:00Z', updatedAt: '2025-02-05T00:00:00Z' }
    ]);
  }, []);

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerms.brands.toLowerCase())
  );

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerms.categories.toLowerCase()) &&
    (selectedBrand === '' || category.brandId === selectedBrand)
  );

  const filteredSubcategories = subcategories.filter(subcategory => 
    subcategory.name.toLowerCase().includes(searchTerms.subcategories.toLowerCase()) &&
    (selectedCategory === '' || subcategory.categoryId === selectedCategory)
  );

  const filteredVariations = variations.filter(variation => 
    variation.name.toLowerCase().includes(searchTerms.variations.toLowerCase()) &&
    (selectedSubcategory === '' || variation.subcategoryId === selectedSubcategory)
  );

  const openModal = (type: 'brand' | 'category' | 'subcategory' | 'variation', item?: any) => {
    setModalType(type);
    setEditingItem(item);
    setFormData({
      name: item?.name || '',
      description: item?.description || '',
      brandId: type === 'category' ? selectedBrand : (item?.brandId || ''),
      categoryId: type === 'subcategory' ? selectedCategory : (item?.categoryId || ''),
      subcategoryId: type === 'variation' ? selectedSubcategory : (item?.subcategoryId || '')
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem = {
      id: editingItem?.id || String(Date.now()),
      name: formData.name,
      description: formData.description,
      isActive: true,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    switch (modalType) {
      case 'brand':
        if (editingItem) {
          setBrands(brands.map(b => b.id === editingItem.id ? newItem as Brand : b));
        } else {
          setBrands([...brands, newItem as Brand]);
        }
        break;
      case 'category':
        const categoryItem = {
          ...newItem,
          brandId: formData.brandId,
          brandName: brands.find(b => b.id === formData.brandId)?.name || ''
        };
        if (editingItem) {
          setCategories(categories.map(c => c.id === editingItem.id ? categoryItem as Category : c));
        } else {
          setCategories([...categories, categoryItem as Category]);
        }
        break;
      case 'subcategory':
        const subcategoryItem = {
          ...newItem,
          brandId: formData.brandId,
          categoryId: formData.categoryId
        };
        if (editingItem) {
          setSubcategories(subcategories.map(s => s.id === editingItem.id ? subcategoryItem as Subcategory : s));
        } else {
          setSubcategories([...subcategories, subcategoryItem as Subcategory]);
        }
        break;
      case 'variation':
        const variationItem = {
          ...newItem,
          brandId: formData.brandId,
          categoryId: formData.categoryId,
          subcategoryId: formData.subcategoryId
        };
        if (editingItem) {
          setVariations(variations.map(v => v.id === editingItem.id ? variationItem as Variation : v));
        } else {
          setVariations([...variations, variationItem as Variation]);
        }
        break;
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ name: '', description: '', brandId: '', categoryId: '', subcategoryId: '' });
  };

  const deleteItem = (type: 'brand' | 'category' | 'subcategory' | 'variation', id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    
    switch (type) {
      case 'brand':
        setBrands(brands.filter(b => b.id !== id));
        break;
      case 'category':
        setCategories(categories.filter(c => c.id !== id));
        break;
      case 'subcategory':
        setSubcategories(subcategories.filter(s => s.id !== id));
        break;
      case 'variation':
        setVariations(variations.filter(v => v.id !== id));
        break;
    }
  };

  const getModalTitle = () => {
    const titles = {
      brand: 'Marca',
      category: 'Categoria',
      subcategory: 'Subcategoria',
      variation: 'Variação/Grade'
    };
    return `${editingItem ? 'Editar' : 'Nova'} ${titles[modalType]}`;
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
          <h1 className={`text-3xl font-bold mb-2 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            <Building2 className="mr-3 text-blue-600" size={32} />
            Estrutura de Produtos
          </h1>
          <p className={`text-slate-600 ${theme === 'dark' ? 'text-slate-300' : ''}`}>Estrutura hierárquica dos produtos</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <span className={`text-slate-600 ${theme === 'dark' ? 'text-slate-400' : ''}`}>Estrutura:</span>
        {selectedBrand && (
          <>
            <ChevronRight size={16} className="text-slate-400" />
            <span className="font-medium text-blue-600">
              {brands.find(b => b.id === selectedBrand)?.name}
            </span>
          </>
        )}
        {selectedCategory && (
          <>
            <ChevronRight size={16} className="text-slate-400" />
            <span className="font-medium text-purple-600">
              {categories.find(c => c.id === selectedCategory)?.name}
            </span>
          </>
        )}
        {selectedSubcategory && (
          <>
            <ChevronRight size={16} className="text-slate-400" />
            <span className="font-medium text-green-600">
              {subcategories.find(s => s.id === selectedSubcategory)?.name}
            </span>
          </>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Marcas */}
        <div className={`rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
          <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <h3 className={`text-lg font-semibold flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              <Building2 className="mr-2 text-blue-600" size={20} />
              Marcas ({filteredBrands.length})
            </h3>
            <button
              onClick={() => openModal('brand')}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="p-4">
            <div className="relative mb-4">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} size={16} />
              <input
                type="text"
                placeholder="Buscar marcas..."
                value={searchTerms.brands}
                onChange={(e) => setSearchTerms({ ...searchTerms, brands: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredBrands.map((brand) => (
                <div
                  key={brand.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedBrand === brand.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : (theme === 'dark' ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')
                  }`}
                  onClick={() => {
                    setSelectedBrand(brand.id);
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{brand.name}</h4>
                      {brand.description && (
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{brand.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('brand', brand);
                        }}
                        className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-blue-900/50' : 'hover:bg-blue-100'}`}
                      >
                        <Edit size={14} className="text-blue-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem('brand', brand.id);
                        }}
                        className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-red-900/50' : 'hover:bg-red-100'}`}
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categorias */}
        <div className={`rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
          <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <h3 className={`text-lg font-semibold flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              <Tag className="mr-2 text-purple-600" size={20} />
              Categorias ({filteredCategories.length})
            </h3>
            <button
              onClick={() => openModal('category')}
              disabled={!selectedBrand}
              className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="p-4">
            <div className="relative mb-4">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} size={16} />
              <input
                type="text"
                placeholder="Buscar categorias..."
                value={searchTerms.categories}
                onChange={(e) => setSearchTerms({ ...searchTerms, categories: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                disabled={!selectedBrand}
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedBrand ? (
                filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedCategory === category.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : (theme === 'dark' ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSelectedSubcategory('');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{category.name}</h4>
                        {category.description && (
                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{category.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('category', category);
                          }}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-purple-900/50' : 'hover:bg-purple-100'}`}
                        >
                          <Edit size={14} className="text-purple-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem('category', category.id);
                          }}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-red-900/50' : 'hover:bg-red-100'}`}
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                  <Tag size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Selecione uma marca primeiro</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subcategorias */}
        <div className={`rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
          <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <h3 className={`text-lg font-semibold flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              <Package className="mr-2 text-green-600" size={20} />
              Subcategorias ({filteredSubcategories.length})
            </h3>
            <button
              onClick={() => openModal('subcategory')}
              disabled={!selectedCategory}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="p-4">
            <div className="relative mb-4">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} size={16} />
              <input
                type="text"
                placeholder="Buscar subcategorias..."
                value={searchTerms.subcategories}
                onChange={(e) => setSearchTerms({ ...searchTerms, subcategories: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                disabled={!selectedCategory}
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedCategory ? (
                filteredSubcategories.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSubcategory === subcategory.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : (theme === 'dark' ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')
                    }`}
                    onClick={() => setSelectedSubcategory(subcategory.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{subcategory.name}</h4>
                        {subcategory.description && (
                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{subcategory.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('subcategory', subcategory);
                          }}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-green-900/50' : 'hover:bg-green-100'}`}
                        >
                          <Edit size={14} className="text-green-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem('subcategory', subcategory.id);
                          }}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-red-900/50' : 'hover:bg-red-100'}`}
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Selecione uma categoria primeiro</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Variações/Grades */}
        <div className={`rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
          <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <h3 className={`text-lg font-semibold flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              <Tag className="mr-2 text-orange-600" size={20} />
              Variações/Grades ({filteredVariations.length})
            </h3>
            <button
              onClick={() => openModal('variation')}
              disabled={!selectedSubcategory}
              className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="p-4">
            <div className="relative mb-4">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} size={16} />
              <input
                type="text"
                placeholder="Buscar variações..."
                value={searchTerms.variations}
                onChange={(e) => setSearchTerms({ ...searchTerms, variations: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                disabled={!selectedSubcategory}
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedSubcategory ? (
                filteredVariations.map((variation) => (
                  <div
                    key={variation.id}
                    className={`p-3 rounded-lg border transition-all ${theme === 'dark' ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{variation.name}</h4>
                        {variation.description && (
                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{variation.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openModal('variation', variation)}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-orange-900/50' : 'hover:bg-orange-100'}`}
                        >
                          <Edit size={14} className="text-orange-600" />
                        </button>
                        <button
                          onClick={() => deleteItem('variation', variation.id)}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-red-900/50' : 'hover:bg-red-100'}`}
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                  <Tag size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Selecione uma subcategoria primeiro</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl max-w-md w-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">{getModalTitle()}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {modalType === 'category' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                      Marca *
                    </label>
                    <select
                      value={formData.brandId}
                      onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      required
                    >
                      <option value="">Selecione uma marca</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {modalType === 'subcategory' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                        Marca *
                      </label>
                      <select
                        value={formData.brandId}
                        onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        required
                      >
                        <option value="">Selecione uma marca</option>
                        {brands.map(brand => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                        Categoria *
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.filter(c => c.brandId === formData.brandId).map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {modalType === 'variation' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                        Marca *
                      </label>
                      <select
                        value={formData.brandId}
                        onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        required
                      >
                        <option value="">Selecione uma marca</option>
                        {brands.map(brand => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                        Categoria *
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.filter(c => c.brandId === formData.brandId).map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                        Subcategoria *
                      </label>
                      <select
                        value={formData.subcategoryId}
                        onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        required
                      >
                        <option value="">Selecione uma subcategoria</option>
                        {subcategories.filter(s => s.categoryId === formData.categoryId).map(subcategory => (
                          <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    placeholder="Digite o nome"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    rows={3}
                    placeholder="Descrição (opcional)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
                >
                  <Save className="mr-2" size={16} />
                  {editingItem ? 'Salvar Alterações' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}