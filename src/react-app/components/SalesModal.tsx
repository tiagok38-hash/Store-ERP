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
  Building2,
  Info,
  Percent,
  Calendar,
  Edit3,
  Package // Garantindo que Package esteja explicitamente importado
} from 'lucide-react';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { useTheme } from '@/react-app/hooks/useTheme';
import { formatCurrencyInput, parseCurrencyBR, formatCurrencyBR } from '@/react-app/utils/currency';
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
  discountApplied?: number; // Desconto aplicado a este item específico
}

interface PaymentMethod {
  type: 'money' | 'pix' | 'debit' | 'credit' | 'promissory' | 'trade_in' | 'crediario';
  amount: number; // Valor total para esta forma de pagamento
  installments?: number; // Número de parcelas (para crédito/crediário)
  withInterest?: boolean; // Se há juros (para crédito)
  interestRate?: number; // Taxa de juros aplicada
  installmentValue?: number; // Valor de cada parcela
  taxesAmount?: number; // Valor das taxas (para crédito/débito)
  tradeInValue?: number; // Valor do aparelho na troca
  tradeInDevice?: string; // Descrição do aparelho na troca
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Seller {
  id: string;
  name: string;
}

interface LeadOrigin {
  id: string;
  name: string;
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

const mockSellers: Seller[] = [
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

const mockLeadOrigins: LeadOrigin[] = [
  { id: '1', name: 'Indicação' },
  { id: '2', name: 'Redes Sociais' },
  { id: '3', name: 'Google' },
  { id: '4', name: 'Loja Física' },
  { id: '5', name: 'Outro' },
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

// Taxas de cartão de débito e crédito (simuladas)
const debitCardFee = 2.5; // 2.5%
const creditCardFee = 3.5; // 3.5%

export default function EnhancedSalesModal({ isOpen, onClose }: EnhancedSalesModalProps) {
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning } = useNotification();
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [leadOrigin, setLeadOrigin] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [discountValue, setDiscountValue] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedWarrantyTerm, setSelectedWarrantyTerm] = useState(mockWarrantyTerms[0].name);
  const [observations, setObservations] = useState('');
  const [isProductConfirmOpen, setIsProductConfirmOpen] = useState(false);
  const [selectedProductUnit, setSelectedProductUnit] = useState<InventoryUnit | null>(null);
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [availableInventory, setAvailableInventory] = useState<InventoryUnit[]>(mockInventoryUnits);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // Match animation duration
  };

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

  const handleSellerSelect = (seller: Seller) => {
    setSelectedSeller(seller);
  };

