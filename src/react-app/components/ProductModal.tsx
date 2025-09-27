import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Package,
  DollarSign,
  Hash,
  Tag,
  Smartphone,
  Plus,
  Info, 
  Barcode, 
  Clock, 
  MapPin,
  CheckSquare, // New icon for requiresImei/Serial
  Square // New icon for requiresImei/Serial
} from 'lucide-react';
import { Link } from 'react-router-dom'; 
import { useTheme } from '@/react-app/hooks/useTheme'; 
import { supabase } from '@/integrations/supabase/client'; 
import { useAuth } from '@/react-app/hooks/useAuth'; 
import { formatCurrencyInput, parseCurrencyBR, formatCurrencyBR } from '@/react-app/utils/currency'; 
import { useNotification } from '@/react-app/components/NotificationSystem';
import { Product as ProductDefinition } from '@/shared/types'; // Import Product from shared types

// Hierarchical data for product structure (remains the same)
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

interface StockLocation {
  id: string;
  name: string;
}

interface WarrantyTerm {
  id: string;
  name: string;
  months: number;
}

// Mapa de tradução para os tipos de variação
const variationTypeTranslations: { [key: string]: string } = {
  storage: 'Armazenamento',
  colors: 'Cor',
  size: 'Tamanho',
  compatibility: 'Compatibilidade',
  power: 'Potência',
  type: 'Tipo',
};

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductDefinition; // Now expects a ProductDefinition
  onProductSaved?: (product: ProductDefinition) => void; // Callback returns ProductDefinition
}

