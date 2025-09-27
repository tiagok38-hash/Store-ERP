import { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Filter, 
  ChevronDown,
  X,
  CreditCard,
  Smartphone,
  DollarSign,
  FileText,
  MoreHorizontal,
  Plus, // Importar Plus
  Minus,
  Trash2,
  User,
  Package,
  Calculator, // Importar Calculator
  Edit3,
  Check,
  Award // Ícone para ranking
} from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';
import { useNotification } from '@/react-app/components/NotificationSystem';
import SalesModal from '@/react-app/components/SalesModal'; // Importa o modal de vendas correto
import SaleActionsDropdown from '@/react-app/components/SaleActionsDropdown';
import SaleViewModal from '@/react-app/components/SaleViewModal';
import CardSimulatorModal from '@/react-app/components/CardSimulatorModal';
import { useAuth } from '@/react-app/hooks/useAuth'; // Importar useAuth
import { UserPermissions } from '@/shared/auth-types'; // Importar UserPermissions

interface Sale {
  id: string;
  date: string;
  seller: string;
  customer: string;
  status: string;
  origin: string;
  total: number;
  taxes: number;
  profit: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imei?: string;
}

interface PaymentMethod {
  type: 'money' | 'pix' | 'debit' | 'credit' | 'promissory' | 'trade_in';
  amount: number;
  installments?: number;
}

const mockProducts = [
  { 
    id: '1', 
    name: 'iPhone 13 Pro 128GB', 
    price: 3200.00, 
    requiresImei: true,
    stock: 5
  },
  { 
    id: '2', 
    name: 'Samsung Galaxy S22 128GB', 
    price: 2800.00, 
    requiresImei: true,
    stock: 8
  },
  { 
    id: '3', 
    name: 'Capinha iPhone 13 Pro', 
    price: 45.90, 
    requiresImei: false,
    stock: 25
  },
  { 
    id: '4', 
    name: 'Fone Bluetooth JBL', 
    price: 189.90, 
    requiresImei: false,
    stock: 12
  }
];

const mockSellers = [
  { id: '1', name: 'Isaac' },
  { id: '2', name: 'Joana' },
  { id: '3', name: 'Maria Madalena Da Conceição' },
  { id: '4', name: 'Natalia' },
];

const mockWarrantyTerms = [
  { id: '1', name: 'Garantia de 1 ano para defeitos de fábrica' },
  { id: '2', name: 'Garantia de 6 meses limitada' },
  { id: '3', name: 'Garantia de 3 meses para seminovos' },
  { id: '4', name: 'Sem garantia - produto usado' },
];

