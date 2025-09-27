import { useState, useEffect, useMemo } from 'react';
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
  DollarSign // Importar DollarSign para o botão de atualização de preços
} from 'lucide-react';
import PurchaseModal from '@/react-app/components/PurchaseModal';
import FinalizePurchaseModal from '@/react-app/components/FinalizePurchaseModal';
import PurchaseViewModal from '@/react-app/components/PurchaseViewModal';
import ProductHistoryModal from '@/react-app/components/ProductHistoryModal';
import ProductModal from '@/react-app/components/ProductModal'; // Importar ProductModal
import BulkPriceUpdateModal from '@/react-app/components/BulkPriceUpdateModal'; // Importar o novo modal
import { useNotification } from '@/react-app/components/NotificationSystem';
import { useLocation, useSearchParams } from 'react-router-dom'; // Importar useLocation e useSearchParams

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

export default function Inventory() {
  const { showSuccess, showError } = useNotification(); // Adicionado showError
  const [searchParams] = useSearchParams(); // Hook para ler parâmetros da URL
  const location = useLocation(); // Hook para obter a localização atual

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
  
  // New states for ProductModal (editing inventory units)
  const [isProductEditModalOpen, setIsProductEditModalOpen] = useState(false);
  const [editingProductUnit, setEditingProductUnit] = useState<InventoryUnit | null>(null);

  // New state for BulkPriceUpdateModal
  const [isBulkPriceUpdateModalOpen, setIsBulkPriceUpdateModalOpen] = useState(false);

  // Purchase filters
  const [purchaseDateFrom, setPurchaseDateFrom] = useState('');
  const [purchaseDateTo, setPurchaseDateTo] = useState('');
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState('all');

  // Novo estado para o filtro de nível de estoque
  const [stockLevelFilter, setStockLevelFilter] = useState('all'); // 'all', 'low', 'zero', 'negative'

  // Função para verificar duplicidade de IMEI/Serial
  const checkDuplicateImeiSerial = (
    imei1: string | undefined,
    imei2: string | undefined,
    serialNumber: string | undefined,
    currentUnitId: string | undefined = undefined // Para edição, para excluir a própria unidade
  ): { isDuplicate: boolean; type: string; value: string } => {
    for (const unit of inventoryUnits) {
      if (currentUnitId && unit.id === currentUnitId) {
        continue; // Ignorar a unidade que está sendo editada
      }
      if (imei1 && unit.imei1 && unit.imei1.trim() === imei1.trim()) {
        return { isDuplicate: true, type: 'IMEI 1', value: imei1 };
      }
      if (imei2 && unit.imei2 && unit.imei2.trim() === imei2.trim()) {
        return { isDuplicate: true, type: 'IMEI 2', value: imei2 };
      }
      if (serialNumber && unit.serialNumber && unit.serialNumber.trim() === serialNumber.trim()) {
        return { isDuplicate: true, type: 'Número de Série', value: serialNumber };
      }
    }
    return { isDuplicate: false, type: '', value: '' };
  };

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
        minStock: 2 // Adicionado minStock
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
        minStock: 1 // Adicionado minStock
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
        minStock: 3 // Adicionado minStock
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
        minStock: 1 // Adicionado minStock
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
        minStock: 10 // Adicionado minStock
      },
      {
        id: '6',
        productSku: '#133',
        productDescription: 'Fone de Ouvido Bluetooth',
        brand: 'Genérica',
        category: 'Áudio',
        model: 'Fone',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444555777',
        costPrice: 50.00,
        salePrice: 99.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 1 // Estoque baixo (1 <= 1)
      },
      {
        id: '7',
        productSku: '#134',
        productDescription: 'Carregador Portátil 10000mAh',
        brand: 'Genérica',
        category: 'Acessórios',
        model: 'Power Bank',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444555888',
        costPrice: 80.00,
        salePrice: 150.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0 // Não tem estoque mínimo
      },
      {
        id: '8',
        productSku: '#135',
        productDescription: 'Cabo USB-C 2m',
        brand: 'Genérica',
        category: 'Cabos',
        model: 'Cabo',
        color: 'Cinza',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444555999',
        costPrice: 20.00,
        salePrice: 40.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 5 // Estoque baixo (1 <= 5)
      },
      {
        id: '9',
        productSku: '#135', // Mesmo SKU do item 8
        productDescription: 'Cabo USB-C 2m',
        brand: 'Genérica',
        category: 'Cabos',
        model: 'Cabo',
        color: 'Cinza',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444555999',
        costPrice: 20.00,
        salePrice: 40.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 5 // Estoque baixo (2 <= 5)
      },
      {
        id: '10',
        productSku: '#136',
        productDescription: 'Mouse Sem Fio',
        brand: 'Logitech',
        category: 'Periféricos',
        model: 'M185',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556000',
        costPrice: 60.00,
        salePrice: 120.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 1 // Estoque baixo (1 <= 1)
      },
      {
        id: '11',
        productSku: '#137',
        productDescription: 'Teclado Mecânico',
        brand: 'HyperX',
        category: 'Periféricos',
        model: 'Alloy Origins',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556001',
        costPrice: 300.00,
        salePrice: 500.00,
        status: 'sold', // Item vendido, não deve aparecer no estoque disponível
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 1
      },
      {
        id: '12',
        productSku: '#138',
        productDescription: 'Webcam Full HD',
        brand: 'Logitech',
        category: 'Periféricos',
        model: 'C920',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556002',
        costPrice: 150.00,
        salePrice: 250.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '13',
        productSku: '#139',
        productDescription: 'Monitor Gamer 24"',
        brand: 'Acer',
        category: 'Monitores',
        model: 'Nitro VG240Y',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556003',
        costPrice: 700.00,
        salePrice: 1000.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 1
      },
      {
        id: '14',
        productSku: '#140',
        productDescription: 'Impressora Multifuncional',
        brand: 'Epson',
        category: 'Impressoras',
        model: 'EcoTank L3150',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556004',
        costPrice: 800.00,
        salePrice: 1200.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '15',
        productSku: '#141',
        productDescription: 'Roteador Wi-Fi 6',
        brand: 'TP-Link',
        category: 'Redes',
        model: 'Archer AX10',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556005',
        costPrice: 200.00,
        salePrice: 350.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '16',
        productSku: '#142',
        productDescription: 'SSD 1TB NVMe',
        brand: 'Kingston',
        category: 'Armazenamento',
        model: 'NV2',
        color: undefined,
        storage: '1TB',
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556006',
        costPrice: 350.00,
        salePrice: 500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '17',
        productSku: '#143',
        productDescription: 'Memória RAM 16GB DDR4',
        brand: 'Corsair',
        category: 'Componentes',
        model: 'Vengeance LPX',
        color: 'Preto',
        storage: '16GB',
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556007',
        costPrice: 250.00,
        salePrice: 400.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '18',
        productSku: '#144',
        productDescription: 'Placa de Vídeo RTX 3060',
        brand: 'NVIDIA',
        category: 'Componentes',
        model: 'RTX 3060',
        color: undefined,
        storage: '12GB',
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556008',
        costPrice: 1500.00,
        salePrice: 2200.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '19',
        productSku: '#145',
        productDescription: 'Processador Intel i5-12400F',
        brand: 'Intel',
        category: 'Componentes',
        model: 'i5-12400F',
        color: undefined,
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556009',
        costPrice: 900.00,
        salePrice: 1300.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '20',
        productSku: '#146',
        productDescription: 'Placa Mãe B660M',
        brand: 'ASUS',
        category: 'Componentes',
        model: 'Prime B660M-A',
        color: undefined,
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556010',
        costPrice: 700.00,
        salePrice: 1000.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '21',
        productSku: '#147',
        productDescription: 'Gabinete Gamer',
        brand: 'Deepcool',
        category: 'Componentes',
        model: 'Matrexx 55 Mesh',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556011',
        costPrice: 250.00,
        salePrice: 400.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '22',
        productSku: '#148',
        productDescription: 'Fonte 650W 80 Plus Bronze',
        brand: 'Corsair',
        category: 'Componentes',
        model: 'CV650',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556012',
        costPrice: 300.00,
        salePrice: 500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '23',
        productSku: '#149',
        productDescription: 'Headset Gamer',
        brand: 'HyperX',
        category: 'Áudio',
        model: 'Cloud Stinger Core',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556013',
        costPrice: 150.00,
        salePrice: 250.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '24',
        productSku: '#150',
        productDescription: 'Microfone Condensador',
        brand: 'HyperX',
        category: 'Áudio',
        model: 'QuadCast S',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556014',
        costPrice: 500.00,
        salePrice: 800.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '25',
        productSku: '#151',
        productDescription: 'Cadeira Gamer',
        brand: 'DT3 Sports',
        category: 'Móveis',
        model: 'Elise',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556015',
        costPrice: 800.00,
        salePrice: 1300.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '26',
        productSku: '#152',
        productDescription: 'Mesa Gamer',
        brand: 'Fortrek',
        category: 'Móveis',
        model: 'FT-200',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556016',
        costPrice: 400.00,
        salePrice: 700.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '27',
        productSku: '#153',
        productDescription: 'Controle Xbox Series X',
        brand: 'Microsoft',
        category: 'Acessórios',
        model: 'Xbox Wireless Controller',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556017',
        costPrice: 250.00,
        salePrice: 400.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '28',
        productSku: '#154',
        productDescription: 'Jogo PS5 Spider-Man 2',
        brand: 'Sony',
        category: 'Jogos',
        model: 'Spider-Man 2',
        color: undefined,
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556018',
        costPrice: 200.00,
        salePrice: 300.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '29',
        productSku: '#155',
        productDescription: 'Console Nintendo Switch OLED',
        brand: 'Nintendo',
        category: 'Consoles',
        model: 'Switch OLED',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556019',
        costPrice: 1800.00,
        salePrice: 2500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '30',
        productSku: '#156',
        productDescription: 'Câmera de Segurança Wi-Fi',
        brand: 'Intelbras',
        category: 'Segurança',
        model: 'IMX',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556020',
        costPrice: 100.00,
        salePrice: 180.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '31',
        productSku: '#157',
        productDescription: 'Smart Lâmpada Wi-Fi',
        brand: 'Positivo',
        category: 'Casa Inteligente',
        model: 'Smart Color',
        color: undefined,
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556021',
        costPrice: 50.00,
        salePrice: 90.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '32',
        productSku: '#158',
        productDescription: 'Fechadura Digital',
        brand: 'Intelbras',
        category: 'Casa Inteligente',
        model: 'FR 101',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556022',
        costPrice: 300.00,
        salePrice: 500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '33',
        productSku: '#159',
        productDescription: 'Aspirador Robô',
        brand: 'Xiaomi',
        category: 'Casa Inteligente',
        model: 'Robot Vacuum E10',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556023',
        costPrice: 1000.00,
        salePrice: 1500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '34',
        productSku: '#160',
        productDescription: 'Câmera de Ação 4K',
        brand: 'GoPro',
        category: 'Câmeras',
        model: 'Hero 11 Black',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556024',
        costPrice: 2000.00,
        salePrice: 2800.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '35',
        productSku: '#161',
        productDescription: 'Drone DJI Mini 3 Pro',
        brand: 'DJI',
        category: 'Drones',
        model: 'Mini 3 Pro',
        color: 'Cinza',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556025',
        costPrice: 4000.00,
        salePrice: 5500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '36',
        productSku: '#162',
        productDescription: 'Caixa de Som Bluetooth',
        brand: 'JBL',
        category: 'Áudio',
        model: 'Flip 6',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556026',
        costPrice: 400.00,
        salePrice: 600.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '37',
        productSku: '#163',
        productDescription: 'Fritadeira Air Fryer',
        brand: 'Mondial',
        category: 'Eletrodomésticos',
        model: 'AFN-40-BI',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556027',
        costPrice: 300.00,
        salePrice: 500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '38',
        productSku: '#164',
        productDescription: 'Cafeteira Expresso',
        brand: 'Nespresso',
        category: 'Eletrodomésticos',
        model: 'Essenza Mini',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556028',
        costPrice: 400.00,
        salePrice: 700.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '39',
        productSku: '#165',
        productDescription: 'Liquidificador',
        brand: 'Britânia',
        category: 'Eletrodomésticos',
        model: 'Diamante 800',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556029',
        costPrice: 100.00,
        salePrice: 180.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '40',
        productSku: '#166',
        productDescription: 'Ferro de Passar',
        brand: 'Black+Decker',
        category: 'Eletrodomésticos',
        model: 'VFA1110T',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556030',
        costPrice: 80.00,
        salePrice: 150.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '41',
        productSku: '#167',
        productDescription: 'Ventilador de Mesa',
        brand: 'Arno',
        category: 'Eletrodomésticos',
        model: 'Silence Force',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556031',
        costPrice: 120.00,
        salePrice: 200.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '42',
        productSku: '#168',
        productDescription: 'Aquecedor Elétrico',
        brand: 'Cadence',
        category: 'Eletrodomésticos',
        model: 'AQC300',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556032',
        costPrice: 150.00,
        salePrice: 250.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '43',
        productSku: '#169',
        productDescription: 'Máquina de Lavar',
        brand: 'Brastemp',
        category: 'Eletrodomésticos',
        model: 'BWL11AB',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556033',
        costPrice: 1500.00,
        salePrice: 2200.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '44',
        productSku: '#170',
        productDescription: 'Geladeira Frost Free',
        brand: 'Consul',
        category: 'Eletrodomésticos',
        model: 'CRM39AB',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556034',
        costPrice: 2000.00,
        salePrice: 3000.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '45',
        productSku: '#171',
        productDescription: 'Fogão 4 Bocas',
        brand: 'Atlas',
        category: 'Eletrodomésticos',
        model: 'Top Gourmet',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556035',
        costPrice: 800.00,
        salePrice: 1200.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '46',
        productSku: '#172',
        productDescription: 'Micro-ondas',
        brand: 'Electrolux',
        category: 'Eletrodomésticos',
        model: 'MEO44',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556036',
        costPrice: 300.00,
        salePrice: 500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '47',
        productSku: '#173',
        productDescription: 'Máquina de Café Expresso',
        brand: 'Três Corações',
        category: 'Eletrodomésticos',
        model: 'Lov',
        color: 'Vermelho',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556037',
        costPrice: 200.00,
        salePrice: 350.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '48',
        productSku: '#174',
        productDescription: 'Batedeira Planetária',
        brand: 'Philco',
        category: 'Eletrodomésticos',
        model: 'PBP600P',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556038',
        costPrice: 250.00,
        salePrice: 400.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '49',
        productSku: '#175',
        productDescription: 'Grill e Sanduicheira',
        brand: 'Britânia',
        category: 'Eletrodomésticos',
        model: 'Press Inox',
        color: 'Inox',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556039',
        costPrice: 80.00,
        salePrice: 150.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '50',
        productSku: '#176',
        productDescription: 'Panela de Pressão Elétrica',
        brand: 'Mondial',
        category: 'Eletrodomésticos',
        model: 'Master Cooker',
        color: 'Inox',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556040',
        costPrice: 200.00,
        salePrice: 350.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '51',
        productSku: '#177',
        productDescription: 'Smart TV 50" 4K',
        brand: 'Samsung',
        category: 'TVs',
        model: 'AU8000',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556041',
        costPrice: 2000.00,
        salePrice: 2800.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '52',
        productSku: '#178',
        productDescription: 'Soundbar 2.1 Canais',
        brand: 'LG',
        category: 'Áudio',
        model: 'SN4',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556042',
        costPrice: 500.00,
        salePrice: 800.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '53',
        productSku: '#179',
        productDescription: 'Home Theater',
        brand: 'Sony',
        category: 'Áudio',
        model: 'HT-S20R',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556043',
        costPrice: 1000.00,
        salePrice: 1500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '54',
        productSku: '#180',
        productDescription: 'Projetor Portátil',
        brand: 'Epson',
        category: 'Projetores',
        model: 'EpiqVision Mini EF12',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556044',
        costPrice: 3000.00,
        salePrice: 4500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '55',
        productSku: '#181',
        productDescription: 'Tela de Projeção 100"',
        brand: 'Multilaser',
        category: 'Projetores',
        model: 'SP200',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556045',
        costPrice: 200.00,
        salePrice: 350.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '56',
        productSku: '#182',
        productDescription: 'Câmera DSLR Canon EOS Rebel T7',
        brand: 'Canon',
        category: 'Câmeras',
        model: 'EOS Rebel T7',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556046',
        costPrice: 2500.00,
        salePrice: 3500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '57',
        productSku: '#183',
        productDescription: 'Lente 50mm f/1.8',
        brand: 'Canon',
        category: 'Câmeras',
        model: 'EF 50mm f/1.8 STM',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556047',
        costPrice: 600.00,
        salePrice: 900.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '58',
        productSku: '#184',
        productDescription: 'Tripé para Câmera',
        brand: 'Manfrotto',
        category: 'Acessórios',
        model: 'Compact Advanced',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556048',
        costPrice: 300.00,
        salePrice: 500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '59',
        productSku: '#185',
        productDescription: 'Mochila para Câmera',
        brand: 'Lowepro',
        category: 'Acessórios',
        model: 'ProTactic 450 AW II',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556049',
        costPrice: 700.00,
        salePrice: 1000.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '60',
        productSku: '#186',
        productDescription: 'Cartão de Memória SD 128GB',
        brand: 'SanDisk',
        category: 'Armazenamento',
        model: 'Extreme Pro',
        color: undefined,
        storage: '128GB',
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556050',
        costPrice: 100.00,
        salePrice: 180.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '61',
        productSku: '#187',
        productDescription: 'Leitor de Cartão USB-C',
        brand: 'Kingston',
        category: 'Acessórios',
        model: 'Nucleum',
        color: 'Cinza',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556051',
        costPrice: 150.00,
        salePrice: 250.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '62',
        productSku: '#188',
        productDescription: 'Hub USB-C 7 em 1',
        brand: 'Baseus',
        category: 'Acessórios',
        model: 'Type-C Hub',
        color: 'Cinza',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556052',
        costPrice: 180.00,
        salePrice: 300.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '63',
        productSku: '#189',
        productDescription: 'Adaptador HDMI para USB-C',
        brand: 'UGREEN',
        category: 'Acessórios',
        model: 'CM121',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556053',
        costPrice: 70.00,
        salePrice: 120.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '64',
        productSku: '#190',
        productDescription: 'Cabo de Rede Cat6 10m',
        brand: 'Multilaser',
        category: 'Redes',
        model: 'RE001',
        color: 'Azul',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556054',
        costPrice: 30.00,
        salePrice: 60.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '65',
        productSku: '#191',
        productDescription: 'Repetidor Wi-Fi',
        brand: 'TP-Link',
        category: 'Redes',
        model: 'RE200',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556055',
        costPrice: 100.00,
        salePrice: 180.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '66',
        productSku: '#192',
        productDescription: 'Switch de Rede 8 Portas',
        brand: 'Intelbras',
        category: 'Redes',
        model: 'SF 800 Q+',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556056',
        costPrice: 80.00,
        salePrice: 150.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '67',
        productSku: '#193',
        productDescription: 'Servidor NAS 2 Baias',
        brand: 'Synology',
        category: 'Armazenamento',
        model: 'DS220+',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556057',
        costPrice: 1500.00,
        salePrice: 2200.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '68',
        productSku: '#194',
        productDescription: 'HD Externo 2TB',
        brand: 'Seagate',
        category: 'Armazenamento',
        model: 'Expansion',
        color: 'Preto',
        storage: '2TB',
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556058',
        costPrice: 300.00,
        salePrice: 500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '69',
        productSku: '#195',
        productDescription: 'Pendrive 64GB',
        brand: 'SanDisk',
        category: 'Armazenamento',
        model: 'Cruzer Blade',
        color: 'Preto',
        storage: '64GB',
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556059',
        costPrice: 30.00,
        salePrice: 60.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '70',
        productSku: '#196',
        productDescription: 'Bateria Externa 20000mAh',
        brand: 'Xiaomi',
        category: 'Acessórios',
        model: 'Power Bank 3 Pro',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556060',
        costPrice: 150.00,
        salePrice: 250.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '71',
        productSku: '#197',
        productDescription: 'Carregador de Parede USB-C 65W',
        brand: 'Baseus',
        category: 'Acessórios',
        model: 'GaN2 Pro',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556061',
        costPrice: 120.00,
        salePrice: 200.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '72',
        productSku: '#198',
        productDescription: 'Cabo USB-C para Lightning 1.8m',
        brand: 'Apple',
        category: 'Cabos',
        model: 'USB-C to Lightning',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556062',
        costPrice: 80.00,
        salePrice: 150.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '73',
        productSku: '#199',
        productDescription: 'Adaptador USB-C para P2',
        brand: 'UGREEN',
        category: 'Acessórios',
        model: 'CM193',
        color: 'Cinza',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556063',
        costPrice: 40.00,
        salePrice: 70.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '74',
        productSku: '#200',
        productDescription: 'Suporte para Notebook',
        brand: 'ELG',
        category: 'Acessórios',
        model: 'F80',
        color: 'Prata',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556064',
        costPrice: 100.00,
        salePrice: 180.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '75',
        productSku: '#201',
        productDescription: 'Mochila para Notebook 15.6"',
        brand: 'Dell',
        category: 'Acessórios',
        model: 'Essential Backpack 15',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556065',
        costPrice: 120.00,
        salePrice: 200.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '76',
        productSku: '#202',
        productDescription: 'Capa para Tablet 10"',
        brand: 'Genérica',
        category: 'Acessórios',
        model: 'Universal',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556066',
        costPrice: 50.00,
        salePrice: 90.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '77',
        productSku: '#203',
        productDescription: 'Caneta Stylus',
        brand: 'Apple',
        category: 'Acessórios',
        model: 'Apple Pencil 2ª Geração',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556067',
        costPrice: 800.00,
        salePrice: 1200.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '78',
        productSku: '#204',
        productDescription: 'Fone de Ouvido com Fio',
        brand: 'Samsung',
        category: 'Áudio',
        model: 'EO-IC100BBEGWW',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556068',
        costPrice: 50.00,
        salePrice: 90.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '79',
        productSku: '#205',
        productDescription: 'Câmera de Segurança Externa',
        brand: 'Intelbras',
        category: 'Segurança',
        model: 'VIP 3220 B',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556069',
        costPrice: 300.00,
        salePrice: 500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '80',
        productSku: '#206',
        productDescription: 'Sensor de Presença Wi-Fi',
        brand: 'Positivo',
        category: 'Casa Inteligente',
        model: 'Smart Sensor',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556070',
        costPrice: 80.00,
        salePrice: 150.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '81',
        productSku: '#207',
        productDescription: 'Tomada Inteligente Wi-Fi',
        brand: 'Positivo',
        category: 'Casa Inteligente',
        model: 'Smart Plug',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556071',
        costPrice: 60.00,
        salePrice: 100.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '82',
        productSku: '#208',
        productDescription: 'Controle Universal IR Wi-Fi',
        brand: 'Positivo',
        category: 'Casa Inteligente',
        model: 'Smart Controle Universal',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556072',
        costPrice: 100.00,
        salePrice: 180.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '83',
        productSku: '#209',
        productDescription: 'Kit Casa Inteligente',
        brand: 'Positivo',
        category: 'Casa Inteligente',
        model: 'Kit Smart Home',
        color: undefined,
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556073',
        costPrice: 300.00,
        salePrice: 500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '84',
        productSku: '#210',
        productDescription: 'Câmera de Segurança Wi-Fi',
        brand: 'TP-Link',
        category: 'Segurança',
        model: 'Tapo C200',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556074',
        costPrice: 150.00,
        salePrice: 250.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '85',
        productSku: '#211',
        productDescription: 'Lâmpada Inteligente Wi-Fi',
        brand: 'TP-Link',
        category: 'Casa Inteligente',
        model: 'Tapo L510E',
        color: undefined,
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556075',
        costPrice: 50.00,
        salePrice: 90.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '86',
        productSku: '#212',
        productDescription: 'Tomada Inteligente Wi-Fi',
        brand: 'TP-Link',
        category: 'Casa Inteligente',
        model: 'Tapo P100',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556076',
        costPrice: 60.00,
        salePrice: 100.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '87',
        productSku: '#213',
        productDescription: 'Robô Aspirador',
        brand: 'Electrolux',
        category: 'Casa Inteligente',
        model: 'Pure i9.2',
        color: 'Cinza',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556077',
        costPrice: 1800.00,
        salePrice: 2500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '88',
        productSku: '#214',
        productDescription: 'Câmera de Ação',
        brand: 'Akaso',
        category: 'Câmeras',
        model: 'Brave 7 LE',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556078',
        costPrice: 800.00,
        salePrice: 1200.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '89',
        productSku: '#215',
        productDescription: 'Drone',
        brand: 'FIMI',
        category: 'Drones',
        model: 'X8 Mini',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556079',
        costPrice: 1500.00,
        salePrice: 2200.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '90',
        productSku: '#216',
        productDescription: 'Caixa de Som',
        brand: 'Ultimate Ears',
        category: 'Áudio',
        model: 'Boom 3',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556080',
        costPrice: 500.00,
        salePrice: 800.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '91',
        productSku: '#217',
        productDescription: 'Fritadeira Elétrica',
        brand: 'Britânia',
        category: 'Eletrodomésticos',
        model: 'Air Fry Pro',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556081',
        costPrice: 250.00,
        salePrice: 400.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '92',
        productSku: '#218',
        productDescription: 'Cafeteira',
        brand: 'Oster',
        category: 'Eletrodomésticos',
        model: 'PrimaLatte II',
        color: 'Prata',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556082',
        costPrice: 700.00,
        salePrice: 1000.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '93',
        productSku: '#219',
        productDescription: 'Liquidificador',
        brand: 'Walita',
        category: 'Eletrodomésticos',
        model: 'ProBlend 6',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556083',
        costPrice: 150.00,
        salePrice: 250.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '94',
        productSku: '#220',
        productDescription: 'Ferro de Passar a Vapor',
        brand: 'Philips Walita',
        category: 'Eletrodomésticos',
        model: 'EasySpeed Plus',
        color: 'Azul',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556084',
        costPrice: 100.00,
        salePrice: 180.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '95',
        productSku: '#221',
        productDescription: 'Ventilador de Coluna',
        brand: 'Arno',
        category: 'Eletrodomésticos',
        model: 'Silence Force Repelente',
        color: 'Preto',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556085',
        costPrice: 180.00,
        salePrice: 300.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '96',
        productSku: '#222',
        productDescription: 'Aquecedor a Óleo',
        brand: 'Cadence',
        category: 'Eletrodomésticos',
        model: 'AQC800',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556086',
        costPrice: 200.00,
        salePrice: 350.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '97',
        productSku: '#223',
        productDescription: 'Máquina de Lavar',
        brand: 'Electrolux',
        category: 'Eletrodomésticos',
        model: 'LPR16',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556087',
        costPrice: 1800.00,
        salePrice: 2500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '98',
        productSku: '#224',
        productDescription: 'Geladeira',
        brand: 'Brastemp',
        category: 'Eletrodomésticos',
        model: 'BRM54HK',
        color: 'Inox',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556088',
        costPrice: 2500.00,
        salePrice: 3500.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '99',
        productSku: '#225',
        productDescription: 'Fogão',
        brand: 'Consul',
        category: 'Eletrodomésticos',
        model: 'CFO4NAB',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556089',
        costPrice: 900.00,
        salePrice: 1300.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
      },
      {
        id: '100',
        productSku: '#226',
        productDescription: 'Micro-ondas',
        brand: 'Brastemp',
        category: 'Eletrodomésticos',
        model: 'BMF45ABBNA',
        color: 'Branco',
        storage: undefined,
        condition: 'novo',
        location: 'D1-A1',
        imei1: undefined,
        imei2: undefined,
        serialNumber: undefined,
        barcode: '7899444556090',
        costPrice: 400.00,
        salePrice: 600.00,
        status: 'available',
        createdAt: '2025-09-13',
        updatedAt: '2025-09-13',
        purchaseId: '2',
        locatorCode: 'LOC001234568',
        minStock: 0
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
          { id: 'item1', description: 'iPhone 16 Pro Max 256GB Titânio-deserto', quantity: 1, costPrice: 3000, finalPrice: 3500, condition: 'seminovo', location: 'Loja', warranty: '1 ano', hasImeiSerial: true, imei1: '123456789012345', imei2: '123456789012346' },
          { id: 'item2', description: 'Samsung Galaxy S24 Ultra 512GB Preto', quantity: 1, costPrice: 4200, finalPrice: 4800, condition: 'novo', location: 'A1-B2', warranty: '1 ano', hasImeiSerial: true, imei1: '555666777888999', imei2: '555666777888998' }
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
          { id: 'item3', description: 'Smartphone Xiaomi 13X 8GB/256GB Dourado', quantity: 1, costPrice: 500, finalPrice: 750, condition: 'novo', location: 'Vitrine iS', warranty: '1 ano', hasImeiSerial: true, imei1: '987654321098765' },
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
          { id: 'item5', description: 'MacBook Pro 14" M3 512GB Cinza Espacial', quantity: 1, costPrice: 8500, finalPrice: 9200, condition: 'novo', location: 'B1-A3', warranty: '1 ano', hasImeiSerial: true, serialNumber: 'FVFH3LL/A12345' }
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

  // Efeito para lidar com o parâmetro de URL 'filter=low-stock'
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'low-stock') {
      setStockLevelFilter('low'); // Define o filtro para 'low'
      setActiveTab('inventory'); // Garante que a aba de inventário esteja ativa
      setFilterStatus('available'); // Filtra para mostrar apenas itens disponíveis
      setFilterCondition('all'); // Não filtra por condição específica
      setSearchTerm(''); // Limpa o termo de busca
      setLocatorSearch(''); // Limpa a busca por localizador
    } else {
      // Se o filtro não for 'low-stock' na URL, resetar para 'all'
      setStockLevelFilter('all');
    }
  }, [searchParams]); // Depende de searchParams para reagir a mudanças na URL

  // Mapeia o estoque atual para cada SKU de produto
  const currentStockMap = useMemo(() => {
    const map = new Map<string, number>();
    inventoryUnits.forEach(unit => {
      if (unit.status === 'available') {
        map.set(unit.productSku, (map.get(unit.productSku) || 0) + 1);
      }
    });
    return map;
  }, [inventoryUnits]);

  // Helper function to determine if a unit is low stock
  const isUnitLowStock = (unit: InventoryUnit, stockMap: Map<string, number>): boolean => {
    if (unit.minStock === undefined || unit.minStock <= 0) return false;
    const currentStock = stockMap.get(unit.productSku) || 0;
    return currentStock <= unit.minStock;
  };

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
    
    // Nova lógica de filtro para nível de estoque
    let matchesStockLevel = true;
    if (stockLevelFilter !== 'all') {
      const currentStock = currentStockMap.get(unit.productSku) || 0;
      const minStock = unit.minStock || 0;

      if (stockLevelFilter === 'low') {
        matchesStockLevel = currentStock > 0 && currentStock <= minStock;
      } else if (stockLevelFilter === 'zero') {
        matchesStockLevel = currentStock === 0;
      } else if (stockLevelFilter === 'negative') {
        matchesStockLevel = currentStock < 0; // Assumindo que o estoque pode ser negativo em algum cenário
      }
    }

    return matchesSearch && matchesBrand && matchesCategory && matchesStatus && matchesCondition && matchesStockLevel;
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
  const lowStockItems = useMemo(() => {
    const lowStockSkus = new Set<string>();
    inventoryUnits.forEach(unit => {
      if (isUnitLowStock(unit, currentStockMap)) {
        lowStockSkus.add(unit.productSku);
      }
    });
    return lowStockSkus.size;
  }, [inventoryUnits, currentStockMap]);

  const summaryStats = {
    total: inventoryUnits.length,
    available: inventoryUnits.filter(u => u.status === 'available').length,
    sold: inventoryUnits.filter(u => u.status === 'sold').length,
    defective: inventoryUnits.filter(u => u.status === 'defective').length,
    lowStock: lowStockItems, // Adicionado lowStock
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

  // New functions for editing inventory units
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
          {/* Botão Nova Compra/Produto (agora primeiro e menor) */}
          <button 
            onClick={handleNewPurchase}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium text-sm"
          >
            <ShoppingBag className="mr-2" size={18} />
            Nova Compra/Produto
          </button>
          {/* Botão Atualizar Preços em Massa (agora segundo e menor) */}
          <button 
            onClick={() => setIsBulkPriceUpdateModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium text-sm"
          >
            <DollarSign className="mr-2" size={18} />
            Atualizar Preços
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

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4"> {/* Aumentado para 5 colunas */}
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

              {/* Novo filtro de nível de estoque */}
              <select
                value={stockLevelFilter}
                onChange={(e) => setStockLevelFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos Níveis de Estoque</option>
                <option value="low">Estoque Baixo</option>
                <option value="zero">Estoque Zerado</option>
                <option value="negative">Estoque Negativo</option>
              </select>

              <div className="flex items-center text-sm text-slate-600 mt-4 md:col-span-5"> {/* Ajustado para ocupar a linha inteira */}
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
                    const isLowStock = isUnitLowStock(unit, currentStockMap);
                    
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
                              onClick={() => handleEditProductUnit(unit)} // Updated to open ProductModal
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={16} className="text-green-600" />
                            </button>
                            <button
                              onClick={() => alert(`Excluir item ${unit.id}`)}
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
        checkDuplicateImeiSerial={checkDuplicateImeiSerial} // Passando a função
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
        checkDuplicateImeiSerial={checkDuplicateImeiSerial} // Passando a função
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
        product={editingProductUnit} // Pass the selected unit for editing
        onProductSaved={handleProductUnitSaved} // Handle saving updates
        checkDuplicateImeiSerial={checkDuplicateImeiSerial} // Passando a função
      />

      {/* Bulk Price Update Modal */}
      <BulkPriceUpdateModal
        isOpen={isBulkPriceUpdateModalOpen}
        onClose={() => setIsBulkPriceUpdateModalOpen(false)}
        inventoryUnits={inventoryUnits}
        onUpdateInventoryUnits={setInventoryUnits}
      />
    </div>
  );
}