export default function ProductModal({ isOpen, onClose, product, onProductSaved }: ProductModalProps) {
  const { theme } = useTheme();
  const { user } = useAuth(); 
  const { showSuccess, showError } = useNotification(); 
  const [formData, setFormData] = useState({
    id: product?.id || '', 
    sku: product?.sku || '', // Changed from productSku to sku
    brand: product?.brand || '',
    category: product?.category || '',
    description: product?.description || '', // Changed from productDescription to description
    variations: [] as string[], 
    costPrice: product?.cost_price ? formatCurrencyBR(product.cost_price) : '', // Changed from costPrice to cost_price
    salePrice: product?.sale_price ? formatCurrencyBR(product.sale_price) : '', // Changed from salePrice to sale_price
    additionalCost: '0,00', 
    defaultLocationId: '', 
    defaultWarrantyTermId: '', 
    barcode: product?.barcode || '',
    requiresImei: product?.requires_imei || false, // New field
    requiresSerial: product?.requires_serial || false, // New field
    minStock: product?.min_stock || 0, // Changed from minStock to min_stock
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableBrands, setAvailableBrands] = useState<string[]>([]); 
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableDescriptions, setAvailableDescriptions] = useState<string[]>([]);
  const [availableVariations, setAvailableVariations] = useState<{[key: string]: string[]}>({});
  const [selectedVariations, setSelectedVariations] = useState<{[key: string]: string}>({});
  const [stockLocations, setStockLocations] = useState<StockLocation[]>([]); 
  const [warrantyTerms, setWarrantyTerms] = useState<WarrantyTerm[]>([]); 
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); 
  };

  useEffect(() => {
    if (isOpen) {
      setErrors({}); 
      setAvailableBrands(Object.keys(hierarchicalData));

      if (product) {
        setFormData({
          id: product.id,
          sku: product.sku || '',
          brand: product.brand || '',
          category: product.category || '',
          description: product.description || '',
          variations: [], 
          costPrice: product.cost_price ? formatCurrencyBR(product.cost_price) : '',
          salePrice: product.sale_price ? formatCurrencyBR(product.sale_price) : '',
          additionalCost: '0,00', 
          defaultLocationId: '', 
          defaultWarrantyTermId: '', 
          barcode: product.barcode || '',
          requiresImei: product.requires_imei || false,
          requiresSerial: product.requires_serial || false,
          minStock: product.min_stock || 0,
        });
        setSelectedVariations({});
      } else {
        setFormData({
          id: '',
          sku: '',
          brand: '',
          category: '',
          description: '',
          variations: [],
          costPrice: '',
          salePrice: '',
          additionalCost: '0,00',
          defaultLocationId: '',
          defaultWarrantyTermId: '',
          barcode: '',
          requiresImei: false,
          requiresSerial: false,
          minStock: 0,
        });
        setSelectedVariations({});
      }
    }
  }, [isOpen, product]);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user?.id) return;

      const { data: locationsData, error: locationsError } = await supabase
        .from('stock_locations')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (locationsError) {
        console.error('Error fetching stock locations:', locationsError);
      } else {
        setStockLocations(locationsData || []);
      }

      const { data: warrantyData, error: warrantyError } = await supabase
        .from('warranty_terms')
        .select('id, name, months')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (warrantyError) {
        console.error('Error fetching warranty terms:', warrantyError);
      } else {
        setWarrantyTerms(warrantyData || []);
        if (product && product.warranty_term_id) { // Use warranty_term_id from Product
          setFormData(prev => ({ ...prev, defaultWarrantyTermId: product.warranty_term_id }));
        }
      }
    };

    if (isOpen && user) {
      fetchAdminData();
    }
  }, [isOpen, user, product]);

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

  useEffect(() => {
    if (formData.brand && formData.category && formData.description) {
      let sku = '';
      
      const brandPrefix = formData.brand.substring(0, 3).toUpperCase();
      
      const categoryCode = formData.category.substring(0, 3).toUpperCase();
      
      const descriptionCode = formData.description
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(' ')
        .map((word: string) => word.substring(0, 2))
        .join('')
        .toUpperCase()
        .substring(0, 6);
      
      sku = `${brandPrefix}${categoryCode}${descriptionCode}`;
      
      Object.values(selectedVariations).forEach(variation => {
        if (variation) {
          sku += variation.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
        }
      });
      
      setFormData(prev => ({ ...prev, sku: sku }));
    }
  }, [formData.brand, formData.category, formData.description, selectedVariations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.brand) newErrors.brand = 'Marca é obrigatória';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.description) newErrors.description = 'Descrição é obrigatória';
    
    const parsedCostPrice = parseCurrencyBR(formData.costPrice);
    const parsedSalePrice = parseCurrencyBR(formData.salePrice);

    if (parsedCostPrice <= 0) {
      newErrors.costPrice = 'Preço de custo deve ser maior que zero';
    }
    if (parsedSalePrice <= 0) {
      newErrors.salePrice = 'Preço de venda deve ser maior que zero';
    }
    if (!formData.defaultLocationId) {
      newErrors.defaultLocationId = 'Localização de estoque é obrigatória';
    }
    if (!formData.defaultWarrantyTermId) {
      newErrors.defaultWarrantyTermId = 'Garantia é obrigatória';
    }
    if (formData.minStock < 0) {
      newErrors.minStock = 'Quantidade mínima de estoque não pode ser negativa';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedWarranty = warrantyTerms.find(term => term.id === formData.defaultWarrantyTermId);
    const selectedLocation = stockLocations.find(loc => loc.id === formData.defaultLocationId);

    const newOrUpdatedProduct: ProductDefinition = {
      id: formData.id || String(Date.now()), 
      sku: formData.sku,
      description: getProductDescription(), 
      brand: formData.brand,
      category: formData.category,
      model: formData.description, 
      variation: Object.values(selectedVariations).filter(v => v).join(', ') || undefined, // Combine variations into a single string
      cost_price: parsedCostPrice,
      sale_price: parsedSalePrice,
      markup: parseFloat(calculateMarkup()), // Calculate markup
      ncm: undefined, // Not collected in this modal
      unit: 'UN', // Default unit
      requires_imei: formData.requiresImei,
      requires_serial: formData.requiresSerial,
      is_active: true, // Always active on creation/edit
      created_at: product?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      location_id: selectedLocation?.id || undefined, // Store location ID
      warranty_term_id: selectedWarranty?.id || undefined, // Store warranty ID
      min_stock: formData.minStock,
      image_url: undefined, // Not collected in this modal
      company_id: undefined, // Not collected in this modal
    };

    if (onProductSaved) {
      onProductSaved(newOrUpdatedProduct);
    }
    
    handleClose(); 
  };

  const calculateMarkup = () => {
    const cost = parseCurrencyBR(formData.costPrice);
    const additional = parseCurrencyBR(formData.additionalCost);
    const sale = parseCurrencyBR(formData.salePrice);
    
    const trueCost = cost + additional;

    if (trueCost > 0 && sale > 0) {
      return (((sale - trueCost) / trueCost) * 100).toFixed(1);
    }
    return '0.0';
  };

  const getProductDescription = () => {
    let description = '';
    if (formData.brand) description += formData.brand;
    if (formData.description) description += ` ${formData.description}`;
    
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

  if (!isOpen && !isAnimatingOut) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto ${isAnimatingOut ? 'animate-modal-out' : 'animate-modal-in'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-bold flex items-center">
            <Package className="mr-2" size={24} />
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={handleClose}
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

              {/* Link para estrutura de produtos */}
              <div className={`rounded p-2 ${
                theme === 'dark' 
                  ? 'bg-blue-900/50 border border-blue-700' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-start">
                  <Info className={`mr-1 mt-0.5 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} size={12} />
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    Para cadastrar Marcas, Categorias e Grades,{' '}
                    <Link 
                      to="/administration/product-structure" 
                      target="_blank"
                      className={`underline font-medium transition-colors ${
                        theme === 'dark' 
                          ? 'hover:text-blue-200' 
                          : 'hover:text-blue-900'
                      }`}
                    >
                      clique aqui
                    </Link>
                    .
                  </div>
                </div>
              </div>

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
                  {availableBrands.map(brand => (
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
                        {variationTypeTranslations[variationType] || variationType} 
                      </label>
                      <select
                        value={selectedVariations[variationType] || ''}
                        onChange={(e) => handleVariationChange(variationType, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">Selecione {variationTypeTranslations[variationType] || variationType}</option> 
                        {options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  ))}
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
                Preços
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
                  readOnly
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preço de Custo *
                  </label>
                  <input
                    type="text"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: formatCurrencyInput(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.costPrice ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="0,00"
                  />
                  {errors.costPrice && <p className="text-red-600 text-sm mt-1">{errors.costPrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Custo Adicional
                  </label>
                  <input
                    type="text"
                    value={formData.additionalCost}
                    onChange={(e) => setFormData({ ...formData, additionalCost: formatCurrencyInput(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Preço de Venda *
                </label>
                <input
                  type="text"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: formatCurrencyInput(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.salePrice ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="0,00"
                />
                {errors.salePrice && <p className="text-red-600 text-sm mt-1">{errors.salePrice}</p>}
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Margem de Lucro:</span>
                  <span className="text-lg font-bold text-green-600">{calculateMarkup()}%</span>
                </div>
              </div>

              {/* Quantidade Mínima de Estoque */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantidade Mínima de Estoque
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.minStock ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="0"
                />
                {errors.minStock && <p className="text-red-600 text-sm mt-1">{errors.minStock}</p>}
              </div>
            </div>

            {/* Coluna 3: Configurações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <Tag className="mr-2 text-purple-500" size={18} />
                Configurações
              </h3>

              {/* Código de Barras */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Código de Barras
                </label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o código de barras"
                  />
                </div>
              </div>

              {/* Requires IMEI */}
              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.requiresImei}
                    onChange={(e) => setFormData({ ...formData, requiresImei: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
                  />
                  Produto requer IMEI
                </label>
              </div>

              {/* Requires Serial Number */}
              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.requiresSerial}
                    onChange={(e) => setFormData({ ...formData, requiresSerial: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
                  />
                  Produto requer Número de Série
                </label>
              </div>

              {/* Garantia (Dropdown) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Garantia Padrão *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={formData.defaultWarrantyTermId}
                    onChange={(e) => setFormData({ ...formData, defaultWarrantyTermId: e.target.value })}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.defaultWarrantyTermId ? 'border-red-300' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Selecione um termo de garantia</option>
                    {warrantyTerms.map(term => (
                      <option key={term.id} value={term.id}>{term.name} ({term.months} meses)</option>
                    ))}
                  </select>
                </div>
                {errors.defaultWarrantyTermId && <p className="text-red-600 text-sm mt-1">{errors.defaultWarrantyTermId}</p>}
              </div>

              {/* Localização no Estoque (Dropdown) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Localização Padrão no Estoque *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={formData.defaultLocationId}
                    onChange={(e) => setFormData({ ...formData, defaultLocationId: e.target.value })}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.defaultLocationId ? 'border-red-300' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Selecione um local de estoque</option>
                    {stockLocations.map(location => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>
                {errors.defaultLocationId && <p className="text-red-600 text-sm mt-1">{errors.defaultLocationId}</p>}
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
                    {Object.values(selectedVariations).some(v => v) && (
                      <p><strong>Variações:</strong> {Object.values(selectedVariations).filter(v => v).join(', ')}</p>
                    )}
                    {formData.salePrice && (
                      <p><strong>Preço:</strong> R$ {parseCurrencyBR(formData.salePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    )}
                    {formData.barcode && (
                      <p><strong>Cód. Barras:</strong> {formData.barcode}</p>
                    )}
                    {formData.requiresImei && (
                      <p className="flex items-center">
                        <CheckSquare size={14} className="mr-1 text-blue-600" />
                        Requer IMEI
                      </p>
                    )}
                    {formData.requiresSerial && (
                      <p className="flex items-center">
                        <CheckSquare size={14} className="mr-1 text-blue-600" />
                        Requer Nº de Série
                      </p>
                    )}
                    {formData.defaultLocationId && (
                      <p><strong>Local Padrão:</strong> {stockLocations.find(loc => loc.id === formData.defaultLocationId)?.name}</p>
                    )}
                    {formData.defaultWarrantyTermId && (
                      <p><strong>Garantia Padrão:</strong> {warrantyTerms.find(term => term.id === formData.defaultWarrantyTermId)?.name}</p>
                    )}
                    <p><strong>Estoque Mínimo:</strong> {formData.minStock}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
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