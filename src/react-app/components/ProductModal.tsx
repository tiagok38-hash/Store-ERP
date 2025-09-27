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
  product_id: string; // Changed to product_id
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
  product?: InventoryUnit; // This is an InventoryUnit, not a Product definition
  onProductSaved?: (product: InventoryUnit) => void;
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  brand_id: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface Variation {
  id: string;
  name: string;
  subcategory_id: string;
}

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
    id: product?.product_id || '', // This is the product_id, not inventory_unit_id
    productSku: product?.productSku || '',
    brand_id: '', // Store brand ID
    category_id: '', // Store category ID
    subcategory_id: '', // Store subcategory ID
    variation_id: '', // Store variation ID
    productDescription: product?.productDescription || '',
    variations: [] as string[], // For generic products
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
    image_url: product?.image_url || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [stockLocations, setStockLocations] = useState<StockLocation[]>([]);
  const [warrantyTerms, setWarrantyTerms] = useState<WarrantyTerm[]>([]);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300);
  };

  // Fetch initial data from Supabase
  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchInitialData = async () => {
      // Fetch Brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (brandsError) console.error('Error fetching brands:', brandsError);
      else setBrands(brandsData || []);

      // Fetch Categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, brand_id')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (categoriesError) console.error('Error fetching categories:', categoriesError);
      else setCategories(categoriesData || []);

      // Fetch Subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('id, name, category_id')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (subcategoriesError) console.error('Error fetching subcategories:', subcategoriesError);
      else setSubcategories(subcategoriesData || []);

      // Fetch Variations
      const { data: variationsData, error: variationsError } = await supabase
        .from('variations')
        .select('id, name, subcategory_id')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (variationsError) console.error('Error fetching variations:', variationsError);
      else setVariations(variationsData || []);

      // Fetch Stock Locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('stock_locations')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (locationsError) console.error('Error fetching stock locations:', locationsError);
      else setStockLocations(locationsData || []);

      // Fetch Warranty Terms
      const { data: warrantyData, error: warrantyError } = await supabase
        .from('warranty_terms')
        .select('id, name, months')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (warrantyError) console.error('Error fetching warranty terms:', warrantyError);
      else setWarrantyTerms(warrantyData || []);
    };

    fetchInitialData();
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setImageFile(null);

      if (product) {
        // Fetch product details from 'products' table using product.product_id
        const fetchProductDetails = async () => {
          const { data: productData, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', product.product_id)
            .single();

          if (error) {
            console.error('Error fetching product details:', error);
            showError('Erro', 'Não foi possível carregar os detalhes do produto.');
            return;
          }

          setFormData({
            id: productData.id,
            productSku: productData.sku || '',
            brand_id: productData.brand_id || '',
            category_id: productData.category_id || '',
            subcategory_id: productData.subcategory_id || '',
            variation_id: productData.variation_id || '',
            productDescription: productData.description || '',
            variations: [], // Assuming variations are part of description or handled differently
            costPrice: productData.cost_price ? formatCurrencyBR(productData.cost_price) : '',
            salePrice: productData.sale_price ? formatCurrencyBR(productData.sale_price) : '',
            additionalCost: '0,00', // Not stored in product definition
            defaultLocationId: productData.location_id || '',
            defaultWarrantyTermId: productData.warranty_term_id || '',
            barcode: productData.barcode || '',
            imei1: productData.requires_imei ? 'sim' : 'nao', // Derive from requires_imei
            imei2: productData.requires_imei ? 'sim' : 'nao', // Derive from requires_imei
            serialNumber: productData.requires_serial ? 'sim' : 'nao', // Derive from requires_serial
            condition: product.condition || 'novo', // From inventory unit
            status: product.status || 'available', // From inventory unit
            minStock: productData.min_stock || 0,
            image_url: productData.image_url || '',
          });
          setImagePreviewUrl(productData.image_url || null);
        };
        fetchProductDetails();
      } else {
        setFormData({
          id: '',
          productSku: '',
          brand_id: '',
          category_id: '',
          subcategory_id: '',
          variation_id: '',
          productDescription: '',
          variations: [],
          costPrice: '',
          salePrice: '',
          additionalCost: '0,00',
          defaultLocationId: stockLocations.length > 0 ? stockLocations[0].id : '',
          defaultWarrantyTermId: warrantyTerms.length > 0 ? warrantyTerms[0].id : '',
          barcode: '',
          imei1: '',
          imei2: '',
          serialNumber: '',
          condition: 'novo',
          status: 'available',
          minStock: 0,
          image_url: '',
        });
        setImagePreviewUrl(null);
      }
    }
  }, [isOpen, product, stockLocations, warrantyTerms, user]);

  const availableCategoriesFiltered = categories.filter(cat => cat.brand_id === formData.brand_id);
  const availableSubcategoriesFiltered = subcategories.filter(subcat => subcat.category_id === formData.category_id);
  const availableVariationsFiltered = variations.filter(v => v.subcategory_id === formData.subcategory_id);

  const getProductDescriptionText = () => {
    const brandName = brands.find(b => b.id === formData.brand_id)?.name;
    const categoryName = categories.find(c => c.id === formData.category_id)?.name;
    const subcategoryName = subcategories.find(s => s.id === formData.subcategory_id)?.name;
    const variationName = variations.find(v => v.id === formData.variation_id)?.name;

    let descriptionParts = [];
    if (brandName) descriptionParts.push(brandName);
    if (categoryName) descriptionParts.push(categoryName);
    if (subcategoryName) descriptionParts.push(subcategoryName);
    if (variationName) descriptionParts.push(variationName);
    
    return descriptionParts.join(' ').trim();
  };

  const getProductSkuText = () => {
    let skuParts = [];
    const brandName = brands.find(b => b.id === formData.brand_id)?.name;
    const categoryName = categories.find(c => c.id === formData.category_id)?.name;
    const subcategoryName = subcategories.find(s => s.id === formData.subcategory_id)?.name;
    const variationName = variations.find(v => v.id === formData.variation_id)?.name;

    if (brandName) skuParts.push(brandName.substring(0, 3).toUpperCase());
    if (categoryName) skuParts.push(categoryName.substring(0, 3).toUpperCase());
    if (subcategoryName) skuParts.push(subcategoryName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase());
    if (variationName) skuParts.push(variationName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase());

    return skuParts.join('').trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.brand_id) newErrors.brand_id = 'Marca é obrigatória';
    if (!formData.category_id) newErrors.category_id = 'Categoria é obrigatória';
    if (!getProductDescriptionText()) newErrors.productDescription = 'Descrição é obrigatória';
    
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
      if (imageFile) {
        if (formData.image_url) {
          await deleteProductImage(formData.image_url);
        }
        finalImageUrl = await uploadProductImage(imageFile, formData.id || 'new-product', user.id);
      } else if (formData.image_url && !imagePreviewUrl) {
        await deleteProductImage(formData.image_url);
        finalImageUrl = '';
      }
    } catch (uploadError: any) {
      showError('Erro no upload da imagem', uploadError.message);
      return;
    }

    const productData = {
      user_id: user.id,
      sku: getProductSkuText(),
      description: getProductDescriptionText(),
      brand_id: formData.brand_id,
      category_id: formData.category_id,
      subcategory_id: formData.subcategory_id || null,
      variation_id: formData.variation_id || null,
      cost_price: parsedCostPrice,
      sale_price: parsedSalePrice,
      min_stock: formData.minStock,
      location_id: formData.defaultLocationId,
      requires_imei: formData.imei1 === 'sim',
      requires_serial: formData.serialNumber === 'sim',
      warranty_term_id: formData.defaultWarrantyTermId,
      is_active: true,
      image_url: finalImageUrl,
    };

    if (product) {
      const { data: updatedData, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.product_id)
        .select()
        .single();

      if (error) {
        showError('Erro ao atualizar produto', error.message);
        console.error('Error updating product:', error);
      } else {
        showSuccess('Produto Atualizado', `O produto "${getProductDescriptionText()}" foi atualizado com sucesso.`);
        onProductSaved?.({ ...product, ...updatedData }); // Pass updated product data
        handleClose();
      }
    } else {
      const { data: newData, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        showError('Erro ao criar produto', error.message);
        console.error('Error creating product:', error);
      } else {
        showSuccess('Produto Criado', `O produto "${getProductDescriptionText()}" foi criado com sucesso.`);
        // For a new product, we don't have an InventoryUnit yet, so we just pass the product data
        onProductSaved?.({
          id: '', // No inventory unit ID yet
          product_id: newData.id,
          productSku: newData.sku,
          productDescription: newData.description,
          brand: brands.find(b => b.id === newData.brand_id)?.name || '',
          category: categories.find(c => c.id === newData.category_id)?.name || '',
          condition: 'novo', // Default
          costPrice: newData.cost_price,
          salePrice: newData.sale_price,
          status: 'available', // Default
          createdAt: newData.created_at,
          updatedAt: newData.updated_at,
          minStock: newData.min_stock,
          image_url: newData.image_url,
          location: stockLocations.find(loc => loc.id === newData.location_id)?.name || '',
          imei1: newData.requires_imei ? 'sim' : undefined,
          serialNumber: newData.requires_serial ? 'sim' : undefined,
        });
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
    setFormData(prev => ({ ...prev, image_url: '' }));
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
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value, category_id: '', subcategory_id: '', variation_id: '' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.brand_id ? 'border-red-300' : 'border-slate-300'
                  }`}
                >
                  <option value="">Selecione a marca</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
                {errors.brand_id && <p className="text-red-600 text-sm mt-1">{errors.brand_id}</p>}
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  2. Categoria *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value, subcategory_id: '', variation_id: '' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category_id ? 'border-red-300' : 'border-slate-300'
                  } ${!formData.brand_id ? 'bg-slate-100' : ''}`}
                  disabled={!formData.brand_id}
                >
                  <option value="">Selecione a categoria</option>
                  {availableCategoriesFiltered.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-600 text-sm mt-1">{errors.category_id}</p>}
                {!formData.brand_id && (
                  <p className="text-slate-500 text-xs mt-1">Selecione uma marca primeiro</p>
                )}
              </div>

              {/* Subcategoria */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  3. Subcategoria
                </label>
                <select
                  value={formData.subcategory_id}
                  onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value, variation_id: '' })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !formData.category_id ? 'bg-slate-100' : ''
                  }`}
                  disabled={!formData.category_id}
                >
                  <option value="">Selecione a subcategoria</option>
                  {availableSubcategoriesFiltered.map(subcategory => (
                    <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                  ))}
                </select>
                {!formData.category_id && (
                  <p className="text-slate-500 text-xs mt-1">Selecione uma categoria primeiro</p>
                )}
              </div>

              {/* Variação */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  4. Variação
                </label>
                <select
                  value={formData.variation_id}
                  onChange={(e) => setFormData({ ...formData, variation_id: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !formData.subcategory_id ? 'bg-slate-100' : ''
                  }`}
                  disabled={!formData.subcategory_id}
                >
                  <option value="">Selecione a variação</option>
                  {availableVariationsFiltered.map(variation => (
                    <option key={variation.id} value={variation.id}>{variation.name}</option>
                  ))}
                </select>
                {!formData.subcategory_id && (
                  <p className="text-slate-500 text-xs mt-1">Selecione uma subcategoria primeiro</p>
                )}
              </div>

              {/* Preview Automático */}
              {getProductDescriptionText() && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Preview Automático</h4>
                  <p className="text-blue-800 font-medium text-sm">{getProductDescriptionText()}</p>
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
                  value={getProductSkuText()}
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
                  Requer IMEI 1?
                </label>
                <div className="flex gap-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="requiresImei1"
                      value="sim"
                      checked={formData.imei1 === 'sim'}
                      onChange={(e) => setFormData({ ...formData, imei1: e.target.value })}
                      className="mr-1"
                    />
                    <span className="text-sm">Sim</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="requiresImei1"
                      value="nao"
                      checked={formData.imei1 === 'nao'}
                      onChange={(e) => setFormData({ ...formData, imei1: e.target.value })}
                      className="mr-1"
                    />
                    <span className="text-sm">Não</span>
                  </label>
                </div>
              </div>

              {/* IMEI 2 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Requer IMEI 2?
                </label>
                <div className="flex gap-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="requiresImei2"
                      value="sim"
                      checked={formData.imei2 === 'sim'}
                      onChange={(e) => setFormData({ ...formData, imei2: e.target.value })}
                      className="mr-1"
                    />
                    <span className="text-sm">Sim</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="requiresImei2"
                      value="nao"
                      checked={formData.imei2 === 'nao'}
                      onChange={(e) => setFormData({ ...formData, imei2: e.target.value })}
                      className="mr-1"
                    />
                    <span className="text-sm">Não</span>
                  </label>
                </div>
              </div>

              {/* Número de Série */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Requer Número de Série?
                </label>
                <div className="flex gap-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="requiresSerialNumber"
                      value="sim"
                      checked={formData.serialNumber === 'sim'}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      className="mr-1"
                    />
                    <span className="text-sm">Sim</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="requiresSerialNumber"
                      value="nao"
                      checked={formData.serialNumber === 'nao'}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      className="mr-1"
                    />
                    <span className="text-sm">Não</span>
                  </label>
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
              {getProductDescriptionText() && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Resumo do Produto</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>SKU:</strong> {getProductSkuText()}</p>
                    <p><strong>Descrição:</strong> {getProductDescriptionText()}</p>
                    <p><strong>Marca:</strong> {brands.find(b => b.id === formData.brand_id)?.name}</p>
                    <p><strong>Categoria:</strong> {categories.find(c => c.id === formData.category_id)?.name}</p>
                    {formData.salePrice && (
                      <p><strong>Preço:</strong> R$ {parseCurrencyBR(formData.salePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    )}
                    {formData.barcode && (
                      <p><strong>Cód. Barras:</strong> {formData.barcode}</p>
                    )}
                    {(formData.imei1 === 'sim' || formData.imei2 === 'sim') && (
                      <p><strong>IMEI:</strong> Sim</p>
                    )}
                    {formData.serialNumber === 'sim' && (
                      <p><strong>Número de Série:</strong> Sim</p>
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