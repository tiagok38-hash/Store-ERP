import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  MapPin,
  User,
  Building,
  Calendar,
  Clock
} from 'lucide-react';
import CustomerModal from '@/react-app/components/CustomerModal';
import CustomerHistoryModal from '@/react-app/components/CustomerHistoryModal';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  observations?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastPurchase?: string;
  totalPurchases: number;
  purchaseCount: number;
}

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  observations?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastPurchase?: string;
  totalPurchases: number;
}

export default function Registrations() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<any>(null);

  useEffect(() => {
    // Mock data for customers
    setCustomers([
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-1234',
        document: '123.456.789-00',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        observations: 'Cliente preferencial',
        isActive: true,
        createdAt: '2025-01-15',
        updatedAt: '2025-09-07',
        lastPurchase: '2025-09-05',
        totalPurchases: 15240.50,
        purchaseCount: 8
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '(11) 88888-5678',
        document: '987.654.321-00',
        address: 'Av. Principal, 456',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '02345-678',
        isActive: true,
        createdAt: '2025-02-20',
        updatedAt: '2025-08-28',
        lastPurchase: '2025-08-28',
        totalPurchases: 8750.00,
        purchaseCount: 5
      },
      {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        phone: '(11) 77777-9012',
        document: '456.789.123-00',
        address: 'Rua do Comércio, 789',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '03456-789',
        observations: 'Sempre paga em dinheiro',
        isActive: true,
        createdAt: '2024-11-10',
        updatedAt: '2025-09-01',
        lastPurchase: '2025-09-01',
        totalPurchases: 3200.00,
        purchaseCount: 2
      },
      {
        id: '4',
        name: 'Ana Oliveira',
        phone: '(11) 66666-3456',
        document: '789.123.456-00',
        isActive: false,
        createdAt: '2024-08-05',
        updatedAt: '2024-12-15',
        lastPurchase: '2024-12-15',
        totalPurchases: 950.00,
        purchaseCount: 1
      }
    ]);

    // Mock data for suppliers
    setSuppliers([
      {
        id: '1',
        name: 'Fornecedor ABC Ltda',
        email: 'contato@fornecedorabc.com.br',
        phone: '(11) 1234-5678',
        document: '12.345.678/0001-90',
        address: 'Rua Industrial, 100',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04567-890',
        observations: 'Prazo de entrega: 5 dias úteis',
        isActive: true,
        createdAt: '2024-01-15',
        updatedAt: '2025-08-20',
        lastPurchase: '2025-08-20',
        totalPurchases: 150000.00
      },
      {
        id: '2',
        name: 'Tech Distribuidora',
        email: 'vendas@techdist.com.br',
        phone: '(11) 9876-5432',
        document: '98.765.432/0001-10',
        address: 'Av. Tecnologia, 500',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '05678-901',
        isActive: true,
        createdAt: '2024-03-20',
        updatedAt: '2025-07-15',
        lastPurchase: '2025-07-15',
        totalPurchases: 89500.00
      },
      {
        id: '3',
        name: 'Acessórios & Cia',
        email: 'acessorios@email.com.br',
        phone: '(11) 5555-1234',
        document: '11.222.333/0001-44',
        isActive: false,
        createdAt: '2024-02-10',
        updatedAt: '2024-06-30',
        lastPurchase: '2024-06-30',
        totalPurchases: 25600.00
      }
    ]);
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.includes(searchTerm) ||
                         customer.document?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && customer.isActive) ||
                         (filterStatus === 'inactive' && !customer.isActive);
    return matchesSearch && matchesStatus;
  });

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.phone?.includes(searchTerm) ||
                         supplier.document?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && supplier.isActive) ||
                         (filterStatus === 'inactive' && !supplier.isActive);
    return matchesSearch && matchesStatus;
  });

  const customerSummary = {
    total: customers.length,
    active: customers.filter(c => c.isActive).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalPurchases, 0),
    totalPurchases: customers.reduce((sum, c) => sum + c.purchaseCount, 0)
  };

  const supplierSummary = {
    total: suppliers.length,
    active: suppliers.filter(s => s.isActive).length,
    totalSpent: suppliers.reduce((sum, s) => sum + s.totalPurchases, 0)
  };

  const handleViewHistory = (customer: Customer) => {
    setSelectedCustomerForHistory(customer);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
            <Users className="mr-3 text-indigo-600" size={32} />
            Cadastros
          </h1>
          <p className="text-slate-600">Gestão de clientes e fornecedores</p>
        </div>
        <button 
          onClick={() => {
            setSelectedData(null);
            setIsAddModalOpen(true);
          }}
          className="bg-gradient-to-r from-indigo-400 to-indigo-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium"
        >
          <Plus className="mr-2" size={20} />
          Novo {activeTab === 'customer' ? 'Cliente' : 'Fornecedor'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {activeTab === 'customer' ? (
          <>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Total Clientes</h3>
              <p className="text-xl font-bold text-indigo-500">{customerSummary.total}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Clientes Ativos</h3>
              <p className="text-xl font-bold text-green-500">{customerSummary.active}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Total Vendido</h3>
              <p className="text-xl font-bold text-blue-500">
                R$ {customerSummary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Total Compras</h3>
              <p className="text-xl font-bold text-purple-500">{customerSummary.totalPurchases}</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Total Fornecedores</h3>
              <p className="text-xl font-bold text-indigo-500">{supplierSummary.total}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Fornecedores Ativos</h3>
              <p className="text-xl font-bold text-green-500">{supplierSummary.active}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Total Comprado</h3>
              <p className="text-xl font-bold text-orange-500">
                R$ {supplierSummary.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Média por Fornecedor</h3>
              <p className="text-xl font-bold text-purple-500">
                R$ {(supplierSummary.totalSpent / supplierSummary.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Tabs and Content */}
      <div className="bg-white rounded-xl shadow-lg">
        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('customer')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'customer'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <User className="mr-2" size={18} />
              Clientes ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('supplier')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'supplier'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Building className="mr-2" size={18} />
              Fornecedores ({suppliers.length})
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder={`Buscar ${activeTab === 'customer' ? 'clientes' : 'fornecedores'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Todos Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
            
            
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">
                  {activeTab === 'customer' ? 'Cliente' : 'Fornecedor'}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Contato</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Documento</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Endereço</th>
                {activeTab === 'customer' ? (
                  <>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Total Compras</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Última Compra</th>
                  </>
                ) : (
                  <>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Total Comprado</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Última Compra</th>
                  </>
                )}
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'customer' ? filteredCustomers : filteredSuppliers).map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-3">
                    <div>
                      <div className="font-medium text-sm text-slate-800">{item.name}</div>
                      {item.observations && (
                        <div className="text-xs text-slate-600 italic truncate max-w-32">{item.observations}</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="py-2 px-3">
                    <div className="space-y-0.5">
                      {item.email && (
                        <div className="flex items-center text-xs">
                          <Mail size={10} className="mr-1 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-32">{item.email}</span>
                        </div>
                      )}
                      {item.phone && (
                        <div className="flex items-center text-xs">
                          <Phone size={10} className="mr-1 text-slate-400 flex-shrink-0" />
                          <span>{item.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="py-2 px-3 font-mono text-xs">
                    {item.document || '-'}
                  </td>
                  
                  <td className="py-2 px-3">
                    {item.address ? (
                      <div className="text-xs">
                        <div className="flex items-center">
                          <MapPin size={10} className="mr-1 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-24">{item.address}</span>
                        </div>
                        {item.city && item.state && (
                          <div className="text-slate-600 ml-3 truncate max-w-24">
                            {item.city}, {item.state}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  
                  <td className="py-2 px-3">
                    <div>
                      <div className="font-semibold text-green-600 text-xs">
                        R$ {item.totalPurchases.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      {activeTab === 'customer' && (
                        <div className="text-xs text-slate-600">
                          {(item as Customer).purchaseCount} compras
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="py-2 px-3 text-xs">
                    {item.lastPurchase ? (
                      <div className="flex items-center">
                        <Calendar size={10} className="mr-1 text-slate-400" />
                        {new Date(item.lastPurchase).toLocaleDateString('pt-BR')}
                      </div>
                    ) : (
                      <span className="text-slate-400">Nunca</span>
                    )}
                  </td>
                  
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      item.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  
                  <td className="py-2 px-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => alert(`Visualizar ${activeTab === 'customer' ? 'cliente' : 'fornecedor'} ${item.id}`)}
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={14} className="text-blue-600" />
                      </button>
                      {activeTab === 'customer' && (
                        <button
                          onClick={() => handleViewHistory(item as Customer)}
                          className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors"
                          title="Histórico de Compras"
                        >
                          <Clock size={14} className="text-purple-600" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedData(item);
                          setIsAddModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={14} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => alert(`Excluir ${activeTab === 'customer' ? 'cliente' : 'fornecedor'} ${item.id}`)}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer/Supplier Modal */}
      <CustomerModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedData(null);
        }}
        type={activeTab}
        data={selectedData}
      />

      {/* Customer History Modal */}
      <CustomerHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedCustomerForHistory(null);
        }}
        customer={selectedCustomerForHistory}
      />
    </div>
  );
}
