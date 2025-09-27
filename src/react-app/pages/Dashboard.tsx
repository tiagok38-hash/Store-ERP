import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  TrendingUp,
  Eye,
  Calendar,
  DollarSign,
  Package,
  UserCheck,
  Settings,
  AlertTriangle // Importar AlertTriangle para estoque baixo
} from 'lucide-react';
import DashboardCard from '@/react-app/components/DashboardCard';
import { useTheme } from '@/react-app/hooks/useTheme';
import { useAuth } from '@/react-app/hooks/useAuth';
import { UserPermissions } from '@/shared/auth-types';
import { useNavigate } from 'react-router'; // Importar useNavigate

const recentSales = [
  { id: 1, customer: 'João Silva', product: 'iPhone 13 Pro', amount: 3200, profit: 850, time: '10:30' },
  { id: 2, customer: 'Maria Santos', product: 'Samsung Galaxy S22', amount: 2899, profit: 720, time: '11:15' },
  { id: 3, customer: 'Pedro Costa', product: 'Fone Bluetooth', amount: 159, profit: 55, time: '12:00' },
  { id: 4, customer: 'Ana Oliveira', product: 'Capinha iPhone', amount: 45, profit: 25, time: '12:30' },
  { id: 5, customer: 'Carlos Lima', product: 'Carregador USB-C', amount: 70, profit: 35, time: '13:15' },
];

// Dados mockados para produtos com estoque baixo
const lowStockProducts = [
  { id: 1, product: 'Capinha iPhone 16 Pro Max', currentStock: 2, minStock: 5 },
  { id: 2, product: 'Película Galaxy S24 Ultra', currentStock: 1, minStock: 3 },
  { id: 3, product: 'Carregador USB-C 20W', currentStock: 4, minStock: 10 },
  { id: 4, product: 'Fone Bluetooth JBL', currentStock: 3, minStock: 5 },
];

type PeriodFilter = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

const periodOptions = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'month', label: 'Este Mês' },
  { value: 'quarter', label: 'Este Trimestre' },
  { value: 'year', label: 'Este Ano' },
  { value: 'custom', label: 'Período Personalizado' },
];