  const addToCart = (unit: InventoryUnit) => {
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
    setProductSearchTerm(''); // Clear search after adding
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
        item.id === unitId ? { ...item, status: 'available' } : item
      ));
      showWarning('Produto Removido', `${itemToRemove.productDescription} foi removido do carrinho`);
    }
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + item.salePrice, 0);
  };

  const getDiscountAmount = () => {
    const subtotal = getCartSubtotal();
    const discount = parseCurrencyBR(discountValue);
    if (discountType === 'percentage') {
      return subtotal * (discount / 100);
    }
    return discount;
  };

  const getCartTotal = () => {
    return getCartSubtotal() - getDiscountAmount();
  };

  const calculatePaymentTaxes = (method: PaymentMethod, itemAmount: number) => {
    let fee = 0;
    if (method.type === 'debit') {
      fee = debitCardFee;
    } else if (method.type === 'credit') {
      fee = creditCardFee;
      if (method.withInterest && method.installments && method.installments > 3) {
        let currentInterestRate = (interestRates[method.installments as keyof typeof interestRates] || 0);
        fee += currentInterestRate;
      }
    }
    return itemAmount * (fee / 100);
  };

  const getTotalPaymentTaxes = () => {
    return paymentMethods.reduce((totalTaxes, method) => {
      return totalTaxes + calculatePaymentTaxes(method, method.amount);
    }, 0);
  };

  const getTotalPayments = () => {
    return paymentMethods.reduce((total, method) => total + method.amount, 0);
  };

  const getRemainingAmount = () => {
    return Math.max(0, getCartTotal() + getTotalPaymentTaxes() - getTotalPayments());
  };

  const addPaymentMethod = (type: PaymentMethod['type'] = 'money') => {
    console.log(`Attempting to add payment method: ${type}`); // Log para depuração
    setPaymentMethods(prev => [...prev, { 
      type, 
      amount: 0, // Initialize amount to 0 for user input
      installments: 1,
      withInterest: false,
      interestRate: 0,
      installmentValue: 0,
      taxesAmount: 0
    }]);
    if (type === 'trade_in') {
      setIsTradeInModalOpen(true);
      console.log('setIsTradeInModalOpen(true) called'); // Log para depuração
    }
  };

  const updatePaymentMethod = (index: number, field: keyof PaymentMethod, value: any) => {
    const newMethods = [...paymentMethods];
    let updatedMethod = { ...newMethods[index], [field]: value };

    if (field === 'amount') {
      updatedMethod.amount = parseCurrencyBR(value.toString());
    }

    // No need to open modal here, it's handled by addPaymentMethod
    // if (field === 'type' && value === 'trade_in') {
    //   setIsTradeInModalOpen(true);
    //   updatedMethod.amount = 0; // Reset amount for trade_in until value is returned from modal
    // }

    // Recalculate interest and installment value for credit cards
    if (updatedMethod.type === 'credit' && updatedMethod.installments && updatedMethod.amount) {
      const baseAmount = updatedMethod.amount;
      let totalAmountWithInterest = baseAmount;
      let currentInterestRate = (interestRates[updatedMethod.installments as keyof typeof interestRates] || 0);

      if (updatedMethod.withInterest && updatedMethod.installments > 3) {
        totalAmountWithInterest = baseAmount * (1 + currentInterestRate / 100);
      } else {
        currentInterestRate = 0; // No interest if not explicitly enabled or <= 3 installments
      }
      updatedMethod.interestRate = currentInterestRate;
      updatedMethod.installmentValue = totalAmountWithInterest / updatedMethod.installments;
      updatedMethod.taxesAmount = calculatePaymentTaxes(updatedMethod, baseAmount); // Base tax on original amount
    } else {
      updatedMethod.interestRate = 0;
      updatedatedMethod.installmentValue = updatedMethod.amount;
      updatedMethod.taxesAmount = calculatePaymentTaxes(updatedMethod, updatedMethod.amount);
    }
    
    newMethods[index] = updatedMethod;
    setPaymentMethods(newMethods);
  };

  const removePaymentMethod = (index: number) => {
    if (paymentMethods.length > 0) {
      const newMethods = paymentMethods.filter((_, i) => i !== index);
      setPaymentMethods(newMethods);
    }
  };

  const validateSale = () => {
    if (cart.length === 0) {
      showError('Carrinho Vazio', 'Adicione pelo menos um produto ao carrinho antes de finalizar a venda.');
      return false;
    }

    const remaining = getRemainingAmount();
    if (remaining > 0.01) { // Allow for minor floating point inaccuracies
      showError('Pagamento Incompleto', `Ainda faltam R$ ${formatCurrencyBR(remaining)} para completar o pagamento.`);
      return false;
    }

    if (getTotalPayments() > getCartTotal() + getTotalPaymentTaxes() + 0.01) {
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

    const sellerName = selectedSeller?.name || 'Vendedor';
    const customerInfo = selectedCustomer ? `Cliente: ${selectedCustomer.name}` : 'Cliente Avulso';
    
    showSuccess(
      'Venda Finalizada!', 
      `${customerInfo} • Total: R$ ${formatCurrencyBR(getCartTotal())} • Vendedor: ${sellerName}`
    );
    
    // Update status of sold units in availableInventory
    setAvailableInventory(prev => prev.map(unit => 
      cart.some(cartItem => cartItem.id === unit.id) ? { ...unit, status: 'sold' } : unit
    ));

    // Reset form
    setCart([]);
    setSelectedCustomer(null);
    setCustomerSearchTerm('');
    setPaymentMethods([]);
    setSelectedSeller(null);
    setLeadOrigin('');
    setProductSearchTerm('');
    setDiscountValue('');
    setSelectedWarrantyTerm(mockWarrantyTerms[0].name);
    setObservations('');
    handleClose();
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
    showSuccess('Trade-in registrado', `Valor de R$ ${formatCurrencyBR(tradeInCost)} adicionado como pagamento.`);
  };

  if (!isOpen && !isAnimatingOut) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div 
          className={`rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          } ${isAnimatingOut ? 'animate-modal-out' : 'animate-modal-in'}`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 flex justify-between items-center rounded-t-xl">
            <h2 className="text-xl font-bold flex items-center">
              <FileText className="mr-2" size={24} />
              Nova Venda
            </h2>
            <button
              onClick={handleClose}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 max-h-[calc(95vh-60px)] overflow-y-auto">
            {/* Dados da Venda */}
            <div className={`rounded-lg p-3 mb-4 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <h3 className={`text-base font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                <Edit3 className="mr-2 text-blue-600" size={18} />
                Dados da venda
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                    Data da venda
                  </label>
                  <div className="relative">
                    <Calendar className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} size={16} />
                    <input
                      type="date"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      className={`w-full pl-8 pr-2 py-1.5 border rounded-lg text-xs ${
                        theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      readOnly // Data da venda é preenchida automaticamente
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                    Cliente *
                  </label>
                  <div className="flex gap-1">
                    <div className="relative flex-1">
                      <UserIcon className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} size={16} />
                      <input
                        type="text"
                        placeholder="Buscar ou digitar nome"
                        value={customerSearchTerm}
                        onChange={(e) => {
                          setCustomerSearchTerm(e.target.value);
                          setSelectedCustomer(null); // Clear selected customer on input change
                        }}
                        className={`w-full pl-8 pr-2 py-1.5 border rounded-l-lg text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                      {customerSearchTerm && filteredCustomers.length > 0 && !selectedCustomer && (
                        <div className={`absolute z-10 w-full mt-1 border rounded shadow-lg max-h-24 overflow-y-auto ${
                          theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'
                        } animate-dropdown-in`}>
                          {filteredCustomers.map(customer => (
                            <button
                              key={customer.id}
                              type="button"
                              onClick={() => handleCustomerSelect(customer)}
                              className={`w-full text-left px-2 py-1.5 transition-colors text-xs ${
                                theme === 'dark' ? 'hover:bg-slate-600 text-white' : 'hover:bg-blue-50 text-slate-900'
                              }`}
                            >
                              {customer.name} {customer.phone ? `| ${customer.phone}` : ''}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => setIsCustomerModalOpen(true)}
                      className={`px-2 py-1.5 border-t border-r border-b rounded-r-lg text-xs ${
                        theme === 'dark' ? 'bg-slate-700 border-slate-500 text-white hover:bg-slate-600' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                      } transition-colors`} title="Adicionar novo cliente">
                      <Plus size={14} />
                    </button>
                  </div>
                  {selectedCustomer && (
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      Cliente: <span className="font-medium">{selectedCustomer.name}</span>
                      <button onClick={() => setIsCustomerModalOpen(true)} className="ml-1 text-blue-500 hover:underline">Editar</button>
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                    Vendedor *
                  </label>
                  <div className="relative">
                    <UserIcon className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} size={16} />
                    <select
                      value={selectedSeller?.id || ''}
                      onChange={(e) => {
                        const seller = mockSellers.find(s => s.id === e.target.value);
                        setSelectedSeller(seller || null);
                      }}
                      className={`w-full pl-8 pr-2 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="">Selecionar vendedor</option>
                      {mockSellers.map(seller => (
                        <option key={seller.id} value={seller.id}>{seller.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Produtos / Serviços */}
            <div className={`rounded-lg p-3 mb-4 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <h3 className={`text-base font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                <Package className="mr-2 text-purple-600" size={18} />
                Produtos / Serviços
              </h3>
              <div className="mb-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} size={16} />
                  <input
                    type="text"
                    placeholder="Buscar Produto, IMEI ou Serial Number"
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className={`w-full pl-8 pr-2 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  {productSearchTerm && filteredAvailableUnits.length > 0 && (
                    <div className={`absolute z-10 w-full mt-1 border rounded shadow-lg max-h-24 overflow-y-auto ${
                      theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'
                    } animate-dropdown-in`}>
                      {filteredAvailableUnits.map(unit => (
                        <button
                          key={unit.id}
                          type="button"
                          onClick={() => handleProductUnitSelect(unit)}
                          className={`w-full text-left px-2 py-1.5 transition-colors text-xs ${
                            theme === 'dark' ? 'hover:bg-slate-600 text-white' : 'hover:bg-blue-50 text-slate-900'
                          }`}
                        >
                          {unit.productDescription} {unit.imei1 ? `(IMEI: ${unit.imei1})` : ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setIsProductModalOpen(true)}
                  className={`px-2 py-1.5 border rounded-lg text-xs ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  } transition-colors`} title="Adicionar novo produto (definição)">
                  <Plus size={14} />
                </button>
              </div>

              {/* Cart Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'border-slate-600' : 'border-slate-200'}`}>
                      <th className={`text-left py-1.5 px-2 font-medium text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Produto(s)</th>
                      <th className={`text-center py-1.5 px-2 font-medium text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Qtd.</th>
                      <th className={`text-right py-1.5 px-2 font-medium text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Valor</th>
                      <th className={`text-center py-1.5 px-2 font-medium text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={`text-center py-6 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          Nenhum item no carrinho
                        </td>
                      </tr>
                    ) : (
                      cart.map((item) => (
                        <tr key={item.id} className={`border-b ${theme === 'dark' ? 'border-slate-600' : 'border-slate-100'}`}>
                          <td className="py-1.5 px-2">
                            <div className={`font-medium text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                              {item.productSku} - {item.productDescription}
                            </div>
                            {(item.imei1 || item.serialNumber) && (
                              <div className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                IMEI1: {item.imei1 || '-'} | Saúde da bateria: 84%
                              </div>
                            )}
                            <div className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                              {item.condition}, {item.warrantyTerm}
                            </div>
                          </td>
                          <td className={`py-1.5 px-2 text-center text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                            {item.quantity}
                          </td>
                          <td className={`py-1.5 px-2 text-right font-medium text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                            R$ {formatCurrencyBR(item.salePrice)}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded"
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumo */}
            <div className={`rounded-lg p-3 mb-4 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <h3 className={`text-base font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                <Calculator className="mr-2 text-orange-600" size={18} />
                Resumo
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Subtotal</span>
                  <span className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    R$ {formatCurrencyBR(getCartSubtotal())}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Descontos</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as 'amount' | 'percentage')}
                      className={`px-1.5 py-1 border rounded text-xs ${
                        theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="amount">R$</option>
                      <option value="percentage">%</option>
                    </select>
                    <input
                      type="text"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(formatCurrencyInput(e.target.value))}
                      className={`w-20 px-1.5 py-1 border rounded text-xs ${
                        theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      placeholder="0,00"
                    />
                    <span className={`font-medium text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                      - R$ {formatCurrencyBR(getDiscountAmount())}
                    </span>
                  </div>
                </div>
                <div className={`border-t pt-2 flex justify-between items-center ${theme === 'dark' ? 'border-slate-600' : 'border-slate-200'}`}>
                  <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Total</span>
                  <span className={`text-xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    R$ {formatCurrencyBR(getCartTotal())}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Total em taxas de cartão</span>
                  <span className={`font-medium text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                    R$ {formatCurrencyBR(getTotalPaymentTaxes())}
                  </span>
                </div>
              </div>
            </div>

            {/* Formas de Pagamento */}
            <div className={`rounded-lg p-3 mb-4 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <h3 className={`text-base font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                <CreditCard className="mr-2 text-blue-600" size={18} />
                Formas de Pagamento
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <button onClick={() => addPaymentMethod('pix')} className="px-2.5 py-1.5 bg-blue-500 text-white rounded-lg text-xs flex items-center hover:bg-blue-600"><Smartphone size={14} className="mr-1" /> Pix</button>
                <button onClick={() => addPaymentMethod('money')} className="px-2.5 py-1.5 bg-green-500 text-white rounded-lg text-xs flex items-center hover:bg-green-600"><DollarSign size={14} className="mr-1" /> Dinheiro</button>
                <button onClick={() => addPaymentMethod('debit')} className="px-2.5 py-1.5 bg-purple-500 text-white rounded-lg text-xs flex items-center hover:bg-purple-600"><CreditCard size={14} className="mr-1" /> Débito</button>
                <button onClick={() => addPaymentMethod('credit')} className="px-2.5 py-1.5 bg-orange-500 text-white rounded-lg text-xs flex items-center hover:bg-orange-600"><CreditCard size={14} className="mr-1" /> Crédito</button>
                <button onClick={() => addPaymentMethod('trade_in')} className="px-2.5 py-1.5 bg-indigo-500 text-white rounded-lg text-xs flex items-center hover:bg-indigo-600"><RefreshCw size={14} className="mr-1" /> Aparelho na Troca</button>
                <button onClick={() => addPaymentMethod('crediario')} className="px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs flex items-center hover:bg-red-600"><Building2 size={14} className="mr-1" /> Crediário</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'border-slate-600' : 'border-slate-200'}`}>
                      <th className={`text-left py-1.5 px-2 font-medium text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Forma</th>
                      <th className={`text-left py-1.5 px-2 font-medium text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Taxas</th>
                      <th className={`text-left py-1.5 px-2 font-medium text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Parcelas</th>
                      <th className={`text-right py-1.5 px-2 font-medium text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Valor</th>
                      <th className={`text-center py-1.5 px-2 font-medium text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentMethods.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={`text-center py-6 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          Nenhuma forma de pagamento adicionada
                        </td>
                      </tr>
                    ) : (
                      paymentMethods.map((method, index) => (
                        <tr key={index} className={`border-b ${theme === 'dark' ? 'border-slate-600' : 'border-slate-100'}`}>
                          <td className="py-1.5 px-2">
                            <div className="flex items-center gap-1">
                              {getPaymentMethodIcon(method.type)}
                              <span className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                {getPaymentMethodLabel(method.type)}
                              </span>
                            </div>
                          </td>
                          <td className={`py-1.5 px-2 text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                            {method.taxesAmount ? `${(method.taxesAmount / method.amount * 100).toFixed(2)}%` : '-'}
                          </td>
                          <td className="py-1.5 px-2">
                            {method.type === 'credit' || method.type === 'crediario' ? (
                              <div className="flex items-center gap-1">
                                <select
                                  value={method.installments || 1}
                                  onChange={(e) => updatePaymentMethod(index, 'installments', parseInt(e.target.value))}
                                  className={`px-1 py-0.5 border rounded text-xs ${
                                    theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                                  }`}
                                >
                                  {Array.from({ length: 18 }, (_, i) => i + 1).map(i => (
                                    <option key={i} value={i}>{i}x</option>
                                  ))}
                                </select>
                                {method.type === 'credit' && (
                                  <label className="flex items-center gap-1 text-xs">
                                    <input
                                      type="checkbox"
                                      checked={method.withInterest || false}
                                      onChange={(e) => updatePaymentMethod(index, 'withInterest', e.target.checked)}
                                      className="rounded"
                                    />
                                    Juros
                                  </label>
                                )}
                                {method.installmentValue && (
                                  <span className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                    R$ {formatCurrencyBR(method.installmentValue)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-right">
                            <input
                              type="text"
                              value={formatCurrencyInput(method.amount.toString())}
                              onChange={(e) => updatePaymentMethod(index, 'amount', e.target.value)}
                              className={`w-24 px-2 py-0.5 border rounded text-xs text-right ${
                                theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <button
                              onClick={() => removePaymentMethod(index)}
                              className="text-red-500 hover:text-red-700 p-1 rounded"
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Termo de Garantia e Observações - Agrupados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  <ShieldCheck className="mr-2 text-green-600" size={20} />
                  Termo de Garantia
                </h3>
                <div className="mb-4">
                  <div className="relative">
                    <select
                      value={selectedWarrantyTerm}
                      onChange={(e) => setSelectedWarrantyTerm(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      {mockWarrantyTerms.map(term => (
                        <option key={term.id} value={term.name}>{term.name}</option>
                      ))}
                    </select>
                    <Info className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} size={20} />
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  <FileText className="mr-2 text-blue-600" size={20} />
                  Observações
                </h3>
                <div>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    rows={3}
                    placeholder="Observações | Visível em Recibos"
                  />
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
                  Faltam R$ {formatCurrencyBR(getRemainingAmount())}
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
        // Aumentar o z-index para garantir que ele apareça sobre o SalesModal
        style={{ zIndex: 60 }} 
      />

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        type="customer"
        data={selectedCustomer} // Pass selected customer data for editing
        onCustomerSaved={handleCustomerSelect} // Update selected customer after save
      />

      {/* Product Modal (for defining new product types, not inventory units) */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </>
  );
}