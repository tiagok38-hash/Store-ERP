import { useState, useEffect, useMemo } from 'react';
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
  Calculator,
  Tag,
  ShieldCheck,
  User as UserIcon,
  Building2
} from 'lucide-react';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { useTheme } from '@/react-app/hooks/useTheme';
import { formatCurrencyInput, parseCurrencyBR } from '@/react-app/utils/currency';
import ProductConfirmModal from '@/react-app/components/ProductConfirmModal';
import PurchaseModal from '@/react-app/components/PurchaseModal';
import CustomerModal from '@/react-app/components/CustomerModal';
import ProductModal from '@/react-app/components/ProductModal';

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
}

interface CartItem extends InventoryUnit {
  quantity: number; // Para o PDV, cada item é uma unidade única, então quantity será sempre 1
  warrantyTerm: string; // Termo de garantia selecionado para este item
}

interface PaymentMethod {
  type: 'money' | 'pix' | 'debit' | 'credit' | 'promissory' | 'trade_in' | 'crediario';
  amount: number;
  installments?: number;
  withInterest?: boolean;
  interestRate?: number;
  tradeInValue?: number;
  tradeInDevice?: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface EnhancedSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockInventoryUnits: InventoryUnit[] = [
  {
    id: 'unit-1', productSku: 'IPH13P128-TN', productDescription: 'iPhone 13 Pro 128GB Titânio Natural', brand: 'Apple', category: 'Smartphone', model: 'iPhone 13 Pro', color: 'Titânio Natural', storage: '128GB', condition: 'novo', location: 'Loja', imei1: '123456789012345', serialNumber: undefined, barcode: '7891234567890', costPrice: 2399.40, salePrice: 3200.00, status: 'available', createdAt: '2025-09-13', updatedAt: '2025-09-13', purchaseId: '1', locatorCode: 'LOC001234567'
  },
  {
    id: 'unit-2', productSku: 'SGS22128-PB', productDescription: 'Samsung Galaxy S22 128GB Phantom Black', brand: 'Samsung', category: 'Smartphone', model: 'Galaxy S22', color: 'Phantom Black', storage: '128GB', condition: 'novo', location: 'Vitrine', imei1: '987654321098765', serialNumber: undefined, barcode: '7891234567891', costPrice: 2179.00, salePrice: 2800.00, status: 'available', createdAt: '2025-09-13', updatedAt: '2025-09-13', purchaseId: '2', locatorCode: 'LOC001234568'
  },
  {
    id: 'unit-3', productSku: 'CIPH13P-TR', productDescription: 'Capinha iPhone 13 Pro Transparente', brand: 'Genérica', category: 'Acessórios', model: 'Capinha', color: 'Transparente', storage: undefined, condition: 'novo', location: 'Prateleira', imei1: undefined, serialNumber: undefined, barcode: '7891234567892', costPrice: 19.90, salePrice: 45.90, status: 'available', createdAt: '2025-09-13', updatedAt: '2025-09-13', purchaseId: '3', locatorCode: 'LOC001234569'
  },
  {
    id: 'unit-4', productSku: 'FJBL001-BL', productDescription: 'Fone Bluetooth JBL Wave Buds Azul', brand: 'JBL', category: 'Áudio', model: 'Wave Buds', color: 'Azul', storage: undefined, condition: 'novo', location: 'Prateleira', imei1: undefined, serialNumber: 'JBLWB0012345', barcode: '7891234567893', costPrice: 120.00, salePrice: 189.90, status: 'available', createdAt: '2025-09-13', updatedAt: '2025-09-13', purchaseId: '4', locatorCode: 'LOC001234570'
  },
  {
    id: 'unit-5', productSku: 'IPH13P128-TB', productDescription: 'iPhone 13 Pro 128GB Titânio Azul', brand: 'Apple', category: 'Smartphone', model: 'iPhone 13 Pro', color: 'Titânio Azul', storage: '128GB', condition: 'seminovo', location: 'Loja', imei1: '111222333444555', serialNumber: undefined, barcode: '7891234567894', costPrice: 2200.00, salePrice: 2900.00, status: 'available', createdAt: '2025-09-10', updatedAt: '2025-09-10', purchaseId: '5', locatorCode: 'LOC001234571'
  }
];

const mockSellers = [
  { id: '1', name: 'João Vendedor' },
  { id: '2', name: 'Maria Silva' },
  { id: '3', name: 'Pedro Santos' },
  { id: '4', name: 'Ana Costa' },
];

const mockCustomers: Customer[] = [
  { id: '1', name: 'João Silva', email: 'joao.silva@email.com', phone: '(11) 99999-1234' },
  { id: '2', name: 'Maria Santos', email: 'maria.santos@email.com', phone: '(11) 88888-5678' },
  { id: '3', name: 'Pedro Costa', email: 'pedro.costa@email.com', phone: '(11) 77777-9012' },
  { id: '4', name: 'Ana Oliveira', phone: '(11) 66666-3456' }
];

const mockWarrantyTerms = [
  { id: '1', name: '1 ano (defeito de fábrica)' },
  { id: '2', name: '6 meses (limitada)' },
  { id: '3', name: '3 meses (seminovos)' },
  { id: '4', name: 'Sem garantia' },
];

// Taxas de juros simuladas (configuradas pelo admin)
const interestRates = {
  3: 0, // Até 3x sem juros
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
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { type: 'money', amount: 0 }
  ]);
  const [selectedSeller, setSelectedSeller] = useState('');
  const [isProductConfirmOpen, setIsProductConfirmOpen] = useState(false);
  const [selectedProductUnit, setSelectedProductUnit] = useState<InventoryUnit | null>(null);
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [availableInventory, setAvailableInventory] = useState<InventoryUnit[]>(mockInventoryUnits);

  // Filter available inventory units based on search term
  const filteredAvailableUnits = useMemo(() => {
    const searchLower = productSearchTerm.toLowerCase();
    return availableInventory.filter(unit => 
      unit.status === 'available' &&
      (unit.productDescription.toLowerCase().includes(searchLower) ||
       unit.productSku.toLowerCase().includes(searchLower) ||
       unit.brand.toLowerCase().includes(searchLower) ||
       (unit.model && unit.model.toLowerCase().includes(searchLower)) ||
       (unit.color && unit.color.toLowerCase().includes(searchLower)) ||
       (unit.storage && unit.storage.toLowerCase().includes(searchLower)) ||
       (unit.imei1 && unit.imei1.includes(productSearchTerm)) ||
       (unit.imei2 && unit.imei2.includes(productSearchTerm)) ||
       (unit.serialNumber && unit.serialNumber.toLowerCase().includes(searchLower)) ||
       (unit.barcode && unit.barcode.includes(productSearchTerm)))
    );
  }, [productSearchTerm, availableInventory]);

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    const searchLower = customerSearchTerm.toLowerCase();
    return mockCustomers.filter(customer => 
      customer.name.toLowerCase().includes(searchLower) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
      (customer.phone && customer.phone.includes(customerSearchTerm))
    );
  }, [customerSearchTerm]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchTerm(customer.name);
  };

  const addToCart = (unit: InventoryUnit) => {
    // Check if this specific unit (by its unique ID) is already in the cart
    const existingItem = cart.find(item => item.id === unit.id);

    if (existingItem) {
      showWarning('Item já no carrinho', `${unit.productDescription} (ID: ${unit.id}) já está no carrinho.`);
      return;
    }

    setCart([...cart, {
      ...unit,
      quantity: 1, // Always 1 for unique inventory units
      warrantyTerm: mockWarrantyTerms[0].name // Default warranty
    }]);
    
    // Mark the unit as reserved in availableInventory
    setAvailableInventory(prev => prev.map(item => 
      item.id === unit.id ? { ...item, status: 'reserved' } : item
    ));

    showSuccess('Produto Adicionado', `${unit.productDescription} foi adicionado ao carrinho`);
  };

  const handleProductUnitSelect = (unit: InventoryUnit) => {
    setSelectedProductUnit(unit);
    setIsProductConfirmOpen(true);
  };

  const confirmAddProduct = () => {
    if (selectedProductUnit) {
      addToCart(selectedProductUnit);
    }
  };

  const updateCartItemWarranty = (unitId: string, warrantyTerm: string) => {
    setCart(prev => prev.map(item => 
      item.id === unitId ? { ...item, warrantyTerm } : item
    ));
  };

  const removeFromCart = (unitId: string) => {
    const itemToRemove = cart.find(item => item.id === unitId);
    if (itemToRemove) {
      setCart(cart.filter(item => item.id !== unitId));
      // Return the unit to 'available' status in availableInventory
      setAvailableInventory(prev => prev.map(item => 
        item.id === unitToRemove.id ? { ...item, status: 'available' } : item
      ));
      showWarning('Produto Removido', `${itemToRemove.productDescription} foi removido do carrinho`);
    }
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + item.salePrice, 0);
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
    } else {
      setPaymentMethods([...paymentMethods, { type: 'money', amount: 0 }]);
    }
  };

  const updatePaymentMethod = (index: number, field: keyof PaymentMethod, value: any) => {
    const newMethods = [...paymentMethods];
    newMethods[index] = { ...newMethods[index], [field]: value };

    if (field === 'type' && value === 'trade_in') {
      setIsTradeInModalOpen(true);
      // Reset amount for trade_in until value is returned from modal
      newMethods[index].amount = 0;
    }
    
    setPaymentMethods(newMethods);
  };

  const removePaymentMethod = (index: number) => {
    if (paymentMethods.length > 1) {
      const newMethods = paymentMethods.filter((_, i) => i !== index);
      setPaymentMethods(newMethods);
    }
  };

  const calculateInstallmentValue = (amount: number, installments: number, withInterest: boolean) => {
    if (!withInterest || installments <= 3) { // Assuming up to 3 installments are interest-free
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
    if (remaining > 0.01) { // Allow for minor floating point inaccuracies
      showError('Pagamento Incompleto', `Ainda faltam R$ ${remaining.toFixed(2)} para completar o pagamento.`);
      return false;
    }

    if (getTotalPayments() > getCartSubtotal() + 0.01) {
      showError('Pagamento Excessivo', 'O valor total dos pagamentos excede o valor da venda.');
      return false;
    }

    if (!selectedSeller) {
      showError('Vendedor Obrigatório', 'Selecione o vendedor responsável pela venda.');
      return false;
    }

    return true;
  };

  const handleSale = () => {
    if (!validateSale()) return;

    const sellerName = mockSellers.find(s => s.id === selectedSeller)?.name || 'Vendedor';
    const customerInfo = selectedCustomer ? `Cliente: ${selectedCustomer.name}` : 'Cliente Avulso';
    
    showSuccess(
      'Venda Finalizada!', 
      `${customerInfo} • Total: R$ ${getCartSubtotal().toFixed(2)} • Vendedor: ${sellerName}`
    );
    
    // Update status of sold units in availableInventory
    setAvailableInventory(prev => prev.map(unit => 
      cart.some(cartItem => cartItem.id === unit.id) ? { ...unit, status: 'sold' } : unit
    ));

    setCart([]);
    setSelectedCustomer(null);
    setCustomerSearchTerm('');
    setPaymentMethods([{ type: 'money', amount: 0 }]);
    setSelectedSeller('');
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
      case 'crediario': return <Building2 size={18} />;
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
      trade_in: 'Troca (Aparelho)',
      crediario: 'Crediário'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleTradeInValue = (tradeInCost: number) => {
    // Find the trade_in payment method and update its amount
    setPaymentMethods(prev => prev.map(method => 
      method.type === 'trade_in' ? { ...method, amount: tradeInCost } : method
    ));
    showSuccess('Trade-in registrado', `Valor de R$ ${tradeInCost.toFixed(2)} adicionado como pagamento.`);
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
                      placeholder="Buscar por descrição, SKU, IMEI, serial, código de barras..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
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
                    } transition-colors`} title="Adicionar novo produto (definição)">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                {filteredAvailableUnits.length === 0 ? (
                  <p className={`text-center py-8 col-span-full ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Nenhum produto disponível no estoque com este termo de busca.
                  </p>
                ) : (
                  filteredAvailableUnits.map((unit) => (
                    <div key={unit.id} className={`rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      theme === 'dark' ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                    }`} onClick={() => handleProductUnitSelect(unit)}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                          {unit.productDescription}
                        </h3>
                        <div className="flex items-center text-slate-600">
                          {(unit.imei1 || unit.serialNumber) && <Smartphone size={16} className="ml-1" />}
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                          SKU: {unit.productSku} | Marca: {unit.brand}
                        </p>
                        {(unit.imei1 || unit.serialNumber) && (
                          <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {unit.imei1 ? `IMEI: ${unit.imei1}` : `Serial: ${unit.serialNumber}`}
                          </p>
                        )}
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          Status: <span className="capitalize">{unit.status}</span>
                        </p>
                      </div>

                      <p className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        R$ {unit.salePrice.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
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
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Buscar ou digitar nome do cliente"
                      value={customerSearchTerm}
                      onChange={(e) => {
                        setCustomerSearchTerm(e.target.value);
                        setSelectedCustomer(null); // Clear selected customer on input change
                      }}
                      className={`w-full px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    {customerSearchTerm && filteredCustomers.length > 0 && !selectedCustomer && (
                      <div className={`absolute z-10 w-full mt-1 border rounded shadow-lg max-h-32 overflow-y-auto ${
                        theme === 'dark' 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-white border-slate-300'
                      } animate-dropdown-in`}>
                        {filteredCustomers.map(customer => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => handleCustomerSelect(customer)}
                            className={`w-full text-left px-3 py-2 transition-colors text-sm ${
                              theme === 'dark' 
                                ? 'hover:bg-slate-600 text-white' 
                                : 'hover:bg-blue-50 text-slate-900'
                            }`}
                          >
                            {customer.name} ({customer.phone || customer.email})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
                {selectedCustomer && (
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    Cliente selecionado: <span className="font-medium">{selectedCustomer.name}</span>
                  </p>
                )}
              </div>

              {/* Seller Selection */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}>Vendedor *</label>
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
                    {cart.map((item) => (
                      <div key={item.id} 
                           className={`rounded-lg p-3 shadow ${theme === 'dark' ? 'bg-slate-600' : 'bg-white'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                            {item.productDescription}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        {(item.imei1 || item.serialNumber) && (
                          <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                            {item.imei1 ? `IMEI: ${item.imei1}` : `Serial: ${item.serialNumber}`}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                            R$ {item.salePrice.toFixed(2)}
                          </span>
                        </div>

                        {/* Warranty Selection for each item */}
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                          }`}>Garantia</label>
                          <select
                            value={item.warrantyTerm}
                            onChange={(e) => updateCartItemWarranty(item.id, e.target.value)}
                            className={`w-full px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                              theme === 'dark'
                                ? 'bg-slate-500 border-slate-400 text-white'
                                : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          >
                            {mockWarrantyTerms.map(term => (
                              <option key={term.id} value={term.name}>{term.name}</option>
                            ))}
                          </select>
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
                            <option value="money">{getPaymentMethodLabel('money')}</option>
                            <option value="pix">{getPaymentMethodLabel('pix')}</option>
                            <option value="debit">{getPaymentMethodLabel('debit')}</option>
                            <option value="credit">{getPaymentMethodLabel('credit')}</option>
                            <option value="promissory">{getPaymentMethodLabel('promissory')}</option>
                            <option value="trade_in">{getPaymentMethodLabel('trade_in')}</option>
                            <option value="crediario">{getPaymentMethodLabel('crediario')}</option>
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
        product={selectedProductUnit}
      />

      {/* Trade In Modal (using PurchaseModal for now) */}
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

      {/* Product Modal (for defining new product types, not inventory units) */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </>
  );
}