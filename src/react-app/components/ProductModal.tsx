import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Package,
  DollarSign,
  Hash,
  Tag,
  Smartphone,
  Plus
} from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
}

// Estrutura hierárquica: Marca → Categoria → Descrição → Variações
const hierarchicalData = {
  'Apple': {
    'iPhone': {
      descriptions: [
        'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
        'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
        'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 Mini',
        'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 Mini',
        'iPhone SE 3ª Geração'
      ],
      variations: {
        storage: ['128GB', '256GB', '512GB', '1TB'],
        colors: ['Titânio Natural', 'Titânio Azul', 'Titânio Branco', 'Titânio Preto', 'Preto', 'Branco', 'Product Red', 'Azul', 'Rosa', 'Amarelo', 'Roxo', 'Verde', 'Midnight', 'Starlight']
      }
    },
    'iPad': {
      descriptions: [
        'iPad Pro 12.9"', 'iPad Pro 11"', 'iPad Air', 'iPad', 'iPad Mini'
      ],
      variations: {
        storage: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'],
        colors: ['Cinza Espacial', 'Prata', 'Azul', 'Rosa', 'Roxo', 'Starlight']
      }
    },
    'Mac': {
      descriptions: [
        'MacBook Pro 16"', 'MacBook Pro 14"', 'MacBook Air 15"', 'MacBook Air 13"',
        'iMac 24"', 'Mac Studio', 'Mac Pro', 'Mac Mini'
      ],
      variations: {
        storage: ['256GB', '512GB', '1TB', '2TB', '4TB', '8TB'],
        colors: ['Cinza Espacial', 'Prata', 'Dourado', 'Midnight', 'Starlight']
      }
    },
    'Apple Watch': {
      descriptions: [
        'Apple Watch Ultra 2', 'Apple Watch Series 9', 'Apple Watch SE'
      ],
      variations: {
        size: ['41mm', '45mm', '49mm'],
        colors: ['Midnight', 'Starlight', 'Rosa', 'Product Red', 'Azul Tempestade', 'Laranja Alpino']
      }
    },
    'AirPods': {
      descriptions: [
        'AirPods Pro 2ª Geração', 'AirPods 3ª Geração', 'AirPods Max'
      ],
      variations: {
        colors: ['Branco', 'Cinza Espacial', 'Prata', 'Azul Céu', 'Rosa', 'Verde']
      }
    }
  },
  'Samsung': {
    'Galaxy S': {
      descriptions: [
        'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
        'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23'
      ],
      variations: {
        storage: ['128GB', '256GB', '512GB', '1TB'],
        colors: ['Preto Titânio', 'Cinza Titânio', 'Violeta Titânio', 'Amarelo Titânio', 'Phantom Black', 'Phantom White']
      }
    },
    'Galaxy A': {
      descriptions: [
        'Galaxy A54 5G', 'Galaxy A34 5G', 'Galaxy A24', 'Galaxy A14'
      ],
      variations: {
        storage: ['128GB', '256GB'],
        colors: ['Preto', 'Branco', 'Violeta', 'Lima']
      }
    },
    'Galaxy Tab': {
      descriptions: [
        'Galaxy Tab S9 Ultra', 'Galaxy Tab S9+', 'Galaxy Tab S9',
        'Galaxy Tab A9+', 'Galaxy Tab A9'
      ],
      variations: {
        storage: ['128GB', '256GB', '512GB'],
        colors: ['Grafite', 'Bege', 'Prata']
      }
    }
  },
  'Xiaomi': {
    'Redmi': {
      descriptions: [
        'Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi Note 13',
        'Redmi Note 12 Pro', 'Redmi Note 12', 'Redmi 13C'
      ],
      variations: {
        storage: ['128GB', '256GB', '512GB'],
        colors: ['Preto', 'Azul', 'Verde', 'Dourado']
      }
    },
    'POCO': {
      descriptions: [
        'POCO X6 Pro', 'POCO X6', 'POCO F6', 'POCO M6 Pro'
      ],
      variations: {
        storage: ['128GB', '256GB', '512GB'],
        colors: ['Preto', 'Azul', 'Amarelo']
      }
    }
  },
  'Genérica': {
    'Capinhas': {
      descriptions: [
        'Capinha Silicone', 'Capinha Transparente', 'Capinha Couro',
        'Capinha Magnetica', 'Capinha Antigravidade'
      ],
      variations: {
        compatibility: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14', 'Galaxy S24', 'Galaxy S23'],
        colors: ['Transparente', 'Preto', 'Branco', 'Azul', 'Rosa', 'Verde']
      }
    },
    'Películas': {
      descriptions: [
        'Película Vidro Temperado', 'Película Hidrogel', 'Película Privacidade',
        'Película Anti-Impacto', 'Película Cerâmica'
      ],
      variations: {
        compatibility: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14', 'Galaxy S24', 'Galaxy S23'],
        type: ['Comum', 'Premium', 'Ultra']
      }
    },
    'Carregadores': {
      descriptions: [
        'Carregador USB-C 20W', 'Carregador Lightning', 'Carregador Wireless',
        'Power Bank', 'Carregador Veicular'
      ],
      variations: {
        power: ['20W', '30W', '65W', '100W'],
        colors: ['Branco', 'Preto']
      }
    }
  }
};

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    brand: product?.brand || '',
    category: product?.category || '',
    description: product?.description || '',
    variations: product?.variations || [],
    costPrice: product?.costPrice || '',
    salePrice: product?.salePrice || '',
    minStock: product?.minStock || '5',
    maxStock: product?.maxStock || '50',
    location: product?.location || '',
    requiresImei: product?.requiresImei || false,
    requiresSerial: product?.requiresSerial || false,
    warrantyMonths: product?.warrantyMonths || '12'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableDescriptions, setAvailableDescriptions] = useState<string[]>([]);
  const [availableVariations, setAvailableVariations] = useState<{[key: string]: string[]}>({});
  const [selectedVariations, setSelectedVariations] = useState<{[key: string]: string}>({});

  // Atualizar categorias quando marca muda
  useEffect(() => {
    if (formData.brand) {
      const brandData = hierarchicalData[formData.brand as keyof typeof hierarchicalData];
      if (brandData) {
        const categories = Object.keys(brandData);
        setAvailableCategories(categories);
        setFormData(prev => ({ ...prev, category: '', description: '' }));
        setAvailableDescriptions([]);
        setAvailableVariations({});
        setSelectedVariations({});
      }
    } else {
      setAvailableCategories([]);
      setAvailableDescriptions([]);
      setAvailableVariations({});
      setSelectedVariations({});
    }
  }, [formData.brand]);

  // Atualizar descrições quando categoria muda
  useEffect(() => {
    if (formData.brand && formData.category) {
      const brandData = hierarchicalData[formData.brand as keyof typeof hierarchicalData];
      if (brandData) {
        const categoryData = brandData[formData.category as keyof typeof brandData] as any;
        if (categoryData && categoryData.descriptions) {
          setAvailableDescriptions(categoryData.descriptions);
          setFormData(prev => ({ ...prev, description: '' }));
          setAvailableVariations({});
          setSelectedVariations({});
        }
      }
    } else {
      setAvailableDescriptions([]);
      setAvailableVariations({});
      setSelectedVariations({});
    }
  }, [formData.brand, formData.category]);

  // Atualizar variações quando descrição muda
  useEffect(() => {
    if (formData.brand && formData.category && formData.description) {
      const brandData = hierarchicalData[formData.brand as keyof typeof hierarchicalData];
      if (brandData) {
        const categoryData = brandData[formData.category as keyof typeof brandData] as any;
        if (categoryData && categoryData.variations) {
          setAvailableVariations(categoryData.variations);
          setSelectedVariations({});
        }
      }
    } else {
      setAvailableVariations({});
      setSelectedVariations({});
    }
  }, [formData.brand, formData.category, formData.description]);

  // Gerar SKU automaticamente
  useEffect(() => {
    if (formData.brand && formData.category && formData.description) {
      let sku = '';
      
      // Prefixo da marca
      const brandPrefix = formData.brand.substring(0, 3).toUpperCase();
      
      // Categoria
      const categoryCode = formData.category.substring(0, 3).toUpperCase();
      
      // Descrição (pegar palavras importantes)
      const descriptionCode = formData.description
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(' ')
        .map((word: string) => word.substring(0, 2))
        .join('')
        .toUpperCase()
        .substring(0, 6);
      
      sku = `${brandPrefix}${categoryCode}${descriptionCode}`;
      
      // Adicionar variações se disponível
      Object.values(selectedVariations).forEach(variation => {
        if (variation) {
          sku += variation.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
        }
      });
      
      setFormData(prev => ({ ...prev, sku }));
    }
  }, [formData.brand, formData.category, formData.description, selectedVariations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.brand) newErrors.brand = 'Marca é obrigatória';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.description) newErrors.description = 'Descrição é obrigatória';
    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      newErrors.costPrice = 'Preço de custo deve ser maior que zero';
    }
    if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
      newErrors.salePrice = 'Preço de venda deve ser maior que zero';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simular salvamento
    alert(`Produto ${product ? 'atualizado' : 'criado'} com sucesso!`);
    onClose();
  };

  const calculateMarkup = () => {
    const cost = parseFloat(formData.costPrice) || 0;
    const sale = parseFloat(formData.salePrice) || 0;
    if (cost > 0 && sale > 0) {
      return (((sale - cost) / cost) * 100).toFixed(1);
    }
    return '0.0';
  };

  const getProductDescription = () => {
    let description = '';
    if (formData.brand) description += formData.brand;
    if (formData.description) description += ` ${formData.description}`;
    
    // Adicionar variações selecionadas
    Object.values(selectedVariations).forEach((value) => {
      if (value) {
        description += ` ${value}`;
      }
    });
    
    return description.trim();
  };

  const handleVariationChange = (variationType: string, value: string) => {
    setSelectedVariations(prev => ({
      ...prev,
      [variationType]: value
    }));
  };

  const addVariationToProduct = () => {
    if (Object.keys(selectedVariations).length > 0) {
      const variationString = Object.entries(selectedVariations)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      
      setFormData(prev => ({
        ...prev,
        variations: [...prev.variations, variationString]
      }));
      
      setSelectedVariations({});
    }
  };

  const removeVariation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_: any, i: number) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-bold flex items-center">
            <Package className="mr-2" size={24} />
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1: Identificação Hierárquica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <Hash className="mr-2 text-blue-500" size={18} />
                Identificação Hierárquica
              </h3>

              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  1. Marca *
                </label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.brand ? 'border-red-300' : 'border-slate-300'
                  }`}
                >
                  <option value="">Selecione a marca</option>
                  {Object.keys(hierarchicalData).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                {errors.brand && <p className="text-red-600 text-sm mt-1">{errors.brand}</p>}
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  2. Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? 'border-red-300' : 'border-slate-300'
                  } ${!formData.brand ? 'bg-slate-100' : ''}`}
                  disabled={!formData.brand}
                >
                  <option value="">Selecione a categoria</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
                {!formData.brand && (
                  <p className="text-slate-500 text-xs mt-1">Selecione uma marca primeiro</p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  3. Descrição do Produto *
                </label>
                <select
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-slate-300'
                  } ${!formData.category ? 'bg-slate-100' : ''}`}
                  disabled={!formData.category}
                >
                  <option value="">Selecione a descrição</option>
                  {availableDescriptions.map(description => (
                    <option key={description} value={description}>{description}</option>
                  ))}
                </select>
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                {!formData.category && (
                  <p className="text-slate-500 text-xs mt-1">Selecione uma categoria primeiro</p>
                )}
              </div>

              {/* Variações Disponíveis */}
              {Object.keys(availableVariations).length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-700 flex items-center">
                    <Tag className="mr-2 text-purple-500" size={16} />
                    4. Variações Disponíveis
                  </h4>
                  {Object.entries(availableVariations).map(([variationType, options]) => (
                    <div key={variationType}>
                      <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                        {variationType}
                      </label>
                      <select
                        value={selectedVariations[variationType] || ''}
                        onChange={(e) => handleVariationChange(variationType, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">Selecione {variationType}</option>
                        {options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  
                  {Object.values(selectedVariations).some(v => v) && (
                    <button
                      type="button"
                      onClick={addVariationToProduct}
                      className="mt-2 w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-2 px-4 rounded-lg text-sm hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <Plus className="mr-2" size={16} />
                      Adicionar Variação
                    </button>
                  )}
                </div>
              )}

              {/* Variações Adicionadas */}
              {formData.variations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Variações do Produto</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {formData.variations.map((variation: string, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
                        <span className="text-sm text-blue-800">{variation}</span>
                        <button
                          type="button"
                          onClick={() => removeVariation(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Automático */}
              {getProductDescription() && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Preview Automático</h4>
                  <p className="text-blue-800 font-medium text-sm">{getProductDescription()}</p>
                </div>
              )}
            </div>

            {/* Coluna 2: Preços e Estoque */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <DollarSign className="mr-2 text-green-500" size={18} />
                Preços e Estoque
              </h3>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SKU (Gerado Automaticamente)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                  placeholder="SKU será gerado automaticamente"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preço de Custo *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.costPrice ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="0,00"
                  />
                  {errors.costPrice && <p className="text-red-600 text-sm mt-1">{errors.costPrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preço de Venda *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.salePrice ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="0,00"
                  />
                  {errors.salePrice && <p className="text-red-600 text-sm mt-1">{errors.salePrice}</p>}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Margem de Lucro:</span>
                  <span className="text-lg font-bold text-blue-600">{calculateMarkup()}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estoque Mínimo
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estoque Máximo
                  </label>
                  <input
                    type="number"
                    value={formData.maxStock}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Localização no Estoque
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: A1-B2, Prateleira 3"
                />
              </div>
            </div>

            {/* Coluna 3: Configurações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <Tag className="mr-2 text-purple-500" size={18} />
                Configurações
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Garantia (meses)
                </label>
                <input
                  type="number"
                  value={formData.warrantyMonths}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setFormData({ ...formData, warrantyMonths: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              {/* Controles Especiais */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">Controles Especiais</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requiresImei}
                      onChange={(e) => setFormData({ ...formData, requiresImei: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-slate-700 flex items-center">
                      <Smartphone size={14} className="mr-1" />
                      Requer IMEI
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requiresSerial}
                      onChange={(e) => setFormData({ ...formData, requiresSerial: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-slate-700 flex items-center">
                      <Hash size={14} className="mr-1" />
                      Requer Número de Série
                    </span>
                  </label>
                </div>
              </div>

              {/* Preview do Produto Final */}
              {formData.brand && formData.category && formData.description && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Resumo do Produto</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>SKU:</strong> {formData.sku}</p>
                    <p><strong>Descrição:</strong> {getProductDescription()}</p>
                    <p><strong>Marca:</strong> {formData.brand}</p>
                    <p><strong>Categoria:</strong> {formData.category}</p>
                    {formData.variations.length > 0 && (
                      <p><strong>Variações:</strong> {formData.variations.length}</p>
                    )}
                    {formData.salePrice && (
                      <p><strong>Preço:</strong> R$ {parseFloat(formData.salePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Save className="mr-2" size={16} />
              {product ? 'Atualizar Produto' : 'Criar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
