import { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  Save,
  X,
  ChevronLeft
} from 'lucide-react';
import { UserPermissions } from '@/shared/auth-types';
import { useTheme } from '@/react-app/hooks/useTheme';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'seller' | 'technician' | 'financial' | 'stock' | 'auditor';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  key: string;
  label: string;
  color: string;
  defaultPermissions: string[];
}

const roles: Role[] = [
  {
    key: 'admin',
    label: 'Administrador',
    color: 'bg-red-100 text-red-800',
    defaultPermissions: Object.values(UserPermissions)
  },
  {
    key: 'manager',
    label: 'Gerente',
    color: 'bg-purple-100 text-purple-800',
    defaultPermissions: [
      UserPermissions.DASHBOARD_VIEW, UserPermissions.DASHBOARD_CARDS_VIEW,
      UserPermissions.SALES_VIEW, UserPermissions.SALES_CREATE, UserPermissions.SALES_EDIT, UserPermissions.SALES_CARDS_VIEW,
      UserPermissions.INVENTORY_VIEW, UserPermissions.INVENTORY_CREATE, UserPermissions.INVENTORY_EDIT,
      UserPermissions.CUSTOMERS_VIEW, UserPermissions.CUSTOMERS_CREATE, UserPermissions.CUSTOMERS_EDIT,
      UserPermissions.REPORTS_VIEW, UserPermissions.REPORTS_EXPORT,
      UserPermissions.SECTION_BRANDS_CATEGORIES, UserPermissions.SECTION_PAYMENT_METHODS, UserPermissions.SECTION_WARRANTY_STOCK
    ]
  },
  {
    key: 'seller',
    label: 'Vendedor',
    color: 'bg-green-100 text-green-800',
    defaultPermissions: [
      UserPermissions.DASHBOARD_VIEW, UserPermissions.DASHBOARD_CARDS_VIEW,
      UserPermissions.SALES_VIEW, UserPermissions.SALES_CREATE, UserPermissions.SALES_CARDS_VIEW,
      UserPermissions.INVENTORY_VIEW,
      UserPermissions.CUSTOMERS_VIEW, UserPermissions.CUSTOMERS_CREATE, UserPermissions.CUSTOMERS_EDIT
    ]
  },
  {
    key: 'technician',
    label: 'Técnico',
    color: 'bg-blue-100 text-blue-800',
    defaultPermissions: [
      UserPermissions.DASHBOARD_VIEW,
      UserPermissions.SERVICE_VIEW, UserPermissions.SERVICE_CREATE, UserPermissions.SERVICE_EDIT,
      UserPermissions.INVENTORY_VIEW,
      UserPermissions.CUSTOMERS_VIEW
    ]
  },
  {
    key: 'financial',
    label: 'Financeiro',
    color: 'bg-yellow-100 text-yellow-800',
    defaultPermissions: [
      UserPermissions.DASHBOARD_VIEW, UserPermissions.DASHBOARD_CARDS_VIEW,
      UserPermissions.FINANCIAL_VIEW, UserPermissions.FINANCIAL_CREATE, UserPermissions.FINANCIAL_EDIT,
      UserPermissions.SALES_VIEW,
      UserPermissions.CUSTOMERS_VIEW,
      UserPermissions.REPORTS_VIEW
    ]
  },
  {
    key: 'stock',
    label: 'Estoquista',
    color: 'bg-indigo-100 text-indigo-800',
    defaultPermissions: [
      UserPermissions.DASHBOARD_VIEW,
      UserPermissions.INVENTORY_VIEW, UserPermissions.INVENTORY_CREATE, UserPermissions.INVENTORY_EDIT, UserPermissions.INVENTORY_MOVEMENT,
      UserPermissions.CUSTOMERS_VIEW
    ]
  },
  {
    key: 'auditor',
    label: 'Auditor',
    color: 'bg-gray-100 text-gray-800',
    defaultPermissions: [
      UserPermissions.DASHBOARD_VIEW, UserPermissions.DASHBOARD_CARDS_VIEW,
      UserPermissions.AUDIT_VIEW,
      UserPermissions.REPORTS_VIEW, UserPermissions.REPORTS_EXPORT,
      UserPermissions.SALES_VIEW,
      UserPermissions.INVENTORY_VIEW,
      UserPermissions.FINANCIAL_VIEW
    ]
  }
];

