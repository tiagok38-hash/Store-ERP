import { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  ShoppingBag,
  Hash,
  Smartphone,
  Barcode,
  Filter,
  ShoppingCart,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Image as ImageIcon // Importar ImageIcon para exibir no lugar da imagem
} from 'lucide-react';
import PurchaseModal from '@/react-app/components/PurchaseModal';
import FinalizePurchaseModal from '@/react-app/components/FinalizePurchaseModal';
import PurchaseViewModal from '@/react-app/components/PurchaseViewModal';
import ProductHistoryModal from '@/react-app/components/ProductHistoryModal';
import ProductModal from '@/react-app/components/ProductModal';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { supabase } from '@/integrations/supabase/client'; // Importar supabase
import { useAuth } from '@/react-app/hooks/useAuth'; // Importar useAuth
import DeleteConfirmModal from '@/react-app/components/DeleteConfirmModal';

interface InventoryUnit {
  id: string;
  product_id: string;
  productSku: string;
  productDescription: string;
  brand: string;
  category: string;
  model?: string;
  color?: string;
  storage?: string;
  condition: 'novo' | 'seminovo' | 'usado';
  location?: string;
  imei1?: string;
  imei2?: string;
  serialNumber?: string;
  barcode?: string;
  costPrice: number;
  salePrice: number;
  status: 'available' | 'sold' | 'reserved' | 'defective';
  createdAt: string;
  updatedAt: string;
  purchaseId?: string;
  locatorCode?: string;
  minStock?: number;
  image_url?: string; // Adicionado image_url
}

