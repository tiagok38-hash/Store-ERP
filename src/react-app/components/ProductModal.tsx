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
  Upload, // Importar o ícone Upload
  Camera, // Importar o ícone Camera
  Image as ImageIcon // Importar o ícone Image
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/react-app/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/react-app/hooks/useAuth';
import { formatCurrencyInput, parseCurrencyBR, formatCurrencyBR } from '@/react-app/utils/currency';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { uploadProductImage, deleteProductImage } from '@/integrations/supabase/storage'; // Importar funções de storage

interface InventoryUnit {
  id: string;
  productSku: string;
  productDescription: string;
  brand: string;
  category: string;
  model?: string;
  color?: string;
  storage?: string;
  condition: 'novo' | 'seminovo' | 'usado';
  location?: string;
  imei1?: string;
  imei2?: string;
  serialNumber?: string;
  barcode?: string;
  costPrice: number;
  salePrice: number;
  status: 'available' | 'sold' | 'reserved' | 'defective';
  createdAt: string;
  updatedAt: string;
  purchaseId?: string;
  locatorCode?: string;
  minStock?: number;
  image_url?: string; // Adicionado image_url
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: InventoryUnit;
  onProductSaved?: (product: InventoryUnit) => void;
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

export default function ProductModal({ isOpen, onClose, product, onProductSaved }: ProductModalProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    id: product?.id || '',
    productSku: product?.productSku || '',
    brand: product?.brand || '',
    category: product?.category || '',
    productDescription: product?.productDescription || '',
    variations: [] as string[],
    costPrice: product?.costPrice ? formatCurrencyBR(product.costPrice) : '',
    salePrice: product?.salePrice ? formatCurrencyBR(product.salePrice) : '',
    additionalCost: '0,00',
    defaultLocationId: product?.location || '',
    defaultWarrantyTermId: '',
    barcode: product?.barcode || '',
    imei1: product?.imei1 || '',
    imei2: product?.imei2 || '',
    serialNumber: product?.serialNumber || '',
    condition: product?.condition || 'novo',
    status: product?.status || 'available',
    minStock: product?.minStock || 0,
    image_url: product?.image_url || '', // Adicionado image_url ao formData
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
  const [imageFile, setImageFile] = useState<File | null>(null); // Estado para o arquivo de imagem
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null); // Estado para a URL de preview

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
          productSku: product.productSku || '',
          brand: product.brand || '',
          category: product.category || '',
          productDescription: product.productDescription || '',
          variations: [],
          costPrice: product.costPrice ? formatCurrencyBR(product.costPrice) : '',
          salePrice: product.salePrice ? formatCurrencyBR(product.salePrice) : '',
          additionalCost: '0,00',
          defaultLocationId: product.location || '',
          defaultWarrantyTermId: '',
          barcode: product.barcode || '',
          imei1: product.imei1 || '',
          imei2: product.imei2 || '',
          serialNumber: product.serialNumber || '',
          condition: product.condition || 'novo',
          status: product.status || 'available',
          minStock: product.minStock || 0,
          image_url: product.image_url || '', // Carregar URL da imagem existente
        });
        setImagePreviewUrl(product.image_url || null); // Definir preview da imagem existente
        setImageFile(null); // Limpar arquivo de imagem ao editar
        setSelectedVariations({});
      } else {
        setFormData({
          id: '',
          productSku: '',
          brand: '',
          category: '',
          productDescription: '',
          variations: [],
          costPrice: '',
          salePrice: '',
          additionalCost: '0,00',
          defaultLocationId: '',
          defaultWarrantyTermId: '',
          barcode: '',
          imei1: '',
          imei2: '',
          serialNumber: '',
          condition: 'novo',
          status: 'available',
          minStock: 0,
          image_url: '',
        });
        setImagePreviewUrl(null); // Limpar preview
        setImageFile(null); // Limpar arquivo de imagem
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
        if (product && product.warrantyTerm) {
          const matchingTerm = warrantyData?.find(term => term.name === product.warrantyTerm);
          if (matchingTerm) {
            setFormData(prev => ({ ...prev, defaultWarrantyTermId: matchingTerm.id }));
          }
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
        setFormData(prev => ({ ...prev, category: '', productDescription: '' }));
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
          setFormData(prev => ({ ...prev, productDescription: '' }));
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
    if (formData.brand && formData.category && formData.productDescription) {
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
  }, [formData.brand, formData.category, formData.productDescription]);

  useEffect(() => {
    if (formData.brand && formData.category && formData.productDescription) {
      let sku = '';
      
      const brandPrefix = formData.brand.substring(0, 3).toUpperCase();
      const categoryCode = formData.category.substring(0, 3).toUpperCase();
      const descriptionCode = formData.productDescription
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
      
      setFormData(prev => ({ ...prev, productSku: sku }));
    }
  }, [formData.brand, formData.category, formData.productDescription, selectedVariations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.brand) newErrors.brand = 'Marca é obrigatória';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.productDescription) newErrors.productDescription = 'Descrição é obrigatória';
    
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

    if (!user) {
      showError('Erro', 'Usuário não autenticado.');
      return;
    }

    let finalImageUrl = formData.image_url;

    try {
      // Handle image upload/deletion
      if (imageFile) {
        // If there's an old image and a new one is uploaded, delete the old one first
        if (formData.image_url) {
          await deleteProductImage(formData.image_url);
        }
        finalImageUrl = await uploadProductImage(imageFile, formData.id || 'new-product', user.id);
      } else if (formData.image_url && !imagePreviewUrl) {
        // If there was an image but it was removed (imagePreviewUrl is null)
        await deleteProductImage(formData.image_url);
        finalImageUrl = ''; // Set to empty string or null in DB
      }
    } catch (uploadError: any) {
      showError('Erro no upload da imagem', uploadError.message);
      return;
    }

    const selectedWarranty = warrantyTerms.find(term => term.id === formData.defaultWarrantyTermId);
    const selectedLocation = stockLocations.find(loc => loc.id === formData.defaultLocationId);

    const productData = {
      user_id: user.id, // Adicionar user_id para RLS
      sku: formData.productSku,
      description: getProductDescription(),
      brand_id: formData.brand, // Assumindo que brand_id é o ID da marca
      category_id: formData.category, // Assumindo que category_id é o ID da categoria
      variation_id: null, // Não estamos usando variation_id diretamente aqui
      cost_price: parsedCostPrice,
      sale_price: parsedSalePrice,
      min_stock: formData.minStock,
      location_id: formData.defaultLocationId,
      requires_imei: !!formData.imei1, // True se IMEI1 for preenchido
      requires_serial: !!formData.serialNumber, // True se SerialNumber for preenchido
      warranty_term_id: formData.defaultWarrantyTermId,
      is_active: true, // Produtos são ativos por padrão
      image_url: finalImageUrl, // Salvar a URL da imagem
    };

    if (product) {
      // Update existing product
      const { data: updatedData, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id)
        .select();

      if (error) {
        showError('Erro ao atualizar produto', error.message);
        console.error('Error updating product:', error);
      } else {
        showSuccess('Produto Atualizado', `O produto "${getProductDescription()}" foi atualizado com sucesso.`);
        onProductSaved?.({ ...product, ...updatedData[0] });
        handleClose();
      }
    } else {
      // Insert new product
      const { data: newData, error } = await supabase
        .from('products')
        .insert(productData)
        .select();

      if (error) {
        showError('Erro ao criar produto', error.message);
        console.error('Error creating product:', error);
      } else {
        showSuccess('Produto Criado', `O produto "${getProductDescription()}" foi criado com sucesso.`);
        onProductSaved?.(newData[0]);
        handleClose();
      }
    }
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
    if (formData.productDescription) description += ` ${formData.productDescription}`;
    
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
        .map(([key, value]) => `${variationTypeTranslations[key] || key}: ${value}`)
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setFormData(prev => ({ ...prev, image_url: '' })); // Clear image_url in form data
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
                  value={formData.productDescription}
                  onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.productDescription ? 'border-red-300' : 'border-slate-300'
                  } ${!formData.category ? 'bg-slate-100' : ''}`}
                  disabled={!formData.category}
                >
                  <option value="">Selecione a descrição</option>
                  {availableDescriptions.map(description => (
                    <option key={description} value={description}>{description}</option>
                  ))}
                </select>
                {errors.productDescription && <p className="text-red-600 text-sm mt-1">{errors.productDescription}</p>}
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
                Preços
              </h3>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SKU (Gerado Automaticamente)
                </label>
                <input
                  type="text"
                  value={formData.productSku}
                  onChange={(e) => setFormData({ ...formData, productSku: e.target.value })}
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

            {/* Coluna 3: Configurações e Imagem */}
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

              {/* IMEI 1 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  IMEI 1
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={formData.imei1}
                    onChange={(e) => setFormData({ ...formData, imei1: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o IMEI 1 (opcional)"
                  />
                </div>
              </div>

              {/* IMEI 2 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  IMEI 2
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={formData.imei2}
                    onChange={(e) => setFormData({ ...formData, imei2: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o IMEI 2 (opcional)"
                  />
                </div>
              </div>

              {/* Número de Série */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Número de Série
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o número de série (opcional)"
                  />
                </div>
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

              {/* Upload de Imagem */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-700 flex items-center">
                  <Camera className="mr-2 text-orange-500" size={18} />
                  Foto do Produto
                </h3>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  theme === 'dark' ? 'border-slate-600' : 'border-slate-300'
                }`}>
                  {imagePreviewUrl ? (
                    <div className="relative">
                      <img 
                        src={imagePreviewUrl} 
                        alt="Product preview" 
                        className="max-w-full max-h-32 mx-auto object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className={`mx-auto mb-2 ${
                        theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                      }`} size={32} />
                      <p className={`mb-1 ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                      }`}>Nenhuma foto</p>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}>PNG, JPG até 2MB</p>
                    </div>
                  )}
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="product-image-upload"
                />
                <label
                  htmlFor="product-image-upload"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center font-medium text-sm"
                >
                  <Upload className="mr-2" size={16} />
                  {imagePreviewUrl ? 'Alterar Foto' : 'Adicionar Foto'}
                </label>
              </div>

              {/* Preview do Produto Final */}
              {formData.brand && formData.category && formData.productDescription && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Resumo do Produto</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>SKU:</strong> {formData.productSku}</p>
                    <p><strong>Descrição:</strong> {getProductDescription()}</p>
                    <p><strong>Marca:</strong> {formData.brand}</p>
                    <p><strong>Categoria:</strong> {formData.category}</p>
                    {formData.variations.length > 0 && (
                      <p><strong>Variações:</strong> {formData.variations.length}</p>
                    )}
                    {formData.salePrice && (
                      <p><strong>Preço:</strong> R$ {parseCurrencyBR(formData.salePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    )}
                    {formData.barcode && (
                      <p><strong>Cód. Barras:</strong> {formData.barcode}</p>
                    )}
                    {formData.imei1 && (
                      <p><strong>IMEI 1:</strong> {formData.imei1}</p>
                    )}
                    {formData.imei2 && (
                      <p><strong>IMEI 2:</strong> {formData.imei2}</p>
                    )}
                    {formData.serialNumber && (
                      <p><strong>Número de Série:</strong> {formData.serialNumber}</p>
                    )}
                    {formData.defaultLocationId && (
                      <p><strong>Local Padrão:</strong> {stockLocations.find(loc => loc.id === formData.defaultLocationId)?.name}</p>
                    )}
                    {formData.defaultWarrantyTermId && (
                      <p><strong>Garantia Padrão:</strong> {warrantyTerms.find(term => term.id === formData.defaultWarrantyTermId)?.name}</p>
                    )}
                    <p><strong>Estoque Mínimo:</strong> {formData.minStock}</p>
                    {formData.image_url && (
                      <p><strong>Foto:</strong> Sim</p>
                    )}
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