import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Receipt,
  CreditCard,
  Banknote
} from 'lucide-react';

interface FinancialTitle {
  id: string;
  type: 'receivable' | 'payable';
  origin: string;
  originId?: string;
  customerName?: string;
  supplierName?: string;
  description: string;
  amount: number;
  dueDate: string;
  paidAmount: number;
  paidAt?: string;
  installmentNumber: number;
  totalInstallments: number;
  status: 'pending' | 'overdue' | 'paid' | 'partial';
  category: string;
  paymentMethod?: string;
  createdAt: string;
}

export default function Financial() {
  const [titles, setTitles] = useState<FinancialTitle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('current_month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Mock data
    setTitles([
      {
        id: '1',
        type: 'receivable',
        origin: 'sale',
        originId: '001',
        customerName: 'João Silva',
        description: 'Venda #001 - iPhone 13 Pro (1/3)',
        amount: 1083.30,
        dueDate: '2025-09-15',
        paidAmount: 1083.30,
        paidAt: '2025-09-13T14:35:00Z',
        installmentNumber: 1,
        totalInstallments: 3,
        status: 'paid',
        category: 'Vendas',
        paymentMethod: 'Cartão de Crédito',
        createdAt: '2025-09-07T14:35:00Z'
      },
      {
        id: '2',
        type: 'receivable',
        origin: 'sale',
        originId: '001',
        customerName: 'João Silva',
        description: 'Venda #001 - iPhone 13 Pro (2/3)',
        amount: 1083.30,
        dueDate: '2025-10-15',
        paidAmount: 0,
        installmentNumber: 2,
        totalInstallments: 3,
        status: 'pending',
        category: 'Vendas',
        createdAt: '2025-09-07T14:35:00Z'
      },
      {
        id: '3',
        type: 'receivable',
        origin: 'sale',
        originId: '001',
        customerName: 'João Silva',
        description: 'Venda #001 - iPhone 13 Pro (3/3)',
        amount: 1083.30,
        dueDate: '2025-11-15',
        paidAmount: 0,
        installmentNumber: 3,
        totalInstallments: 3,
        status: 'pending',
        category: 'Vendas',
        createdAt: '2025-09-07T14:35:00Z'
      },
      {
        id: '4',
        type: 'receivable',
        origin: 'service',
        originId: 'OS001',
        customerName: 'Maria Santos',
        description: 'OS #001 - Troca de display',
        amount: 850.00,
        dueDate: '2025-09-10',
        paidAmount: 0,
        installmentNumber: 1,
        totalInstallments: 1,
        status: 'overdue',
        category: 'Serviços',
        createdAt: '2025-09-05T10:00:00Z'
      },
      {
        id: '5',
        type: 'payable',
        origin: 'purchase',
        supplierName: 'Fornecedor ABC',
        description: 'Compra de produtos - Nota 12345',
        amount: 15000.00,
        dueDate: '2025-09-20',
        paidAmount: 0,
        installmentNumber: 1,
        totalInstallments: 1,
        status: 'pending',
        category: 'Compras',
        createdAt: '2025-08-20T09:00:00Z'
      },
      {
        id: '6',
        type: 'payable',
        origin: 'expense',
        description: 'Aluguel do ponto comercial',
        amount: 3500.00,
        dueDate: '2025-09-05',
        paidAmount: 3500.00,
        paidAt: '2025-09-05T10:00:00Z',
        installmentNumber: 1,
        totalInstallments: 1,
        status: 'paid',
        category: 'Despesas Fixas',
        paymentMethod: 'PIX',
        createdAt: '2025-08-01T08:00:00Z'
      }
    ]);
  }, []);

  const filteredTitles = titles.filter(title => {
    const matchesSearch = title.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         title.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         title.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || title.type === filterType;
    const matchesStatus = filterStatus === 'all' || title.status === filterStatus;
    
    let matchesPeriod = true;
    const today = new Date();
    const titleDate = new Date(title.dueDate);
    
    switch (filterPeriod) {
      case 'today':
        matchesPeriod = titleDate.toDateString() === today.toDateString();
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        matchesPeriod = titleDate >= weekStart && titleDate <= weekEnd;
        break;
      case 'current_month':
        matchesPeriod = titleDate.getMonth() === today.getMonth() && titleDate.getFullYear() === today.getFullYear();
        break;
      case 'overdue':
        matchesPeriod = titleDate < today && title.status !== 'paid';
        break;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesPeriod;
  });

  const getStatusInfo = (status: FinancialTitle['status']) => {
    const statusMap = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      overdue: { label: 'Vencido', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      paid: { label: 'Pago', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      partial: { label: 'Parcial', color: 'bg-blue-100 text-blue-800', icon: Clock }
    };
    return statusMap[status];
  };

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case 'PIX':
        return <Receipt size={14} className="text-purple-600" />;
      case 'Cartão de Crédito':
      case 'Cartão de Débito':
        return <CreditCard size={14} className="text-blue-600" />;
      case 'Dinheiro':
        return <Banknote size={14} className="text-green-600" />;
      default:
        return null;
    }
  };

  const summary = {
    totalReceivable: titles.filter(t => t.type === 'receivable' && t.status !== 'paid').reduce((sum, t) => sum + (t.amount - t.paidAmount), 0),
    totalPayable: titles.filter(t => t.type === 'payable' && t.status !== 'paid').reduce((sum, t) => sum + (t.amount - t.paidAmount), 0),
    overdue: titles.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'paid').length,
    paidToday: titles.filter(t => t.paidAt && new Date(t.paidAt).toDateString() === new Date().toDateString()).reduce((sum, t) => sum + t.paidAmount, 0)
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
            <DollarSign className="mr-3 text-green-600" size={32} />
            Financeiro
          </h1>
          <p className="text-slate-600">Gestão de contas a receber e pagar</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium">
            <Plus className="mr-2" size={20} />
            Nova Receita
          </button>
          <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium">
            <Plus className="mr-2" size={20} />
            Nova Despesa
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center">
            <TrendingUp className="mr-2 text-green-600" size={20} />
            A Receber
          </h3>
          <p className="text-3xl font-bold text-green-600">
            R$ {summary.totalReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center">
            <TrendingDown className="mr-2 text-red-600" size={20} />
            A Pagar
          </h3>
          <p className="text-3xl font-bold text-red-600">
            R$ {summary.totalPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center">
            <AlertTriangle className="mr-2 text-orange-600" size={20} />
            Vencidos
          </h3>
          <p className="text-3xl font-bold text-orange-600">{summary.overdue}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center">
            <CheckCircle className="mr-2 text-blue-600" size={20} />
            Pago Hoje
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            R$ {summary.paidToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar títulos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todos os Tipos</option>
            <option value="receivable">A Receber</option>
            <option value="payable">A Pagar</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todos Status</option>
            <option value="pending">Pendentes</option>
            <option value="overdue">Vencidos</option>
            <option value="paid">Pagos</option>
            <option value="partial">Parciais</option>
          </select>
          
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="current_month">Este Mês</option>
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="overdue">Vencidos</option>
          </select>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Financial Titles Table */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Descrição</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Cliente/Fornecedor</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Valor</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Vencimento</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Parcela</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Pagamento</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTitles.map((title) => {
                const statusInfo = getStatusInfo(title.status);
                const StatusIcon = statusInfo.icon;
                const isOverdue = new Date(title.dueDate) < new Date() && title.status !== 'paid';
                
                return (
                  <tr key={title.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        title.type === 'receivable' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {title.type === 'receivable' ? 'Receber' : 'Pagar'}
                      </span>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-slate-800">{title.description}</div>
                        <div className="text-sm text-slate-600">{title.category}</div>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      {title.customerName || title.supplierName || '-'}
                    </td>
                    
                    <td className="py-3 px-4">
                      <div>
                        <div className={`font-bold ${
                          title.type === 'receivable' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          R$ {title.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        {title.paidAmount > 0 && (
                          <div className="text-sm text-slate-600">
                            Pago: R$ {title.paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className={`flex items-center ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                        <Calendar size={14} className="mr-1" />
                        {new Date(title.dueDate).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm">
                        {title.installmentNumber}/{title.totalInstallments}
                      </span>
                    </td>
                    
                    <td className="py-3 px-4">
                      <span className={`flex items-center px-2 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        <StatusIcon size={14} className="mr-1" />
                        {statusInfo.label}
                      </span>
                    </td>
                    
                    <td className="py-3 px-4">
                      {title.paymentMethod ? (
                        <div className="flex items-center">
                          {getPaymentMethodIcon(title.paymentMethod)}
                          <span className="ml-1 text-sm">{title.paymentMethod}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        {title.status !== 'paid' && (
                          <button
                            onClick={() => alert(`Receber/Pagar título ${title.id}`)}
                            className={`px-3 py-1 rounded text-sm font-medium text-white ${
                              title.type === 'receivable' 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
                          >
                            {title.type === 'receivable' ? 'Receber' : 'Pagar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