// Define a default color option for new cards
const defaultCardColor = { value: 'from-blue-500 to-blue-600', bg: 'bg-blue-500', textColor: 'text-white' };

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { hasPermission } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('today');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [cardSettings, setCardSettings] = useState(() => {
    const defaultSettings = {
      revenueAndSales: { visible: true, color: { value: 'from-blue-600 to-blue-700', bg: 'bg-blue-600', textColor: 'text-white' } },
      stock: { visible: true, color: { value: 'from-orange-600 to-orange-700', bg: 'bg-orange-600', textColor: 'text-white' } },
      customers: { visible: true, color: { value: 'from-purple-600 to-purple-700', bg: 'bg-purple-600', textColor: 'text-white' } },
      lowStock: { visible: true, color: { value: 'from-red-500 to-red-600', bg: 'bg-red-500', textColor: 'text-white' } }
    };
    const saved = localStorage.getItem('dashboardCardSettings');
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved);
        const mergedSettings = { ...defaultSettings };
        for (const key in parsedSaved) {
          if (parsedSaved.hasOwnProperty(key) && mergedSettings.hasOwnProperty(key)) {
            // Ensure color is an object, not just a string
            if (typeof parsedSaved[key].color === 'string') {
              // Fallback to default if saved color is old format
              mergedSettings[key] = { ...mergedSettings[key], ...parsedSettings[key], color: defaultCardColor };
            } else {
              mergedSettings[key] = { ...mergedSettings[key], ...parsedSaved[key] };
            }
          } else if (parsedSaved.hasOwnProperty(key)) {
            // Handle new cards added to settings
            if (typeof parsedSaved[key].color === 'string') {
              mergedSettings[key] = { ...parsedSaved[key], color: defaultCardColor };
            } else {
              mergedSettings[key] = parsedSaved[key];
            }
          }
        }
        return mergedSettings;
      } catch (e) {
        console.error("Failed to parse dashboardCardSettings from localStorage, using default.", e);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('dashboardCardSettings', JSON.stringify(cardSettings));
  }, [cardSettings]);

  // Mock data that changes based on period
  const getDataForPeriod = (period: PeriodFilter) => {
    const periodData: Record<string, any> = {
      today: {
        sales: 23,
        revenue: 8450,
        profit: 1685,
        stockQuantity: 145,
        stockCost: 65400,
        stockValue: 98200,
        customers: 145,
        lowStockItems: 5, // Mock para estoque baixo
        salesTrend: '+15%',
        revenueTrend: '+22%',
        profitTrend: '+19%',
        stockTrend: '+8%',
        customersTrend: '+12%',
        lowStockTrend: '+2%' // Mock para estoque baixo
      },
      week: {
        sales: 156,
        revenue: 52800,
        profit: 11235,
        stockQuantity: 234,
        stockCost: 145600,
        stockValue: 230400,
        customers: 245,
        lowStockItems: 12, // Mock para estoque baixo
        salesTrend: '+28%',
        revenueTrend: '+35%',
        profitTrend: '+31%',
        stockTrend: '+15%',
        customersTrend: '+18%',
        lowStockTrend: '+5%' // Mock para estoque baixo
      },
      month: {
        sales: 687,
        revenue: 234500,
        profit: 48670,
        stockQuantity: 456,
        stockCost: 567800,
        stockValue: 890200,
        customers: 456,
        lowStockItems: 20, // Mock para estoque baixo
        salesTrend: '+42%',
        revenueTrend: '+38%',
        profitTrend: '+45%',
        stockTrend: '+22%',
        customersTrend: '+25%',
        lowStockTrend: '+10%' // Mock para estoque baixo
      },
      quarter: {
        sales: 2156,
        revenue: 758900,
        profit: 156780,
        stockQuantity: 789,
        stockCost: 1245600,
        stockValue: 2134500,
        customers: 789,
        lowStockItems: 35, // Mock para estoque baixo
        salesTrend: '+33%',
        revenueTrend: '+29%',
        profitTrend: '+36%',
        stockTrend: '+28%',
        customersTrend: '+32%',
        lowStockTrend: '+8%' // Mock para estoque baixo
      },
      year: {
        sales: 8945,
        revenue: 3245600,
        profit: 678900,
        stockQuantity: 1245,
        stockCost: 4567800,
        stockValue: 7890200,
        customers: 1245,
        lowStockItems: 50, // Mock para estoque baixo
        salesTrend: '+48%',
        revenueTrend: '+52%',
        profitTrend: '+55%',
        stockTrend: '+35%',
        customersTrend: '+41%',
        lowStockTrend: '+15%' // Mock para estoque baixo
      }
    };
    return periodData[period];
  };

  const data = getDataForPeriod(selectedPeriod === 'custom' ? 'today' : selectedPeriod);

  const getPeriodLabel = (period: PeriodFilter) => {
    const labels: Record<string, string> = {
      today: 'Hoje',
      week: 'Semana',
      month: 'Mês',
      quarter: 'Trimestre',
      year: 'Ano',
      custom: 'Personalizado'
    };
    return labels[period] || 'Personalizado';
  };

  const handleCardVisibilityChange = (cardId: string, visible: boolean) => {
    setCardSettings((prev: any) => ({
      ...prev,
      [cardId]: { ...prev[cardId], visible }
    }));
  };

  const handleCardColorChange = (cardId: string, color: { value: string; bg: string; textColor: string; }) => {
    setCardSettings((prev: any) => ({
      ...prev,
      [cardId]: { ...prev[cardId], color }
    }));
  };

  const getHiddenCardsCount = () => {
    return Object.values(cardSettings).filter((card: any) => !card.visible).length;
  };

  const restoreHiddenCards = () => {
    setCardSettings((prev: any) => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        updated[key].visible = true;
      });
      return updated;
    });
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-100 to-slate-200'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-3xl font-bold mb-2 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            <LayoutDashboard className="mr-3 text-blue-600" size={32} />
            Dashboard
          </h1>
          <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
            Visão geral do seu negócio
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Period Filter */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-slate-700 border-slate-600'
                : 'bg-white border-slate-300'
            }`}>
              <Calendar className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} size={18} />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as PeriodFilter)}
                className={`bg-transparent border-none focus:outline-none focus:ring-0 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-700'
                }`}
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Date Range */}
            {selectedPeriod === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className={`px-3 py-2 border rounded-lg text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                />
                <span className={theme === 'dark' ? 'text-white' : 'text-slate-600'}>até</span>
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className={`px-3 py-2 border rounded-lg text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                />
              </div>
            )}
          </div>

          {/* Hidden Cards Restore */}
          {getHiddenCardsCount() > 0 && (
            <button 
              onClick={restoreHiddenCards}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Eye className="mr-2" size={18} />
              Mostrar {getHiddenCardsCount()} card{getHiddenCardsCount() > 1 ? 's' : ''} oculto{getHiddenCardsCount() > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      {hasPermission(UserPermissions.DASHBOARD_CARDS_VIEW) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Faturamento e Vendas Card (Combinado) */}
          <DashboardCard
            id="revenueAndSales"
            title="Faturamento"
            value={`R$ ${data.revenue.toLocaleString('pt-BR')}`}
            icon={<DollarSign size={24} />}
            trend={parseInt(data.revenueTrend.replace('%', '').replace('+', ''))}
            subtitle={`Vendas: ${data.sales} | Lucro: R$ ${data.profit.toLocaleString('pt-BR')}`}
            isVisible={cardSettings.revenueAndSales.visible}
            customColor={cardSettings.revenueAndSales.color}
            onVisibilityChange={handleCardVisibilityChange}
            onColorChange={handleCardColorChange}
            onClick={() => navigate('/sales')}
          />

          {/* Estoque Card */}
          <DashboardCard
            id="stock"
            title="Produtos em Estoque"
            value={data.stockQuantity.toString()}
            icon={<Package size={24} />}
            trend={parseInt(data.stockTrend.replace('%', '').replace('+', ''))}
            subtitle={`Custo: R$ ${data.stockCost.toLocaleString('pt-BR')} | Venda: R$ ${data.stockValue.toLocaleString('pt-BR')}`}
            isVisible={cardSettings.stock.visible}
            customColor={cardSettings.stock.color}
            onVisibilityChange={handleCardVisibilityChange}
            onColorChange={handleCardColorChange}
            onClick={() => navigate('/inventory')}
          />

          {/* Clientes Card */}
          <DashboardCard
            id="customers"
            title="Clientes"
            value={data.customers.toString()}
            icon={<UserCheck size={24} />}
            trend={parseInt(data.customersTrend.replace('%', '').replace('+', ''))}
            isVisible={cardSettings.customers.visible}
            customColor={cardSettings.customers.color}
            onVisibilityChange={handleCardVisibilityChange}
            onColorChange={handleCardColorChange}
            onClick={() => navigate('/registrations')}
          />

          {/* Produtos com Estoque Baixo Card */}
          <DashboardCard
            id="lowStock"
            title="Estoque Baixo"
            value={data.lowStockItems.toString()}
            icon={<AlertTriangle size={24} />}
            trend={parseInt(data.lowStockTrend.replace('%', '').replace('+', ''))}
            isVisible={cardSettings.lowStock.visible}
            customColor={cardSettings.lowStock.color}
            onVisibilityChange={handleCardVisibilityChange}
            onColorChange={handleCardColorChange}
            onClick={() => navigate('/inventory')} // Redirecionar para a página de estoque
          />
        </div>
      )}

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Today */}
        <div className={`rounded-xl shadow-lg p-6 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              Vendas de Hoje
            </h3>
            <button 
              onClick={() => navigate('/sales')}
              className={`flex items-center transition-colors ${
              theme === 'dark' 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-800'
            }`}>
              <Eye size={16} className="mr-1" />
              Ver todas
            </button>
          </div>
          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div key={sale.id} className={`flex items-center justify-between p-3 rounded-lg ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
              }`}>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {sale.customer}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    {sale.product}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    R$ {sale.amount.toLocaleString('pt-BR')}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    Lucro: R$ {sale.profit}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {sale.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Produtos com Estoque Baixo */}
        <div className={`rounded-xl shadow-lg p-6 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              Produtos com Estoque Baixo
            </h3>
            <button 
              onClick={() => navigate('/inventory')}
              className={`flex items-center transition-colors ${
              theme === 'dark' 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-800'
            }`}>
              <Eye size={16} className="mr-1" />
              Ver todos
            </button>
          </div>
          <div className="space-y-4">
            {lowStockProducts.map((product) => (
              <div key={product.id} className={`flex items-center justify-between p-3 rounded-lg ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
              }`}>
                <div className="flex-1">
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {product.product}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    Estoque atual: {product.currentStock} / Mínimo: {product.minStock}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    theme === 'dark' 
                      ? 'bg-red-900/50 text-red-300' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Abaixo do Mínimo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`rounded-xl shadow-lg p-6 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      }`}>
        <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:shadow-lg transition-all duration-200 flex flex-col items-center">
            <ShoppingCart size={24} className="mb-2" />
            <span className="font-medium">Nova Venda</span>
          </button>
          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:shadow-lg transition-all duration-200 flex flex-col items-center">
            <Settings size={24} className="mb-2" />
            <span className="font-medium">Nova OS</span>
          </button>
          <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:shadow-lg transition-all duration-200 flex flex-col items-center">
            <Users size={24} className="mb-2" />
            <span className="font-medium">Novo Cliente</span>
          </button>
          <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg hover:shadow-lg transition-all duration-200 flex flex-col items-center">
            <TrendingUp size={24} className="mb-2" />
            <span className="font-medium">Relatórios</span>
          </button>
        </div>
      </div>
    </div>
  );
}