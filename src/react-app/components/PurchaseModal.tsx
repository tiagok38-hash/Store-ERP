import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { X, Plus, Save, ShoppingBag, Hash, Smartphone, Barcode, Package, DollarSign, Calendar, MapPin, ShieldCheck, Tag, Palette, HardDrive, List, Info, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useNotification } from '@/react-app/components/NotificationSystem'; // Importar useNotification

// Mock de dados para fornecedores e categorias
const mockSuppliers = [
  { id: '1', name: 'Apple Brasil' },
  { id: '2', name: 'Samsung Eletrônica' },
  { id: '3', name: 'Tech Distribuidora' },
  { id: '4', name: 'Importadora XYZ' },
];

const mockCategories = [
  { id: '1', name: 'Smartphone' },
  { id: '2', name: 'Tablet' },
  { id: '3', name: 'Notebook' },
  { id: '4', name: 'Smartwatch' },
  { id: '5', name: 'Fone de Ouvido' },
  { id: '6', name: 'Carregador' },
  { id: '7', name: 'Cabo' },
  { id: '8', name: 'Acessórios' },
  { id: '9', name: 'Outros' },
];

interface PurchaseItem {
  id: string;
  description: string;
  quantity: number;
  costPrice: number;
  finalPrice: number;
  condition: 'novo' | 'seminovo' | 'usado';
  location?: string;
  warranty?: string;
  hasImeiSerial: boolean;
  imei1?: string;
  imei2?: string;
  serialNumber?: string;
  barcode?: string;
}

interface Purchase {
  id: string;
  locatorCode: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  invoiceNumber: string;
  observations: string;
  items: PurchaseItem[];
  subtotal: number;
  additionalCost: number;
  total: number;
  status: 'completed' | 'pending' | 'partial';
  createdAt: string;
  productType?: 'apple' | 'product';
  selectedBrand?: string;
  selectedCategory?: string;
  selectedModel?: string;
  selectedStorage?: string;
  selectedColor?: string;
  selectedDescription?: string;
  productVariations?: string[];
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSaved: (purchase: Purchase) => void;
  editingPurchase: Purchase | null;
  checkDuplicateImeiSerial: (
    imei1: string | undefined,
    imei2: string | undefined,
    serialNumber: string | undefined,
    currentUnitId?: string
  ) => { isDuplicate: boolean; type: string; value: string }; // Nova prop
}