export default function Sales() {
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const { hasPermission } = useAuth(); // Usar o hook de autenticação
  const [dateFrom, setDateFrom] = useState('01/09/25');
  const [dateTo, setDateTo] = useState('30/09/25');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isCardSimulatorOpen, setIsCardSimulatorOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [viewingSaleId, setViewingSaleId] = useState<string | null>(null);
  const [sellerRankingSortOrder, setSellerRankingSortOrder] = useState<'desc' | 'asc'>('desc');

  // Mock data for sales
  const sales: Sale[] = [
    {
      id: '1928',
      date: '13/09/2025 12:35',
      seller: 'Isaac',
      customer: 'Erica Maria Alves Do Nascimento',
      status: 'Finalizada',
      origin: 'PDV Caixa IP #382',
      total: 3349.00,
      taxes: 0.00,
      profit: 609.00
    },
    {
      id: '1927',
      date: '13/09/2025 11:56',
      seller: 'Joana',
      customer: 'Marilia Maria Da Silva Alves',
      status: 'Finalizada',
      origin: 'PDV Caixa IP #380',
      total: 2299.00,
      taxes: 0.00,
      profit: 359.00
    },
    {
      id: '1925',
      date: '13/09/2025 11:33',
      seller: 'Maria Madalena Da Conceição',
      customer: 'Cliente Avulso',
      status: 'Finalizada',
      origin: 'PDV Caixa IP #382',
      total: 1199.00,
      taxes: 0.00,
      profit: 119.00
    },
    {
      id: '1923',
      date: '13/09/2025 11:12',
      seller: 'Natalia',
      customer: 'Alice Yasmin Nunes De Oliveira',
      status: 'Finalizada',
      origin: 'PDV Caixa IP #381',
      total: 2649.00,
      taxes: 0.00,
      profit: 389.00
    },
    {
      id: '1922',
      date: '13/09/2025 11:10',
      seller: 'Isaac',
      customer: 'Luiz Ricardo Barbosa Dos Santos',
      status: 'Finalizada',
      origin: 'PDV Caixa IP #382',
      total: 3349.00,
      taxes: 0.00,
      profit: 389.00
    }
  ];

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTaxes = sales.reduce((sum, sale) => sum + sale.taxes, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);

  // Calculate seller ranking
  const sellerRanking = useMemo(() => {
    const rankingMap: { [key: string]: { name: string; totalSales: number; salesCount: number } } = {};
    sales.forEach(sale => {
      if (!rankingMap[sale.seller]) {
        rankingMap[sale.seller] = { name: sale.seller, totalSales: 0, salesCount: 0 };
      }
      rankingMap[sale.seller].totalSales += sale.total;
      rankingMap[sale.seller].salesCount += 1;
    });

    return Object.values(rankingMap).sort((a, b) => {
      if (sellerRankingSortOrder === 'desc') {
        return b.totalSales - a.totalSales;
      }
      return a.totalSales - b.totalSales;
    });
  }, [sales, sellerRankingSortOrder]);

  const handleNewSale = () => {
    setIsNewSaleModalOpen(true);
  };

  const handleViewSale = (saleId: string) => {
    setViewingSaleId(saleId);
  };

  const handleEditSale = (saleId: string) => {
    showError('Em desenvolvimento', 'Funcionalidade de editar venda será implementada em breve.');
  };

  const handleDeleteSale = (saleId: string) => {
    showError('Em desenvolvimento', 'Funcionalidade de excluir venda será implementada em breve.');
  };

  const handleReprintSale = (saleId: string) => {
    showError('Em desenvolvimento', 'Funcionalidade de reimprimir venda será implementada em breve.');
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b ${
        theme === 'dark' ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-white/50'
      }`}>
        <div className="flex justify-between items-center mb-2"> {/* Ajustado mb-6 para mb-2 para dar espaço ao subtítulo */}
          <h1 className={`text-2xl font-bold flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            <ShoppingCart className="mr-3 text-blue-600" size={28} />
            Vendas
          </h1>
        </div>
        {/* Subtítulo adicionado aqui */}
        <p className={`text-slate-600 mb-6 ${theme === 'dark' ? 'text-slate-300' : ''}`}>
          Gerencie suas vendas e transações
        </p>

        {/* Date Filters and Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`px-3 py-2 border rounded-lg text-sm w-24 ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
              placeholder="Data inicial"
            />
            <input
              type="text"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`px-3 py-2 border rounded-lg text-sm w-24 ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
              placeholder="Data final"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 border rounded-lg text-sm ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="Todas">Todas</option>
            <option value="Finalizada">Finalizada</option>
            <option value="Pendente">Pendente</option>
            <option value="Cancelada">Cancelada</option>
          </select>

          <button className={`p-2 border rounded-lg ${
            theme === 'dark'
              ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}>
            <Filter size={16} />
          </button>

          <button className={`px-3 py-2 text-sm border rounded-lg ${
            theme === 'dark'
              ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}>
            Limpar
          </button>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleNewSale}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium flex items-center"
            >
              <Plus className="mr-2" size={18} /> {/* Ícone adicionado */}
              NOVA VENDA
            </button>
            <button 
              onClick={() => setIsCardSimulatorOpen(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:shadow-lg transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <Calculator className="mr-2" size={18} /> {/* Ícone adicionado */}
              Simulador de cartão
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {hasPermission(UserPermissions.SALES_VIEW_REVENUE_CARD) && (
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-center shadow-lg">
              <h3 className="text-xs font-medium mb-1 text-green-100">
                Faturamento
              </h3>
              <p className="text-lg font-bold text-white">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          {hasPermission(UserPermissions.SALES_VIEW_TAXES_CARD) && (
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl text-center shadow-lg">
              <h3 className="text-xs font-medium mb-1 text-red-100">
                Taxas
              </h3>
              <p className="text-lg font-bold text-white">
                R$ {totalTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          {hasPermission(UserPermissions.SALES_VIEW_PROFIT_CARD) && (
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-center shadow-lg">
              <h3 className="text-xs font-medium mb-1 text-blue-100">
                Lucro
              </h3>
              <p className="text-lg font-bold text-white">
                R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Seller Ranking */}
      <div className="p-6 pt-0">
        <div className={`rounded-lg shadow-lg overflow-hidden mb-6 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} flex justify-between items-center`}>
            <h3 className={`text-lg font-semibold flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              <Award className="mr-2 text-yellow-500" size={20} />
              Ranking de Vendedores
            </h3>
            <button
              onClick={() => setSellerRankingSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Ordenar por Vendas {sellerRankingSortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}>
                <tr>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Posição</th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Vendedor</th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Total Vendido</th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Nº de Vendas</th>
                </tr>
              </thead>
              <tbody>
                {sellerRanking.map((seller, index) => (
                  <tr key={seller.name} className={`border-b transition-colors ${
                    theme === 'dark' 
                      ? 'border-slate-700 hover:bg-slate-700/50' 
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}>
                    <td className={`py-3 px-4 font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                      {index + 1}º
                    </td>
                    <td className={`py-3 px-4 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      {seller.name}
                    </td>
                    <td className={`py-3 px-4 text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      R$ {seller.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 px-4 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      {seller.salesCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="p-6 pt-0">
        <div className={`rounded-lg shadow-lg overflow-hidden ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Total de Registros: {sales.length}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  1 de 7
                </span>
                <button className={`p-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}>
                <tr>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>ID</th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>Data</th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>Vendedor</th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>Cliente</th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>Status</th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>Origem</th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>Total</th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>Taxas</th>
                  <th className={`text-left py-3 px-4 font-semibold text-sm ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>Lucro</th>
                  <th className={`text-center py-3 px-4 font-semibold text-sm ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className={`border-b transition-colors ${
                    theme === 'dark' 
                      ? 'border-slate-700 hover:bg-slate-700/50' 
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}>
                    <td className={`py-3 px-4 font-medium text-sm ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>
                      {sale.id}
                    </td>
                    <td className={`py-3 px-4 text-sm ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {sale.date}
                    </td>
                    <td className={`py-3 px-4 text-sm ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {sale.seller}
                    </td>
                    <td className={`py-3 px-4 text-sm ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {sale.customer}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {sale.status}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-sm ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {sale.origin}
                    </td>
                    <td className={`py-3 px-4 text-sm font-semibold ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                      R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 px-4 text-sm ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      R$ {sale.taxes.toFixed(2)}
                    </td >
                    <td className={`py-3 px-4 text-sm font-semibold ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                      R$ {sale.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td >
                    <td className="py-3 px-4 text-center">
                      <SaleActionsDropdown
                        saleId={sale.id}
                        onView={handleViewSale}
                        onEdit={handleEditSale}
                        onDelete={handleDeleteSale}
                        onReprint={handleReprintSale}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sales Modal */}
      <SalesModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
      />

      {/* Sale View Modal */}
      <SaleViewModal
        isOpen={viewingSaleId !== null}
        onClose={() => setViewingSaleId(null)}
        saleId={viewingSaleId || ''}
      />

      {/* Card Simulator Modal */}
      <CardSimulatorModal
        isOpen={isCardSimulatorOpen}
        onClose={() => setIsCardSimulatorOpen(false)}
      />
    </div>
  );
}