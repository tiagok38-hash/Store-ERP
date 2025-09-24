import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Calculator
} from 'lucide-react';

interface CreditAccount {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  creditLimit: number;
  availableCredit: number;
  usedCredit: number;
  totalDebt: number;
  status: 'active' | 'blocked' | 'suspended';
  createdAt: string;
  lastPurchase?: string;
}

interface CreditPurchase {
  id: string;
  accountId: string;
  customerName: string;
  description: string;
  amount: number;
  installments: number;
  installmentValue: number;
  paidInstallments: number;
  nextDueDate: string;
  status: 'active' | 'completed' | 'overdue';
  createdAt: string;
}

export default function Credit() {
  const [accounts, setAccounts] = useState<CreditAccount[]>([]);
  const [purchases, setPurchases] = useState<CreditPurchase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'accounts' | 'purchases'>('accounts');

  useEffect(() => {
    // Mock data for credit accounts
    setAccounts([
      {
        id: '1',
        customerId: '001',
        customerName: 'João Silva',
        customerPhone: '(11) 99999-1234',
        creditLimit: 5000.00,
        availableCredit: 2750.00,
        usedCredit: 2250.00,
        totalDebt: 2250.00,
        status: 'active',
        createdAt: '2025-01-15',
        lastPurchase: '2025-09-05'
      },
      {
        id: '2',
        customerId: '002',
        customerName: 'Maria Santos',
        customerPhone: '(11) 88888-5678',
        creditLimit: 3000.00,
        availableCredit: 3000.00,
        usedCredit: 0,
        totalDebt: 0,
        status: 'active',
        createdAt: '2025-03-20',
        lastPurchase: '2025-08-10'
      },
      {
        id: '3',
        customerId: '003',
        customerName: 'Pedro Costa',
        customerPhone: '(11) 77777-9012',
        creditLimit: 2000.00,
        availableCredit: 0,
        usedCredit: 2000.00,
        totalDebt: 2000.00,
        status: 'blocked',
        createdAt: '2024-11-10',
        lastPurchase: '2025-07-20'
      },
      {
        id: '4',
        customerId: '004',
        customerName: 'Ana Oliveira',
        customerPhone: '(11) 66666-3456',
        creditLimit: 4000.00,
        availableCredit: 1500.00,
        usedCredit: 2500.00,
        totalDebt: 2500.00,
        status: 'active',
        createdAt: '2025-02-05',
        lastPurchase: '2025-09-01'
      }
    ]);

    // Mock data for credit purchases
    setPurchases([
      {
        id: '1',
        accountId: '1',
        customerName: 'João Silva',
        description: 'iPhone 13 Pro 128GB',
        amount: 3200.00,
        installments: 10,
        installmentValue: 320.00,
        paidInstallments: 3,
        nextDueDate: '2025-09-15',
        status: 'active',
        createdAt: '2025-06-15'
      },
      {
        id: '2',
        accountId: '3',
        customerName: 'Pedro Costa',
        description: 'Samsung Galaxy S22',
        amount: 2800.00,
        installments: 8,
        installmentValue: 350.00,
        paidInstallments: 2,
        nextDueDate: '2025-08-20',
        status: 'overdue',
        createdAt: '2025-05-20'
      },
      {
        id: '3',
        accountId: '4',
        customerName: 'Ana Oliveira',
        description: 'Fone Bluetooth JBL + Capinha',
        amount: 235.90,
        installments: 3,
        installmentValue: 78.63,
        paidInstallments: 1,
        nextDueDate: '2025-09-20',
        status: 'active',
        createdAt: '2025-08-20'
      }
    ]);
  }, []);

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.customerPhone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || account.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || purchase.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getAccountStatusInfo = (status: CreditAccount['status']) => {
    const statusMap = {
      active: { label: 'Ativo', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      blocked: { label: 'Bloqueado', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      suspended: { label: 'Suspenso', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };
    return statusMap[status];
  };

  const getPurchaseStatusInfo = (status: CreditPurchase['status']) => {
    const statusMap = {
      active: { label: 'Ativo', color: 'bg-blue-100 text-blue-800', icon: Clock },
      completed: { label: 'Quitado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      overdue: { label: 'Vencido', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    };
    return statusMap[status];
  };

  const summary = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter(a => a.status === 'active').length,
    totalCreditLimit: accounts.reduce((sum, a) => sum + a.creditLimit, 0),
    totalDebt: accounts.reduce((sum, a) => sum + a.totalDebt, 0),
    overduePurchases: purchases.filter(p => p.status === 'overdue').length,
    activePurchases: purchases.filter(p => p.status === 'active').length
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
            <CreditCard className="mr-3 text-orange-600" size={32} />
            Crediário
          </h1>
          <p className="text-slate-600">Gestão de contas e compras no crediário</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium">
            <User className="mr-2" size={20} />
            Nova Conta
          </button>
          <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium">
            <Plus className="mr-2" size={20} />
            Nova Compra
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Total Contas</h3>
          <p className="text-3xl font-bold text-blue-600">{summary.totalAccounts}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Contas Ativas</h3>
          <p className="text-3xl font-bold text-green-600">{summary.activeAccounts}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Limite Total</h3>
          <p className="text-3xl font-bold text-purple-600">
            R$ {summary.totalCreditLimit.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Total Devedor</h3>
          <p className="text-3xl font-bold text-orange-600">
            R$ {summary.totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Compras Ativas</h3>
          <p className="text-3xl font-bold text-indigo-600">{summary.activePurchases}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Vencidas</h3>
          <p className="text-3xl font-bold text-red-600">{summary.overduePurchases}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'accounts'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <User className="mr-2" size={18} />
              Contas ({accounts.length})
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'purchases'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Calculator className="mr-2" size={18} />
              Compras ({purchases.length})
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder={activeTab === 'accounts' ? "Buscar contas..." : "Buscar compras..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Todos Status</option>
              {activeTab === 'accounts' ? (
                <>
                  <option value="active">Ativas</option>
                  <option value="blocked">Bloqueadas</option>
                  <option value="suspended">Suspensas</option>
                </>
              ) : (
                <>
                  <option value="active">Ativas</option>
                  <option value="completed">Quitadas</option>
                  <option value="overdue">Vencidas</option>
                </>
              )}
            </select>
            
            <button className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
              <TrendingUp className="mr-2" size={18} />
              Relatório
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'accounts' ? (
            /* Credit Accounts Table */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Cliente</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Limite</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Disponível</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Usado</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Deve</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Última Compra</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => {
                    const statusInfo = getAccountStatusInfo(account.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <tr key={account.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-slate-800">{account.customerName}</div>
                            <div className="text-sm text-slate-600">{account.customerPhone}</div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4 font-semibold text-blue-600">
                          R$ {account.creditLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        
                        <td className="py-3 px-4 font-semibold text-green-600">
                          R$ {account.availableCredit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        
                        <td className="py-3 px-4 font-semibold text-orange-600">
                          R$ {account.usedCredit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        
                        <td className="py-3 px-4 font-semibold text-red-600">
                          R$ {account.totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        
                        <td className="py-3 px-4">
                          <span className={`flex items-center px-2 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            <StatusIcon size={14} className="mr-1" />
                            {statusInfo.label}
                          </span>
                        </td>
                        
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {account.lastPurchase ? (
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {new Date(account.lastPurchase).toLocaleDateString('pt-BR')}
                            </div>
                          ) : (
                            'Nunca'
                          )}
                        </td>
                        
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => alert(`Ver extrato da conta ${account.id}`)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Extrato
                            </button>
                            <button
                              onClick={() => alert(`Ajustar limite da conta ${account.id}`)}
                              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                            >
                              Limite
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Credit Purchases Table */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Cliente</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Produto</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Valor Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Parcelas</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Valor Parcela</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Próximo Venc.</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => {
                    const statusInfo = getPurchaseStatusInfo(purchase.status);
                    const StatusIcon = statusInfo.icon;
                    const isOverdue = new Date(purchase.nextDueDate) < new Date() && purchase.status === 'active';
                    
                    return (
                      <tr key={purchase.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {purchase.customerName}
                        </td>
                        
                        <td className="py-3 px-4">{purchase.description}</td>
                        
                        <td className="py-3 px-4 font-semibold text-green-600">
                          R$ {purchase.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm">
                            {purchase.paidInstallments}/{purchase.installments}
                          </span>
                        </td>
                        
                        <td className="py-3 px-4 font-semibold text-blue-600">
                          R$ {purchase.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className={`flex items-center ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                            <Calendar size={14} className="mr-1" />
                            {new Date(purchase.nextDueDate).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <span className={`flex items-center px-2 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            <StatusIcon size={14} className="mr-1" />
                            {statusInfo.label}
                          </span>
                        </td>
                        
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            {purchase.status === 'active' && (
                              <button
                                onClick={() => alert(`Receber parcela da compra ${purchase.id}`)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Receber
                              </button>
                            )}
                            <button
                              onClick={() => alert(`Ver detalhes da compra ${purchase.id}`)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Detalhes
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