export default function PurchaseModal({
  isOpen,
  onClose,
  onPurchaseSaved,
  editingPurchase,
  checkDuplicateImeiSerial, // Recebendo a nova prop
}: PurchaseModalProps) {
  const { showSuccess, showError } = useNotification();

  const [supplierId, setSupplierId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [observations, setObservations] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [additionalCost, setAdditionalCost] = useState(0);

  // New Item states
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemCostPrice, setNewItemCostPrice] = useState(0);
  const [newItemFinalPrice, setNewItemFinalPrice] = useState(0);
  const [newItemCondition, setNewItemCondition] = useState<'novo' | 'seminovo' | 'usado'>('novo');
  const [newItemLocation, setNewItemLocation] = useState('');
  const [newItemWarranty, setNewItemWarranty] = useState('3 meses');
  const [newItemHasImeiSerial, setNewItemHasImeiSerial] = useState(false);
  const [newItemImei1, setNewItemImei1] = useState('');
  const [newItemImei2, setNewItemImei2] = useState('');
  const [newItemSerialNumber, setNewItemSerialNumber] = useState('');
  const [newItemBarcode, setNewItemBarcode] = useState('');

  // Product Type specific states (for Apple/Product flow)
  const [productType, setProductType] = useState<'apple' | 'product'>('product');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedDescription, setSelectedDescription] = useState('');
  const [productVariations, setProductVariations] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && editingPurchase) {
      setSupplierId(editingPurchase.supplierId);
      setPurchaseDate(editingPurchase.purchaseDate);
      setInvoiceNumber(editingPurchase.invoiceNumber);
      setObservations(editingPurchase.observations);
      setPurchaseItems(editingPurchase.items);
      setAdditionalCost(editingPurchase.additionalCost);
      setProductType(editingPurchase.productType || 'product');
      setSelectedBrand(editingPurchase.selectedBrand || '');
      setSelectedCategory(editingPurchase.selectedCategory || '');
      setSelectedModel(editingPurchase.selectedModel || '');
      setSelectedStorage(editingPurchase.selectedStorage || '');
      setSelectedColor(editingPurchase.selectedColor || '');
      setSelectedDescription(editingPurchase.selectedDescription || '');
      setProductVariations(editingPurchase.productVariations || []);
    } else if (isOpen) {
      // Reset form for new purchase
      setSupplierId('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setInvoiceNumber('');
      setObservations('');
      setPurchaseItems([]);
      setAdditionalCost(0);
      setProductType('product');
      setSelectedBrand('');
      setSelectedCategory('');
      setSelectedModel('');
      setSelectedStorage('');
      setSelectedColor('');
      setSelectedDescription('');
      setProductVariations([]);
      resetNewItemFields();
    }
  }, [isOpen, editingPurchase]);

  const resetNewItemFields = () => {
    setNewItemDescription('');
    setNewItemQuantity(1);
    setNewItemCostPrice(0);
    setNewItemFinalPrice(0);
    setNewItemCondition('novo');
    setNewItemLocation('');
    setNewItemWarranty('3 meses');
    setNewItemHasImeiSerial(false);
    setNewItemImei1('');
    setNewItemImei2('');
    setNewItemSerialNumber('');
    setNewItemBarcode('');
  };

  const generateLocatorCode = () => {
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random chars
    return `LOC-${datePart}-${randomPart}`;
  };

  const handleAddItem = () => {
    if (!newItemDescription || newItemQuantity <= 0 || newItemCostPrice <= 0) {
      showError('Erro', 'Preencha todos os campos obrigatórios para adicionar um item.');
      return;
    }

    // Validação de IMEI/Serial para itens com identificação única
    if (newItemHasImeiSerial) {
      const imei1 = newItemImei1.trim();
      const imei2 = newItemImei2.trim();
      const serial = newItemSerialNumber.trim();

      if (!imei1 && !imei2 && !serial) {
        showError('Erro', 'Para produtos com IMEI/Serial, pelo menos um campo de identificação deve ser preenchido.');
        return;
      }

      // Verificar duplicidade com itens já existentes no estoque
      const duplicateCheck = checkDuplicateImeiSerial(imei1, imei2, serial);
      if (duplicateCheck.isDuplicate) {
        showError(
          'Erro de Duplicidade',
          `O ${duplicateCheck.type} "${duplicateCheck.value}" já está cadastrado no sistema.`
        );
        return; // Impedir adição do item
      }

      // Verificar duplicidade com outros itens já adicionados nesta mesma compra
      for (const existingItem of purchaseItems) {
        if (existingItem.hasImeiSerial) {
          if (imei1 && existingItem.imei1 === imei1) {
            showError('Erro de Duplicidade Interna', `O IMEI 1 "${imei1}" já foi adicionado a outro item nesta compra.`);
            return;
          }
          if (imei2 && existingItem.imei2 === imei2) {
            showError('Erro de Duplicidade Interna', `O IMEI 2 "${imei2}" já foi adicionado a outro item nesta compra.`);
            return;
          }
          if (serial && existingItem.serialNumber === serial) {
            showError('Erro de Duplicidade Interna', `O Número de Série "${serial}" já foi adicionado a outro item nesta compra.`);
            return;
          }
        }
      }
    }

    const newItem: PurchaseItem = {
      id: uuidv4(),
      description: newItemDescription,
      quantity: newItemQuantity,
      costPrice: newItemCostPrice,
      finalPrice: newItemFinalPrice || newItemCostPrice * 1.3, // Default markup
      condition: newItemCondition,
      location: newItemLocation,
      warranty: newItemWarranty,
      hasImeiSerial: newItemHasImeiSerial,
      imei1: newItemHasImeiSerial ? newItemImei1.trim() : undefined,
      imei2: newItemHasImeiSerial ? newItemImei2.trim() : undefined,
      serialNumber: newItemHasImeiSerial ? newItemSerialNumber.trim() : undefined,
      barcode: newItemHasImeiSerial ? newItemBarcode.trim() : undefined,
    };

    setPurchaseItems([...purchaseItems, newItem]);
    showSuccess('Item Adicionado', `"${newItemDescription}" adicionado à compra.`);
    resetNewItemFields();
  };

  const handleRemoveItem = (id: string) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== id));
    showSuccess('Item Removido', 'Item removido da compra.');
  };

  const handleSavePurchase = () => {
    if (!supplierId || !purchaseDate || purchaseItems.length === 0) {
      showError('Erro', 'Preencha todos os campos obrigatórios e adicione pelo menos um item.');
      return;
    }

    // Verificação final de duplicidade para IMEI/Serial antes de salvar a compra
    const allImeiSerialsInThisPurchase = new Set<string>();
    for (const item of purchaseItems) {
      if (item.hasImeiSerial) {
        // Verificar duplicidade com itens já existentes no estoque
        const duplicateCheck = checkDuplicateImeiSerial(item.imei1, item.imei2, item.serialNumber);
        if (duplicateCheck.isDuplicate) {
          showError(
            'Erro de Duplicidade',
            `O ${duplicateCheck.type} "${duplicateCheck.value}" do item "${item.description}" já está cadastrado no sistema.`
          );
          return;
        }

        // Verificar duplicidade com outros itens dentro desta mesma compra
        if (item.imei1) {
          if (allImeiSerialsInThisPurchase.has(item.imei1)) {
            showError(
              'Erro de Duplicidade Interna',
              `O IMEI 1 "${item.imei1}" está duplicado dentro desta mesma compra para o item "${item.description}".`
            );
            return;
          }
          allImeiSerialsInThisPurchase.add(item.imei1);
        }
        if (item.imei2) {
          if (allImeiSerialsInThisPurchase.has(item.imei2)) {
            showError(
              'Erro de Duplicidade Interna',
              `O IMEI 2 "${item.imei2}" está duplicado dentro desta mesma compra para o item "${item.description}".`
            );
            return;
          }
          allImeiSerialsInThisPurchase.add(item.imei2);
        }
        if (item.serialNumber) {
          if (allImeiSerialsInThisPurchase.has(item.serialNumber)) {
            showError(
              'Erro de Duplicidade Interna',
              `O Número de Série "${item.serialNumber}" está duplicado dentro desta mesma compra para o item "${item.description}".`
            );
            return;
          }
          allImeiSerialsInThisPurchase.add(item.serialNumber);
        }
      }
    }

    const newPurchase: Purchase = {
      id: editingPurchase?.id || uuidv4(),
      locatorCode: editingPurchase?.locatorCode || generateLocatorCode(),
      supplierId,
      supplierName: mockSuppliers.find(s => s.id === supplierId)?.name || 'Desconhecido',
      purchaseDate,
      invoiceNumber,
      observations,
      items: purchaseItems,
      subtotal: purchaseItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0),
      additionalCost,
      total: purchaseItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0) + additionalCost,
      status: editingPurchase?.status || 'pending', // New purchases start as pending
      createdAt: editingPurchase?.createdAt || new Date().toISOString(),
      productType,
      selectedBrand,
      selectedCategory,
      selectedModel,
      selectedStorage,
      selectedColor,
      selectedDescription,
      productVariations,
    };

    onPurchaseSaved(newPurchase);
    showSuccess('Compra Salva', `Compra ${newPurchase.locatorCode} salva com sucesso.`);
    onClose();
  };

  const subtotal = purchaseItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
  const total = subtotal + additionalCost;

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" className="text-2xl font-bold leading-6 text-slate-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingBag className="mr-3 text-blue-600" size={28} />
                    {editingPurchase ? `Editar Compra ${editingPurchase.locatorCode}` : 'Nova Compra / Entrada de Produtos'}
                  </div>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-slate-100 px-2 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    <X size={20} />
                  </button>
                </DialogTitle>

                <div className="mt-6 space-y-6">
                  {/* Purchase Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="supplier" className="block text-sm font-medium text-slate-700 mb-1">Fornecedor</label>
                      <select
                        id="supplier"
                        value={supplierId}
                        onChange={(e) => setSupplierId(e.target.value)}
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecione um fornecedor</option>
                        {mockSuppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="purchaseDate" className="block text-sm font-medium text-slate-700 mb-1">Data da Compra</label>
                      <input
                        type="date"
                        id="purchaseDate"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="invoiceNumber" className="block text-sm font-medium text-slate-700 mb-1">Número da Nota Fiscal (Opcional)</label>
                      <input
                        type="text"
                        id="invoiceNumber"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="additionalCost" className="block text-sm font-medium text-slate-700 mb-1">Custo Adicional (Frete, Impostos, etc.)</label>
                      <input
                        type="number"
                        id="additionalCost"
                        value={additionalCost}
                        onChange={(e) => setAdditionalCost(parseFloat(e.target.value) || 0)}
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="observations" className="block text-sm font-medium text-slate-700 mb-1">Observações (Opcional)</label>
                    <textarea
                      id="observations"
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      rows={3}
                      className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>

                  {/* Add New Item Section */}
                  <div className="border-t border-slate-200 pt-6">
                    <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                      <Plus className="mr-2 text-green-600" size={20} /> Adicionar Novo Item
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label htmlFor="newItemDescription" className="block text-sm font-medium text-slate-700 mb-1">Descrição do Produto</label>
                        <input
                          type="text"
                          id="newItemDescription"
                          value={newItemDescription}
                          onChange={(e) => setNewItemDescription(e.target.value)}
                          className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ex: iPhone 16 Pro Max 256GB"
                        />
                      </div>
                      <div>
                        <label htmlFor="newItemQuantity" className="block text-sm font-medium text-slate-700 mb-1">Quantidade</label>
                        <input
                          type="number"
                          id="newItemQuantity"
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="newItemCostPrice" className="block text-sm font-medium text-slate-700 mb-1">Preço de Custo (un.)</label>
                        <input
                          type="number"
                          id="newItemCostPrice"
                          value={newItemCostPrice}
                          onChange={(e) => setNewItemCostPrice(parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="newItemFinalPrice" className="block text-sm font-medium text-slate-700 mb-1">Preço de Venda Sugerido (un.)</label>
                        <input
                          type="number"
                          id="newItemFinalPrice"
                          value={newItemFinalPrice}
                          onChange={(e) => setNewItemFinalPrice(parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="newItemCondition" className="block text-sm font-medium text-slate-700 mb-1">Condição</label>
                        <select
                          id="newItemCondition"
                          value={newItemCondition}
                          onChange={(e) => setNewItemCondition(e.target.value as 'novo' | 'seminovo' | 'usado')}
                          className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="novo">Novo</option>
                          <option value="seminovo">Seminovo</option>
                          <option value="usado">Usado</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="newItemLocation" className="block text-sm font-medium text-slate-700 mb-1">Localização (Opcional)</label>
                        <input
                          type="text"
                          id="newItemLocation"
                          value={newItemLocation}
                          onChange={(e) => setNewItemLocation(e.target.value)}
                          className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ex: Vitrine A1"
                        />
                      </div>
                      <div>
                        <label htmlFor="newItemWarranty" className="block text-sm font-medium text-slate-700 mb-1">Garantia (Opcional)</label>
                        <input
                          type="text"
                          id="newItemWarranty"
                          value={newItemWarranty}
                          onChange={(e) => setNewItemWarranty(e.target.value)}
                          className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ex: 3 meses"
                        />
                      </div>
                      <div className="md:col-span-3 flex items-center mt-2">
                        <input
                          type="checkbox"
                          id="newItemHasImeiSerial"
                          checked={newItemHasImeiSerial}
                          onChange={(e) => setNewItemHasImeiSerial(e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="newItemHasImeiSerial" className="ml-2 block text-sm font-medium text-slate-700">
                          Este item possui IMEI ou Número de Série (identificação única)
                        </label>
                      </div>
                    </div>

                    {newItemHasImeiSerial && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 bg-slate-50 rounded-md border border-slate-200">
                        <div>
                          <label htmlFor="newItemImei1" className="block text-sm font-medium text-slate-700 mb-1">IMEI 1 (Opcional)</label>
                          <input
                            type="text"
                            id="newItemImei1"
                            value={newItemImei1}
                            onChange={(e) => setNewItemImei1(e.target.value)}
                            className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="IMEI 1"
                          />
                        </div>
                        <div>
                          <label htmlFor="newItemImei2" className="block text-sm font-medium text-slate-700 mb-1">IMEI 2 (Opcional)</label>
                          <input
                            type="text"
                            id="newItemImei2"
                            value={newItemImei2}
                            onChange={(e) => setNewItemImei2(e.target.value)}
                            className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="IMEI 2"
                          />
                        </div>
                        <div>
                          <label htmlFor="newItemSerialNumber" className="block text-sm font-medium text-slate-700 mb-1">Número de Série (Opcional)</label>
                          <input
                            type="text"
                            id="newItemSerialNumber"
                            value={newItemSerialNumber}
                            onChange={(e) => setNewItemSerialNumber(e.target.value)}
                            className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Número de Série"
                          />
                        </div>
                        <div>
                          <label htmlFor="newItemBarcode" className="block text-sm font-medium text-slate-700 mb-1">Código de Barras (Opcional)</label>
                          <input
                            type="text"
                            id="newItemBarcode"
                            value={newItemBarcode}
                            onChange={(e) => setNewItemBarcode(e.target.value)}
                            className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Código de Barras"
                          />
                        </div>
                        <p className="md:col-span-4 text-sm text-slate-600 flex items-center">
                          <Info size={16} className="mr-1 text-blue-500" />
                          Preencha pelo menos um dos campos (IMEI 1, IMEI 2 ou Número de Série) se o item for de identificação única.
                        </p>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <Plus className="mr-2" size={18} /> Adicionar Item
                      </button>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="border-t border-slate-200 pt-6">
                    <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                      <List className="mr-2 text-blue-600" size={20} /> Itens da Compra ({purchaseItems.length})
                    </h4>
                    {purchaseItems.length === 0 ? (
                      <p className="text-slate-500">Nenhum item adicionado ainda.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descrição</th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Qtd</th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Custo (un.)</th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Venda (un.)</th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Identificação</th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {purchaseItems.map((item) => (
                              <tr key={item.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-900">{item.description}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{item.quantity}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">R$ {item.costPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">R$ {item.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">
                                  {item.hasImeiSerial ? (
                                    <div className="flex flex-col">
                                      {item.imei1 && <span className="text-xs text-slate-600">IMEI1: {item.imei1}</span>}
                                      {item.imei2 && <span className="text-xs text-slate-600">IMEI2: {item.imei2}</span>}
                                      {item.serialNumber && <span className="text-xs text-slate-600">SN: {item.serialNumber}</span>}
                                      {!item.imei1 && !item.imei2 && !item.serialNumber && <span className="text-xs text-red-500 flex items-center"><AlertTriangle size={12} className="mr-1"/>Faltando ID</span>}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400">N/A</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Remover
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table >
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-slate-200 pt-6 flex justify-end">
                    <div className="w-full max-w-xs space-y-2">
                      <div className="flex justify-between text-sm font-medium text-slate-700">
                        <span>Subtotal:</span>
                        <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-slate-700">
                        <span>Custo Adicional:</span>
                        <span>R$ {additionalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-2">
                        <span>Total da Compra:</span>
                        <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={handleSavePurchase}
                  >
                    <Save className="mr-2" size={18} /> Salvar Compra
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}