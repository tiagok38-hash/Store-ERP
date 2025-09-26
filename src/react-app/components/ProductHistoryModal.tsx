import { useState } from 'react';
import { 
  X, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Edit,
  Clock
} from 'lucide-react';

interface HistoryItem {
  id: string;
  type: 'sale' | 'price_change' | 'stock_change';
  date: string;
  time: string;
  details: any;
}

interface ProductHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

export default function ProductHistoryModal({ isOpen, onClose, product }: ProductHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'prices' | 'stock'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // Match animation duration
  };

  // Mock data for product history
  const productHistory: HistoryItem[] = product ? [
    {
      id: '1',
      type: 'sale',
      date: '2025-09-13',
      time: '14:35:22',
      details: {
        saleId: 'VND001234',
        customer: 'João Silva',
        quantity: 1,
        unitPrice: 3500.00,
        totalPrice: 3500.00,
        paymentMethod: 'Cartão 3x',
        seller: 'João Vendedor',
        imei: '123456789012345'
      }
    },
    {
      id: '2',
      type: 'price_change',
      date: '2025-09-10',
      time: '09:15:30',
      details: {
        user: 'Administrador',
        field: 'sale_price',
        oldValue: 3400.00,
        newValue: 3500.00,
        reason: 'Ajuste de margem'
      }
    },
    {
      id: '3',
      type: 'stock_change',
      date: '2025-09-08',
      time: '16:20:15',
      details: {
        user: 'João Vendedor',
        movementType: 'entrada',
        quantity: 5,
        oldStock: 2,
        newStock: 7,
        supplier: 'Apple Brasil',
        purchaseId: 'COM001234',
        unitCost: 3000.00
      }
    },
    {
      id: '4',
      type: 'sale',
      date: '2025-09-05',
      time: '11:45:12',
      details: {
        saleId: 'VND001156',
        customer: 'Maria Santos',
        quantity: 1,
        unitPrice: 3400.00,
        totalPrice: 3400.00,
        paymentMethod: 'PIX',
        seller: 'Maria Silva',
        imei: '123456789012346'
      }
    },
    {
      id: '5',
      type: 'price_change',
      date: '2025-08-28',
      time: '13:30:45',
      details: {
        user: 'Gerente',
        field: 'cost_price',
        oldValue: 2900.00,
        newValue: 3000.00,
        reason: 'Aumento do fornecedor'
      }
    },
    {
      id: '6',
      type: 'stock_change',
      date: '2025-08-25',
      time: '10:15:22',
      details: {
        user: 'Pedro Santos',
        movementType: 'saída',
        quantity: -1,
        oldStock: 8,
        newStock: 7,
        reason: 'Produto defeituoso - troca garantia',
        saleId: 'VND001089'
      }
    }
  ] : [];

  const filteredHistory = productHistory.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'sales') return item.type === 'sale';
    if (activeTab === 'prices') return item.type === 'price_change';
    if (activeTab === 'stock') return item.type === 'stock_change';
    return true;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime();
    } else {
      return a.type.localeCompare(b.type);
    }
  });

  const salesHistory = productHistory.filter(item => item.type === 'sale');
  const totalSales = salesHistory.length;
  const totalRevenue = salesHistory.reduce((sum, item) => sum + item.details.totalPrice, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale': return <ShoppingCart size={16} className="text-green-500" />;
      case 'price_change': return <Edit size={16} className="text-blue-500" />;
      case 'stock_change': return <Package size={16} className="text-purple-500" />;
      default: return <Package size={16} className="text-slate-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return 'Venda';
      case 'price_change': return 'Alteração de Preço';
      case 'stock_change': return 'Movimentação de Estoque';
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-green-100 text-green-800';
      case 'price_change': return 'bg-blue-100 text-blue-800';
      case 'stock_change': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const renderHistoryDetails = (item: HistoryItem) => {
    switch (item.type) {
      case 'sale':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Venda:</span>
              <p className="font-mono font-bold text-blue-600">{item.details.saleId}</p>
            </div>
            <div>
              <span className="text-slate-600">Cliente:</span>
              <p className="font-medium">{item.details.customer}</p>
            </div>
            <div>
              <span className="text-slate-600">Preço Unit.:</span>
              <p className="font-semibold text-green-600">
                R$ {item.details.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <span className="text-slate-600">Pagamento:</span>
              <p className="font-medium">{item.details.paymentMethod}</p>
            </div>
            <div>
              <span className="text-slate-600">Vendedor:</span>
              <p className="font-medium">{item.details.seller}</p>
            </div>
            {item.details.imei && (
              <div>
                <span className="text-slate-600">IMEI:</span>
                <p className="font-mono text-xs">{item.details.imei}</p>
              </div>
            )}
          </div>
        );

      case 'price_change':
        const isIncrease = item.details.newValue > item.details.oldValue;
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Campo:</span>
              <p className="font-medium">
                {item.details.field === 'sale_price' ? 'Preço de Venda' : 'Preço de Custo'}
              </p>
            </div>
            <div>
              <span className="text-slate-600">Valor Anterior:</span>
              <p className="font-semibold text-red-600">
                R$ {item.details.oldValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <span className="text-slate-600">Novo Valor:</span>
              <div className="flex items-center">
                {isIncrease ? (
                  <TrendingUp size={14} className="text-green-500 mr-1" />
                ) : (
                  <TrendingDown size={14} className="text-red-500 mr-1" />
                )}
                <p className={`font-semibold ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {item.details.newValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div>
              <span className="text-slate-600">Usuário:</span>
              <p className="font-medium">{item.details.user}</p>
            </div>
            {item.details.reason && (
              <div className="col-span-2">
                <span className="text-slate-600">Motivo:</span>
                <p className="font-medium">{item.details.reason}</p>
              </div>
            )}
          </div>
        );

      case 'stock_change':
        const isStockIncrease = item.details.quantity > 0;
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Tipo:</span>
              <p className={`font-medium ${isStockIncrease ? 'text-green-600' : 'text-red-600'}`}>
                {item.details.movementType}
              </p>
            </div>
            <div>
              <span className="text-slate-600">Quantidade:</span>
              <div className="flex items-center">
                {isStockIncrease ? (
                  <TrendingUp size={14} className="text-green-500 mr-1" />
                ) : (
                  <TrendingDown size={14} className="text-red-500 mr-1" />
                )}
                <p className={`font-semibold ${isStockIncrease ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(item.details.quantity)}
                </p>
              </div>
            </div>
            <div>
              <span className="text-slate-600">Estoque:</span>
              <p className="font-medium">
                {item.details.oldStock} → {item.details.newStock}
              </p>
            </div>
            <div>
              <span className="text-slate-600">Usuário:</span>
              <p className="font-medium">{item.details.user}</p>
            </div>
            {item.details.supplier && (
              <div>
                <span className="text-slate-600">Fornecedor:</span>
                <p className="font-medium">{item.details.supplier}</p>
              </div>
            )}
            {item.details.unitCost && (
              <div>
                <span className="text-slate-600">Custo Unit.:</span>
                <p className="font-semibold text-orange-600">
                  R$ {item.details.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            {item.details.reason && (
              <div className="col-span-2">
                <span className="text-slate-600">Motivo:</span>
                <p className="font-medium">{item.details.reason}</p>
              </div>
            )}
          </div>
        );

      default:
        return <p className="text-slate-600">Detalhes não disponíveis</p>;
    }
  };

  if (!isOpen && !isAnimatingOut) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden ${isAnimatingOut ? 'animate-modal-out' : 'animate-modal-in'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Clock className="mr-3" size={28} />
              Histórico do Produto
            </h2>
            <p className="text-blue-100 mt-1">
              {product?.productDescription || product?.description} - Todas as movimentações
            </p>
          </div>
          <button
            onClick={handleClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Total de Vendas</h3>
              <p className="text-2xl font-bold text-green-600">{totalSales}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Receita Total</h3>
              <p className="text-2xl font-bold text-blue-600">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Preço Atual</h3>
              <p className="text-2xl font-bold text-purple-600">
                R$ {(product?.salePrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Estoque Atual</h3>
              <p className="text-2xl font-bold text-orange-600">
                {product?.status === 'available' ? '1' : '0'} unidade{product?.status === 'available' ? '' : 's'}
              </p>
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Todos', count: productHistory.length },
                { key: 'sales', label: 'Vendas', count: productHistory.filter(i => i.type === 'sale').length },
                { key: 'prices', label: 'Preços', count: productHistory.filter(i => i.type === 'price_change').length },
                { key: 'stock', label: 'Estoque', count: productHistory.filter(i => i.type === 'stock_change').length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Ordenar por Data</option>
              <option value="type">Ordenar por Tipo</option>
            </select>
          </div>

          {/* History Timeline */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {sortedHistory.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(item.type)}
                    <div>
                      <h4 className="font-semibold text-slate-800">{getTypeLabel(item.type)}</h4>
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar size={14} className="mr-1" />
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                        <Clock size={14} className="ml-3 mr-1" />
                        {item.time}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(item.type)}`}>
                    {getTypeLabel(item.type)}
                  </span>
                </div>

                {/* Details */}
                <div className="bg-slate-50 rounded-lg p-3">
                  {renderHistoryDetails(item)}
                </div>
              </div>
            ))}
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600">Nenhuma movimentação encontrada para este filtro.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-end">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}