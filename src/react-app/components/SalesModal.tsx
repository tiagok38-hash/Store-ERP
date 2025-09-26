import { useState } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  CreditCard,
  DollarSign,
  Smartphone,
  FileText,
  RefreshCw,
  Check,
  Calculator
} from 'lucide-react';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { useTheme } from '@/react-app/hooks/useTheme';
import { formatCurrencyInput, parseCurrencyBR } from '@/react-app/utils/currency';
import ProductConfirmModal from '@/react-app/components/ProductConfirmModal';
import PurchaseModal from '@/react-app/components/PurchaseModal';
import CustomerModal from '@/react-app/components/CustomerModal';
import ProductModal from '@/react-app/components/ProductModal';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imei?: string;
}

interface PaymentMethod {
  type: 'money' | 'pix' | 'debit' | 'credit' | 'promissory' | 'trade_in';
  amount: number;
  installments?: number;
  withInterest?: boolean;
  interestRate?: number;
  tradeInValue?: number;
  tradeInDevice?: string;
}

interface EnhancedSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockProducts = [
  { 
    id: '1', 
    name: 'iPhone 13 Pro 128GB', 
    price: 3200.00, 
    cost: 2399.40, 
    requiresImei: true,
    sku: 'IPH13P128',
    brand: 'Apple',
    barcode: '7891234567890',
    stock: 5
  },
  { 
    id: '2', 
    name: 'Samsung Galaxy S22 128GB', 
    price: 2800.00, 
    cost: 2179.00, 
    requiresImei: true,
    sku: 'SGS22128',
    brand: 'Samsung',
    barcode: '7891234567891',
    stock: 8
  },
  { 
    id: '3', 
    name: 'Capinha iPhone 13 Pro', 
    price: 45.90, 
    cost: 19.90, 
    requiresImei: false,
    sku: 'CIPH13P',
    brand: 'Genérica',
    barcode: '7891234567892',
    stock: 25
  },
  { 
    id: '4', 
    name: 'Fone Bluetooth JBL', 
    price: 189.90, 
    cost: 120.00, 
    requiresImei: false,
    sku: 'FJBL001',
    brand: 'JBL',
    barcode: '7891234567893',
    stock: 12
  }
];

const mockSellers = [
  { id: '1', name: 'João Vendedor' },
  { id: '2', name: 'Maria Silva' },
  { id: '3', name: 'Pedro Santos' },
  { id: '4', name: 'Ana Costa' },
];

// Taxas de juros simuladas (configuradas pelo admin)
const interestRates = {
  3: 0,
  4: 2.5,
  5: 3.0,
  6: 3.5,
  7: 4.0,
  8: 4.5,
  9: 5.0,
  10: 5.5,
  11: 6.0,
  12: 6.5,
  13: 7.0,
  14: 7.5,
  15: 8.0,
  16: 8.5,
  17: 9.0,
  18: 9.5
};

