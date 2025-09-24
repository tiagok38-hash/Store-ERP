import { useState } from 'react';
import { 
  X, 
  Calendar, 
  DollarSign,
  CreditCard,
  User,
  Receipt,
  Package,
  Clock
} from 'lucide-react';

interface CustomerHistoryItem {
  id: string;
  saleId: string;
  date: string;
  time: string;
  items: string[];
  itemCount: number;
  totalAmount: number;
  paymentMethod: string;
  seller: string;
  status: string;
}

interface CustomerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
}

export default function CustomerHistoryModal({ isOpen, onClose, customer }: CustomerHistoryModalProps) {
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [filterPeriod, setFilterPeriod] = useState<'all' | '30days' | '90days' | '1year'>('all');

  // Mock data for customer history
  const customerHistory: CustomerHistoryItem[] = customer ? [
    {
      id: '1',
      saleId: 'VND001234',
      date: '2025-09-13',
      time: '14:35:22',
      items: ['iPhone 15 Pro Max 256GB', 'Capinha Transparente', 'Película Vidro'],
      itemCount: 3,
      totalAmount: 7850.90,
      paymentMethod: 'Cartão 3x',
      seller: 'João Vendedor',
      status: 'Concluída'
    },
    {
      id: '2',
      saleId: 'VND001156',
      date: '2025-08-28',
      time: '16:20:15',
      items: ['Carregador USB-C 20W', 'Cabo Lightning'],
      itemCount: 2,
      totalAmount: 120.00,
      paymentMethod: 'PIX',
      seller: 'Maria Silva',
      status: 'Concluída'
    },
    {
      id: '3',
      saleId: 'VND000987',
      date: '2025-08-15',
      time: '11:45:30',
      items: ['AirPods Pro 2ª Geração'],
      itemCount: 1,
      totalAmount: 1899.00,
      paymentMethod: 'Dinheiro',
      seller: 'Pedro Santos',
      status: 'Concluída'
    },
    {
      id: '4',
      saleId: 'VND000823',
      date: '2025-07-22',
      time: '09:15:45',
      items: ['Película iPhone 15', 'Suporte Veicular'],
      itemCount: 2,
      totalAmount: 89.90,
      paymentMethod: 'Cartão à vista',
      seller: 'Ana Costa',
      status: 'Concluída'
    },
    {
      id: '5',
      saleId: 'VND000654',
      date: '2025-06-10',
      time: '15:30:12',
      items: ['MacBook Air 13" M2 256GB'],
      itemCount: 1,
      totalAmount: 8999.00,
      paymentMethod: 'Cartão 10x',
      seller: 'João Vendedor',
      status: 'Concluída'
    }
  ] : [];

  const filteredHistory = customerHistory.filter(item => {
    if (filterPeriod === 'all') return true;
    
    const itemDate = new Date(item.date);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (filterPeriod) {
      case '30days': return daysDiff <= 30;
      case '90days': return daysDiff <= 90;
      case '1year': return daysDiff <= 365;
      default: return true;
    }
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime();
    } else {
      return b.totalAmount - a.totalAmount;
    }
  });

  const totalSpent = filteredHistory.reduce((sum, item) => sum + item.totalAmount, 0);
  const averageTicket = filteredHistory.length > 0 ? totalSpent / filteredHistory.length : 0;
  const lastPurchase = sortedHistory.length > 0 ? sortedHistory[0] : null;

  const getPaymentMethodIcon = (method: string) => {
    if (method.includes('Cartão')) return <CreditCard size={14} className="text-blue-500" />;
    if (method === 'PIX') return <DollarSign size={14} className="text-green-500" />;
    if (method === 'Dinheiro') return <DollarSign size={14} className="text-yellow-600" />;
    return <DollarSign size={14} className="text-slate-500" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Clock className="mr-3" size={28} />
              Histórico de Compras
            </h2>
            <p className="text-indigo-100 mt-1">
              {customer?.name} - {filteredHistory.length} compras registradas
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Total de Compras</h3>
              <p className="text-2xl font-bold text-indigo-600">{filteredHistory.length}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Total Gasto</h3>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Ticket Médio</h3>
              <p className="text-2xl font-bold text-blue-600">
                R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Última Compra</h3>
              <p className="text-sm font-medium text-slate-800">
                {lastPurchase ? new Date(lastPurchase.date).toLocaleDateString('pt-BR') : 'Nunca'}
              </p>
              <p className="text-xs text-slate-600">
                {lastPurchase ? lastPurchase.time : '-'}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Todas as compras</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="90days">Últimos 90 dias</option>
              <option value="1year">Último ano</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="date">Ordenar por Data</option>
              <option value="amount">Ordenar por Valor</option>
            </select>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Venda</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Data/Hora</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Produtos</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Pagamento</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Vendedor</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHistory.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Receipt size={16} className="mr-2 text-blue-500" />
                          <span className="font-mono text-sm font-bold text-blue-600">
                            {item.saleId}
                          </span>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div>
                          <div className="flex items-center text-sm">
                            <Calendar size={14} className="mr-1 text-slate-500" />
                            {new Date(item.date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center text-xs text-slate-600">
                            <Clock size={12} className="mr-1" />
                            {item.time}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div>
                          <div className="flex items-center text-sm font-medium">
                            <Package size={14} className="mr-1 text-slate-500" />
                            {item.itemCount} {item.itemCount === 1 ? 'item' : 'itens'}
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            {item.items.slice(0, 2).join(', ')}
                            {item.items.length > 2 && ` +${item.items.length - 2} mais`}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="font-semibold text-green-600">
                          R$ {item.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {getPaymentMethodIcon(item.paymentMethod)}
                          <span className="ml-2 text-sm">{item.paymentMethod}</span>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <User size={14} className="mr-1 text-slate-500" />
                          <span className="text-sm">{item.seller}</span>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600">Nenhuma compra encontrada no período selecionado.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
