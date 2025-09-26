import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus,
  Trash2,
  Info,
  Package
} from 'lucide-react';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { useTheme } from '@/react-app/hooks/useTheme';
import { formatCurrencyInput, parseCurrencyBR, formatCurrencyBR } from '@/react-app/utils/currency';
import CustomerModal from '@/react-app/components/CustomerModal';

interface PurchaseItem {
  id: string;
  description: string;
  quantity: number;
  costPrice: number;
  finalPrice: number;
  totalPrice: number;
  imei1?: string;
  imei2?: string;
  serialNumber?: string;
  condition: string;
  location: string;
  warranty: string;
  sku?: string;
  hasImeiSerial?: boolean;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSaved?: (purchase: any) => void;
  editingPurchase?: any;
  isTradeIn?: boolean;
  onTradeInValue?: (value: number) => void;
}

const mockSuppliers = [
  { id: '1', name: 'Fornecedor ABC Ltda' },
  { id: '2', name: 'Tech Distribuidora' },
  { id: '3', name: 'Acessórios & Cia' },
  { id: '4', name: 'Apple Brasil' },
  { id: '5', name: 'Samsung Eletrônica' },
  { id: '6', name: 'Xiaomi Global' }
];

const mockStockLocations = [
  'Vitrine Principal',
  'Vitrine iS',
  'Estoque A1-B2',
  'Estoque B1-A3',
  'Estoque C1-D2',
  'Depósito',
  'Loja',
  'Balcão',
  'Sala Técnica'
];

const mockBrands = [
  { id: '1', name: 'Apple' },
  { id: '2', name: 'Samsung' },
  { id: '3', name: 'Xiaomi' },
  { id: '4', name: 'Genérica' }
];

// Filtrar marcas baseado no tipo de produto
const getAvailableBrands = (productType: 'apple' | 'product') => {
  if (productType === 'apple') {
    return mockBrands.filter(brand => brand.name === 'Apple');
  }
  return mockBrands;
};

const mockCategories = {
  '1': [
    { id: '1', name: 'iPhone' },
    { id: '2', name: 'iPad' },
    { id: '3', name: 'MacBook' },
    { id: '4', name: 'AirPods' },
    { id: '5', name: 'Apple Watch' }
  ],
  '2': [
    { id: '6', name: 'Galaxy S' },
    { id: '7', name: 'Galaxy A' },
    { id: '8', name: 'Galaxy Tab' }
  ],
  '3': [
    { id: '9', name: 'Redmi' },
    { id: '10', name: 'POCO' },
    { id: '11', name: 'Mi' }
  ],
  '4': [
    { id: '12', name: 'Capinhas' },
    { id: '13', name: 'Películas' },
    { id: '14', name: 'Carregadores' }
  ]
};

// Modelos específicos por categoria
const mockModels = {
  '1': ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13'],
  '2': ['iPad Pro 12.9"', 'iPad Pro 11"', 'iPad Air 5ª Geração', 'iPad 10ª Geração', 'iPad Mini'],
  '3': ['MacBook Pro 16"', 'MacBook Pro 14"', 'MacBook Air 15"', 'MacBook Air 13"'],
  '4': ['AirPods Pro 2ª Geração', 'AirPods 3ª Geração', 'AirPods Max'],
  '5': ['Apple Watch Ultra 2', 'Apple Watch Series 9', 'Apple Watch SE'],
  '6': ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24'],
  '7': ['Galaxy A54', 'Galaxy A34', 'Galaxy A24'],
  '9': ['Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi Note 13'],
  '12': ['Capinha Silicone', 'Capinha Transparente', 'Capinha Couro']
};

// Armazenamento por modelo (para Apple)
const mockStorage = {
  'iPhone 15 Pro Max': ['128GB', '256GB', '512GB', '1TB'],
  'iPhone 15 Pro': ['128GB', '256GB', '512GB', '1TB'],
  'iPhone 15 Plus': ['128GB', '256GB', '512GB'],
  'iPhone 15': ['128GB', '256GB', '512GB'],
  'iPhone 14 Pro Max': ['128GB', '256GB', '512GB', '1TB'],
  'iPhone 14 Pro': ['128GB', '256GB', '512GB', '1TB'],
  'iPhone 14': ['128GB', '256GB', '512GB'],
  'iPhone 13': ['128GB', '256GB', '512GB'],
  'iPad Pro 12.9"': ['128GB', '256GB', '512GB', '1TB', '2TB'],
  'iPad Pro 11"': ['128GB', '256GB', '512GB', '1TB', '2TB'],
  'iPad Air 5ª Geração': ['64GB', '256GB'],
  'iPad 10ª Geração': ['64GB', '256GB'],
  'MacBook Pro 16"': ['512GB', '1TB', '2TB', '4TB', '8TB'],
  'MacBook Pro 14"': ['512GB', '1TB', '2TB', '4TB'],
  'MacBook Air 15"': ['256GB', '512GB', '1TB', '2TB'],
  'MacBook Air 13"': ['256GB', '512GB', '1TB', '2TB']
};

