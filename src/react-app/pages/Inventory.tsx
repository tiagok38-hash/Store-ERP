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
  AlertTriangle, // Importar AlertTriangle para estoque baixo
  DollarSign, // Importar DollarSign para o botão de atualização de preços
  Settings, // Importar Settings para o novo botão
  PackagePlus, // Novo ícone para ajuste de estoque
  MoreVertical // Importar MoreVertical para o dropdown
} from 'lucide-react';
import { Link } from 'react-router-dom'; // Importar Link para navegação
import PurchaseModal from '@/react-app/components/PurchaseModal';
import FinalizePurchaseModal from '@/react-app/components/FinalizePurchaseModal';
import PurchaseViewModal from '@/react-app/components/PurchaseViewModal';
import ProductHistoryModal from '@/react-app/components/ProductHistoryModal';
import ProductModal from '@/react-app/components/ProductModal'; // Importar ProductModal
import BulkPriceUpdateModal from '@/react-app/components/BulkPriceUpdateModal'; // Importar o novo modal
import StockAdjustmentModal from '@/react-app/components/StockAdjustmentModal'; // Importar o novo modal de ajuste de estoque
import ProductActionsDropdown from '@/react-app/components/ProductActionsDropdown'; // Importar o novo dropdown
import EditInventoryUnitModal from '@/react-app/components/EditInventoryUnitModal'; // Importar o novo modal de edição de unidade
import { useNotification } from '@/react-app/components/NotificationSystem';

interface InventoryUnit {
  id: string;
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
  minStock?: number; // Adicionado minStock
  warrantyTerm: string;
}

interface Purchase {
  id: string;
  locatorCode: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  invoiceNumber: string;
  observations: string;
  items: any[];
  subtotal: number;
  additionalCost: number;
  total: number;
  status: 'completed' | 'pending' | 'partial';
  createdAt: string;
  // Adicionando campos para persistir o estado do modal de compra
  productType?: 'apple' | 'product';
  selectedBrand?: string;
  selectedCategory?: string;
  selectedModel?: string;
  selectedStorage?: string;
  selectedColor?: string;
}

// Mock audit log function (for demonstration purposes)
const mockAuditLog = (logEntry: any) => {
  console.log('AUDIT LOG:', logEntry);
  // In a real application, this would send data to a backend audit log service
};