const permissionGroups = [
  {
    name: 'Dashboard',
    permissions: [
      { key: UserPermissions.DASHBOARD_VIEW, label: 'Acessar dashboard' },
      { key: UserPermissions.DASHBOARD_CARDS_VIEW, label: 'Visualizar cards do dashboard' }
    ]
  },
  {
    name: 'Vendas',
    permissions: [
      { key: UserPermissions.SALES_VIEW, label: 'Visualizar vendas' },
      { key: UserPermissions.SALES_CREATE, label: 'Criar vendas' },
      { key: UserPermissions.SALES_EDIT, label: 'Editar vendas' },
      { key: UserPermissions.SALES_DELETE, label: 'Excluir vendas' },
      { key: UserPermissions.SALES_CARDS_VIEW, label: 'Visualizar cards de vendas' }
    ]
  },
  {
    name: 'Estoque',
    permissions: [
      { key: UserPermissions.INVENTORY_VIEW, label: 'Visualizar estoque' },
      { key: UserPermissions.INVENTORY_CREATE, label: 'Criar produtos' },
      { key: UserPermissions.INVENTORY_EDIT, label: 'Editar produtos' },
      { key: UserPermissions.INVENTORY_DELETE, label: 'Excluir produtos' },
      { key: UserPermissions.INVENTORY_MOVEMENT, label: 'Movimentar estoque' }
    ]
  },
  {
    name: 'Clientes e Fornecedores',
    permissions: [
      { key: UserPermissions.CUSTOMERS_VIEW, label: 'Visualizar clientes/fornecedores' },
      { key: UserPermissions.CUSTOMERS_CREATE, label: 'Criar clientes/fornecedores' },
      { key: UserPermissions.CUSTOMERS_EDIT, label: 'Editar clientes/fornecedores' },
      { key: UserPermissions.CUSTOMERS_DELETE, label: 'Excluir clientes/fornecedores' }
    ]
  },
  {
    name: 'Administração - Seções',
    permissions: [
      { key: UserPermissions.SECTION_BRANDS_CATEGORIES, label: 'Marcas e Categorias' },
      { key: UserPermissions.SECTION_PAYMENT_METHODS, label: 'Meios de Pagamento' },
      { key: UserPermissions.SECTION_WARRANTY_STOCK, label: 'Garantias e Estoque' }
    ]
  },
  {
    name: 'Sistema',
    permissions: [
      { key: UserPermissions.USERS_VIEW, label: 'Visualizar usuários' },
      { key: UserPermissions.USERS_CREATE, label: 'Criar usuários' },
      { key: UserPermissions.USERS_EDIT, label: 'Editar usuários' },
      { key: UserPermissions.USERS_DELETE, label: 'Excluir usuários' },
      { key: UserPermissions.SETTINGS_VIEW, label: 'Visualizar configurações' },
      { key: UserPermissions.SETTINGS_EDIT, label: 'Editar configurações' },
      { key: UserPermissions.REPORTS_VIEW, label: 'Visualizar relatórios' },
      { key: UserPermissions.REPORTS_EXPORT, label: 'Exportar relatórios' },
      { key: UserPermissions.AUDIT_VIEW, label: 'Visualizar auditoria' }
    ]
  }
];