// Cores por modelo e armazenamento (para Apple)
const mockColors = {
  'iPhone 15 Pro Max': ['Titânio Natural', 'Titânio Azul', 'Titânio Branco', 'Titânio Preto'],
  'iPhone 15 Pro': ['Titânio Natural', 'Titânio Azul', 'Titânio Branco', 'Titânio Preto'],
  'iPhone 15 Plus': ['Rosa', 'Amarelo', 'Verde', 'Azul', 'Preto'],
  'iPhone 15': ['Rosa', 'Amarelo', 'Verde', 'Azul', 'Preto'],
  'iPhone 14 Pro Max': ['Roxo Profundo', 'Dourado', 'Prata', 'Preto Espacial'],
  'iPhone 14 Pro': ['Roxo Profundo', 'Dourado', 'Prata', 'Preto Espacial'],
  'iPhone 14': ['Roxo', 'Azul', 'Midnight', 'Starlight', 'Product Red'],
  'iPhone 13': ['Rosa', 'Azul', 'Midnight', 'Starlight', 'Product Red'],
  'iPad Pro 12.9"': ['Cinza Espacial', 'Prata'],
  'iPad Pro 11"': ['Cinza Espacial', 'Prata'],
  'iPad Air 5ª Geração': ['Cinza Espacial', 'Rosa', 'Roxo', 'Azul', 'Starlight'],
  'iPad 10ª Geração': ['Azul', 'Rosa', 'Amarelo', 'Prata'],
  'MacBook Pro 16"': ['Cinza Espacial', 'Prata'],
  'MacBook Pro 14"': ['Cinza Espacial', 'Prata'],
  'MacBook Air 15"': ['Midnight', 'Starlight', 'Cinza Espacial', 'Prata'],
  'MacBook Air 13"': ['Midnight', 'Starlight', 'Cinza Espacial', 'Prata'],
  'AirPods Pro 2ª Geração': ['Branco'],
  'AirPods 3ª Geração': ['Branco'],
  'AirPods Max': ['Cinza Espacial', 'Prata', 'Rosa', 'Verde', 'Azul Céu'],
  'Apple Watch Ultra 2': ['Titânio Natural'],
  'Apple Watch Series 9': ['Midnight', 'Starlight', 'Rosa', 'Product Red'],
  'Apple Watch SE': ['Midnight', 'Starlight', 'Prata']
};

// Descrições pré-cadastradas para produtos genéricos
const mockProductDescriptions = [
  'Capinha Silicone Premium',
  'Capinha Transparente Anti-Impacto',
  'Capinha Couro Magnética',
  'Película Vidro Temperado',
  'Película Hidrogel',
  'Película Privacidade',
  'Carregador USB-C 20W',
  'Carregador Lightning',
  'Carregador Wireless',
  'Power Bank 10000mAh',
  'Cabo USB-C para Lightning',
  'Cabo USB-C para USB-C',
  'Adaptador Lightning para P2',
  'Suporte Veicular Magnético',
  'Fone de Ouvido Bluetooth',
  'Smartwatch',
  'Tablet Android',
  'Smartphone Android'
];

