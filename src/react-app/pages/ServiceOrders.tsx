import { useState, useEffect } from 'react';
import { 
  Wrench, 
  Search, 
  Plus, 
  Eye, 
  Edit,
  User,
  Smartphone,
  Clock,
  Settings,
  FileText,
  DollarSign
} from 'lucide-react';

interface ServiceOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  deviceBrand: string;
  deviceModel: string;
  deviceImei?: string;
  reportedIssue: string;
  diagnosis?: string;
  technicianName?: string;
  budgetAmount?: number;
  finalAmount?: number;
  status: 'received' | 'diagnosed' | 'budgeted' | 'approved' | 'in_progress' | 'completed' | 'delivered';
  createdAt: string;
  estimatedCompletion?: string;
  warrantyDays: number;
}

interface Technician {
  id: string;
  name: string;
  specialty: string;
  isActive: boolean;
}

export default function ServiceOrders() {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTechnician, setFilterTechnician] = useState('');
  
  

  useEffect(() => {
    // Mock data
    setServiceOrders([
      {
        id: 'OS001',
        customerName: 'João Silva',
        customerPhone: '(11) 99999-1234',
        deviceBrand: 'Apple',
        deviceModel: 'iPhone 13 Pro',
        deviceImei: '123456789012345',
        reportedIssue: 'Tela quebrada, touch não funciona',
        diagnosis: 'Necessário troca do display e touch',
        technicianName: 'Carlos Técnico',
        budgetAmount: 850.00,
        finalAmount: 850.00,
        status: 'in_progress',
        createdAt: '2025-09-05',
        estimatedCompletion: '2025-09-10',
        warrantyDays: 90
      },
      {
        id: 'OS002',
        customerName: 'Maria Santos',
        customerPhone: '(11) 88888-5678',
        deviceBrand: 'Samsung',
        deviceModel: 'Galaxy S22',
        deviceImei: '987654321098765',
        reportedIssue: 'Não carrega, bateria viciada',
        diagnosis: 'Bateria com defeito, conector ok',
        technicianName: 'Ana Reparos',
        budgetAmount: 180.00,
        status: 'budgeted',
        createdAt: '2025-09-06',
        warrantyDays: 60
      },
      {
        id: 'OS003',
        customerName: 'Pedro Costa',
        customerPhone: '(11) 77777-9012',
        deviceBrand: 'Xiaomi',
        deviceModel: 'Redmi Note 12',
        reportedIssue: 'Travando muito, lento',
        status: 'received',
        createdAt: '2025-09-07',
        warrantyDays: 30
      }
    ]);

    setTechnicians([
      { id: '1', name: 'Carlos Técnico', specialty: 'iPhone/Apple', isActive: true },
      { id: '2', name: 'Ana Reparos', specialty: 'Samsung/Android', isActive: true },
      { id: '3', name: 'Bruno Consertos', specialty: 'Geral', isActive: true },
      { id: '4', name: 'Marina Fix', specialty: 'Soldas/Placa', isActive: false }
    ]);
  }, []);

  const filteredOrders = serviceOrders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.deviceBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.deviceModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesTechnician = filterTechnician === '' || order.technicianName === filterTechnician;
    
    return matchesSearch && matchesStatus && matchesTechnician;
  });

  const getStatusInfo = (status: ServiceOrder['status']) => {
    const statusMap = {
      received: { label: 'Recebido', color: 'text-blue-600', bg: 'bg-blue-100' },
      diagnosed: { label: 'Diagnosticado', color: 'text-purple-600', bg: 'bg-purple-100' },
      budgeted: { label: 'Orçado', color: 'text-orange-600', bg: 'bg-orange-100' },
      approved: { label: 'Aprovado', color: 'text-green-600', bg: 'bg-green-100' },
      in_progress: { label: 'Em Andamento', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      completed: { label: 'Concluído', color: 'text-green-600', bg: 'bg-green-100' },
      delivered: { label: 'Entregue', color: 'text-slate-600', bg: 'bg-slate-100' }
    };
    return statusMap[status];
  };

  const statusCounts = {
    received: serviceOrders.filter(o => o.status === 'received').length,
    in_progress: serviceOrders.filter(o => o.status === 'in_progress').length,
    completed: serviceOrders.filter(o => o.status === 'completed').length,
    total: serviceOrders.length
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
            <Wrench className="mr-3 text-purple-600" size={32} />
            Ordem de Serviço
          </h1>
          <p className="text-slate-600">Gestão completa de serviços técnicos</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert('Modal de técnicos - será implementado')}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium"
          >
            <User className="mr-2" size={20} />
            Técnicos
          </button>
          <button 
            onClick={() => alert('Modal de nova OS - será implementado')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium"
          >
            <Plus className="mr-2" size={20} />
            Nova OS
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Total OS</h3>
          <p className="text-3xl font-bold text-purple-600">{statusCounts.total}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Recebidas</h3>
          <p className="text-3xl font-bold text-blue-600">{statusCounts.received}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Em Andamento</h3>
          <p className="text-3xl font-bold text-yellow-600">{statusCounts.in_progress}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Concluídas</h3>
          <p className="text-3xl font-bold text-green-600">{statusCounts.completed}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente, OS, dispositivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todos Status</option>
              <option value="received">Recebidas</option>
              <option value="diagnosed">Diagnosticadas</option>
              <option value="budgeted">Orçadas</option>
              <option value="approved">Aprovadas</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluídas</option>
              <option value="delivered">Entregues</option>
            </select>
            <select
              value={filterTechnician}
              onChange={(e) => setFilterTechnician(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Todos Técnicos</option>
              {technicians.filter(t => t.isActive).map(tech => (
                <option key={tech.id} value={tech.name}>{tech.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Service Orders Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Ordens de Serviço</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">OS</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Cliente</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Dispositivo</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Problema</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Técnico</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Orçamento</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Data</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Previsão</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-purple-600">{order.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-slate-600">{order.customerPhone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{order.deviceBrand} {order.deviceModel}</div>
                        {order.deviceImei && (
                          <div className="text-sm text-slate-600 flex items-center">
                            <Smartphone size={12} className="mr-1" />
                            {order.deviceImei}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-xs truncate" title={order.reportedIssue}>
                        {order.reportedIssue}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {order.technicianName ? (
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">
                          {order.technicianName}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">Não atribuído</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {order.budgetAmount ? (
                        <div>
                          <div className="font-medium text-green-600">
                            R$ {order.budgetAmount.toFixed(2)}
                          </div>
                          {order.finalAmount && order.finalAmount !== order.budgetAmount && (
                            <div className="text-sm text-slate-600">
                              Final: R$ {order.finalAmount.toFixed(2)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">Pendente</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {order.estimatedCompletion ? (
                        <div className="flex items-center">
                          <Clock size={12} className="mr-1 text-slate-400" />
                          {new Date(order.estimatedCompletion).toLocaleDateString('pt-BR')}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => alert(`Visualizar OS ${order.id} - será implementado`)}
                          className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye size={16} className="text-purple-600" />
                        </button>
                        <button
                          onClick={() => {
                            // Implementar edição
                            alert(`Editar OS ${order.id}`);
                          }}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            // Implementar impressão de orçamento
                            alert(`Imprimir orçamento para OS ${order.id}`);
                          }}
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                          title="Orçamento"
                        >
                          <FileText size={16} className="text-green-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <Settings className="mr-2 text-purple-600" size={24} />
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
              Criar Orçamento
            </button>
            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
              Finalizar Serviço
            </button>
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
              Gerar Relatório
            </button>
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
              Enviar WhatsApp
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <DollarSign className="mr-2 text-green-600" size={24} />
            Resumo Financeiro
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Orçamentos Pendentes:</span>
              <span className="font-bold text-orange-600">
                R$ {serviceOrders
                  .filter(o => o.status === 'budgeted')
                  .reduce((sum, o) => sum + (o.budgetAmount || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Serviços Aprovados:</span>
              <span className="font-bold text-green-600">
                R$ {serviceOrders
                  .filter(o => ['approved', 'in_progress'].includes(o.status))
                  .reduce((sum, o) => sum + (o.budgetAmount || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Concluídos (Mês):</span>
              <span className="font-bold text-blue-600">
                R$ {serviceOrders
                  .filter(o => o.status === 'completed')
                  .reduce((sum, o) => sum + (o.finalAmount || o.budgetAmount || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
