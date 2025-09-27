import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { X, Save, Package, Hash, Smartphone, Barcode, MapPin, ShieldCheck, Tag, Palette, HardDrive, AlertTriangle } from 'lucide-react';
import { useNotification } from '@/react-app/components/NotificationSystem'; // Importar useNotification

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
  minStock?: number;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: InventoryUnit | null; // The product unit being edited
  onProductSaved: (product: InventoryUnit) => void;
  checkDuplicateImeiSerial: (
    imei1: string | undefined,
    imei2: string | undefined,
    serialNumber: string | undefined,
    currentUnitId?: string
  ) => { isDuplicate: boolean; type: string; value: string }; // Nova prop
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
  onProductSaved,
  checkDuplicateImeiSerial, // Recebendo a nova prop
}: ProductModalProps) {
  const { showSuccess, showError } = useNotification();

  const [productSku, setProductSku] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [storage, setStorage] = useState('');
  const [condition, setCondition] = useState<'novo' | 'seminovo' | 'usado'>('novo');
  const [location, setLocation] = useState('');
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [barcode, setBarcode] = useState('');
  const [costPrice, setCostPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [status, setStatus] = useState<'available' | 'sold' | 'reserved' | 'defective'>('available');
  const [minStockValue, setMinStockValue] = useState(0);
  const [hasImeiSerial, setHasImeiSerial] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setProductSku(product.productSku);
      setProductDescription(product.productDescription);
      setBrand(product.brand);
      setCategory(product.category);
      setModel(product.model || '');
      setColor(product.color || '');
      setStorage(product.storage || '');
      setCondition(product.condition);
      setLocation(product.location || '');
      setImei1(product.imei1 || '');
      setImei2(product.imei2 || '');
      setSerialNumber(product.serialNumber || '');
      setBarcode(product.barcode || '');
      setCostPrice(product.costPrice);
      setSalePrice(product.salePrice);
      setStatus(product.status);
      setMinStockValue(product.minStock || 0);
      setHasImeiSerial(!!(product.imei1 || product.imei2 || product.serialNumber));
    } else if (!isOpen) {
      // Reset form when closing
      setProductSku('');
      setProductDescription('');
      setBrand('');
      setCategory('');
      setModel('');
      setColor('');
      setStorage('');
      setCondition('novo');
      setLocation('');
      setImei1('');
      setImei2('');
      setSerialNumber('');
      setBarcode('');
      setCostPrice(0);
      setSalePrice(0);
      setStatus('available');
      setMinStockValue(0);
      setHasImeiSerial(false);
    }
  }, [isOpen, product]);

  const handleSave = () => {
    if (!product) return; // Should not happen if modal is open for editing

    // Basic validation
    if (!productSku.trim() || !productDescription.trim() || !brand.trim() || !category.trim() || costPrice <= 0 || salePrice <= 0) {
      showError('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    // Validação de IMEI/Serial para itens com identificação única
    if (hasImeiSerial) {
      const currentImei1 = imei1.trim();
      const currentImei2 = imei2.trim();
      const currentSerial = serialNumber.trim();

      if (!currentImei1 && !currentImei2 && !currentSerial) {
        showError('Erro', 'Para produtos com IMEI/Serial, pelo menos um campo de identificação deve ser preenchido.');
        return;
      }

      // Verificar duplicidade com itens já existentes no estoque, excluindo o próprio produto
      const duplicateCheck = checkDuplicateImeiSerial(currentImei1, currentImei2, currentSerial, product.id);
      if (duplicateCheck.isDuplicate) {
        showError(
          'Erro de Duplicidade',
          `O ${duplicateCheck.type} "${duplicateCheck.value}" já está cadastrado no sistema para outro produto.`
        );
        return; // Impedir salvamento
      }
    }

    const updatedProduct: InventoryUnit = {
      ...product, // Keep existing ID and other immutable properties
      productSku: productSku.trim(),
      productDescription: productDescription.trim(),
      brand: brand.trim(),
      category: category.trim(),
      model: model.trim() || undefined,
      color: color.trim() || undefined,
      storage: storage.trim() || undefined,
      condition,
      location: location.trim() || undefined,
      imei1: hasImeiSerial ? imei1.trim() : undefined,
      imei2: hasImeiSerial ? imei2.trim() : undefined,
      serialNumber: hasImeiSerial ? serialNumber.trim() : undefined,
      barcode: barcode.trim() || undefined,
      costPrice,
      salePrice,
      status,
      minStock: minStockValue,
      updatedAt: new Date().toISOString(),
    };

    onProductSaved(updatedProduct);
    onClose();
  };

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
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" className="text-2xl font-bold leading-6 text-slate-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="mr-3 text-blue-600" size={28} />
                    Editar Produto: {product?.productDescription}
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
                  {/* Product Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="productSku" className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                      <input
                        type="text"
                        id="productSku"
                        value={productSku}
                        onChange={(e) => setProductSku(e.target.value)}
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label htmlFor="productDescription" className="block text-sm font-medium text-slate-700 mb-1">Descrição do Produto</label>
                      <input
                        type="text"
                        id="productDescription"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="brand" className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                      <input
                        type="text"
                        id="brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                      <input
                        type="text"
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="model" className="block text-sm font-medium text-slate-700 mb-1">Modelo (Opcional)</label>
                      <input
                        type="text"
                        id="model"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="color" className="block text-sm font-medium text-slate-700 mb-1">Cor (Opcional)</label>
                      <input
                        type="text"
                        id="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="storage" className="block text-sm font-medium text-slate-700 mb-1">Armazenamento (Opcional)</label>
                      <input
                        type="text"
                        id="storage"
                        value={storage}
                        onChange={(e) => setStorage(e.target.value)}
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="condition" className="block text-sm font-medium text-slate-700 mb-1">Condição</label>
                      <select
                        id="condition"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value as 'novo' | 'seminovo' | 'usado')}
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="novo">Novo</option>
                        <option value="seminovo">Seminovo</option>
                        <option value="usado">Usado</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Localização (Opcional)</label>
                      <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Vitrine A1"
                      />
                    </div>
                    <div>
                      <label htmlFor="minStockValue" className="block text-sm font-medium text-slate-700 mb-1">Estoque Mínimo</label>
                      <input
                        type="number"
                        id="minStockValue"
                        value={minStockValue}
                        onChange={(e) => setMinStockValue(parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="costPrice" className="block text-sm font-medium text-slate-700 mb-1">Preço de Custo</label>
                      <input
                        type="number"
                        id="costPrice"
                        value={costPrice}
                        onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="salePrice" className="block text-sm font-medium text-slate-700 mb-1">Preço de Venda</label>
                      <input
                        type="number"
                        id="salePrice"
                        value={salePrice}
                        onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'available' | 'sold' | 'reserved' | 'defective')}
                        className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="available">Disponível</option>
                        <option value="sold">Vendido</option>
                        <option value="reserved">Reservado</option>
                        <option value="defective">Defeituoso</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="hasImeiSerial"
                        checked={hasImeiSerial}
                        onChange={(e) => setHasImeiSerial(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="hasImeiSerial" className="ml-2 block text-sm font-medium text-slate-700">
                        Este item possui IMEI ou Número de Série (identificação única)
                      </label>
                    </div>
                  </div>

                  {hasImeiSerial && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-slate-50 rounded-md border border-slate-200">
                      <div>
                        <label htmlFor="imei1" className="block text-sm font-medium text-slate-700 mb-1">IMEI 1 (Opcional)</label>
                        <input
                          type="text"
                          id="imei1"
                          value={imei1}
                          onChange={(e) => setImei1(e.target.value)}
                          className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="IMEI 1"
                        />
                      </div>
                      <div>
                        <label htmlFor="imei2" className="block text-sm font-medium text-slate-700 mb-1">IMEI 2 (Opcional)</label>
                        <input
                          type="text"
                          id="imei2"
                          value={imei2}
                          onChange={(e) => setImei2(e.target.value)}
                          className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="IMEI 2"
                        />
                      </div>
                      <div>
                        <label htmlFor="serialNumber" className="block text-sm font-medium text-slate-700 mb-1">Número de Série (Opcional)</label>
                        <input
                          type="text"
                          id="serialNumber"
                          value={serialNumber}
                          onChange={(e) => setSerialNumber(e.target.value)}
                          className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Número de Série"
                        />
                      </div>
                      <div>
                        <label htmlFor="barcode" className="block text-sm font-medium text-slate-700 mb-1">Código de Barras (Opcional)</label>
                        <input
                          type="text"
                          id="barcode"
                          value={barcode}
                          onChange={(e) => setBarcode(e.target.value)}
                          className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Código de Barras"
                        />
                      </div>
                      <p className="md:col-span-2 text-sm text-slate-600 flex items-center">
                        <Info size={16} className="mr-1 text-blue-500" />
                        Preencha pelo menos um dos campos (IMEI 1, IMEI 2 ou Número de Série) se o item for de identificação única.
                      </p>
                    </div>
                  )}
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
                    onClick={handleSave}
                  >
                    <Save className="mr-2" size={18} /> Salvar Alterações
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