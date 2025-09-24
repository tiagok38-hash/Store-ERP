import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  BarChart3,
  Users,
  ShoppingCart,
  RefreshCw
} from 'lucide-react';

interface ReportData {
  sales: {
    period: string;
    total: number;
    quantity: number;
    profit: number;
  }[];
  customers: {
    id: string;
    name: string;
    phone?: string;
    totalPurchases: number;
    lastPurchase: string;
    frequency: number;
    birthday: string;
  }[];
  inventory: {
    id: string;
    product: string;
    brand: string;
    category: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    value: number;
    location: string;
    status: string;
  }[];
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData>({
    sales: [],
    customers: [],
    inventory: []
  });
  const [activeReport, setActiveReport] = useState<'sales' | 'customers' | 'inventory'>('sales');
  const [birthdayFilter, setBirthdayFilter] = useState<'day' | 'week' | 'month' | 'all'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [dateFrom, setDateFrom] = useState('2025-08-01');
  const [dateTo, setDateTo] = useState('2025-09-07');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock data for reports
    setReportData({
      sales: [
        { period: '2025-08-01', total: 12500.00, quantity: 8, profit: 3200.00 },
        { period: '2025-08-02', total: 8950.00, quantity: 5, profit: 2100.00 },
        { period: '2025-08-03', total: 15600.00, quantity: 12, profit: 4800.00 },
        { period: '2025-08-04', total: 6200.00, quantity: 3, profit: 1500.00 },
        { period: '2025-08-05', total: 18750.00, quantity: 15, profit: 5200.00 },
        { period: '2025-09-01', total: 22100.00, quantity: 18, profit: 6800.00 },
        { period: '2025-09-02', total: 16400.00, quantity: 11, profit: 4200.00 },
        { period: '2025-09-03', total: 19800.00, quantity: 14, profit: 5900.00 },
        { period: '2025-09-04', total: 13200.00, quantity: 9, profit: 3800.00 },
        { period: '2025-09-05', total: 25600.00, quantity: 20, profit: 7200.00 },
        { period: '2025-09-06', total: 18900.00, quantity: 13, profit: 5100.00 },
        { period: '2025-09-07', total: 21400.00, quantity: 16, profit: 6300.00 }
      ],
      customers: [
        {
          id: '1',
          name: 'João Silva',
          phone: '(11) 99999-1234',
          totalPurchases: 15200.50,
          lastPurchase: '2025-09-05',
          frequency: 8,
          birthday: '2025-09-14'
        },
        {
          id: '2',
          name: 'Maria Santos',
          phone: '(11) 88888-5678',
          totalPurchases: 8750.00,
          lastPurchase: '2025-08-28',
          frequency: 5,
          birthday: '2025-09-15'
        },
        {
          id: '3',
          name: 'Pedro Costa',
          phone: '(11) 77777-9012',
          totalPurchases: 3200.00,
          lastPurchase: '2025-09-01',
          frequency: 2,
          birthday: '2025-09-20'
        },
        {
          id: '4',
          name: 'Ana Oliveira',
          phone: '(11) 66666-3456',
          totalPurchases: 12400.00,
          lastPurchase: '2025-09-03',
          frequency: 6,
          birthday: '2025-10-10'
        },
        {
          id: '5',
          name: 'Carlos Mendes',
          phone: '(11) 55555-7890',
          totalPurchases: 9850.00,
          lastPurchase: '2025-08-30',
          frequency: 4,
          birthday: '2025-09-18'
        }
      ],
      inventory: [
        {
          id: '1',
          product: 'iPhone 13 Pro 128GB',
          brand: 'Apple',
          category: 'Smartphones',
          currentStock: 5,
          minStock: 2,
          maxStock: 20,
          value: 16000.00,
          location: 'A1-B2',
          status: 'normal'
        },
        {
          id: '2',
          product: 'Samsung Galaxy S22 128GB',
          brand: 'Samsung',
          category: 'Smartphones',
          currentStock: 1,
          minStock: 3,
          maxStock: 15,
          value: 2800.00,
          location: 'A2-B1',
          status: 'low'
        },
        {
          id: '3',
          product: 'Capinha iPhone 13 Pro',
          brand: 'Genérica',
          category: 'Acessórios',
          currentStock: 25,
          minStock: 10,
          maxStock: 50,
          value: 1147.50,
          location: 'C1-A3',
          status: 'normal'
        },
        {
          id: '4',
          product: 'Fone Bluetooth JBL',
          brand: 'JBL',
          category: 'Acessórios',
          currentStock: 8,
          minStock: 5,
          maxStock: 30,
          value: 1519.20,
          location: 'B1-C2',
          status: 'normal'
        },
        {
          id: '5',
          product: 'Película iPhone 13 Pro',
          brand: 'Genérica',
          category: 'Acessórios',
          currentStock: 0,
          minStock: 15,
          maxStock: 100,
          value: 0,
          location: 'C2-A1',
          status: 'out'
        }
      ]
    });
  }, []);

  const filteredData = () => {
    switch (activeReport) {
      case 'customers':
        return reportData.customers.filter(customer => {
          const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase());
          
          // Birthday filter
          if (birthdayFilter !== 'all') {
            const today = new Date();
            const customerBirthday = new Date(customer.birthday);
            
            if (birthdayFilter === 'day') {
              const isToday = customerBirthday.getDate() === today.getDate() && 
                            customerBirthday.getMonth() === today.getMonth();
              if (!isToday) return false;
            } else if (birthdayFilter === 'week') {
              const weekStart = new Date(today);
              weekStart.setDate(today.getDate() - today.getDay());
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);
              
              const birthdayThisYear = new Date(today.getFullYear(), customerBirthday.getMonth(), customerBirthday.getDate());
              if (birthdayThisYear < weekStart || birthdayThisYear > weekEnd) return false;
            } else if (birthdayFilter === 'month') {
              if (customerBirthday.getMonth() !== today.getMonth()) return false;
            }
          }
          
          return matchesSearch;
        });
      case 'inventory':
        return reportData.inventory.filter(item => {
          const matchesSearch = item.product.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesBrand = filterBrand === '' || item.brand === filterBrand;
          const matchesCategory = filterCategory === '' || item.category === filterCategory;
          
          // Stock filter
          let matchesStock = true;
          if (stockFilter === 'low') {
            matchesStock = item.status === 'low';
          } else if (stockFilter === 'out') {
            matchesStock = item.status === 'out';
          }
          
          return matchesSearch && matchesBrand && matchesCategory && matchesStock;
        });
      default:
        return reportData.sales.filter(sale => {
          const saleDate = new Date(sale.period);
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          return saleDate >= fromDate && saleDate <= toDate;
        });
    }
  };

  const brands = Array.from(new Set(reportData.inventory.map(i => i.brand)));
  const categories = Array.from(new Set(reportData.inventory.map(i => i.category)));

  const getSummary = () => {
    const data = filteredData();
    switch (activeReport) {
      case 'customers':
        const customers = data as typeof reportData.customers;
        return {
          total: customers.length,
          revenue: customers.reduce((sum, c) => sum + c.totalPurchases, 0),
          avgPurchase: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalPurchases, 0) / customers.length : 0,
          totalFrequency: customers.reduce((sum, c) => sum + c.frequency, 0)
        };
      case 'inventory':
        const inventory = data as typeof reportData.inventory;
        return {
          total: inventory.length,
          totalValue: inventory.reduce((sum, i) => sum + i.value, 0),
          lowStock: inventory.filter(i => i.status === 'low').length,
          outOfStock: inventory.filter(i => i.status === 'out').length
        };
      default:
        const sales = data as typeof reportData.sales;
        return {
          total: sales.length,
          revenue: sales.reduce((sum, s) => sum + s.total, 0),
          profit: sales.reduce((sum, s) => sum + s.profit, 0),
          units: sales.reduce((sum, s) => sum + s.quantity, 0)
        };
    }
  };

  const summary = getSummary();

  const handleGenerateReport = () => {
    setIsLoading(true);
    // Simular geração de relatório
    setTimeout(() => {
      setIsLoading(false);
      alert('Relatório gerado com sucesso!');
    }, 2000);
  };

  

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
            <FileText className="mr-3 text-green-600" size={32} />
            Relatórios
          </h1>
          <p className="text-slate-600">Análises e relatórios detalhados</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGenerateReport}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="mr-2 animate-spin" size={20} />
            ) : (
              <BarChart3 className="mr-2" size={20} />
            )}
            {isLoading ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'sales', label: 'Vendas', icon: ShoppingCart },
              { id: 'customers', label: 'Clientes', icon: Users },
              { id: 'inventory', label: 'Estoque', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveReport(tab.id as any)}
                  className={`py-6 px-3 border-b-2 font-medium text-lg flex items-center ${
                    activeReport === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="mr-3" size={28} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Summary Section with Filters */}
        <div className="p-6 border-b border-slate-200">
          <div className="mb-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Totais dos Filtros Aplicados</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activeReport === 'sales' && (
                <>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Faturamento</p>
                    <p className="text-xl font-bold text-green-600">
                      R$ {(summary as any).revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Lucro</p>
                    <p className="text-xl font-bold text-blue-600">
                      R$ {(summary as any).profit?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Unidades</p>
                    <p className="text-xl font-bold text-purple-600">{(summary as any).units}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Registros</p>
                    <p className="text-xl font-bold text-orange-600">{(summary as any).total}</p>
                  </div>
                </>
              )}

              {activeReport === 'customers' && (
                <>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Faturamento Total</p>
                    <p className="text-xl font-bold text-green-600">
                      R$ {(summary as any).revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Ticket Médio</p>
                    <p className="text-xl font-bold text-blue-600">
                      R$ {(summary as any).avgPurchase?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Total Compras</p>
                    <p className="text-xl font-bold text-purple-600">{(summary as any).totalFrequency}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Clientes</p>
                    <p className="text-xl font-bold text-orange-600">{(summary as any).total}</p>
                  </div>
                </>
              )}

              {activeReport === 'inventory' && (
                <>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Valor Total</p>
                    <p className="text-xl font-bold text-green-600">
                      R$ {(summary as any).totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Produtos</p>
                    <p className="text-xl font-bold text-blue-600">{(summary as any).total}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Estoque Baixo</p>
                    <p className="text-xl font-bold text-orange-600">{(summary as any).lowStock}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Sem Estoque</p>
                    <p className="text-xl font-bold text-red-600">{(summary as any).outOfStock}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {activeReport === 'sales' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data Inicial</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data Final</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {activeReport === 'customers' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Aniversariantes</label>
                <select
                  value={birthdayFilter}
                  onChange={(e) => setBirthdayFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Todos os Clientes</option>
                  <option value="day">Aniversariantes Hoje</option>
                  <option value="week">Aniversariantes na Semana</option>
                  <option value="month">Aniversariantes no Mês</option>
                </select>
              </div>
            )}

            {activeReport === 'inventory' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Marca</label>
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Todas as Marcas</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Todas as Categorias</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status do Estoque</label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">Todos os Produtos</option>
                    <option value="low">Estoque Baixo</option>
                    <option value="out">Sem Estoque</option>
                  </select>
                </div>
              </>
            )}
          </div>

          

          {/* Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {activeReport === 'sales' && (
                      <>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Data</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Faturamento</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Quantidade</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Lucro</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Margem %</th>
                      </>
                    )}
                    {activeReport === 'customers' && (
                      <>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Cliente</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Total Compras</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Frequência</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Última Compra</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Aniversário</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Ticket Médio</th>
                      </>
                    )}
                    {activeReport === 'inventory' && (
                      <>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Produto</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Marca</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Categoria</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Estoque</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Valor</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Localização</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredData().map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      {activeReport === 'sales' && (
                        <>
                          <td className="py-3 px-4">{new Date((item as any).period).toLocaleDateString('pt-BR')}</td>
                          <td className="py-3 px-4 font-semibold text-green-600">
                            R$ {(item as any).total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4">{(item as any).quantity}</td>
                          <td className="py-3 px-4 font-semibold text-blue-600">
                            R$ {(item as any).profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4">
                            {(((item as any).profit / (item as any).total) * 100).toFixed(1)}%
                          </td>
                        </>
                      )}
                      {activeReport === 'customers' && (
                        <>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{(item as any).name}</div>
                              <div className="text-sm text-slate-600">{(item as any).phone || 'Não informado'}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-green-600">
                            R$ {(item as any).totalPurchases.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4">{(item as any).frequency} compras</td>
                          <td className="py-3 px-4">{new Date((item as any).lastPurchase).toLocaleDateString('pt-BR')}</td>
                          <td className="py-3 px-4">
                            <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm">
                              {new Date((item as any).birthday).toLocaleDateString('pt-BR')}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-blue-600">
                            R$ {((item as any).totalPurchases / (item as any).frequency).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </>
                      )}
                      {activeReport === 'inventory' && (
                        <>
                          <td className="py-3 px-4 font-medium">{(item as any).product}</td>
                          <td className="py-3 px-4">{(item as any).brand}</td>
                          <td className="py-3 px-4">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                              {(item as any).category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <span className={`font-semibold ${
                                (item as any).status === 'out' ? 'text-red-600' :
                                (item as any).status === 'low' ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                {(item as any).currentStock} un
                              </span>
                              <div className="text-sm text-slate-600">
                                Min: {(item as any).minStock} | Max: {(item as any).maxStock}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-green-600">
                            R$ {(item as any).value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm">
                              {(item as any).location}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              (item as any).status === 'out' ? 'bg-red-100 text-red-800' :
                              (item as any).status === 'low' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {(item as any).status === 'out' ? 'Sem Estoque' :
                               (item as any).status === 'low' ? 'Estoque Baixo' : 'Normal'}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