export default function EnhancedSalesModal({ isOpen, onClose }: EnhancedSalesModalProps) {
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { type: 'money', amount: 0 }
  ]);
  const [imeiInput, setImeiInput] = useState<{[key: string]: string}>({});
  const [selectedSeller, setSelectedSeller] = useState('');
  const [isProductConfirmOpen, setIsProductConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const filteredProducts = mockProducts.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return product.name.toLowerCase().includes(searchLower) ||
           product.sku?.toLowerCase().includes(searchLower) ||
           product.brand?.toLowerCase().includes(searchLower) ||
           product.barcode?.includes(searchTerm);
  });

  const addToCart = (product: typeof mockProducts[0]) => {
    if (product.requiresImei && !imeiInput[product.id]) {
      showError('IMEI Obrigatório', 'Este produto requer um IMEI válido antes de ser adicionado ao carrinho.');
      return;
    }

    const existingItem = cart.find(item => 
      item.id === product.id && 
      (product.requiresImei ? item.imei === imeiInput[product.id] : true)
    );

    if (existingItem && !product.requiresImei) {
      setCart(cart.map(item =>
        item.id === product.id && !item.imei
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      showSuccess('Produto Atualizado', `Quantidade de ${product.name} aumentada para ${existingItem.quantity + 1}`);
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imei: product.requiresImei ? imeiInput[product.id] : undefined
      }]);
      showSuccess('Produto Adicionado', `${product.name} foi adicionado ao carrinho`);
    }

    if (product.requiresImei) {
      setImeiInput({ ...imeiInput, [product.id]: '' });
    }
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setIsProductConfirmOpen(true);
  };

  const confirmAddProduct = () => {
    if (selectedProduct) {
      addToCart(selectedProduct);
    }
  };

  const updateQuantity = (index: number, change: number) => {
    const newCart = [...cart];
    const oldQuantity = newCart[index].quantity;
    newCart[index].quantity += change;
    
    if (newCart[index].quantity <= 0) {
      const productName = newCart[index].name;
      newCart.splice(index, 1);
      showWarning('Produto Removido', `${productName} foi removido do carrinho`);
    }
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    const productName = newCart[index].name;
    newCart.splice(index, 1);
    setCart(newCart);
    showWarning('Produto Removido', `${productName} foi removido do carrinho`);
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalPayments = () => {
    return paymentMethods.reduce((total, method) => total + method.amount, 0);
  };

  const getRemainingAmount = () => {
    return Math.max(0, getCartSubtotal() - getTotalPayments());
  };

  const addPaymentMethod = () => {
    const remaining = getRemainingAmount();
    if (remaining > 0) {
      setPaymentMethods([...paymentMethods, { type: 'money', amount: remaining }]);
    }
  };

  const updatePaymentMethod = (index: number, field: keyof PaymentMethod, value: any) => {
    if (field === 'type' && value === 'trade_in') {
      setIsTradeInModalOpen(true);
      return;
    }
    
    const newMethods = [...paymentMethods];
    newMethods[index] = { ...newMethods[index], [field]: value };
    setPaymentMethods(newMethods);
  };

  const removePaymentMethod = (index: number) => {
    if (paymentMethods.length > 1) {
      const newMethods = paymentMethods.filter((_, i) => i !== index);
      setPaymentMethods(newMethods);
    }
  };

  const calculateInstallmentValue = (amount: number, installments: number, withInterest: boolean) => {
    if (!withInterest || installments <= 3) {
      return amount / installments;
    }
    
    const rate = (interestRates[installments as keyof typeof interestRates] || 0) / 100;
    const totalWithInterest = amount * (1 + rate);
    return totalWithInterest / installments;
  };

  const validateSale = () => {
    if (cart.length === 0) {
      showError('Carrinho Vazio', 'Adicione pelo menos um produto ao carrinho antes de finalizar a venda.');
      return false;
    }

    const remaining = getRemainingAmount();
    if (remaining > 0.01) {
      showError('Pagamento Incompleto', `Ainda faltam R$ ${remaining.toFixed(2)} para completar o pagamento.`);
      return false;
    }

    if (getTotalPayments() > getCartSubtotal() + 0.01) {
      showError('Pagamento Excessivo', 'O valor total dos pagamentos excede o valor da venda.');
      return false;
    }

    return true;
  };

  const handleSale = () => {
    if (!validateSale()) return;

    const sellerName = mockSellers.find(s => s.id === selectedSeller)?.name || 'Vendedor';
    
    showSuccess(
      'Venda Finalizada!', 
      `Cliente: ${customerName || 'Cliente Avulso'} • Total: R$ ${getCartSubtotal().toFixed(2)}`
    );
    
    setCart([]);
    setCustomerName('');
    setPaymentMethods([{ type: 'money', amount: 0 }]);
    setSelectedSeller('1');
    onClose();
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'money': return <DollarSign size={18} />;
      case 'pix': return <Smartphone size={18} />;
      case 'debit': return <CreditCard size={18} />;
      case 'credit': return <CreditCard size={18} />;
      case 'promissory': return <FileText size={18} />;
      case 'trade_in': return <RefreshCw size={18} />;
      default: return <DollarSign size={18} />;
    }
  };

  const getPaymentMethodLabel = (type: string) => {
    const labels = {
      money: 'Dinheiro',
      pix: 'PIX',
      debit: 'Cartão Débito',
      credit: 'Cartão Crédito',
      promissory: 'Promissória',
      trade_in: 'Troca'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div 
          className={`rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}
          style={{ animation: 'modalSlideIn 0.3s ease-out forwards' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center">
              <ShoppingCart className="mr-2" size={28} />
              PDV - Ponto de Venda
            </h2>
            <button
              onClick={onClose}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex h-[calc(90vh-80px)]">
            {/* Products Section */}
            <div className={`flex-1 p-6 border-r ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-400'
                    }`} size={20} />
                    <input
                      type="text"
                      placeholder="Buscar por descrição, IMEI, código de barras, marca, SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <button 
                    onClick={() => setIsProductModalOpen(true)}
                    className={`px-3 py-3 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
                        : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    } transition-colors`} title="Adicionar novo produto">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                {filteredProducts.map((product) => (
                  <div key={product.id} className={`rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    theme === 'dark' ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                  }`} onClick={() => handleProductSelect(product)}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                        {product.name}
                      </h3>
                      <div className="flex items-center text-slate-600">
                        {product.requiresImei && <Smartphone size={16} className="ml-1" />}
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        SKU: {product.sku} | Marca: {product.brand}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Estoque: {product.stock} unidades
                      </p>
                    </div>

                    <p className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      R$ {product.price.toFixed(2)}
                    </p>
                    
                    {product.requiresImei && (
                      <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          placeholder="IMEI obrigatório"
                          value={imeiInput[product.id] || ''}
                          onChange={(e) => setImeiInput({ ...imeiInput, [product.id]: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            theme === 'dark'
                              ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Section */}
            <div className={`w-96 p-6 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                Carrinho de Compras
              </h3>
              
              {/* Customer */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}>Cliente</label>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Nome do cliente (opcional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <button 
                    onClick={() => setIsCustomerModalOpen(true)}
                    className={`px-3 py-2 border-t border-r border-b rounded-r-lg ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-500 text-white hover:bg-slate-600'
                        : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    } transition-colors`} title="Adicionar novo cliente">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Seller Selection */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}>Vendedor</label>
                <select
                  value={selectedSeller}
                  onChange={(e) => setSelectedSeller(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="">Selecione um vendedor...</option>
                  {mockSellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto max-h-48 mb-4">
                {cart.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Carrinho vazio
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item, index) => (
                      <div key={`${item.id}-${item.imei || 'no-imei'}-${index}`} 
                           className={`rounded-lg p-3 shadow ${theme === 'dark' ? 'bg-slate-600' : 'bg-white'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        {item.imei && (
                          <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                            IMEI: {item.imei}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                            className={`w-16 px-2 py-1 border rounded text-center text-sm ${
                              theme === 'dark'
                                ? 'bg-slate-500 border-slate-400 text-white'
                                : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                          <span className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    Formas de Pagamento
                  </h4>
                  <button
                    onClick={addPaymentMethod}
                    className="p-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    disabled={getRemainingAmount() <= 0}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="space-y-3 max-h-32 overflow-y-auto">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      theme === 'dark' ? 'bg-slate-600 border-slate-500' : 'bg-white border-slate-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(method.type)}
                          <select
                            value={method.type}
                            onChange={(e) => updatePaymentMethod(index, 'type', e.target.value)}
                            className={`text-sm border-none bg-transparent focus:outline-none ${
                              theme === 'dark' ? 'text-white' : 'text-slate-800'
                            }`}
                          >
                            <option value="money">Dinheiro</option>
                            <option value="pix">PIX</option>
                            <option value="debit">Cartão Débito</option>
                            <option value="credit">Cartão Crédito</option>
                            <option value="promissory">Promissória</option>
                            <option value="trade_in">Troca</option>
                          </select>
                        </div>
                        {paymentMethods.length > 1 && (
                          <button
                            onClick={() => removePaymentMethod(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="0,00"
                          value={method.amount ? formatCurrencyInput(method.amount.toString()) : ''}
                          onChange={(e) => {
                            const formatted = formatCurrencyInput(e.target.value);
                            const numeric = parseCurrencyBR(formatted);
                            updatePaymentMethod(index, 'amount', numeric);
                          }}
                          className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-green-500 ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-500 text-white'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />

                        {method.type === 'credit' && (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <select
                                value={method.installments || 1}
                                onChange={(e) => updatePaymentMethod(index, 'installments', parseInt(e.target.value))}
                                className={`flex-1 px-2 py-1 border rounded text-sm ${
                                  theme === 'dark'
                                    ? 'bg-slate-700 border-slate-500 text-white'
                                    : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              >
                                {Array.from({ length: 18 }, (_, i) => i + 1).map(i => (
                                  <option key={i} value={i}>{i}x</option>
                                ))}
                              </select>
                              <label className="flex items-center gap-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={method.withInterest || false}
                                  onChange={(e) => updatePaymentMethod(index, 'withInterest', e.target.checked)}
                                  className="rounded"
                                />
                                Juros
                              </label>
                            </div>
                            {method.installments && method.amount && (
                              <p className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                {method.installments}x de R$ {calculateInstallmentValue(
                                  method.amount, 
                                  method.installments, 
                                  method.withInterest || false
                                ).toFixed(2)}
                                {method.withInterest && method.installments > 3 && (
                                  <span className="text-orange-500 ml-1">
                                    (com juros de {interestRates[method.installments as keyof typeof interestRates] || 0}%)
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className={`border-t pt-4 mb-4 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-200'}`}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>Subtotal:</span>
                    <span className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                      R$ {getCartSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>Total Pago:</span>
                    <span className={`text-lg ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      R$ {getTotalPayments().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                      Restante:
                    </span>
                    <span className={`text-xl font-bold ${
                      getRemainingAmount() > 0 
                        ? (theme === 'dark' ? 'text-red-400' : 'text-red-600')
                        : (theme === 'dark' ? 'text-green-400' : 'text-green-600')
                    }`}>
                      R$ {getRemainingAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Finalize Button */}
              <button
                onClick={handleSale}
                disabled={cart.length === 0 || getRemainingAmount() > 0.01}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {getRemainingAmount() > 0.01 ? (
                  <>
                    <Calculator className="mr-2" size={20} />
                    Faltam R$ {getRemainingAmount().toFixed(2)}
                  </>
                ) : (
                  <>
                    <Check className="mr-2" size={20} />
                    Finalizar Venda
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Confirmation Modal */}
      <ProductConfirmModal
        isOpen={isProductConfirmOpen}
        onClose={() => setIsProductConfirmOpen(false)}
        onConfirm={confirmAddProduct}
        product={selectedProduct}
      />

      {/* Trade In Modal */}
      <PurchaseModal
        isOpen={isTradeInModalOpen}
        onClose={() => setIsTradeInModalOpen(false)}
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
    </>
  );
}