interface Purchase {
  id: string;
  locator_code: string;
  supplier_id: string;
  supplier_name: string;
  purchase_date: string;
  invoice_number: string;
  observations: string;
  items: any[]; // purchase_items
  subtotal: number;
  additional_cost: number;
  total: number;
  status: 'completed' | 'pending' | 'partial';
  created_at: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface StockCondition {
  id: string;
  name: string;
}

export default function Inventory() {
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth(); // Obter o usuário logado
  const [activeTab, setActiveTab] = useState<'inventory' | 'purchases'>('inventory');
  const [inventoryUnits, setInventoryUnits] = useState<InventoryUnit[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locatorSearch, setLocatorSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [sortBy] = useState('description');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [isFinalizePurchaseModalOpen, setIsFinalizePurchaseModalOpen] = useState(false);
  const [finalizingPurchase, setFinalizingPurchase] = useState<Purchase | null>(null);
  const [isPurchaseViewModalOpen, setIsPurchaseViewModalOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [isProductHistoryModalOpen, setIsProductHistoryModalOpen] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<InventoryUnit | null>(null);
  
  const [isProductEditModalOpen, setIsProductEditModalOpen] = useState(false);
  const [editingProductUnit, setEditingProductUnit] = useState<InventoryUnit | null>(null);

  const [purchaseDateFrom, setPurchaseDateFrom] = useState('');
  const [purchaseDateTo, setPurchaseDateTo] = useState('');
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockConditions, setStockConditions] = useState<StockCondition[]>([]);

  useEffect(() => {
    if (user) {
      fetchAdminData();
      fetchInventoryUnits();
      fetchPurchases();
    } else {
      setInventoryUnits([]);
      setPurchases([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchAdminData = async () => {
    if (!user) return;

    const { data: brandsData, error: brandsError } = await supabase
      .from('brands')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('is_active', true);
    if (brandsError) console.error('Error fetching brands:', brandsError);
    else setBrands(brandsData || []);

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('is_active', true);
    if (categoriesError) console.error('Error fetching categories:', categoriesError);
    else setCategories(categoriesData || []);

    const { data: conditionsData, error: conditionsError } = await supabase
      .from('stock_conditions')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('is_active', true);
    if (conditionsError) console.error('Error fetching stock conditions:', conditionsError);
    else setStockConditions(conditionsData || []);
  };

  const fetchInventoryUnits = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('inventory_units')
      .select(`
        *,
        products (
          sku,
          description,
          brand_id,
          category_id,
          min_stock,
          image_url
        ),
        brands (name),
        categories (name),
        stock_conditions (name)
      `)
      .eq('user_id', user?.id);

    if (error) {
      showError('Erro ao carregar unidades de estoque', error.message);
      console.error('Error fetching inventory units:', error);
    } else {
      const units: InventoryUnit[] = data.map((unit: any) => ({
        id: unit.id,
        product_id: unit.product_id,
        productSku: unit.products?.sku || 'N/A',
        productDescription: unit.products?.description || 'N/A',
        brand: unit.brands?.name || 'N/A',
        category: unit.categories?.name || 'N/A',
        model: unit.model, // Assuming these are stored directly or derived
        color: unit.color,
        storage: unit.storage,
        condition: unit.stock_conditions?.name || 'N/A', // Use name from joined table
        location: unit.location, // Assuming location is stored directly
        imei1: unit.imei1,
        imei2: unit.imei2,
        serialNumber: unit.serial_number,
        barcode: unit.barcode,
        costPrice: unit.cost_price,
        salePrice: unit.sale_price,
        status: unit.status,
        createdAt: unit.created_at,
        updatedAt: unit.updated_at,
        purchaseId: unit.purchase_id,
        locatorCode: unit.locator_code,
        minStock: unit.products?.min_stock,
        image_url: unit.products?.image_url,
      }));
      setInventoryUnits(units);
    }
    setIsLoading(false);
  };

  const fetchPurchases = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        suppliers (name),
        purchase_items (*)
      `)
      .eq('user_id', user?.id);

    if (error) {
      showError('Erro ao carregar compras', error.message);
      console.error('Error fetching purchases:', error);
    } else {
      const mappedPurchases: Purchase[] = data.map((p: any) => ({
        id: p.id,
        locator_code: p.locator_code,
        supplier_id: p.supplier_id,
        supplier_name: p.suppliers?.name || 'N/A',
        purchase_date: p.purchase_date,
        invoice_number: p.invoice_number,
        observations: p.observations,
        items: p.purchase_items,
        subtotal: p.subtotal,
        additional_cost: p.additional_cost,
        total: p.total,
        status: p.status,
        created_at: p.created_at,
      }));
      setPurchases(mappedPurchases);
    }
    setIsLoading(false);
  };

  const filteredByLocator = locatorSearch ? 
    inventoryUnits.filter(unit => 
      unit.locatorCode?.toLowerCase().includes(locatorSearch.toLowerCase())
    ) : inventoryUnits;

  const locatorSearchResults = locatorSearch ? filteredByLocator.length : null;

  const filteredUnits = filteredByLocator.filter(unit => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      unit.productDescription.toLowerCase().includes(searchTermLower) ||
      unit.productSku.toLowerCase().includes(searchTermLower) ||
      unit.brand.toLowerCase().includes(searchTermLower) ||
      (unit.model && unit.model.toLowerCase().includes(searchTermLower)) ||
      (unit.color && unit.color.toLowerCase().includes(searchTermLower)) ||
      (unit.storage && unit.storage.toLowerCase().includes(searchTermLower)) ||
      (unit.imei1 && unit.imei1.includes(searchTerm)) ||
      (unit.imei2 && unit.imei2.includes(searchTerm)) ||
      (unit.serialNumber && unit.serialNumber.toLowerCase().includes(searchTermLower)) ||
      (unit.barcode && unit.barcode.includes(searchTerm));
    
    const matchesBrand = filterBrand === 'all' || filterBrand === '' || unit.brand === brands.find(b => b.id === filterBrand)?.name;
    const matchesCategory = filterCategory === 'all' || filterCategory === '' || unit.category === categories.find(c => c.id === filterCategory)?.name;
    const matchesStatus = filterStatus === 'all' || unit.status === filterStatus;
    const matchesCondition = filterCondition === 'all' || unit.condition === stockConditions.find(sc => sc.id === filterCondition)?.name;
    
    return matchesSearch && matchesBrand && matchesCategory && matchesStatus && matchesCondition;
  });

  const sortedUnits = [...filteredUnits].sort((a, b) => {
    switch (sortBy) {
      case 'description':
        return a.productDescription.localeCompare(b.productDescription);
      case 'sku':
        return a.productSku.localeCompare(b.productSku);
      case 'brand':
        return a.brand.localeCompare(b.brand);
      case 'price':
        return a.salePrice - b.salePrice;
      default:
        return 0;
    }
  });

  const getCurrentMonthDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      from: firstDay.toISOString().split('T')[0],
      to: lastDay.toISOString().split('T')[0]
    };
  };

  const getEffectiveDateRange = () => {
    if (purchaseDateFrom && purchaseDateTo) {
      return { from: purchaseDateFrom, to: purchaseDateTo };
    }
    return getCurrentMonthDates();
  };

  const filteredPurchases = purchases.filter(purchase => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = purchase.locator_code.toLowerCase().includes(searchTermLower) ||
                         purchase.supplier_name.toLowerCase().includes(searchTermLower) ||
                         purchase.invoice_number.toLowerCase().includes(searchTermLower);
    
    const matchesStatus = purchaseStatusFilter === 'all' || purchase.status === purchaseStatusFilter;
    
    const dateRange = getEffectiveDateRange();
    const purchaseDate = purchase.purchase_date;
    const matchesDate = purchaseDate >= dateRange.from && purchaseDate <= dateRange.to;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getInventoryValueForPeriod = () => {
    const dateRange = getEffectiveDateRange();
    const periodPurchases = purchases.filter(purchase => {
      const purchaseDate = purchase.purchase_date;
      return purchaseDate >= dateRange.from && purchaseDate <= dateRange.to;
    });
    return periodPurchases.reduce((sum, p) => sum + p.total, 0);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      available: { label: 'Disponível', color: 'bg-green-100 text-green-800' },
      sold: { label: 'Vendido', color: 'bg-blue-100 text-blue-800' },
      reserved: { label: 'Reservado', color: 'bg-yellow-100 text-yellow-800' },
      defective: { label: 'Defeituoso', color: 'bg-red-100 text-red-800' }
    };
    return badges[status as keyof typeof badges] || badges.available;
  };

  const getConditionBadge = (conditionName: string) => {
    const badges = {
      'Novo': { label: 'Novo', color: 'bg-green-100 text-green-800' },
      'Seminovo': { label: 'Seminovo', color: 'bg-yellow-100 text-yellow-800' },
      'Usado': { label: 'Usado', color: 'bg-orange-100 text-orange-800' }
    };
    return badges[conditionName as keyof typeof badges] || { label: conditionName, color: 'bg-gray-100 text-gray-800' };
  };

  const getPurchaseStatusBadge = (status: string) => {
    const badges = {
      completed: { label: 'Concluída', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      partial: { label: 'Parcial', color: 'bg-blue-100 text-blue-800' }
    };
    return badges[status as keyof typeof badges] || badges.completed;
  };

  const lowStockItems = inventoryUnits.filter(unit => 
    unit.status === 'available' && 
    unit.minStock !== undefined && 
    unit.minStock > 0 && 
    inventoryUnits.filter(u => u.productSku === unit.productSku && u.status === 'available').length <= unit.minStock
  );

  const summaryStats = {
    total: inventoryUnits.length,
    available: inventoryUnits.filter(u => u.status === 'available').length,
    sold: inventoryUnits.filter(u => u.status === 'sold').length,
    defective: inventoryUnits.filter(u => u.status === 'defective').length,
    lowStock: lowStockItems.length,
    totalValue: activeTab === 'inventory' ? getInventoryValueForPeriod() : inventoryUnits
      .filter(u => u.status === 'available')
      .reduce((sum, u) => sum + u.costPrice, 0)
  };

  const purchaseStats = {
    total: filteredPurchases.length,
    completed: filteredPurchases.filter(p => p.status === 'completed').length,
    pending: filteredPurchases.filter(p => p.status === 'pending').length,
    totalValue: filteredPurchases.reduce((sum, p) => sum + p.total, 0)
  };

  const handlePurchaseSaved = (purchase: Purchase) => {
    if (editingPurchase) {
      setPurchases(purchases.map(p => p.id === purchase.id ? purchase : p));
    } else {
      setPurchases([purchase, ...purchases]);
    }
    
    setEditingPurchase(null);
    fetchInventoryUnits(); // Refresh inventory after purchase saved
    fetchPurchases(); // Refresh purchases list
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setIsPurchaseModalOpen(true);
  };

  const handleNewPurchase = () => {
    setEditingPurchase(null);
    setIsPurchaseModalOpen(true);
  };

  const handleFinalizePurchase = (purchase: Purchase) => {
    setFinalizingPurchase(purchase);
    setIsFinalizePurchaseModalOpen(true);
  };

  const handlePurchaseFinalized = (finalizedItems: any[]) => {
    if (finalizingPurchase) {
      const updatedPurchases = purchases.map(p => 
        p.id === finalizingPurchase.id 
          ? { ...p, status: 'completed' as const }
          : p
      );
      setPurchases(updatedPurchases);
      
      showSuccess(
        'Entrada finalizada com sucesso!',
        `${finalizedItems.length} itens processados com informações completas.`
      );
    }
    setFinalizingPurchase(null);
    fetchInventoryUnits(); // Refresh inventory after finalizing
    fetchPurchases(); // Refresh purchases list
  };

  const handleViewPurchase = (purchase: Purchase) => {
    setViewingPurchase(purchase);
    setIsPurchaseViewModalOpen(true);
  };

  const handleViewProductHistory = (product: InventoryUnit) => {
    setSelectedProductForHistory(product);
    setIsProductHistoryModalOpen(true);
  };

  const handleEditProductUnit = (unit: InventoryUnit) => {
    setEditingProductUnit(unit);
    setIsProductEditModalOpen(true);
  };

  const handleProductUnitSaved = (updatedUnit: InventoryUnit) => {
    setInventoryUnits(prev => 
      prev.map(unit => unit.id === updatedUnit.id ? updatedUnit : unit)
    );
    showSuccess('Produto Atualizado', `O item ${updatedUnit.productDescription} foi atualizado com sucesso.`);
    setIsProductEditModalOpen(false);
    setEditingProductUnit(null);
    fetchInventoryUnits(); // Refresh inventory after product unit saved
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<'unit' | 'purchase' | 'product' | null>(null);

  const openDeleteModal = (item: any, type: 'unit' | 'purchase' | 'product') => {
    setItemToDelete(item);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };

  const deleteItem = async () => {
    if (!itemToDelete || !deleteType) return;

    let error;
    let successMessage = '';
    let errorMessage = '';

    if (deleteType === 'unit') {
      const { error: deleteError } = await supabase
        .from('inventory_units')
        .delete()
        .eq('id', itemToDelete.id);
      error = deleteError;
      successMessage = 'Unidade de estoque excluída com sucesso!';
      errorMessage = 'Erro ao excluir unidade de estoque';
    } else if (deleteType === 'purchase') {
      const { error: deleteError } = await supabase
        .from('purchases')
        .delete()
        .eq('id', itemToDelete.id);
      error = deleteError;
      successMessage = 'Compra excluída com sucesso!';
      errorMessage = 'Erro ao excluir compra';
    } else if (deleteType === 'product') {
      // This would delete the product definition, which might affect inventory units
      // For now, we'll just show an error or prevent it if there are associated units
      showError('Ação não permitida', 'Não é possível excluir a definição de um produto diretamente se houver unidades em estoque.');
      setIsDeleteModalOpen(false);
      return;
    }

    if (error) {
      showError(errorMessage, error.message);
      console.error(`Error deleting ${deleteType}:`, error);
    } else {
      showSuccess(successMessage);
      if (deleteType === 'unit') {
        setInventoryUnits(inventoryUnits.filter(u => u.id !== itemToDelete.id));
      } else if (deleteType === 'purchase') {
        setPurchases(purchases.filter(p => p.id !== itemToDelete.id));
        fetchInventoryUnits(); // Refresh inventory as units might be linked to this purchase
      }
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setDeleteType(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
            <Package className="mr-3 text-blue-600" size={32} />
            Estoque
          </h1>
          <p className="text-slate-600">Gestão completa de produtos e compras</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleNewPurchase}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium text-lg"
          >
            <ShoppingBag className="mr-3" size={24} />
            Nova Compra/Produto
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-3 px-4 border-b-2 font-medium text-base ${
                activeTab === 'inventory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Package className="inline mr-3" size={20} />
              Estoque
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`py-3 px-4 border-b-2 font-medium text-base ${
                activeTab === 'purchases'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <ShoppingCart className="inline mr-3" size={20} />
              Compras
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'inventory' ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Total Itens</h3>
              <p className="text-xl font-bold text-blue-500">{summaryStats.total}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Disponíveis</h3>
              <p className="text-xl font-bold text-green-500">{summaryStats.available}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Vendidos</h3>
              <p className="text-xl font-bold text-blue-500">{summaryStats.sold}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Defeituosos</h3>
              <p className="text-xl font-bold text-red-500">{summaryStats.defective}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                Estoque Baixo
              </h3>
              <p className="text-xl font-bold text-orange-500">{summaryStats.lowStock}</p>
            </div>
          </div>

          {/* Search Bars */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por descrição, SKU, IMEI, serial, código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por localizador da compra (ex: LOC001234567)..."
                  value={locatorSearch}
                  onChange={(e) => setLocatorSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas as Marcas</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos Status</option>
                <option value="available">Disponível</option>
                <option value="sold">Vendido</option>
                <option value="reserved">Reservado</option>
                <option value="defective">Defeituoso</option>
              </select>

              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas Condições</option>
                {stockConditions.map(condition => (
                  <option key={condition.id} value={condition.id}>{condition.name}</option>
                ))}
              </select>

              <div className="flex items-center text-sm text-slate-600">
                <Filter className="mr-2" size={16} />
                {filteredUnits.length} de {inventoryUnits.length} itens
                {locatorSearch && (
                  <span className="ml-2 text-blue-600 font-medium">
                    (Localizador: {locatorSearch} - {locatorSearchResults} produtos encontrados)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Itens do Estoque - Controle Individual
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Cada item possui identificação única (IMEI/Serial) e código localizador da compra
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Foto</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">SKU</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Produto</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Marca/Categoria</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Identificação</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Condição</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Preços</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Localização</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Estoque Mín.</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUnits.map((unit) => {
                    const statusBadge = getStatusBadge(unit.status);
                    const conditionBadge = getConditionBadge(unit.condition);
                    const isLowStock = unit.minStock !== undefined && unit.minStock > 0 && 
                                      inventoryUnits.filter(u => u.productSku === unit.productSku && u.status === 'available').length <= unit.minStock;
                    
                    return (
                      <tr key={unit.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          {unit.image_url ? (
                            <img 
                              src={unit.image_url} 
                              alt={unit.productDescription} 
                              className="w-10 h-10 object-cover rounded-md" 
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-sm font-bold text-blue-600">
                            {unit.productSku}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-slate-800">{unit.productDescription}</div>
                            <div className="text-sm text-slate-600">
                              {unit.model && `${unit.model} `}
                              {unit.color && `• ${unit.color} `}
                              {unit.storage && `• ${unit.storage}`}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-xs font-bold">
                                {unit.brand.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-slate-800">{unit.brand}</div>
                              <div className="text-sm text-slate-600">{unit.category}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {unit.imei1 && (
                              <div className="flex items-center text-xs">
                                <Smartphone size={12} className="mr-1 text-blue-500" />
                                <span className="font-mono">{unit.imei1}</span>
                              </div>
                            )}
                            {unit.imei2 && (
                              <div className="flex items-center text-xs">
                                <Smartphone size={12} className="mr-1 text-purple-500" />
                                <span className="font-mono">{unit.imei2}</span>
                              </div>
                            )}
                            {unit.serialNumber && (
                              <div className="flex items-center text-xs">
                                <Hash size={12} className="mr-1 text-green-500" />
                                <span className="font-mono">{unit.serialNumber}</span>
                              </div>
                            )}
                            {unit.barcode && (
                              <div className="flex items-center text-xs">
                                <Barcode size={12} className="mr-1 text-orange-500" />
                                <span className="font-mono">{unit.barcode}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${conditionBadge.color}`}>
                            {conditionBadge.label}
                          </span>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-sm text-slate-600">
                              Custo: R$ {unit.costPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="font-medium text-green-600">
                              Venda: R$ {unit.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          {unit.location ? (
                            <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm">
                              {unit.location}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {unit.minStock !== undefined && unit.minStock > 0 ? (
                            <div className={`flex items-center text-sm ${isLowStock ? 'text-orange-600 font-bold' : 'text-slate-700'}`}>
                              {isLowStock && <AlertTriangle size={14} className="mr-1" />}
                              {unit.minStock} un.
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => alert(`Visualizar item ${unit.id}`)}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={16} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleViewProductHistory(unit)}
                              className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                              title="Histórico do Produto"
                            >
                              <Clock size={16} className="text-purple-600" />
                            </button>
                            <button
                              onClick={() => handleEditProductUnit(unit)}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={16} className="text-green-600" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(unit, 'unit')}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={16} className="text-red-600" />
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
        </>
      ) : (
        <>
          {/* Purchase Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Total Compras</h3>
              <p className="text-xl font-bold text-blue-500">{purchaseStats.total}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Concluídas</h3>
              <p className="text-xl font-bold text-green-500">{purchaseStats.completed}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Pendentes</h3>
              <p className="text-xl font-bold text-yellow-500">{purchaseStats.pending}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Valor Total</h3>
              <p className="text-xl font-bold text-purple-500">
                R$ {purchaseStats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Purchase Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por localizador, fornecedor ou nota fiscal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={purchaseStatusFilter}
                onChange={(e) => setPurchaseStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="completed">Finalizadas</option>
                <option value="pending">Pendentes</option>
                <option value="partial">Parciais</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={purchaseDateFrom}
                  onChange={(e) => setPurchaseDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data Final
                </label>
                <input
                  type="date"
                  value={purchaseDateTo}
                  onChange={(e) => setPurchaseDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <div className="flex items-center text-sm text-slate-600">
                  <Filter className="mr-2" size={16} />
                  {filteredPurchases.length} de {purchases.length} compras
                  {(!purchaseDateFrom && !purchaseDateTo) && (
                    <span className="ml-2 text-blue-600 font-medium">
                      (Mês Atual)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Purchases Table */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Histórico de Compras
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Gerencie e edite suas compras de mercadorias
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Localizador</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Fornecedor</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Nota Fiscal</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Itens</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => {
                    const statusBadge = getPurchaseStatusBadge(purchase.status);
                    
                    return (
                      <tr key={purchase.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-mono text-sm font-bold text-blue-600">
                            {purchase.locator_code}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{purchase.supplier_name}</div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="flex items-center text-sm">
                            <Calendar size={14} className="mr-1 text-slate-500" />
                            {new Date(purchase.purchase_date).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          {purchase.invoice_number ? (
                            <div className="flex items-center text-sm">
                              <FileText size={14} className="mr-1 text-slate-500" />
                              {purchase.invoice_number}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <span className="font-medium">{purchase.items.length}</span> itens
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="font-medium text-green-600">
                            R$ {purchase.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleViewPurchase(purchase)}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={16} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleEditPurchase(purchase)}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={16} className="text-green-600" />
                            </button>
                            {(purchase.status === 'pending' || purchase.status === 'partial') && (
                              <button
                                onClick={() => handleFinalizePurchase(purchase)}
                                className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                title="Finalizar Entrada"
                              >
                                <CheckCircle size={16} className="text-purple-600" />
                              </button>
                            )}
                            <button
                              onClick={() => openDeleteModal(purchase, 'purchase')}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={16} className="text-red-600" />
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
        </>
      )}

      {/* Purchase/Product Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setEditingPurchase(null);
        }}
        onPurchaseSaved={handlePurchaseSaved}
        editingPurchase={editingPurchase}
      />

      {/* Finalize Purchase Modal */}
      <FinalizePurchaseModal
        isOpen={isFinalizePurchaseModalOpen}
        onClose={() => {
          setIsFinalizePurchaseModalOpen(false);
          setFinalizingPurchase(null);
        }}
        purchase={finalizingPurchase}
        onFinalized={handlePurchaseFinalized}
      />

      {/* Purchase View Modal */}
      <PurchaseViewModal
        isOpen={isPurchaseViewModalOpen}
        onClose={() => {
          setIsPurchaseViewModalOpen(false);
          setViewingPurchase(null);
        }}
        purchase={viewingPurchase}
      />

      {/* Product History Modal */}
      <ProductHistoryModal
        isOpen={isProductHistoryModalOpen}
        onClose={() => {
          setIsProductHistoryModalOpen(false);
          setSelectedProductForHistory(null);
        }}
        product={selectedProductForHistory}
      />

      {/* Product Edit Modal (for Inventory Units) */}
      <ProductModal
        isOpen={isProductEditModalOpen}
        onClose={() => {
          setIsProductEditModalOpen(false);
          setEditingProductUnit(null);
        }}
        product={editingProductUnit}
        onProductSaved={handleProductUnitSaved}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteItem}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir ${deleteType === 'unit' ? 'esta unidade de estoque' : 'esta compra'}? Esta ação não pode ser desfeita.`}
        itemName={itemToDelete?.productDescription || itemToDelete?.locator_code || itemToDelete?.name}
      />
    </div>
  );
}