import { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Calendar, 
  User,
  Eye,
  Download,
  RefreshCw,
  ChevronLeft
} from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';
import { Link } from 'react-router-dom';

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
          salePrice: 3200.00
        },
        newValues: {
          salePrice: 3100.00
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
          status: 'received'
        },
        newValues: {
          status: 'diagnosed',
          diagnosis: 'Tela quebrada'
        },
        ipAddress: '192.168.1.110',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
        createdAt: '2025-09-13T14:15:00Z'
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
        createdAt: '2025-09-13T14:10:00Z'
      }
    ]);
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.tableName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = selectedUser === '' || log.userId === selectedUser;
    const matchesAction = selectedAction === '' || log.action === selectedAction;
    const matchesTable = selectedTable === '' || log.tableName === selectedTable;
    
    let matchesDate = true;
    if (dateFrom && dateTo) {
      const logDate = new Date(log.createdAt);
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo + 'T23:59:59Z');
      matchesDate = logDate >= fromDate && logDate <= toDate;
    }
    
    return matchesSearch && matchesUser && matchesAction && matchesTable && matchesDate;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE': return 'Criação';
      case 'UPDATE': return 'Edição';
      case 'DELETE': return 'Exclusão';
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
      financial_titles: 'Títulos Financeiros'
    };
    return tableMap[tableName] || tableName;
  };

  const users = [...new Set(auditLogs.map(log => ({ id: log.userId, name: log.userName })))];
  const actions = [...new Set(auditLogs.map(log => log.action))];
  const tables = [...new Set(auditLogs.map(log => log.tableName))];

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
          <p className="text-3xl font-bold text-green-600">{auditLogs.filter(l => l.action === 'CREATE').length}</p>
        </div>
        <div className={`rounded-xl p-6 shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Edições</h3>
          <p className="text-3xl font-bold text-blue-600">{auditLogs.filter(l => l.action === 'UPDATE').length}</p>
        </div>
        <div className={`rounded-xl p-6 shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Exclusões</h3>
          <p className="text-3xl font-bold text-red-600">{auditLogs.filter(l => l.action === 'DELETE').length}</p>
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

      {/* Audit Logs Table */}
      <div className={`rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}>
              <tr>
                <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Data/Hora</th>
                <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Usuário</th>
                <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Ação</th>
                <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Tabela</th>
                <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Registro</th>
                <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>IP</th>
                <th className={`text-center py-3 px-4 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className={`border-b ${
                  theme === 'dark' 
                    ? 'border-slate-700 hover:bg-slate-700/50' 
                    : 'border-slate-100 hover:bg-slate-50'
                }`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Calendar size={14} className={`mr-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} />
                      <div>
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                          {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                          {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
                      <div className="ml-2">
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{log.userName}</div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>ID: {log.userId}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getActionColor(log.action)}`}>
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${theme === 'dark' ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
                      {getTableLabel(log.tableName)}
                    </span>
                  </td>
                  
                  <td className={`py-3 px-4 text-sm font-mono ${theme === 'dark' ? 'text-slate-300' : ''}`}>
                    {log.recordId || '-'}
                  </td>
                  
                  <td className={`py-3 px-4 text-sm font-mono ${theme === 'dark' ? 'text-slate-300' : ''}`}>
                    {log.ipAddress}
                  </td>
                  
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => viewDetails(log)}
                      className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-blue-900/50' : 'hover:bg-blue-100'}`}
                      title="Ver detalhes"
                    >
                      <Eye size={16} className="text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Detalhes da Auditoria</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Data/Hora</label>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : ''}`}>{new Date(selectedLog.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Usuário</label>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : ''}`}>{selectedLog.userName}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Ação</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getActionColor(selectedLog.action)}`}>
                    {getActionLabel(selectedLog.action)}
                  </span>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Tabela</label>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : ''}`}>{getTableLabel(selectedLog.tableName)}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>ID do Registro</label>
                  <p className={`text-sm font-mono ${theme === 'dark' ? 'text-slate-300' : ''}`}>{selectedLog.recordId || '-'}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>IP</label>
                  <p className={`text-sm font-mono ${theme === 'dark' ? 'text-slate-300' : ''}`}>{selectedLog.ipAddress}</p>
                </div>
              </div>

              {selectedLog.oldValues && (
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Valores Anteriores</label>
                  <pre className={`p-3 rounded-lg text-sm overflow-x-auto ${theme === 'dark' ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-600'}`}>
                    {JSON.stringify(selectedLog.oldValues, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValues && (
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Novos Valores</label>
                  <pre className={`p-3 rounded-lg text-sm overflow-x-auto ${theme === 'dark' ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-600'}`}>
                    {JSON.stringify(selectedLog.newValues, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>User Agent</label>
                <p className={`text-xs break-all ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{selectedLog.userAgent}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}