export default function PurchaseModal({ 
  isOpen, 
  onClose, 
  onPurchaseSaved, 
  editingPurchase, 
  isTradeIn = false,
  onTradeInValue 
}: PurchaseModalProps) {
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    supplierId: editingPurchase?.supplierId || '',
    purchaseDate: editingPurchase?.purchaseDate || new Date().toISOString().split('T')[0],
    invoiceNumber: editingPurchase?.invoiceNumber || '',
    observations: editingPurchase?.observations || ''
  });

  const [productType, setProductType] = useState<'apple' | 'product'>(
    editingPurchase?.productType || 'apple'
  );
  const [selectedSupplier, setSelectedSupplier] = useState(editingPurchase?.supplierId || '');
  const [supplierSearchTerm, setSupplierSearchTerm] = useState(
    editingPurchase ? mockSuppliers.find(s => s.id === editingPurchase.supplierId)?.name || '' : ''
  );
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(
    editingPurchase?.selectedBrand || (editingPurchase?.productType === 'apple' ? '1' : '')
  );
  const [selectedCategory, setSelectedCategory] = useState(editingPurchase?.selectedCategory || '');
  const [selectedModel, setSelectedModel] = useState(editingPurchase?.selectedModel || '');
  const [selectedStorage, setSelectedStorage] = useState(editingPurchase?.selectedStorage || '');
  const [selectedColor, setSelectedColor] = useState(editingPurchase?.selectedColor || '');
  const [selectedDescription, setSelectedDescription] = useState(editingPurchase?.selectedDescription || '');
  const [productVariations, setProductVariations] = useState<string[]>(editingPurchase?.productVariations || []);
  const [currentVariation, setCurrentVariation] = useState('');
  const [hasImeiSn, setHasImeiSn] = useState<'sim' | 'nao'>('sim');
  
  const [currentItem, setCurrentItem] = useState({
    warranty: '1 ano',
    location: '',
    condition: 'Novo',
    quantity: 1,
    costPrice: '',
    additionalCost: ''
  });

  const [items, setItems] = useState<PurchaseItem[]>(editingPurchase?.items || []);
  const [additionalCost, setAdditionalCost] = useState(editingPurchase?.additionalCost || 0);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // Efeito para inicializar o formulário quando editingPurchase muda
  useEffect(() => {
    if (editingPurchase) {
      setFormData({
        supplierId: editingPurchase.supplierId || '',
        purchaseDate: editingPurchase.purchaseDate || new Date().toISOString().split('T')[0],
        invoiceNumber: editingPurchase.invoiceNumber || '',
        observations: editingPurchase.observations || ''
      });
      setProductType(editingPurchase.productType || 'apple');
      setSelectedSupplier(editingPurchase.supplierId || '');
      setSupplierSearchTerm(mockSuppliers.find(s => s.id === editingPurchase.supplierId)?.name || '');
      setSelectedBrand(editingPurchase.selectedBrand || (editingPurchase.productType === 'apple' ? '1' : ''));
      setSelectedCategory(editingPurchase.selectedCategory || '');
      setSelectedModel(editingPurchase.selectedModel || '');
      setSelectedStorage(editingPurchase.selectedStorage || '');
      setSelectedColor(editingPurchase.selectedColor || '');
      setSelectedDescription(editingPurchase.selectedDescription || '');
      setProductVariations(editingPurchase.productVariations || []);

      // Inicializa items corretamente, calculando totalPrice para itens existentes
      const initializedItems = editingPurchase.items.map((item: any) => {
        const quantity = item.quantity || 0;
        const finalPrice = item.finalPrice || 0;
        return {
          ...item,
          quantity: quantity,
          costPrice: item.costPrice || 0,
          finalPrice: finalPrice,
          totalPrice: finalPrice * quantity, // Calcula totalPrice para itens existentes
        };
      });
      setItems(initializedItems);
      setAdditionalCost(editingPurchase.additionalCost || 0);
    } else {
      // Resetar formulário para nova compra
      setFormData({
        supplierId: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        invoiceNumber: '',
        observations: ''
      });
      setProductType('apple');
      setSelectedSupplier('');
      setSupplierSearchTerm('');
      setSelectedBrand('1'); // Default to Apple brand ID
      setSelectedCategory('');
      setSelectedModel('');
      setSelectedStorage('');
      setSelectedColor('');
      setSelectedDescription('');
      setProductVariations([]);
      setItems([]);
      setAdditionalCost(0);
    }
  }, [editingPurchase]);


  const filteredSuppliers = mockSuppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
  );
  
  const availableCategories = selectedBrand ? mockCategories[selectedBrand as keyof typeof mockCategories] || [] : [];
  const availableModels = selectedCategory ? mockModels[selectedCategory as keyof typeof mockModels] || [] : [];
  const availableStorage = selectedModel ? mockStorage[selectedModel as keyof typeof mockStorage] || [] : [];
  const availableColors = selectedModel ? mockColors[selectedModel as keyof typeof mockColors] || [] : [];

  const resetCurrentItem = () => {
    // Preservar seleções feitas para facilitar cadastro de produtos similares
    setCurrentItem({
      ...currentItem,  // Manter configurações atuais
      quantity: 1,     // Resetar apenas quantidade
      costPrice: '',   // Resetar apenas preço
      additionalCost: '' // Resetar apenas custo adicional
    });
    
    // Para produtos não-Apple, resetar descrição e variações
    if (productType !== 'apple') {
      setSelectedDescription('');
      setProductVariations([]);
      setCurrentVariation('');
    }
  };

  const getProductDescription = () => {
    if (productType === 'apple') {
      if (!selectedModel) return '';
      let description = selectedModel;
      if (selectedStorage) description += ` ${selectedStorage}`;
      if (selectedColor) description += ` ${selectedColor}`;
      return description;
    } else {
      if (!selectedDescription) return '';
      let description = selectedDescription;
      if (productVariations.length > 0) {
        description += ` - ${productVariations.join(', ')}`;
      }
      return description;
    }
  };

  const addItem = () => {
    const description = getProductDescription();
    
    if (!description || !currentItem.costPrice || !selectedSupplier) {
      showError('Campos obrigatórios', 'Preencha todos os campos obrigatórios: fornecedor, descrição do produto e preço de custo');
      return;
    }

    const costPrice = parseCurrencyBR(currentItem.costPrice);
    const itemSpecificAdditionalCost = parseCurrencyBR(currentItem.additionalCost); // Renomeado para clareza
    const quantity = currentItem.quantity;

    if (costPrice <= 0) {
      showError('Valores inválidos', 'Preço de custo deve ser maior que zero');
      return;
    }

    const finalPrice = costPrice + itemSpecificAdditionalCost; // Preço final unitário
    const totalPrice = finalPrice * quantity; // Total para esta linha de item

    const hasImeiSerial = hasImeiSn === 'sim';

    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      description,
      quantity,
      costPrice,
      finalPrice, // Usar o finalPrice calculado
      totalPrice,
      condition: currentItem.condition,
      location: currentItem.location,
      warranty: currentItem.warranty,
      hasImeiSerial
    };

    setItems([...items, newItem]);
    resetCurrentItem();

    // Se for trade-in, passa o valor para o componente pai
    if (isTradeIn && onTradeInValue) {
      onTradeInValue(costPrice);
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subtotal + additionalCost;

  // Gerar código localizador único
  const generateLocatorCode = (): string => {
    const prefix = 'LOC';
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      showError('Nenhum item', 'Adicione pelo menos um item');
      return;
    }

    if (!selectedSupplier) {
      showError('Fornecedor obrigatório', 'Selecione um fornecedor');
      return;
    }

    // Generate unique SKUs for each item
    const itemsWithSkus = items.map((item, index) => ({
      ...item,
      sku: editingPurchase ? item.sku || `#${128 + index}` : `#${128 + Math.floor(Math.random() * 9000) + 1000}`
    }));

    const supplierName = mockSuppliers.find(s => s.id === selectedSupplier)?.name || 'Fornecedor';
    const locatorCode = editingPurchase?.locatorCode || generateLocatorCode();
    
    const purchaseData = {
      id: editingPurchase?.id || Date.now().toString(),
      locatorCode,
      supplierId: selectedSupplier,
      supplierName,
      purchaseDate: formData.purchaseDate,
      invoiceNumber: formData.invoiceNumber,
      observations: formData.observations,
      items: itemsWithSkus,
      subtotal,
      additionalCost,
      total,
      status: editingPurchase?.status || 'partial',
      createdAt: editingPurchase?.createdAt || new Date().toISOString(),
      // Salvar seleções para edição
      productType,
      selectedBrand,
      selectedCategory,
      selectedModel,
      selectedStorage,
      selectedColor,
      selectedDescription,
      productVariations
    };

    // Callback para salvar a compra
    if (onPurchaseSaved) {
      onPurchaseSaved(purchaseData);
    }
    
    showSuccess(
      `${editingPurchase ? 'Compra atualizada' : isTradeIn ? 'Trade-in registrado' : 'Compra registrada'} com sucesso!`,
      `Localizador: ${locatorCode} - ${itemsWithSkus.length} itens ${editingPurchase ? 'atualizados' : 'registrados'}`
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}
        style={{ animation: 'modalSlideIn 0.3s ease-out forwards' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 flex justify-between items-center rounded-t-xl">
          <h2 className="text-lg font-bold flex items-center">
            <Package className="mr-2" size={20} />
            {isTradeIn ? 'Trade-in: Entrada no Estoque' : editingPurchase ? 'Editar Compra' : 'Lançamento de Compras'}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className={`p-4 ${theme === 'dark' ? 'text-white' : ''}`}>
          {/* Supplier Selection and Registration Note */}
          <div className="mb-3">
            <div className="grid grid-cols-2 gap-3 items-start">
              {/* Supplier Search */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  Fornecedor *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Buscar fornecedor..."
                      value={supplierSearchTerm}
                      onChange={(e) => {
                        setSupplierSearchTerm(e.target.value);
                        setShowSupplierDropdown(true);
                        if (!e.target.value) {
                          setSelectedSupplier('');
                        }
                      }}
                      onFocus={() => setShowSupplierDropdown(true)}
                      className={`w-full px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    {showSupplierDropdown && supplierSearchTerm && filteredSuppliers.length > 0 && (
                      <div className={`absolute z-10 w-full mt-1 border rounded shadow-lg max-h-32 overflow-y-auto ${
                        theme === 'dark' 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-white border-slate-300'
                      }`}>
                        {filteredSuppliers.map(supplier => (
                          <button
                            key={supplier.id}
                            type="button"
                            onClick={() => {
                              setSelectedSupplier(supplier.id);
                              setSupplierSearchTerm(supplier.name);
                              setShowSupplierDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 transition-colors text-xs ${
                              theme === 'dark' 
                                ? 'hover:bg-slate-600 text-white' 
                                : 'hover:bg-blue-50 text-slate-900'
                            }`}
                          >
                            {supplier.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSupplierModalOpen(true)}
                    className="px-2 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center justify-center"
                    title="Adicionar novo fornecedor"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Registration Note */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  Cadastros
                </label>
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
                      <button 
                        type="button" // Adicionado type="button"
                        onClick={() => window.open('/administration/product-structure', '_blank')}
                        className={`underline font-medium transition-colors ${
                          theme === 'dark' 
                            ? 'hover:text-blue-200' 
                            : 'hover:text-blue-900'
                        }`}
                      >
                        clique aqui
                      </button>
                      .
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Type Selection */}
          <div className="mb-3">
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="productType"
                  value="apple"
                  checked={productType === 'apple'}
                  onChange={(e) => {
                    setProductType(e.target.value as 'apple' | 'product');
                    if (e.target.value === 'apple') {
                      setSelectedBrand('1'); // Apple ID
                      setSelectedCategory(''); // Resetar categoria para mostrar opções
                    } else {
                      setSelectedBrand('');
                      setSelectedDescription('');
                      setProductVariations([]);
                    }
                  }}
                  className="mr-1"
                />
                <span className={`font-medium text-xs ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                }`}>Apple</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="productType"
                  value="product"
                  checked={productType === 'product'}
                  onChange={(e) => {
                    setProductType(e.target.value as 'apple' | 'product');
                    if (e.target.value === 'apple') {
                      setSelectedBrand('1'); // Apple ID
                      setSelectedCategory(''); // Resetar categoria para mostrar opções
                    } else {
                      setSelectedBrand('');
                      setSelectedDescription('');
                      setProductVariations([]);
                    }
                  }}
                  className="mr-1"
                />
                <span className={`font-medium text-xs ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                }`}>Produto</span>
              </label>
            </div>
          </div>

          {/* Compact Row - Garantia, Local e Condição */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Garantia
              </label>
              <select
                value={currentItem.warranty}
                onChange={(e) => setCurrentItem({...currentItem, warranty: e.target.value})}
                className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="1 ano">1 ano</option>
                <option value="6 meses">6 meses</option>
                <option value="3 meses">3 meses</option>
                <option value="Sem garantia">Sem garantia</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Local estoque
              </label>
              <select
                value={currentItem.location}
                onChange={(e) => setCurrentItem({...currentItem, location: e.target.value})}
                className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">Selecione</option>
                {mockStockLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Condição
              </label>
              <select
                value={currentItem.condition}
                onChange={(e) => setCurrentItem({...currentItem, condition: e.target.value})}
                className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="Novo">Novo</option>
                <option value="Seminovo">Seminovo</option>
                <option value="Usado">Usado</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                IMEI/SN?
              </label>
              <div className="flex gap-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasImeiSn"
                    value="sim"
                    checked={hasImeiSn === 'sim'}
                    onChange={(e) => setHasImeiSn(e.target.value as 'sim' | 'nao')}
                    className="mr-1"
                  />
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>Sim</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasImeiSn"
                    value="nao"
                    checked={hasImeiSn === 'nao'}
                    onChange={(e) => setHasImeiSn(e.target.value as 'sim' | 'nao')}
                    className="mr-1"
                  />
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>Não</span>
                </label>
              </div>
            </div>
          </div>

          {/* Product Form */}
          <div className="space-y-3 mb-4">
            {/* Product Registration */}
            <div className="space-y-3">
              {productType === 'apple' ? (
                // Fluxo Apple - todos os filtros em uma única linha
                <>
                  {/* Linha única compacta - Marca, Categoria, Modelos, Armazenamento, Cor */}
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Marca*
                      </label>
                      <select
                        value={selectedBrand}
                        onChange={(e) => {
                          setSelectedBrand(e.target.value);
                          setSelectedCategory('');
                          setSelectedModel('');
                          setSelectedStorage('');
                          setSelectedColor('');
                        }}
                        className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          theme === 'dark'
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="">Marca</option>
                        {getAvailableBrands(productType).map(brand => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Categoria*
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedModel('');
                          setSelectedStorage('');
                          setSelectedColor('');
                        }}
                        className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          theme === 'dark'
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        disabled={!selectedBrand}
                      >
                        <option value="">Categoria</option>
                        {availableCategories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Modelos*
                      </label>
                      <select
                        value={selectedModel}
                        onChange={(e) => {
                          setSelectedModel(e.target.value);
                          setSelectedStorage('');
                          setSelectedColor('');
                        }}
                        className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          theme === 'dark'
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        disabled={!selectedCategory}
                      >
                        <option value="">Modelo</option>
                        {availableModels.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Armazenamento
                      </label>
                      <select
                        value={selectedStorage}
                        onChange={(e) => {
                          setSelectedStorage(e.target.value);
                          setSelectedColor('');
                        }}
                        className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          theme === 'dark'
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        disabled={!selectedModel || availableStorage.length === 0}
                      >
                        <option value="">Armazenamento</option> {/* Alterado para exibir 'Armazenamento' */}
                        {availableStorage.map(storage => (
                          <option key={storage} value={storage}>{storage}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Cor
                      </label>
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          theme === 'dark'
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        disabled={!selectedModel || availableColors.length === 0}
                      >
                        <option value="">Cor</option> {/* Alterado para exibir 'Cor' */}
                        {availableColors.map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                // Fluxo Produto compacto
                <>
                  {/* Primeira linha compacta - Marca, Categoria, Descrição */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Marca*
                      </label>
                      <select
                        value={selectedBrand}
                        onChange={(e) => {
                          setSelectedBrand(e.target.value);
                          setSelectedCategory('');
                          setSelectedDescription('');
                          setProductVariations([]);
                        }}
                        className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          theme === 'dark'
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="">Marca</option>
                        {getAvailableBrands(productType).map(brand => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>

                    {selectedBrand && (
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Categoria*
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setSelectedDescription('');
                            setProductVariations([]);
                          }}
                          className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="">Categoria</option>
                          {availableCategories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {selectedCategory && (
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Descrição*
                        </label>
                        <select
                          value={selectedDescription}
                          onChange={(e) => setSelectedDescription(e.target.value)}
                          className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="">Descrição</option>
                          {mockProductDescriptions.map(description => (
                            <option key={description} value={description}>{description}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Variações compactas */}
                  {selectedDescription && (
                    <div className="mb-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={currentVariation}
                          onChange={(e) => setCurrentVariation(e.target.value)}
                          className={`flex-1 px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          placeholder="Variação (ex: 128GB, Azul)"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (currentVariation.trim()) {
                              setProductVariations([...productVariations, currentVariation.trim()]);
                              setCurrentVariation('');
                            }
                          }}
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      
                      {productVariations.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {productVariations.map((variation, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs flex items-center gap-1"
                            >
                              {variation}
                              <button
                                type="button"
                                onClick={() => setProductVariations(productVariations.filter((_, i) => i !== index))}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X size={8} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Linha de Quantidade, Preço de Custo e Custo Adicional - compacta */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                    className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Preço de Custo *
                  </label>
                  <div className="relative">
                    <span className={`absolute left-1.5 top-1/2 transform -translate-y-1/2 text-xs ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>R$</span>
                    <input
                      type="text"
                      value={currentItem.costPrice}
                      onChange={(e) => {
                        const formattedValue = formatCurrencyInput(e.target.value);
                        setCurrentItem({...currentItem, costPrice: formattedValue});
                      }}
                      className={`w-full pl-6 pr-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Custo Adicional
                  </label>
                  <div className="relative">
                    <span className={`absolute left-1.5 top-1/2 transform -translate-y-1/2 text-xs ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>R$</span>
                    <input
                      type="text"
                      value={currentItem.additionalCost}
                      onChange={(e) => {
                        const formattedValue = formatCurrencyInput(e.target.value);
                        setCurrentItem({...currentItem, additionalCost: formattedValue});
                      }}
                      className={`w-full pl-6 pr-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>

              {/* Botão Adicionar Item compacto */}
              <button
                onClick={addItem}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-1.5 rounded hover:shadow-lg transition-all duration-200 flex items-center justify-center font-medium text-xs"
              >
                ADICIONAR ITEM
              </button>
            </div>
          </div>

          {/* Items Table - compacta */}
          <div className="mb-4">
            <div className={`rounded p-3 ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold text-sm flex items-center ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  <Package className="mr-2" size={16} />
                  Produtos
                </h3>
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>Total: {items.length}</span>
              </div>

              {items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`text-left text-xs font-medium border-b ${
                        theme === 'dark' 
                          ? 'text-slate-300 border-slate-600' 
                          : 'text-slate-700 border-slate-200'
                      }`}>
                        <th className="pb-1">#</th>
                        <th className="pb-1">Descrição</th>
                        <th className="pb-1">Qtd</th>
                        <th className="pb-1">Preço (un)</th>
                        <th className="pb-1">Total</th>
                        <th className="pb-1 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id} className={`border-b ${
                          theme === 'dark' ? 'border-slate-600' : 'border-slate-100'
                        }`}>
                          <td className="py-1.5 text-xs">{index + 1}</td>
                          <td className="py-1.5">
                            <div>
                              <div className={`font-medium text-xs ${
                                theme === 'dark' ? 'text-white' : 'text-slate-800'
                              }`}>{item.description}</div>
                              <div className={`text-xs ${
                                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                              }`}>
                                {item.condition} • {item.warranty}
                              </div>
                            </div>
                          </td>
                          <td className="py-1.5 text-xs">{item.quantity}</td>
                          <td className="py-1.5 text-xs">R$ {formatCurrencyBR(item.costPrice)}</td>
                          <td className="py-1.5 text-xs font-medium">R$ {formatCurrencyBR(item.totalPrice)}</td>
                          <td className="py-1.5 text-center">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Remover item"
                            >
                              <Trash2 size={12} className="text-red-600" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={`text-center py-6 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <Package size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Nenhum item adicionado</p>
                </div>
              )}
            </div>
          </div>

          {/* Totals compactos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Subtotal
              </label>
              <div className={`px-3 py-1.5 rounded font-medium text-sm ${
                theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-800'
              }`}>
                R$ {formatCurrencyBR(subtotal)}
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Custo Adicional
              </label>
              <div className="relative">
                <span className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-xs ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>R$</span>
                <input
                  type="text"
                  value={formatCurrencyInput(additionalCost.toString())}
                  onChange={(e) => {
                    const formattedValue = formatCurrencyInput(e.target.value);
                    setAdditionalCost(parseCurrencyBR(formattedValue));
                  }}
                  className={`w-full pl-6 pr-3 py-1.5 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Total
              </label>
              <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded font-bold text-sm">
                R$ {formatCurrencyBR(total)}
              </div>
            </div>
          </div>

          {/* Action Buttons compactos */}
          <div className="flex justify-between gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 border rounded hover:bg-slate-50 transition-colors text-sm ${
                theme === 'dark'
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 text-slate-700'
              }`}
            >
              Voltar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:shadow-lg transition-all duration-200 flex items-center text-sm"
            >
              <Save className="mr-2" size={14} />
              {editingPurchase ? 'Atualizar' : isTradeIn ? 'Confirmar Trade-in' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>

      {/* Supplier Modal */}
      <CustomerModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        type="supplier"
      />
    </div>
  );
}