export default function UsersManagementPage() {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'seller' as User['role'],
    permissions: [] as string[],
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Mock data
    setUsers([
      {
        id: '1',
        name: 'Admin Sistema',
        email: 'admin@sistema.com',
        phone: '(11) 99999-0000',
        role: 'admin',
        permissions: Object.values(UserPermissions),
        isActive: true,
        lastLogin: '2025-09-13T10:30:00Z',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-09-13T10:30:00Z'
      },
      {
        id: '2',
        name: 'João Vendedor',
        email: 'joao@loja.com',
        phone: '(11) 98888-1111',
        role: 'seller',
        permissions: [
          UserPermissions.SALES_VIEW,
          UserPermissions.SALES_CREATE,
          UserPermissions.INVENTORY_VIEW,
          UserPermissions.CUSTOMERS_VIEW,
          UserPermissions.CUSTOMERS_CREATE
        ],
        isActive: true,
        lastLogin: '2025-09-13T09:15:00Z',
        createdAt: '2025-03-15T00:00:00Z',
        updatedAt: '2025-09-13T09:15:00Z'
      },
      {
        id: '3',
        name: 'Maria Técnica',
        email: 'maria@loja.com',
        phone: '(11) 97777-2222',
        role: 'technician',
        permissions: [
          UserPermissions.SERVICE_VIEW,
          UserPermissions.SERVICE_CREATE,
          UserPermissions.SERVICE_EDIT,
          UserPermissions.INVENTORY_VIEW,
          UserPermissions.CUSTOMERS_VIEW
        ],
        isActive: true,
        lastLogin: '2025-09-12T16:45:00Z',
        createdAt: '2025-04-20T00:00:00Z',
        updatedAt: '2025-09-12T16:45:00Z'
      }
    ]);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === '' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && user.isActive) ||
                         (selectedStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleInfo = (roleKey: string) => {
    return roles.find(r => r.key === roleKey) || roles[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!selectedUser && !formData.password) newErrors.password = 'Senha é obrigatória';
    if (!selectedUser && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const userData: User = {
      id: selectedUser?.id || String(Date.now()),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      permissions: formData.permissions,
      isActive: true,
      createdAt: selectedUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (selectedUser) {
      setUsers(users.map(u => u.id === selectedUser.id ? userData : u));
    } else {
      setUsers([...users, userData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'seller',
      permissions: [],
      password: '',
      confirmPassword: ''
    });
    setSelectedUser(null);
    setIsAddModalOpen(false);
    setErrors({});
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      permissions: user.permissions,
      password: '',
      confirmPassword: ''
    });
    setIsAddModalOpen(true);
  };

  const handleRoleChange = (role: User['role']) => {
    const roleInfo = getRoleInfo(role);
    setFormData({
      ...formData,
      role,
      permissions: roleInfo.defaultPermissions
    });
  };

  const handlePermissionToggle = (permission: string) => {
    const newPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    
    setFormData({ ...formData, permissions: newPermissions });
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
  };

  const deleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
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
          <h1 className={`text-3xl font-bold mb-2 flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            <UserCheck className="mr-3 text-indigo-600" size={32} />
            Gestão de Usuários
          </h1>
          <p className={`text-slate-600 ${theme === 'dark' ? 'text-slate-300' : ''}`}>
            Gestão de usuários e permissões do sistema
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-indigo-400 to-indigo-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium"
        >
          <Plus className="mr-2" size={20} />
          Novo Usuário
        </button>
      </div>

      {/* Filters */}
      <div className={`rounded-xl shadow-lg p-6 mb-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                theme === 'dark'
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              theme === 'dark'
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="">Todos os Perfis</option>
            {roles.map(role => (
              <option key={role.key} value={role.key}>{role.label}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              theme === 'dark'
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="all">Todos Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className={`rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}>
              <tr>
                <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Usuário</th>
                <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Perfil</th>
                <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Contato</th>
                <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Último Acesso</th>
                <th className={`text-left py-3 px-4 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Status</th>
                <th className={`text-center py-3 px-4 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                return (
                  <tr key={user.id} className={`border-b ${
                    theme === 'dark' 
                      ? 'border-slate-700 hover:bg-slate-700/50' 
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{user.name}</div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail size={12} className={`mr-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                            <Phone size={12} className={`mr-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className={`py-3 px-4 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      {user.lastLogin ? (
                        <div className="flex items-center">
                          <Calendar size={12} className={`mr-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} />
                          {new Date(user.lastLogin).toLocaleString('pt-BR')}
                        </div>
                      ) : (
                        <span className={`text-slate-400 ${theme === 'dark' ? 'text-slate-500' : ''}`}>Nunca acessou</span>
                      )}
                    </td>
                    
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`px-2 py-1 rounded-full text-sm ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-blue-900/50' : 'hover:bg-blue-100'}`}
                          title="Editar"
                        >
                          <Edit size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-yellow-900/50' : 'hover:bg-yellow-100'}`}
                          title={user.isActive ? 'Desativar' : 'Ativar'}
                        >
                          <Shield size={16} className={user.isActive ? 'text-yellow-600' : 'text-green-600'} />
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => deleteUser(user.id)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-red-900/50' : 'hover:bg-red-100'}`}
                            title="Excluir"
                          >
                            <Trash2 size={16} className="text-red-600" />
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

      {/* Add/Edit User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">
                {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button
                onClick={resetForm}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Informações Básicas</h3>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.name 
                          ? 'border-red-300' 
                          : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 text-slate-900')
                      }`}
                      placeholder="Digite o nome completo"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                      Email *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors.email 
                            ? 'border-red-300' 
                            : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 text-slate-900')
                        }`}
                        placeholder="usuario@email.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                      Perfil de Acesso *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value as User['role'])}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      {roles.map(role => (
                        <option key={role.key} value={role.key}>{role.label}</option>
                      ))}
                    </select>
                  </div>

                  {!selectedUser && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                          Senha *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              errors.password 
                                ? 'border-red-300' 
                                : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 text-slate-900')
                            }`}
                            placeholder="Digite a senha"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : ''}`}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                          Confirmar Senha *
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.confirmPassword 
                              ? 'border-red-300' 
                              : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 text-slate-900')
                          }`}
                          placeholder="Confirme a senha"
                        />
                        {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                      </div>
                    </>
                  )}
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Permissões</h3>
                  <div className={`max-h-96 overflow-y-auto border rounded-lg p-4 ${theme === 'dark' ? 'border-slate-700 bg-slate-700' : 'border-slate-200 bg-slate-50'}`}>
                    {permissionGroups.map(group => (
                      <div key={group.name} className="mb-4">
                        <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{group.name}</h4>
                        <div className="space-y-2">
                          {group.permissions.map(permission => (
                            <label key={permission.key} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission.key)}
                                onChange={() => handlePermissionToggle(permission.key)}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                              />
                              <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{permission.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-6 py-2 border rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
                >
                  <Save className="mr-2" size={16} />
                  {selectedUser ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}