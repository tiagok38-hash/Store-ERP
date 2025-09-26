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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useNotification } from '@/react-app/components/NotificationSystem';
import DeleteConfirmModal from '@/react-app/components/DeleteConfirmModal';

interface Customer {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
  house_number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  observations?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  date_of_birth?: string;
  // Campos mockados, serão removidos ou calculados
  lastPurchase?: string;
  totalPurchases: number;
  purchaseCount: number;
}

interface Supplier {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
  house_number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  observations?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Campos mockados, serão removidos ou calculados
  lastPurchase?: string;
  totalPurchases: number;
}

export default function Registrations() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchCustomers();
      fetchSuppliers();
    } else {
      setCustomers([]);
      setSuppliers([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user?.id);

    if (error) {
      showError('Erro ao carregar clientes', error.message);
      console.error('Error fetching customers:', error);
    } else {
      setCustomers(data || []);
    }
    setIsLoading(false);
  };

  const fetchSuppliers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', user?.id);

    if (error) {
      showError('Erro ao carregar fornecedores', error.message);
      console.error('Error fetching suppliers:', error);
    } else {
      setSuppliers(data || []);
    }
    setIsLoading(false);
  };

  const handleItemSaved = (newItem: any) => {
    if (activeTab === 'customer') {
      if (selectedData) {
        setCustomers(customers.map(c => c.id === newItem.id ? newItem : c));
      } else {
        setCustomers([...customers, newItem]);
      }
    } else {
      if (selectedData) {
        setSuppliers(suppliers.map(s => s.id === newItem.id ? newItem : s));
      } else {
        setSuppliers([...suppliers, newItem]);
      }
    }
    setIsAddModalOpen(false);
    setSelectedData(null);
  };

  const openDeleteModal = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const deleteItem = async () => {
    if (!itemToDelete) return;

    const tableName = activeTab === 'customer' ? 'customers' : 'suppliers';
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', itemToDelete.id);

    if (error) {
      showError(`Erro ao excluir ${activeTab}`, error.message);
      console.error(`Error deleting ${tableName}:`, error);
    } else {
      if (activeTab === 'customer') {
        setCustomers(customers.filter(c => c.id !== itemToDelete.id));
      } else {
        setSuppliers(suppliers.filter(s => s.id !== itemToDelete.id));
      }
      showSuccess(`${activeTab === 'customer' ? 'Cliente' : 'Fornecedor'} Excluído`, `O ${activeTab} "${itemToDelete.name}" foi excluído com sucesso.`);
      setItemToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (customer.phone && customer.phone.includes(searchTerm)) ||
                         (customer.document && customer.document.includes(searchTerm));
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && customer.is_active) ||
                         (filterStatus === 'inactive' && !customer.is_active);
    return matchesSearch && matchesStatus;
  });

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (supplier.phone && supplier.phone.includes(searchTerm)) ||
                         (supplier.document && supplier.document.includes(searchTerm));
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && supplier.is_active) ||
                         (filterStatus === 'inactive' && !supplier.is_active);
    return matchesSearch && matchesStatus;
  });

  // Mocked summary data, will need to be calculated from Supabase in a real app
  const customerSummary = {
    total: customers.length,
    active: customers.filter(c => c.is_active).length,
    totalRevenue: 0, // Needs calculation from sales
    totalPurchases: 0 // Needs calculation from sales
  };

  const supplierSummary = {
    total: suppliers.length,
    active: suppliers.filter(s => s.is_active).length,
    totalSpent: 0 // Needs calculation from purchases
  };

  const handleViewHistory = (customer: Customer) => {
    setSelectedCustomerForHistory(customer);
    setIsHistoryModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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
                      item.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.is_active ? 'Ativo' : 'Inativo'}
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
                        onClick={() => openDeleteModal(item)}
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
        onCustomerSaved={handleItemSaved}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteItem}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir ${activeTab === 'customer' ? 'o cliente' : 'o fornecedor'} "${itemToDelete?.name}"? Esta ação não pode ser desfeita.`}
        itemName={itemToDelete?.name}
      />
    </div>
  );
}