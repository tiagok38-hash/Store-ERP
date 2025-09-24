import { useState } from 'react';
import { 
  X, 
  Plus,
  Trash2, 
  FileText
} from 'lucide-react';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { useTheme } from '@/react-app/hooks/useTheme';
import { formatCurrencyInput, parseCurrencyBR } from '@/react-app/utils/currency';
import PurchaseModal from '@/react-app/components/PurchaseModal';
import CustomerModal from '@/react-app/components/CustomerModal';
import ProductModal from '@/react-app/components/ProductModal';

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  imei?: string;
}

interface PaymentMethodItem {
  id: string;
  type: string;
  typeLabel: string;
  taxes: number;
  taxAmount: number;
  installments: string;
  amount: number;
}

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockProducts = [
  { 
    id: '66', 
    sku: '66',
    name: 'iPhone 13 Pro 128GB - Gold', 
    price: 3499.00,
    requiresImei: true,
    stock: 1,
    imei: '358823347531785',
    condition: 'Seminovo',
    batteryHealth: '84%'
  },
  { 
    id: '67', 
    sku: '67',
    name: 'Samsung Galaxy S22 256GB', 
    price: 2800.00,
    requiresImei: true,
    stock: 3
  },
  { 
    id: '68', 
    sku: '68',
    name: 'Capinha iPhone 13 Pro', 
    price: 45.90,
    requiresImei: false,
    stock: 25
  }
];

// Mock de clientes para busca em tempo real
const mockCustomers = [
  { id: '1', name: 'Joao Marcos Fenix', phone: '(81) 99724-8893', email: 'joao@email.com' },
  { id: '2', name: 'Maria Silva Santos', phone: '(11) 98765-4321', email: 'maria@email.com' },
  { id: '3', name: 'Pedro Oliveira', phone: '(21) 97654-3210', email: 'pedro@email.com' },
  { id: '4', name: 'Ana Costa Lima', phone: '(85) 96543-2109', email: 'ana@email.com' },
  { id: '5', name: 'Carlos Eduardo', phone: '(47) 95432-1098', email: 'carlos@email.com' },
  { id: '6', name: 'Fernanda Almeida', phone: '(62) 94321-0987', email: 'fernanda@email.com' }
];

// Mock de vendedores
const mockSellers = [
  { id: '1', name: 'João Vendedor' },
  { id: '2', name: 'Maria Silva' },
  { id: '3', name: 'Pedro Santos' },
  { id: '4', name: 'Ana Costa' },
  { id: '5', name: 'Carlos Ferreira' },
  { id: '6', name: 'Fernanda Lima' }
];

