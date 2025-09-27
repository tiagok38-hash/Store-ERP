import { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Calendar,
  User,
  Eye,
  Download,
  RefreshCw,
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Edit,
  Info,
  PackagePlus, // Novo ícone para ajuste de estoque
  PackageMinus // Ícone para remoção de estoque
} from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';
import { Link } from 'react-router-dom';
import AuditLogDetailsModal from '@/react-app/components/AuditLogDetailsModal'; // Import the new modal

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  tableName: string;
  recordId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export default function AuditPage() {
  const { theme } = useTheme();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Mock data
    setAuditLogs([
      {
        id: '1',
        userId: '1',
        userName: 'Admin Sistema',
        action: 'CREATE',
        tableName: 'products',
        recordId: '101',
        newValues: {
          sku: 'IPH13PRO128',
          description: 'iPhone 13 Pro 128GB',
          salePrice: 3200.00
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: '2025-09-13T14:30:00Z'
      },
      {
        id: '2',
        userId: '2',
        userName: 'João Vendedor',
        action: 'UPDATE',
        tableName: 'products',
        recordId: '101',
        oldValues: {
          salePrice: 3200.00,
          stock: 10
        },
        newValues: {
          salePrice: 3100.00,
          stock: 9
        },
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: '2025-09-13T14:25:00Z'
      },
      {
        id: '3',
        userId: '1',
        userName: 'Admin Sistema',
        action: 'CREATE',
        tableName: 'sales',
        recordId: '201',
        newValues: {
          customerId: '1',
          totalAmount: 3100.00,
          paymentMethod: 'PIX'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: '2025-09-13T14:20:00Z'
      },
      {
        id: '4',
        userId: '3',
        userName: 'Maria Técnica',
        action: 'UPDATE',
        tableName: 'service_orders',
        recordId: '301',
        oldValues: {
          status: 'received',
          diagnosis: null
        },
        newValues: {
          status: 'diagnosed',
          diagnosis: 'Tela quebrada'
        },
        ipAddress: '192.168.1.110',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
        createdAt: '2025-09-12T16:15:00Z' // Different day
      },
      {
        id: '5',
        userId: '2',
        userName: 'João Vendedor',
        action: 'DELETE',
        tableName: 'customers',
        recordId: '501',
        oldValues: {
          name: 'Cliente Teste',
          email: 'teste@email.com'
        },
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: '2025-09-12T14:10:00Z' // Same day as #4
      },
      {
        id: '6',
        userId: '1',
        userName: 'Admin Sistema',
        action: 'CREATE',
        tableName: 'brands',
        recordId: 'B001',
        newValues: {
          name: 'Apple',
          description: 'Marca de tecnologia'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: '2025-09-11T09:00:00Z' // Another day
      },
      // Mock sales actions for specific sellers
      {
        id: '7',
        userId: '1', // Admin Sistema
        userName: 'Admin Sistema',
        action: 'SALE_FINALIZED',
        tableName: 'sales',
        recordId: '1928',
        newValues: {
          seller: 'Isaac',
          customer: 'Erica Maria Alves Do Nascimento',
          total: 3349.00,
          discount: 0.00,
          items: ['iPhone 13 Pro']
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: '2025-09-13T12:35:00Z'
      },
      {
        id: '8',
        userId: '2', // João Vendedor
        userName: 'João Vendedor',
        action: 'SALE_FINALIZED',
        tableName: 'sales',
        recordId: '1927',
        newValues: {
          seller: 'Joana',
          customer: 'Marilia Maria Da Silva Alves',
          total: 2299.00,
          discount: 0.00,
          items: ['Samsung Galaxy S22']
        },
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: '2025-09-13T11:56:00Z'
      },
      {
        id: '9',
        userId: '1', // Admin Sistema
        userName: 'Admin Sistema',
        action: 'DISCOUNT_EXCEEDED',
        tableName: 'sales',
        recordId: '1925',
        oldValues: {
          originalPrice: 1500.00,
          discountPercentage: 10
        },
        newValues: {
          finalPrice: 1199.00,
          discountPercentage: 20
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: '2025-09-13T11:33:00Z'
      },
      {
        id: '10',
        userId: '4', // Natalia
        userName: 'Natalia',
        action: 'PRODUCT_ADD',
        tableName: 'inventory_units',
        recordId: 'UNIT001',
        newValues: {
          productDescription: 'Fone Bluetooth JBL',
          costPrice: 120.00,
          salePrice: 189.90
        },
        ipAddress: '192.168.1.115',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G970F) AppleWebKit/537.36',
        createdAt: '2025-09-12T10:00:00Z'
      },
      {
        id: '11',
        userId: '4', // Natalia
        userName: 'Natalia',
        action: 'PRODUCT_DELETE',
        tableName: 'inventory_units',
        recordId: 'UNIT005',
        oldValues: {
          productDescription: 'Capinha iPhone 12',
          salePrice: 30.00
        },
        ipAddress: '192.168.1.115',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G970F) AppleWebKit/537.36',
        createdAt: '2025-09-12T10:15:00Z'
      },
      { // Novo log de auditoria para ajuste de estoque (adição)
        id: '12',
        userId: '1',
        userName: 'Admin Sistema',
        action: 'STOCK_ADJUSTMENT',
        tableName: 'inventory_units',
        recordId: '#132', // SKU do produto
        newValues: {
          productSku: '#132',
          productDescription: 'Capinha iPhone 16 Pro Max Transparente',
          change: 5,
          reason: 'Correção de inventário',
          newStock: 15,
          adjustmentType: 'add'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: '2025-09-14T10:00:00Z'
      },
      { // Novo log de auditoria para ajuste de estoque (remoção)
        id: '13',
        userId: '1',
        userName: 'Admin Sistema',
        action: 'STOCK_ADJUSTMENT',
        tableName: 'inventory_units',
        recordId: '#128', // SKU do produto
        newValues: {
          productSku: '#128',
          productDescription: 'iPhone 16 Pro Max 256GB',
          change: -1,
          reason: 'Item danificado',
          newStock: 1,
          adjustmentType: 'remove'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: '2025-09-14T10:15:00Z'
      }
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); // Sort by date descending
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
      case 'SALE_FINALIZED':
      case 'PRODUCT_ADD':
      case 'STOCK_ADJUSTMENT': // Adicionado
        return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE':
      case 'PRODUCT_DELETE':
        return 'bg-red-100 text-red-800';
      case 'DISCOUNT_EXCEEDED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string, newValues?: Record<string, any>) => {
    switch (action) {
      case 'CREATE':
      case 'SALE_FINALIZED':
      case 'PRODUCT_ADD':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'UPDATE': return <Edit size={16} className="text-blue-600" />;
      case 'DELETE':
      case 'PRODUCT_DELETE':
        return <Trash2 size={16} className="text-red-600" />;
      case 'DISCOUNT_EXCEEDED': return <AlertTriangle size={16} className="text-orange-600" />;
      case 'STOCK_ADJUSTMENT': // Adicionado
        return newValues?.adjustmentType === 'add' 
          ? <PackagePlus size={16} className="text-green-600" /> 
          : <PackageMinus size={16} className="text-red-600" />;
      default: return <Info size={16} className="text-gray-600" />;
    }
  };

  const getActionLabel = (action: string, newValues?: Record<string, any>) => {
    switch (action) {
      case 'CREATE': return 'Criação';
      case 'UPDATE': return 'Edição';
      case 'DELETE': return 'Exclusão';
      case 'SALE_FINALIZED': return 'Venda Finalizada';
      case 'DISCOUNT_EXCEEDED': return 'Desconto Excedido';
      case 'PRODUCT_ADD': return 'Produto Adicionado';
      case 'PRODUCT_DELETE': return 'Produto Excluído';
      case 'STOCK_ADJUSTMENT': // Adicionado
        return newValues?.adjustmentType === 'add' ? 'Ajuste de Estoque (Entrada)' : 'Ajuste de Estoque (Saída)';
      default: return action;
    }
  };

  const getTableLabel = (tableName: string) => {
    const tableMap: Record<string, string> = {
      products: 'Produtos',
      sales: 'Vendas',
      customers: 'Clientes',
      suppliers: 'Fornecedores',
      service_orders: 'Ordens de Serviço',
      users: 'Usuários',
      financial_titles: 'Títulos Financeiros',
      brands: 'Marcas',
      categories: 'Categorias',
      subcategories: 'Subcategorias',
      variations: 'Variações',
      payment_methods: 'Meios de Pagamento',
      warranty_terms: 'Termos de Garantia',
      stock_conditions: 'Condições de Estoque',
      stock_locations: 'Locais de Estoque',
      inventory_units: 'Unidades de Estoque',
    };
    return tableMap[tableName] || tableName;
  };

  const users = useMemo(() => {
    const uniqueUsers = new Map<string, { id: string; name: string }>();
    auditLogs.forEach(log => {
      if (!uniqueUsers.has(log.userId)) {
        uniqueUsers.set(log.userId, { id: log.userId, name: log.userName });
      }
    });
    return Array.from(uniqueUsers.values());
  }, [auditLogs]);
  
  const actions = useMemo(() => [...new Set(auditLogs.map(log => log.action))], [auditLogs]);
  const tables = useMemo(() => [...new Set(auditLogs.map(log => log.tableName))], [auditLogs]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (log.recordId && log.recordId.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesUser = selectedUser === '' || log.userId === selectedUser;
      const matchesAction = selectedAction === '' || log.action === selectedAction;
      const matchesTable = selectedTable === '' || log.tableName === selectedTable;

      let matchesDate = true;
      if (dateFrom && dateTo) {
        const logDate = new Date(log.createdAt);
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo + 'T23:59:59Z'); // End of day
        matchesDate = logDate >= fromDate && logDate <= toDate;
      } else if (dateFrom) {
        const logDate = new Date(log.createdAt);
        const fromDate = new Date(dateFrom);
        matchesDate = logDate >= fromDate;
      } else if (dateTo) {
        const logDate = new Date(log.createdAt);
        const toDate = new Date(dateTo + 'T23:59:59Z');
        matchesDate = logDate <= toDate;
      }

      return matchesSearch && matchesUser && matchesAction && matchesTable && matchesDate;
    });
  }, [auditLogs, searchTerm, selectedUser, selectedAction, selectedTable, dateFrom, dateTo]);

  const groupedLogs = useMemo(() => {
    const groups = new Map<string, AuditLog[]>();
    filteredLogs.forEach(log => {
      const dateKey = new Date(log.createdAt).toLocaleDateString('pt-BR');
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)?.push(log);
    });
    return Array.from(groups.entries()).sort(([dateA], [dateB]) => {
      // Sort dates in descending order
      const [dayA, monthA, yearA] = dateA.split('/').map(Number);
      const [dayB, monthB, yearB] = dateB.split('/').map(Number);
      const fullDateA = new Date(yearA, monthA - 1, dayA);
      const fullDateB = new Date(yearB, monthB - 1, dayB);
      return fullDateB.getTime() - fullDateA.getTime();
    });
  }, [filteredLogs]);

  const exportLogs = () => {
    // Implementar exportação
    alert('Exportando logs de auditoria...');
  };

  const viewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 to-slate-800'
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            to="/administration"
            className={`inline-flex items-center text-sm font-medium mb-4 transition-colors ${
              theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            <ChevronLeft size={16} className="mr-1" />
            Voltar para Administração
          </Link>
          <h1 className={`text-3xl font-bold mb-2 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            <History className="mr-3 text-slate-600" size={32} />
            Auditoria do Sistema
          </h1>
          <p className={`text-slate-600 ${theme === 'dark' ? 'text-slate-300' : ''}`}>Histórico de ações realizadas no sistema</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium"
          >
            <RefreshCw className="mr-2" size={18} />
            Atualizar
          </button>
          <button
            onClick={exportLogs}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium"
          >
            <Download className="mr-2" size={18} />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className={`rounded-xl p-6 shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Total de Logs</h3>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{auditLogs.length}</p>
        </div>
        <div className={`rounded-xl p-6 shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Criações</h3>
          <p className="text-3xl font-bold text-green-600">{auditLogs.filter(l => l.action === 'CREATE' || l.action === 'SALE_FINALIZED' || l.action === 'PRODUCT_ADD' || l.action === 'STOCK_ADJUSTMENT').length}</p>
        </div>
        <div className={`rounded-xl p-6 shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Edições</h3>
          <p className="text-3xl font-bold text-blue-600">{auditLogs.filter(l => l.action === 'UPDATE').length}</p>
        </div>
        <div className={`rounded-xl p-6 shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Exclusões</h3>
          <p className="text-3xl font-bold text-red-600">{auditLogs.filter(l => l.action === 'DELETE' || l.action === 'PRODUCT_DELETE').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`rounded-xl shadow-lg p-6 mb-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} size={20} />
            <input
              type="text"
              placeholder="Buscar logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                theme === 'dark'
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
              theme === 'dark'
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="">Todos Usuários</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
              theme === 'dark'
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="">Todas Ações</option>
            {actions.map(action => (
              <option key={action} value={action}>{getActionLabel(action)}</option>
            ))}
          </select>

          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
              theme === 'dark'
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="">Todas Tabelas</option>
            {tables.map(table => (
              <option key={table} value={table}>{getTableLabel(table)}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
              theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
            placeholder="Data inicial"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
              theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
            placeholder="Data final"
          />
        </div>
      </div>

      {/* Audit Logs Timeline */}
      <div className={`rounded-xl shadow-lg p-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Linha do Tempo de Auditoria</h3>
        {groupedLogs.length === 0 ? (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            <History size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum log de auditoria encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="relative pl-8 sm:pl-32 py-6">
            <div className={`absolute left-0 sm:left-16 top-0 bottom-0 w-0.5 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

            {groupedLogs.map(([date, logsForDay]) => (
              <div key={date} className="mb-10">
                <div className={`absolute left-0 sm:left-16 -ml-2 sm:-ml-3.5 w-4 h-4 rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} border-2 ${theme === 'dark' ? 'border-slate-800' : 'border-white'} z-10`}></div>
                <h4 className={`absolute left-8 sm:left-24 -mt-2 text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  {date}
                </h4>
                <div className="ml-8 sm:ml-24 mt-8 space-y-4">
                  {logsForDay.map((log) => (
                    <div
                      key={log.id}
                      className={`relative p-4 rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
                        theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className={`absolute -left-8 sm:-left-20 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full ${theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'} border-2 ${theme === 'dark' ? 'border-slate-800' : 'border-white'}`}></div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action, log.newValues)}
                          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                            {getActionLabel(log.action, log.newValues)} em {getTableLabel(log.tableName)}
                          </span>
                          {log.recordId && (
                            <span className={`text-xs font-mono px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                              ID: {log.recordId}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-3`}>
                        Por <span className="font-medium">{log.userName}</span> (IP: {log.ipAddress})
                      </p>
                      <button
                        onClick={() => viewDetails(log)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center ${
                          theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        <Eye size={14} className="mr-1" />
                        Ver Detalhes
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AuditLogDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        log={selectedLog}
      />
    </div>
  );
}