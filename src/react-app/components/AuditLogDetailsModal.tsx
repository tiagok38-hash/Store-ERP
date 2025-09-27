import { useState } from 'react';
import { X, History, CheckCircle, AlertTriangle, Trash2, Edit, Info } from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';

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

interface AuditLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

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
    financial_titles: 'Títulos Financeiros',
    brands: 'Marcas',
    categories: 'Categorias',
    subcategories: 'Subcategorias',
    variations: 'Variações',
    payment_methods: 'Meios de Pagamento',
    warranty_terms: 'Termos de Garantia',
    stock_conditions: 'Condições de Estoque',
    stock_locations: 'Locais de Estoque',
  };
  return tableMap[tableName] || tableName;
};

export default function AuditLogDetailsModal({ isOpen, onClose, log }: AuditLogDetailsModalProps) {
  const { theme } = useTheme();
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // Match animation duration
  };

  if (!isOpen || !log && !isAnimatingOut) return null;

  const actionColorClass = getActionColor(log.action);
  const actionLabel = getActionLabel(log.action);
  const tableLabel = getTableLabel(log.tableName);

  const renderValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const renderDiff = () => {
    if (log.action !== 'UPDATE' || !log.oldValues || !log.newValues) return null;

    const changes: { field: string; oldValue: any; newValue: any }[] = [];
    const allKeys = new Set([...Object.keys(log.oldValues), ...Object.keys(log.newValues)]);

    allKeys.forEach(key => {
      const oldValue = log.oldValues?.[key];
      const newValue = log.newValues?.[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field: key, oldValue, newValue });
      }
    });

    if (changes.length === 0) return <p className="text-slate-500">Nenhuma alteração detectada.</p>;

    return (
      <div className="space-y-3">
        {changes.map((change, index) => (
          <div key={index} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Campo: {change.field}</p>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              <div>
                <span className={`block font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Valor Anterior:</span>
                <pre className={`p-2 rounded text-red-600 overflow-x-auto ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  {renderValue(change.oldValue)}
                </pre>
              </div>
              <div>
                <span className={`block font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Novo Valor:</span>
                <pre className={`p-2 rounded text-green-600 overflow-x-auto ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  {renderValue(change.newValue)}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} ${isAnimatingOut ? 'animate-modal-out' : 'animate-modal-in'}`}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r from-slate-600 to-slate-700 text-white p-4 flex justify-between items-center rounded-t-xl`}>
          <h2 className="text-xl font-bold flex items-center">
            <History className="mr-2" size={24} />
            Detalhes do Log de Auditoria
          </h2>
          <button
            onClick={handleClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Data/Hora</label>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : ''}`}>{new Date(log.createdAt).toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Usuário</label>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : ''}`}>{log.userName} (ID: {log.userId})</p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Ação</label>
              <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${actionColorClass}`}>
                {actionLabel}
              </span>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Tabela</label>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : ''}`}>{tableLabel}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>ID do Registro</label>
              <p className={`text-sm font-mono ${theme === 'dark' ? 'text-slate-300' : ''}`}>{log.recordId || '-'}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>IP</label>
              <p className={`text-sm font-mono ${theme === 'dark' ? 'text-slate-300' : ''}`}>{log.ipAddress}</p>
            </div>
          </div>

          {log.action === 'UPDATE' && (
            <div className="mb-4">
              <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Alterações Detalhadas</h3>
              {renderDiff()}
            </div>
          )}

          {log.action === 'CREATE' && log.newValues && (
            <div className="mb-4">
              <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Valores Criados</h3>
              <pre className={`p-3 rounded-lg text-sm overflow-x-auto ${theme === 'dark' ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-600'}`}>
                {JSON.stringify(log.newValues, null, 2)}
              </pre>
            </div>
          )}

          {log.action === 'DELETE' && log.oldValues && (
            <div className="mb-4">
              <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Valores Excluídos</h3>
              <pre className={`p-3 rounded-lg text-sm overflow-x-auto ${theme === 'dark' ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-600'}`}>
                {JSON.stringify(log.oldValues, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>User Agent</label>
            <p className={`text-xs break-all ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{log.userAgent}</p>
          </div>
        </div>
      </div>
    </div>
  );
}