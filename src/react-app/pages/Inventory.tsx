import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  ShoppingCart, 
  History, 
  DollarSign, 
  Tag, 
  MapPin, 
  Clock, 
  X, 
  Check,
  RotateCcw // Icon for revert
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useTheme } from '@/react-app/hooks/useTheme';
import { useNotification } from '@/react-app/components/NotificationSystem';
import ProductModal from '@/react-app/components/ProductModal';
import PurchaseModal from '@/react-app/components/PurchaseModal';
import FinalizePurchaseModal from '@/react-app/components/FinalizePurchaseModal';
import ProductActionsDropdown from '@/react-app/components/ProductActionsDropdown';
import { Product, InventoryUnit, Purchase, PurchaseItem, StockLocation, WarrantyTerm } from '@/shared/types'; // Ensure these types are defined in shared/types.ts
import { formatCurrencyBR } from '@/react-app/utils/currency';

// Define local types if not already in shared/types.ts
// (Assuming these are already in shared/types.ts as per previous turns)
// interface Product { ... }
// interface InventoryUnit { ... }
// interface Purchase { ... }
// interface PurchaseItem { ... }
// interface StockLocation { ... }
// interface WarrantyTerm { ... }

export default function Inventory() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();

  const [inventoryUnits, setInventoryUnits] = useState<InventoryUnit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stockLocations, setStockLocations] = useState<StockLocation[]>([]);
  const [warrantyTerms, setWarrantyTerms] = useState<WarrantyTerm[]>([]);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isFinalizePurchaseModalOpen, setIsFinalizePurchaseModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [purchaseToFinalize, setPurchaseToFinalize] = useState<Purchase | undefined>(undefined);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'products' | 'purchases'>('inventory');
  const [loading, setLoading] = useState(true);

  // --- Data Fetching ---
  useEffect(() => {
    if (!user?.id) return;

    const fetchAllData = async () => {
      setLoading(true);
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (productsError) {
        showError('Erro ao carregar produtos.');
        console.error('Error fetching products:', productsError);
      } else {
        setProducts(productsData || []);
      }

      const { data: locationsData, error: locationsError } = await supabase
        .from('stock_locations')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (locationsError) {
        console.error('Error fetching stock locations:', locationsError);
      } else {
        setStockLocations(locationsData || []);
      }

      const { data: warrantyData, error: warrantyError } = await supabase
        .from('warranty_terms')
        .select('id, name, months')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (warrantyError) {
        console.error('Error fetching warranty terms:', warrantyError);
      } else {
        setWarrantyTerms(warrantyData || []);
      }

      setLoading(false);
    };

    fetchAllData();
  }, [user, showError]);

  // Fetch Inventory Units (with search)
  useEffect(() => {
    if (!user?.id) return;

    const fetchInventoryUnits = async () => {
      setLoading(true);
      let query = supabase
        .from('inventory_units')
        .select('*, products(*), stock_locations(name), warranty_terms(name, months)')
        .eq('user_id', user.id)
        .eq('status', 'in_stock'); // Only show units currently in stock

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        query = query.or(`
          serial_number.ilike.%${searchLower}%,
          imei1.ilike.%${searchLower}%,
          imei2.ilike.%${searchLower}%,
          products.description.ilike.%${searchLower}%,
          products.sku.ilike.%${searchLower}%
        `);
      }

      const { data, error } = await query;

      if (error) {
        showError('Erro ao carregar unidades de estoque.');
        console.error('Error fetching inventory units:', error);
      } else {
        setInventoryUnits(data || []);
      }
      setLoading(false);
    };

    fetchInventoryUnits();
  }, [user, searchTerm, showError]);

  // Fetch Purchases
  useEffect(() => {
    if (!user?.id) return;

    const fetchPurchases = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchases')
        .select('*, purchase_items(*, products(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        showError('Erro ao carregar compras.');
        console.error('Error fetching purchases:', error);
      } else {
        setPurchases(data || []);
      }
      setLoading(false);
    };

    fetchPurchases();
  }, [user, showError]);

  // --- Handlers for Modals and Actions ---
  const handleProductSaved = async (newOrUpdatedProduct: Product) => {
    if (!user?.id) return;

    try {
      if (newOrUpdatedProduct.id && products.some(p => p.id === newOrUpdatedProduct.id)) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            sku: newOrUpdatedProduct.sku,
            description: newOrUpdatedProduct.description,
            brand: newOrUpdatedProduct.brand,
            category: newOrUpdatedProduct.category,
            model: newOrUpdatedProduct.model,
            variation: newOrUpdatedProduct.variation,
            cost_price: newOrUpdatedProduct.cost_price,
            sale_price: newOrUpdatedProduct.sale_price,
            markup: newOrUpdatedProduct.markup,
            requires_imei: newOrUpdatedProduct.requires_imei,
            requires_serial: newOrUpdatedProduct.requires_serial,
            location_id: newOrUpdatedProduct.location_id,
            warranty_term_id: newOrUpdatedProduct.warranty_term_id,
            min_stock: newOrUpdatedProduct.min_stock,
            updated_at: new Date().toISOString(),
          })
          .eq('id', newOrUpdatedProduct.id)
          .eq('user_id', user.id);

        if (error) throw error;
        setProducts(prev => prev.map(p => p.id === newOrUpdatedProduct.id ? newOrUpdatedProduct : p));
        showSuccess('Produto atualizado com sucesso!');
      } else {
        // Insert new product
        const { data, error } = await supabase
          .from('products')
          .insert({
            ...newOrUpdatedProduct,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();

        if (error) throw error;
        setProducts(prev => [...prev, data[0]]);
        showSuccess('Produto criado com sucesso!');
      }
    } catch (error: any) {
      showError(`Erro ao salvar produto: ${error.message}`);
      console.error('Error saving product:', error);
    }
    setSelectedProduct(undefined);
    setIsProductModalOpen(false);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!user?.id) return;

    if (!window.confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false, updated_at: new Date().toISOString() }) // Soft delete
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== productId));
      showSuccess('Produto excluído com sucesso!');
    } catch (error: any) {
      showError(`Erro ao excluir produto: ${error.message}`);
      console.error('Error deleting product:', error);
    }
  };

  const handlePurchaseCreated = async (newPurchase: Purchase) => {
    if (!user?.id) return;

    try {
      // Insert the purchase
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          status: newPurchase.status,
          total_cost: newPurchase.total_cost,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (purchaseError) throw purchaseError;

      const createdPurchase = purchaseData[0];

      // Insert purchase items
      const purchaseItemsToInsert = newPurchase.purchase_items.map(item => ({
        purchase_id: createdPurchase.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost_price: item.unit_cost_price,
        total_cost_price: item.total_cost_price,
      }));

      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(purchaseItemsToInsert);

      if (itemsError) throw itemsError;

      // Refetch purchases to get the full joined data
      const { data: refetchedPurchases, error: refetchError } = await supabase
        .from('purchases')
        .select('*, purchase_items(*, products(*))')
        .eq('id', createdPurchase.id);

      if (refetchError) throw refetchError;

      setPurchases(prev => [refetchedPurchases[0], ...prev]);
      showSuccess('Compra registrada com sucesso!');

      // If purchase is pending, open FinalizePurchaseModal
      if (createdPurchase.status === 'pending') {
        setPurchaseToFinalize(refetchedPurchases[0]);
        setIsFinalizePurchaseModalOpen(true);
      }

    } catch (error: any) {
      showError(`Erro ao registrar compra: ${error.message}`);
      console.error('Error creating purchase:', error);
    }
    setIsPurchaseModalOpen(false);
  };

  const handleFinalizePurchase = async (finalizedPurchase: Purchase, newInventoryUnits: InventoryUnit[]) => {
    if (!user?.id) return;

    try {
      // Update purchase status to 'completed'
      const { error: purchaseUpdateError } = await supabase
        .from('purchases')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', finalizedPurchase.id)
        .eq('user_id', user.id);

      if (purchaseUpdateError) throw purchaseUpdateError;

      // Insert new inventory units
      const unitsToInsert = newInventoryUnits.map(unit => ({
        ...unit,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error: unitsInsertError } = await supabase
        .from('inventory_units')
        .insert(unitsToInsert);

      if (unitsInsertError) throw unitsInsertError;

      showSuccess('Compra finalizada e estoque atualizado com sucesso!');

      // Update local state
      setPurchases(prev => prev.map(p => p.id === finalizedPurchase.id ? { ...p, status: 'completed' } : p));
      setInventoryUnits(prev => [...prev, ...newInventoryUnits]);

    } catch (error: any) {
      showError(`Erro ao finalizar compra: ${error.message}`);
      console.error('Error finalizing purchase:', error);
    }
    setIsFinalizePurchaseModalOpen(false);
    setPurchaseToFinalize(undefined);
  };

  const handleRevertPurchase = async (purchaseId: string) => {
    if (!user?.id) return;

    if (!window.confirm('Tem certeza que deseja reverter esta compra? Isso removerá todos os itens associados do estoque e a compra voltará ao status "pendente".')) {
      return;
    }

    try {
      // Start a transaction (Supabase client doesn't directly support transactions,
      // so we'll do sequential operations and handle errors)
      
      // 1. Delete associated inventory units
      const { error: deleteUnitsError } = await supabase
        .from('inventory_units')
        .delete()
        .eq('purchase_id', purchaseId)
        .eq('user_id', user.id);

      if (deleteUnitsError) throw deleteUnitsError;

      // 2. Update purchase status to 'pending'
      const { error: updatePurchaseError } = await supabase
        .from('purchases')
        .update({ status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', purchaseId)
        .eq('user_id', user.id);

      if (updatePurchaseError) throw updatePurchaseError;

      showSuccess('Compra revertida com sucesso! Itens removidos do estoque.');

      // Update local state
      setPurchases(prev => prev.map(p => p.id === purchaseId ? { ...p, status: 'pending' } : p));
      setInventoryUnits(prev => prev.filter(unit => unit.purchase_id !== purchaseId));

    } catch (error: any) {
      showError(`Erro ao reverter compra: ${error.message}`);
      console.error('Error reverting purchase:', error);
    }
  };

  const handleViewHistory = (unitId: string) => {
    // Implement navigation or modal for viewing history
    showError('Funcionalidade "Ver Histórico" ainda não implementada.');
    console.log('View history for unit:', unitId);
  };

  const handleAdjustStock = (unitId: string) => {
    // Implement modal for adjusting stock
    showError('Funcionalidade "Ajustar Estoque" ainda não implementada.');
    console.log('Adjust stock for unit:', unitId);
  };

  // --- Memoized Data for Display ---
  const totalStockValue = useMemo(() => {
    return inventoryUnits.reduce((sum, unit) => sum + unit.cost_price, 0);
  }, [inventoryUnits]);

  const totalPurchasesValue = useMemo(() => {
    return purchases.reduce((sum, purchase) => sum + purchase.total_cost, 0);
  }, [purchases]);

  const pendingPurchasesCount = useMemo(() => {
    return purchases.filter(p => p.status === 'pending').length;
  }, [purchases]);

  const completedPurchasesCount = useMemo(() => {
    return purchases.filter(p => p.status === 'completed').length;
  }, [purchases]);

  const getPurchaseStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getPurchaseStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <Package className="mr-3 text-blue-500" size={32} />
          Gestão de Estoque
        </h1>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mb-8">
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Novo Produto
          </button>
          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <ShoppingCart size={20} className="mr-2" />
            Nova Compra
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Valor Total em Estoque</h2>
              <DollarSign className="text-green-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-green-600">R$ {formatCurrencyBR(totalStockValue)}</p>
          </div>
          <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Compras Pendentes</h2>
              <History className="text-yellow-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{pendingPurchasesCount}</p>
          </div>
          <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Compras Concluídas</h2>
              <Check className="text-blue-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-blue-600">{completedPurchasesCount}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} mb-6`}>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-6 text-lg font-medium ${
              activeTab === 'inventory'
                ? `border-b-2 border-blue-500 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`
                : `${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`
            } transition-colors`}
          >
            Estoque
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-6 text-lg font-medium ${
              activeTab === 'products'
                ? `border-b-2 border-blue-500 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`
                : `${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`
            } transition-colors`}
          >
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-3 px-6 text-lg font-medium ${
              activeTab === 'purchases'
                ? `border-b-2 border-blue-500 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`
                : `${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`
            } transition-colors`}
          >
            Compras
          </button>
        </div>

        {/* Search Bar (only for Inventory tab) */}
        {activeTab === 'inventory' && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por SKU, descrição, número de série ou IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
        )}

        {/* Content based on active tab */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {activeTab === 'inventory' && (
              <div className={`overflow-x-auto rounded-lg shadow-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Produto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nº Série/IMEI</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Preço Custo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Preço Venda</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Localização</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Garantia</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                    {inventoryUnits.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 text-center text-slate-500">Nenhum item em estoque encontrado.</td>
                      </tr>
                    ) : (
                      inventoryUnits.map((unit) => (
                        <tr key={unit.id} className={`${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{unit.product.sku}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{unit.product.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {unit.serial_number || unit.imei1 || unit.imei2 || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">R$ {formatCurrencyBR(unit.cost_price)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">R$ {formatCurrencyBR(unit.sale_price)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{unit.stock_locations?.name || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {unit.warranty_terms?.name} ({unit.warranty_terms?.months} meses)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <ProductActionsDropdown
                              unitId={unit.id}
                              onViewHistory={handleViewHistory}
                              onEdit={() => showError('Edição de unidade ainda não implementada.')} // Placeholder
                              onDelete={() => showError('Exclusão de unidade ainda não implementada.')} // Placeholder
                              onAdjustStock={handleAdjustStock}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'products' && (
              <div className={`overflow-x-auto rounded-lg shadow-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descrição</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Marca</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Custo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Venda</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">IMEI/Série</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-slate-500">Nenhum produto cadastrado.</td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className={`${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{product.sku}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{product.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{product.brand}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">R$ {formatCurrencyBR(product.cost_price)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">R$ {formatCurrencyBR(product.sale_price)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {product.requires_imei && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">IMEI</span>}
                            {product.requires_serial && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Série</span>}
                            {!product.requires_imei && !product.requires_serial && 'Não'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'purchases' && (
              <div className={`overflow-x-auto rounded-lg shadow-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID Compra</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Itens</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-slate-200'}`}>
                    {purchases.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-slate-500">Nenhuma compra registrada.</td>
                      </tr>
                    ) : (
                      purchases.map((purchase) => (
                        <tr key={purchase.id} className={`${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{purchase.id.substring(0, 8)}...</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(purchase.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm">
                            {purchase.purchase_items.map(item => (
                              <div key={item.id} className="text-xs text-slate-500">
                                {item.quantity}x {item.product.description}
                              </div>
                            ))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">R$ {formatCurrencyBR(purchase.total_cost)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPurchaseStatusColor(purchase.status)}`}>
                              {getPurchaseStatusText(purchase.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {purchase.status === 'pending' && (
                              <button
                                onClick={() => {
                                  setPurchaseToFinalize(purchase);
                                  setIsFinalizePurchaseModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                Finalizar
                              </button>
                            )}
                            {purchase.status === 'completed' && (
                              <button
                                onClick={() => handleRevertPurchase(purchase.id)}
                                className="text-red-600 hover:text-red-900 flex items-center justify-end"
                              >
                                <RotateCcw size={16} className="mr-1" />
                                Reverter Compra
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => { setIsProductModalOpen(false); setSelectedProduct(undefined); }}
        product={selectedProduct}
        onProductSaved={handleProductSaved}
      />
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onPurchaseCreated={handlePurchaseCreated}
        products={products}
        stockLocations={stockLocations}
        warrantyTerms={warrantyTerms}
      />
      {purchaseToFinalize && (
        <FinalizePurchaseModal
          isOpen={isFinalizePurchaseModalOpen}
          onClose={() => { setIsFinalizePurchaseModalOpen(false); setPurchaseToFinalize(undefined); }}
          purchase={purchaseToFinalize}
          onFinalize={handleFinalizePurchase}
          existingInventoryUnits={inventoryUnits} // Pass existing units for duplication check
          stockLocations={stockLocations}
          warrantyTerms={warrantyTerms}
        />
      )}
    </div>
  );
}