const paymentOptions = [
  { id: 'pix', label: 'Pix', icon: '💳' },
  { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { id: 'credito', label: 'Crédito', icon: '💳' },
  { id: 'debito', label: 'Débito', icon: '💳' },
  { id: 'aparelho', label: 'Aparelho na Troca', icon: '🔄' },
  { id: 'crediario', label: 'Crediário', icon: '📋' }
];

const warrantyTerms = [
  'IPHONE SEMINOVO',
  'Garantia de 1 ano para defeitos de fábrica',
  'Garantia de 6 meses limitada',
  'Garantia de 3 meses para seminovos'
];

export default function SalesModal({ isOpen, onClose }: SalesModalProps) {
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'digital' | 'barcode'>('digital');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [seller, setSeller] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cardTaxes, setCardTaxes] = useState(0.00);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [warrantyTerm, setWarrantyTerm] = useState('');
  const [observations, setObservations] = useState('');
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [tradeInValue, setTradeInValue] = useState(0);

  // Filtro de clientes em tempo real
  const filteredCustomers = mockCustomers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone.includes(customerSearchTerm) ||
    customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const filteredProducts = mockProducts.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return product.name.toLowerCase().includes(searchLower) ||
           product.sku.toLowerCase().includes(searchLower);
  });

  const addToCart = (product: typeof mockProducts[0]) => {
    const newItem: CartItem = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: 1,
      imei: product.requiresImei ? product.imei : undefined
    };
    setCart([...cart, newItem]);
    setSearchTerm('');
    showSuccess('Produto Adicionado', `${product.name} foi adicionado ao carrinho`);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    const productName = newCart[index].name;
    newCart.splice(index, 1);
    setCart(newCart);
    showSuccess('Produto Removido', `${productName} foi removido do carrinho`);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    setCart(newCart);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotal = () => {
    return getSubtotal() - discountAmount + cardTaxes;
  };

  const addPaymentMethod = (type: string) => {
    if (type === 'aparelho') {
      setIsTradeInModalOpen(true);
      return;
    }

    const paymentOption = paymentOptions.find(p => p.id === type);
    if (!paymentOption) return;

    const remaining = getTotal() - paymentMethods.reduce((sum, p) => sum + p.amount, 0);
    
    const newPayment: PaymentMethodItem = {
      id: Date.now().toString(),
      type: type,
      typeLabel: paymentOption.label,
      taxes: type === 'credito' ? 11.82 : 0,
      taxAmount: type === 'credito' ? 194.23 : 0,
      installments: type === 'credito' ? '10x de R$ 164,32' : '-',
      amount: Math.min(remaining, type === 'credito' ? 1643.23 : remaining)
    };

    setPaymentMethods([...paymentMethods, newPayment]);
    setSelectedPaymentMethod('');
  };

  const handleTradeInValue = (value: number) => {
    // Adiciona o valor do trade-in como forma de pagamento
    const newPayment: PaymentMethodItem = {
      id: Date.now().toString(),
      type: 'aparelho',
      typeLabel: 'Aparelho na Troca',
      taxes: 0,
      taxAmount: 0,
      installments: '-',
      amount: value
    };

    setPaymentMethods([...paymentMethods, newPayment]);
    setTradeInValue(value);
    setIsTradeInModalOpen(false);
  };

  const removePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(p => p.id !== id));
  };

  const getTotalPaid = () => {
    return paymentMethods.reduce((sum, p) => sum + p.amount, 0);
  };

  const getRemainingAmount = () => {
    return Math.max(0, getTotal() - getTotalPaid());
  };

  const handleSave = () => {
    if (cart.length === 0) {
      showError('Carrinho Vazio', 'Adicione produtos ao carrinho antes de salvar');
      return;
    }
    
    if (!seller.trim()) {
      showError('Vendedor Obrigatório', 'Selecione um vendedor antes de finalizar a venda');
      return;
    }
    
    if (!warrantyTerm.trim()) {
      showError('Termo de Garantia Obrigatório', 'Selecione um termo de garantia antes de finalizar a venda');
      return;
    }
    
    if (getRemainingAmount() > 0.01) {
      showError('Pagamento Incompleto', `Ainda faltam R$ ${getRemainingAmount().toFixed(2)} para completar o pagamento.`);
      return;
    }
    
    showSuccess('Venda Salva', 'A venda foi salva com sucesso!');
    onClose();
  };

  const handleDiscountChange = (value: string) => {
    const formattedValue = formatCurrencyInput(value);
    setDiscount(formattedValue);
    setDiscountAmount(parseCurrencyBR(formattedValue));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <FileText className="mr-2" size={24} />
            Nova venda
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Dados da venda */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              📊 Dados da venda
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>Data da venda</label>
                <input
                  type="text"
                  value="13/09/2025"
                  readOnly
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-gray-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>Cliente*</label>
                <div className="flex">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customerSearchTerm}
                      onChange={(e) => {
                        setCustomerSearchTerm(e.target.value);
                        setShowCustomerDropdown(true);
                        if (!e.target.value) {
                          setSelectedCustomer(null);
                        }
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      placeholder="Buscar cliente..."
                      className={`w-full px-3 py-2 border rounded-l-lg text-sm ${
                        theme === 'dark'
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    {showCustomerDropdown && customerSearchTerm && filteredCustomers.length > 0 && (
                      <div className={`absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-48 overflow-y-auto ${
                        theme === 'dark' 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-white border-slate-300'
                      }`}>
                        {filteredCustomers.map(customer => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setCustomerSearchTerm(customer.name);
                              setShowCustomerDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 transition-colors text-sm ${
                              theme === 'dark' 
                                ? 'hover:bg-slate-600 text-white' 
                                : 'hover:bg-blue-50 text-slate-900'
                            }`}
                          >
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className={`text-xs ${
                                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                              }`}>
                                {customer.phone} • {customer.email}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setIsCustomerModalOpen(true)}
                    className={`px-3 py-2 border-t border-r border-b rounded-r-lg ${
                      theme === 'dark'
                        ? 'bg-slate-600 border-slate-600 text-white hover:bg-slate-500'
                        : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    } transition-colors`} title="Adicionar novo cliente">
                    <Plus size={16} />
                  </button>
                </div>
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {selectedCustomer ? `Selecionado: ${selectedCustomer.name}` : 'Digite para buscar...'}
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>Vendedor*</label>
                <select
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="">Selecione um vendedor...</option>
                  {mockSellers.map(seller => (
                    <option key={seller.id} value={seller.id}>{seller.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Busca de produto */}
            <div className="mb-4">
              <p className={`text-sm mb-2 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Selecione a forma que deseja buscar o produto
              </p>
              <div className="flex gap-4 mb-3">
                <label className={`flex items-center ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="searchType"
                    value="digital"
                    checked={searchType === 'digital'}
                    onChange={(e) => setSearchType(e.target.value as 'digital')}
                    className="mr-2"
                  />
                  Digitar
                </label>
                <label className={`flex items-center ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="searchType"
                    value="barcode"
                    checked={searchType === 'barcode'}
                    onChange={(e) => setSearchType(e.target.value as 'barcode')}
                    className="mr-2"
                  />
                  Leitor Código de Barras (beta)
                </label>
              </div>
            </div>
          </div>

          {/* Produtos / Serviços */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              📦 Produtos / Serviços
            </h3>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o Produto, IMEI ou Serial Number"
                className={`flex-1 px-3 py-2 border rounded-l-lg text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <button 
                onClick={() => setIsProductModalOpen(true)}
                className={`px-3 py-2 border-t border-r border-b ${
                  theme === 'dark'
                    ? 'bg-slate-600 border-slate-600 text-white hover:bg-slate-500'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                } transition-colors`} title="Adicionar novo produto">
                <Plus size={16} />
              </button>
              <div className={`flex items-center border-t border-r border-b rounded-r-lg px-2 ${
                theme === 'dark' ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-slate-50'
              }`}>
                <span className={`text-sm mr-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>Qtd:</span>
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  className={`w-16 px-2 py-2 border rounded-lg text-sm text-center ${
                    theme === 'dark'
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {searchTerm && (
              <div className="mb-4 max-h-32 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`p-3 mb-2 border rounded-lg cursor-pointer hover:shadow-md transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-slate-800'
                        }`}>
                          SKU: {product.sku} - {product.name}
                        </p>
                        {product.imei && (
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            IMEI: {product.imei} - {product.condition}, Saúde da bateria: {product.batteryHealth}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        }`}>
                          R$ {product.price.toFixed(2)}
                        </p>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          Qtd: {product.stock}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Products Table */}
            <div className={`border rounded-lg ${
              theme === 'dark' ? 'border-slate-600' : 'border-slate-300'
            }`}>
              <div className={`px-3 py-2 border-b font-medium text-sm ${
                theme === 'dark' 
                  ? 'border-slate-600 bg-slate-700 text-white'
                  : 'border-slate-300 bg-slate-50 text-slate-800'
              }`}>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">Produto(s)</div>
                  <div className="col-span-2 text-center">Qtd.</div>
                  <div className="col-span-3 text-right">Valor</div>
                  <div className="col-span-2 text-center">Ações</div>
                </div>
              </div>

              <div className="p-3">
                {cart.length === 0 ? (
                  <p className={`text-center py-4 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Nenhum produto adicionado
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <p className={`font-medium text-sm ${
                            theme === 'dark' ? 'text-white' : 'text-slate-800'
                          }`}>
                            SKU: {item.sku} - {item.name}
                          </p>
                          {item.imei && (
                            <p className={`text-xs ${
                              theme === 'dark' ? 'text-slate-300' : 'text-slate-500'
                            }`}>
                              IMEI: {item.imei} - Seminovo, Saúde da bateria: 84%
                            </p>
                          )}
                        </div>
                        <div className="col-span-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                            className={`w-16 px-2 py-1 border rounded text-center text-sm ${
                              theme === 'dark'
                                ? 'bg-slate-600 border-slate-500 text-white'
                                : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                        <div className="col-span-3 text-right">
                          <p className={`font-semibold text-sm ${
                            theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          }`}>
                            R$ {item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="col-span-2 text-center">
                          <button
                            onClick={() => removeFromCart(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className={`text-right pt-2 border-t ${
                      theme === 'dark' ? 'border-slate-600' : 'border-slate-200'
                    }`}>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-slate-600'
                      }`}>
                        Total de itens: {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumo e Formas de Pagamento */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              📋 Resumo Financeiro
            </h3>
            
            {/* Resumo financeiro em uma linha */}
            <div className={`flex gap-4 p-4 rounded-lg mb-4 ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
            }`}>
              <div className="flex-1">
                <label className={`block text-xs font-medium mb-1 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>Subtotal</label>
                <div className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  R$ {getSubtotal().toFixed(2)}
                </div>
              </div>
              
              <div className="flex-1">
                <label className={`block text-xs font-medium mb-1 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>Desconto</label>
                <div className="flex items-center">
                  <span className={`text-sm mr-1 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>R$</span>
                  <input
                    type="text"
                    value={discount}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    placeholder="0,00"
                    className={`w-20 px-2 py-1 border rounded text-sm ${
                      theme === 'dark'
                        ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label className={`block text-xs font-medium mb-1 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>Desconto aplicado</label>
                <div className={`text-lg font-semibold text-red-600 ${
                  theme === 'dark' ? 'text-red-400' : ''
                }`}>
                  R$ {discountAmount.toFixed(2)}
                </div>
              </div>
              
              <div className="flex-1">
                <label className={`block text-xs font-medium mb-1 text-green-600 ${
                  theme === 'dark' ? 'text-green-400' : ''
                }`}>Total</label>
                <div className={`text-xl font-bold text-green-600 ${
                  theme === 'dark' ? 'text-green-400' : ''
                }`}>
                  R$ {getTotal().toFixed(2)}
                </div>
              </div>
              
              <div className="flex-1">
                <label className={`block text-xs font-medium mb-1 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>Taxas de cartão</label>
                <div className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  R$ {cardTaxes.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Formas de Pagamento */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  💳 Formas de Pagamentos
                </h4>
                <div className="flex items-center gap-4">
                  {getRemainingAmount() > 0 && (
                    <span className="text-red-500 text-sm font-medium">
                      Falta receber: R$ {getRemainingAmount().toFixed(2)}
                    </span>
                  )}
                  {getRemainingAmount() === 0 && cart.length > 0 && (
                    <span className="text-green-500 text-sm font-medium">Pagamento OK</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {paymentOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => addPaymentMethod(option.id)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>

              {/* Payment Methods Table */}
              <div className={`border rounded-lg ${
                theme === 'dark' ? 'border-slate-600' : 'border-slate-300'
              }`}>
                <div className={`px-3 py-2 border-b font-medium text-sm ${
                  theme === 'dark' 
                    ? 'border-slate-600 bg-slate-700 text-white'
                    : 'border-slate-300 bg-slate-50 text-slate-800'
                }`}>
                  <div className="grid grid-cols-6 gap-2">
                    <div>Forma de pagamento</div>
                    <div>Tipo</div>
                    <div>Taxas</div>
                    <div>Parcelas</div>
                    <div>Valor</div>
                    <div>Ações</div>
                  </div>
                </div>
                <div className="p-3">
                  {paymentMethods.length === 0 ? (
                    <p className={`text-center py-4 text-sm ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Selecione uma forma de pagamento
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {paymentMethods.map((payment) => (
                        <div key={payment.id} className="grid grid-cols-6 gap-2 items-center">
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-white' : 'text-slate-800'
                          }`}>{payment.typeLabel}</div>
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                          }`}>{payment.type === 'credito' ? 'CJ' : '-'}</div>
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {payment.taxes > 0 ? `${payment.taxes}% - R$ ${payment.taxAmount.toFixed(2)}` : '-'}
                          </div>
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                          }`}>{payment.installments}</div>
                          <div className={`text-sm font-semibold ${
                            theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          }`}>R$ {payment.amount.toFixed(2)}</div>
                          <div>
                            <button
                              onClick={() => removePaymentMethod(payment.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Termo de Garantia*:
              </label>
              <select
                value={warrantyTerm}
                onChange={(e) => setWarrantyTerm(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">Selecione um termo de garantia...</option>
                {warrantyTerms.map((term, index) => (
                  <option key={index} value={term}>{term}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Observações
                <span className={`text-xs ml-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                }`}>* Visível em Recibos</span>
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={cart.length === 0 || getRemainingAmount() > 0.01 || !seller.trim() || !warrantyTerm.trim()}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>

      {/* Trade In Modal */}
      <PurchaseModal
        isOpen={isTradeInModalOpen}
        onClose={() => setIsTradeInModalOpen(false)}
        isTradeIn={true}
        onTradeInValue={handleTradeInValue}
      />

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        type="customer"
      />

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </div>
  );
}