export default function Inventory() {
  const { showSuccess, showError } = useNotification();
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
  
  // New states for ProductModal (editing product definitions)
  const [isProductDefinitionModalOpen, setIsProductDefinitionModalOpen] = useState(false);
  const [editingProductDefinition, setEditingProductDefinition] = useState<any>(null); // Use 'any' for ProductDefinition type

  // New state for BulkPriceUpdateModal
  const [isBulkPriceUpdateModalOpen, setIsBulkPriceUpdateModalOpen] = useState(false);

  // New states for StockAdjustmentModal
  const [isStockAdjustmentModalOpen, setIsStockAdjustmentModalOpen] = useState(false);
  const [selectedProductForStockAdjustment, setSelectedProductForStockAdjustment] = useState<InventoryUnit | null>(null);
  const [currentStockForAdjustment, setCurrentStockForAdjustment] = useState(0);

  // New states for EditInventoryUnitModal
  const [isEditInventoryUnitModalOpen, setIsEditInventoryUnitModalOpen] = useState(false);
  const [unitToEdit, setUnitToEdit] = useState<InventoryUnit | null>(null);

  // Purchase filters
  const [purchaseDateFrom, setPurchaseDateFrom] = useState('');
  const [purchaseDateTo, setPurchaseDateTo] = useState('');
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState('all');

  useEffect(() => {
    // Mock data com produtos únicos por IMEI/Serial
    setInventoryUnits([
      {
        id: '1',
        productSku: '#128',
        productDescription: 'iPhone 16 Pro Max 256GB',
        brand: 'Apple',
        category: 'Smartphone',
        model: 'iPhone 16 Pro Max',
        color: 'Titânio-deserto',
        storage: '256GB',
        condition: 'seminovo',
        location: 'Loja',
        imei1: '123456789012345',
        imei2: '123456789012346',
        serialNumber: undefined,
        barcode: '7899123456789',
        costPrice: 3000.00,
        salePrice: 3500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '1',
        locatorCode: 'LOC001234567',
        minStock: 2, // Adicionado minStock
        warrantyTerm: '1 ano (defeito de fábrica)'
      },
      {
        id: '2',
        productSku: '#129',
        productDescription: 'Smartphone Xiaomi 13X 8GB/256GB Dourado',
        brand: 'Xiaomi',
        category: 'Smartphone',
        model: '13X',
        color: 'Dourado',
        storage: '8GB/256GB',
        condition: 'novo',
        location: 'Vitrine iS',
        imei1: '987654321098765',
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899987654321',
        costPrice: 500.00,
        salePrice: 750.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 1, // Adicionado minStock
        warrantyTerm: '1 ano (defeito de fábrica)'
      },
      {
        id: '3',
        productSku: '#130',
        productDescription: 'Samsung Galaxy S24 Ultra 512GB',
        brand: 'Samsung',
        category: 'Smartphone',
        model: 'Galaxy S24 Ultra',
        color: 'Preto',
        storage: '512GB',
        condition: 'novo',
        location: 'A1-B2',
        imei1: '555666777888999',
        imei2: '555666777888998',
        serialNumber: undefined,
        barcode: '7899555666777',
        costPrice: 4200.00,
        salePrice: 4800.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '1',
        locatorCode: 'LOC001234567',
        minStock: 3, // Adicionado minStock
        warrantyTerm: '1 ano (defeito de fábrica)'
      },
      {
        id: '4',
        productSku: '#131',
        productDescription: 'MacBook Pro 14" M3 512GB',
        brand: 'Apple',
        category: 'Notebook',
        model: 'MacBook Pro 14"',
        color: 'Cinza Espacial',
        storage: '512GB',
        condition: 'novo',
        location: 'B1-A3',
        imei1: undefined,
        imei2: undefined,
        serialNumber: 'FVFH3LL/A12345',
        barcode: '7899111222333',
        costPrice: 8500.00,
        salePrice: 9200.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '3',
        locatorCode: 'LOC001234569',
        minStock: 1, // Adicionado minStock
        warrantyTerm: '1 ano (defeito de fábrica)'
      },
      {
        id: '5',
        productSku: '#132',
        productDescription: 'Capinha iPhone 16 Pro Max Transparente',
        brand: 'Genérica',
        category: 'Acessórios',
        model: 'Capinha',
        color: 'Transparente',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444555666',
        costPrice: 15.00,
        salePrice: 45.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 10, // Adicionado minStock
        warrantyTerm: '3 meses (seminovos)'
      }
    ]);

    // Mock data para compras
    setPurchases([
      {
        id: '1',
        locatorCode: 'LOC001234567',
        supplierId: '1',
        supplierName: 'Apple Brasil',
        purchaseDate: '2025-09-13',
        invoiceNumber: 'NF-001234',
        observations: 'Compra de produtos Apple para estoque principal',
        items: [
          { id: 'item1', description: 'iPhone 16 Pro Max 256GB Titânio-deserto', quantity: 1, costPrice: 3000, finalPrice: 3500, condition: 'seminovo', location: 'Loja', warranty: '1 ano', hasImeiSerial: true },
          { id: 'item2', description: 'Samsung Galaxy S24 Ultra 512GB Preto', quantity: 1, costPrice: 4200, finalPrice: 4800, condition: 'novo', location: 'A1-B2', warranty: '1 ano', hasImeiSerial: true }
        ],
        subtotal: 8300.00,
        additionalCost: 0,
        total: 8300.00,
        status: 'completed',
        createdAt: '2025-09-13T10:30:00Z',
        productType: 'apple',
        selectedBrand: '1',
        selectedCategory: '1',
        selectedModel: 'iPhone 16 Pro Max',
        selectedStorage: '256GB',
        selectedColor: 'Titânio-deserto'
      },
      {
        id: '2',
        locatorCode: 'LOC001234568',
        supplierId: '3',
        supplierName: 'Tech Distribuidora',
        purchaseDate: '2025-09-12',
        invoiceNumber: 'NF-001235',
        observations: 'Compra de acessórios diversos',
        items: [
          { id: 'item3', description: 'Smartphone Xiaomi 13X 8GB/256GB Dourado', quantity: 1, costPrice: 500, finalPrice: 750, condition: 'novo', location: 'Vitrine iS', warranty: '1 ano', hasImeiSerial: true },
          { id: 'item4', description: 'Capinha iPhone 16 Pro Max Transparente', quantity: 10, costPrice: 15, finalPrice: 45, condition: 'novo', location: 'D1-A1', warranty: '3 meses', hasImeiSerial: false }
        ],
        subtotal: 1250.00,
        additionalCost: 50.00,
        total: 1300.00,
        status: 'completed',
        createdAt: '2025-09-12T14:20:00Z',
        productType: 'product',
        selectedBrand: '3',
        selectedCategory: '9',
        selectedDescription: 'Smartphone Xiaomi 13X',
        productVariations: ['8GB/256GB', 'Dourado']
      },
      {
        id: '3',
        locatorCode: 'LOC001234569',
        supplierId: '1',
        supplierName: 'Apple Brasil',
        purchaseDate: '2025-09-11',
        invoiceNumber: 'NF-001236',
        observations: 'Notebooks para revenda',
        items: [
          { id: 'item5', description: 'MacBook Pro 14" M3 512GB Cinza Espacial', quantity: 1, costPrice: 8500, finalPrice: 9200, condition: 'novo', location: 'B1-A3', warranty: '1 ano', hasImeiSerial: true }
        ],
        subtotal: 9200.00,
        additionalCost: 100.00,
        total: 9300.00,
        status: 'completed',
        createdAt: '2025-09-11T09:15:00Z',
        productType: 'apple',
        selectedBrand: '1',
        selectedCategory: '3',
        selectedModel: 'MacBook Pro 14"',
        selectedStorage: '512GB',
        selectedColor: 'Cinza Espacial'
      },
      {
        id: '4',
        locatorCode: 'LOC001234570',
        supplierId: '2',
        supplierName: 'Samsung Eletrônica',
        purchaseDate: '2025-09-10',
        invoiceNumber: '',
        observations: 'Compra em processo de lançamento',
        items: [
          { id: 'item6', description: 'Galaxy Tab S9 256GB', quantity: 2, costPrice: 1200, finalPrice: 1500, condition: 'novo', location: 'Loja', warranty: '1 ano', hasImeiSerial: true }
        ],
        subtotal: 3000.00,
        additionalCost: 0,
        total: 3000.00,
        status: 'pending',
        createdAt: '2025-09-10T16:45:00Z',
        productType: 'product',
        selectedBrand: '2',
        selectedCategory: '8',
        selectedDescription: 'Galaxy Tab S9',
        productVariations: ['256GB']
      }
    ]);
  }, []);

  // Filtrar unidades do estoque por localizador
  const filteredByLocator = locatorSearch ? 
    inventoryUnits.filter(unit => 
      unit.locatorCode?.toLowerCase().includes(locatorSearch.toLowerCase())
    ) : inventoryUnits;

  // Show locator search results message
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
    
    const matchesBrand = filterBrand === '' || unit.brand === filterBrand;
    const matchesCategory = filterCategory === '' || unit.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || unit.status === filterStatus;
    const matchesCondition = filterCondition === 'all' || unit.condition === filterCondition;
    
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

  // Helper function to get current month dates
  const getCurrentMonthDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      from: firstDay.toISOString().split('T')[0],
      to: lastDay.toISOString().split('T')[0]
    };
  };

  // Get effective date range (current month if no filter set)
  const getEffectiveDateRange = () => {
    if (purchaseDateFrom && purchaseDateTo) {
      return { from: purchaseDateFrom, to: purchaseDateTo };
    }
    return getCurrentMonthDates();
  };

  // Filtrar compras
  const filteredPurchases = purchases.filter(purchase => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = purchase.locatorCode.toLowerCase().includes(searchTermLower) ||
                         purchase.supplierName.toLowerCase().includes(searchTermLower) ||
                         purchase.invoiceNumber.toLowerCase().includes(searchTermLower);
    
    const matchesStatus = purchaseStatusFilter === 'all' || purchase.status === purchaseStatusFilter;
    
    // Date filtering
    const dateRange = getEffectiveDateRange();
    const purchaseDate = purchase.purchaseDate;
    const matchesDate = purchaseDate >= dateRange.from && purchaseDate <= dateRange.to;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const brands = [...new Set(inventoryUnits.map(u => u.brand))];
  const categories = [...new Set(inventoryUnits.map(u => u.category))];

  // Update summary stats for inventory to use current month purchases when no date filter is set
  const getInventoryValueForPeriod = () => {
    const dateRange = getEffectiveDateRange();
    const periodPurchases = purchases.filter(purchase => {
      const purchaseDate = purchase.purchaseDate;
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

  const getConditionBadge = (condition: string) => {
    const badges = {
      novo: { label: 'Novo', color: 'bg-green-100 text-green-800' },
      seminovo: { label: 'Seminovo', color: 'bg-yellow-100 text-yellow-800' },
      usado: { label: 'Usado', color: 'bg-orange-100 text-orange-800' }
    };
    return badges[condition as keyof typeof badges] || badges.novo;
  };

  const getPurchaseStatusBadge = (status: string) => {
    const badges = {
      completed: { label: 'Concluída', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      partial: { label: 'Parcial', color: 'bg-blue-100 text-blue-800' }
    };
    return badges[status as keyof typeof badges] || badges.completed;
  };

  // Calculate low stock items
  const lowStockItems = inventoryUnits.filter(unit => 
    unit.status === 'available' && 
    unit.minStock !== undefined && 
    unit.minStock > 0 && 
    // To get the current stock for a product, we need to count available units for that productSku
    inventoryUnits.filter(u => u.productSku === unit.productSku && u.status === 'available').length <= unit.minStock
  );

  const summaryStats = {
    total: inventoryUnits.length,
    available: inventoryUnits.filter(u => u.status === 'available').length,
    sold: inventoryUnits.filter(u => u.status === 'sold').length,
    defective: inventoryUnits.filter(u => u.status === 'defective').length,
    lowStock: lowStockItems.length, // Adicionado lowStock
    totalValue: activeTab === 'inventory' ? getInventoryValueForPeriod() : inventoryUnits
      .filter(u => u.status === 'available')
      .reduce((sum, u) => sum + u.costPrice, 0)
  };

  // Purchase stats based on current filtering
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
    
    // Se todos os itens não precisam de IMEI/Serial, já finalizar automaticamente
    const allItemsNoImeiSerial = purchase.items.every((item: any) => item.hasImeiSerial === false);
    if (allItemsNoImeiSerial) {
      // Atualizar status para completed automaticamente
      const updatedPurchases = purchases.map(p => 
        p.id === purchase.id ? { ...purchase, status: 'completed' as const } : p
      );
      if (!editingPurchase) {
        updatedPurchases.unshift({ ...purchase, status: 'completed' as const });
      }
      setPurchases(updatedPurchases);
      
      showSuccess(
        'Compra finalizada automaticamente!',
        `${purchase.items.length} itens adicionados ao estoque sem necessidade de IMEI/Serial.`
      );
    }
    
    setEditingPurchase(null);
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
    // Update purchase status to completed
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
  };

  const handleViewPurchase = (purchase: Purchase) => {
    setViewingPurchase(purchase);
    setIsPurchaseViewModalOpen(true);
  };

  const handleViewProductHistory = (product: InventoryUnit) => {
    setSelectedProductForHistory(product);
    setIsProductHistoryModalOpen(true);
  };

  // New functions for editing individual inventory units
  const handleEditInventoryUnit = (unitId: string) => {
    const unit = inventoryUnits.find(u => u.id === unitId);
    if (unit) {
      setUnitToEdit(unit);
      setIsEditInventoryUnitModalOpen(true);
    }
  };

  const handleInventoryUnitUpdated = (updatedUnit: InventoryUnit) => {
    setInventoryUnits(prev => 
      prev.map(unit => unit.id === updatedUnit.id ? updatedUnit : unit)
    );
    setIsEditInventoryUnitModalOpen(false);
    setUnitToEdit(null);
  };

  // New functions for deleting inventory units
  const handleDeleteProductUnit = (unitId: string) => {
    if (confirm('Tem certeza que deseja excluir este item do estoque? Esta ação não pode ser desfeita.')) {
      setInventoryUnits(prev => prev.filter(unit => unit.id !== unitId));
      showSuccess('Item Excluído', 'O item foi removido do estoque com sucesso.');
      // Log to audit
      mockAuditLog({
        id: `AUDIT-${Date.now()}-PRODUCT-DELETE`,
        userId: 'current_user_id', // Replace with actual user ID
        userName: 'Current User', // Replace with actual user name
        action: 'PRODUCT_DELETE',
        tableName: 'inventory_units',
        recordId: unitId,
        oldValues: inventoryUnits.find(unit => unit.id === unitId), // Store old values
        ipAddress: '127.0.0.1', // Mock IP
        userAgent: navigator.userAgent,
        createdAt: new Date().toISOString()
      });
    }
  };

  // New functions for stock adjustment
  const handleOpenStockAdjustmentModal = (unitId: string) => {
    const unitToAdjust = inventoryUnits.find(unit => unit.id === unitId);
    if (unitToAdjust) {
      setSelectedProductForStockAdjustment(unitToAdjust);
      // Calculate current stock for this specific SKU
      const currentStockCount = inventoryUnits.filter(u => u.productSku === unitToAdjust.productSku && u.status === 'available').length;
      setCurrentStockForAdjustment(currentStockCount);
      setIsStockAdjustmentModalOpen(true);
    }
  };

  const handleConfirmStockAdjustment = (
    productSku: string,
    change: number,
    reason: string,
    newStock: number,
    adjustmentType: 'add' | 'remove',
    oldStock: number // Adicionado: estoque antes do ajuste
  ) => {
    // Find all units with the same SKU and update their status or add/remove dummy units
    setInventoryUnits(prevUnits => {
      let updatedUnits = [...prevUnits];
      const unitsToAdjust = prevUnits.filter(u => u.productSku === productSku && u.status === 'available');
      const productTemplate = unitsToAdjust.length > 0 ? unitsToAdjust[0] : prevUnits.find(u => u.productSku === productSku);

      if (!productTemplate) {
        console.error('Product template not found for SKU:', productSku);
        return prevUnits; // Should not happen
      }

      if (adjustmentType === 'add') {
        for (let i = 0; i < change; i++) {
          // Create a new dummy unit for stock addition
          const newUnit: InventoryUnit = {
            ...productTemplate,
            id: `stock-adj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            imei1: undefined, // Clear unique identifiers for generic stock
            imei2: undefined,
            serialNumber: undefined,
            barcode: undefined,
            status: 'available',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            purchaseId: 'stock-adjustment', // Mark as stock adjustment
            locatorCode: 'STOCK-ADJ',
          };
          updatedUnits.push(newUnit);
        }
      } else { // remove
        // Remove units from the end of the available list
        for (let i = 0; i < Math.abs(change); i++) {
          const indexToRemove = updatedUnits.findIndex(u => u.productSku === productSku && u.status === 'available');
          if (indexToRemove !== -1) {
            updatedUnits.splice(indexToRemove, 1);
          } else {
            break; // No more units to remove
          }
        }
      }
      return updatedUnits;
    });

    // Log to audit
    mockAuditLog({
      id: `AUDIT-${Date.now()}-STOCK-ADJ`,
      userId: 'current_user_id', // Replace with actual user ID
      userName: 'Current User', // Replace with actual user name
      action: 'STOCK_ADJUSTMENT',
      tableName: 'inventory_units',
      recordId: productSku, // Use SKU as record ID for stock adjustments
      newValues: {
        productSku: productSku,
        productDescription: selectedProductForStockAdjustment?.productDescription,
        change: change,
        reason: reason,
        newStock: newStock,
        adjustmentType: adjustmentType,
      },
      ipAddress: '127.0.0.1', // Mock IP
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString()
    });

    // Also add to product history (mocked for now)
    // This would typically be handled by the backend when the audit log is processed
    // For frontend mock, we can simulate it:
    const historyEntry = {
      id: `history-${Date.now()}`,
      type: 'stock_change',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR'),
      details: {
        user: 'Current User',
        movementType: adjustmentType === 'add' ? 'entrada' : 'saída',
        quantity: change,
        oldStock: oldStock, // Usando o oldStock passado como argumento
        newStock: newStock,
        reason: reason,
      }
    };
    // This part would need to be integrated with how ProductHistoryModal fetches its data.
    // For now, it's a console log to show the intent.
    console.log('PRODUCT HISTORY ENTRY (STOCK ADJUSTMENT):', historyEntry);

    setIsStockAdjustmentModalOpen(false);
    setSelectedProductForStockAdjustment(null);
  };

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
          {/* Botão Nova Compra/Produto */}
          <button 
            onClick={handleNewPurchase}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium"
          >
            <ShoppingBag className="mr-2" size={20} />
            Nova Compra/Produto
          </button>
          {/* Botão Atualizar Preços em Massa */}
          <button 
            onClick={() => setIsBulkPriceUpdateModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium"
          >
            <DollarSign className="mr-2" size={20} />
            Atualizar Preços
          </button>
          {/* Novo Botão para Configurações de Estoque */}
          <Link 
            to="/administration/warranty-stock"
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium"
          >
            <Settings className="mr-2" size={20} />
            Configurações de Estoque
          </Link>
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
                <option value="">Todas as Marcas</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
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
                <option value="novo">Novo</option>
                <option value="seminovo">Seminovo</option>
                <option value="usado">Usado</option>
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">SKU</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Produto</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Marca/Categoria</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Identificação</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Condição</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Preços</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Localização</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Estoque Mín.</th> {/* Adicionado */}
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
                          <div>
                            <div className="font-medium text-slate-800">{unit.brand}</div>
                            <div className="text-sm text-slate-600">{unit.category}</div>
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

                        <td className="py-3 px-4"> {/* Coluna de Estoque Mínimo */}
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
                          <ProductActionsDropdown
                            unitId={unit.id}
                            onViewHistory={() => handleViewProductHistory(unit)}
                            onEdit={() => handleEditInventoryUnit(unit.id)} {/* Chamar o novo handler */}
                            onDelete={() => handleDeleteProductUnit(unit.id)}
                            onAdjustStock={() => handleOpenStockAdjustmentModal(unit.id)}
                          />
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
                            {purchase.locatorCode}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{purchase.supplierName}</div>
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="flex items-center text-sm">
                            <Calendar size={14} className="mr-1 text-slate-500" />
                            {new Date(purchase.purchaseDate).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        
                        <td className="py-3 px-4">
                          {purchase.invoiceNumber ? (
                            <div className="flex items-center text-sm">
                              <FileText size={14} className="mr-1 text-slate-500" />
                              {purchase.invoiceNumber}
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
                              onClick={() => {
                                if (confirm('Tem certeza que deseja excluir esta compra?')) {
                                  setPurchases(purchases.filter(p => p.id !== purchase.id));
                                  showSuccess('Compra excluída com sucesso!');
                                }
                              }}
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

      {/* Product Definition Modal (for creating/editing product types) */}
      <ProductModal
        isOpen={isProductDefinitionModalOpen}
        onClose={() => {
          setIsProductDefinitionModalOpen(false);
          setEditingProductDefinition(null);
        }}
        product={editingProductDefinition}
        onProductSaved={() => { /* Handle product definition saved */ }}
      />

      {/* Bulk Price Update Modal */}
      <BulkPriceUpdateModal
        isOpen={isBulkPriceUpdateModalOpen}
        onClose={() => setIsBulkPriceUpdateModalOpen(false)}
        inventoryUnits={inventoryUnits}
        onUpdateInventoryUnits={setInventoryUnits}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isStockAdjustmentModalOpen}
        onClose={() => setIsStockAdjustmentModalOpen(false)}
        productUnit={selectedProductForStockAdjustment}
        currentStock={currentStockForAdjustment}
        onConfirmAdjustment={handleConfirmStockAdjustment}
      />

      {/* Edit Inventory Unit Modal (NEW) */}
      <EditInventoryUnitModal
        isOpen={isEditInventoryUnitModalOpen}
        onClose={() => setIsEditInventoryUnitModalOpen(false)}
        unit={unitToEdit}
        onUnitUpdated={handleInventoryUnitUpdated}
      />
    </div>
  );
}