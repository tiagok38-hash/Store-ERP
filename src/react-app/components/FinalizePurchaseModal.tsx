import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { X, CheckCircle, Package, Hash, Smartphone, Barcode, MapPin, ShieldCheck, DollarSign, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useNotification } from '@/react-app/components/NotificationSystem'; // Importar useNotification

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
}

interface FinalizePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
  onFinalized: (finalizedItems: any[]) => void;
  checkDuplicateImeiSerial: (
    imei1: string | undefined,
    imei2: string | undefined,
    serialNumber: string | undefined,
    currentUnitId?: string
  ) => { isDuplicate: boolean; type: string; value: string }; // Nova prop
}

export default function FinalizePurchaseModal({
  isOpen,
  onClose,
  purchase,
  onFinalized,
  checkDuplicateImeiSerial, // Recebendo a nova prop
}: FinalizePurchaseModalProps) {
  const { showSuccess, showError } = useNotification();

  const [finalizedItems, setFinalizedItems] = useState<PurchaseItem[]>([]);
  const [isItemDetailsModalOpen, setIsItemDetailsModalOpen] = useState(false);
  const [currentPurchaseItem, setCurrentPurchaseItem] = useState<PurchaseItem | null>(null);

  // States for item details form
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [barcode, setBarcode] = useState('');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState<'novo' | 'seminovo' | 'usado'>('novo');
  const [warranty, setWarranty] = useState('3 meses');
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    if (isOpen && purchase) {
      // Initialize finalizedItems with existing items from the purchase
      // For items with quantity > 1 and hasImeiSerial, we need to create multiple entries
      const initialFinalized: PurchaseItem[] = [];
      purchase.items.forEach(item => {
        if (item.hasImeiSerial && item.quantity > 1) {
          // Create multiple placeholder entries for unique identification
          for (let i = 0; i < item.quantity; i++) {
            initialFinalized.push({
              ...item,
              id: uuidv4(), // Assign a new unique ID for each unit
              quantity: 1, // Each entry represents one unit
              imei1: undefined, // Clear for new input
              imei2: undefined,
              serialNumber: undefined,
              barcode: undefined,
            });
          }
        } else {
          initialFinalized.push(item);
        }
      });
      setFinalizedItems(initialFinalized);
    } else if (!isOpen) {
      // Reset states when modal closes
      setFinalizedItems([]);
      setIsItemDetailsModalOpen(false);
      setCurrentPurchaseItem(null);
      resetItemDetailsForm();
    }
  }, [isOpen, purchase]);

  const resetItemDetailsForm = () => {
    setImei1('');
    setImei2('');
    setSerialNumber('');
    setBarcode('');
    setLocation('');
    setCondition('novo');
    setWarranty('3 meses');
    setFinalPrice(0);
  };

  const handleEditItemDetails = (item: PurchaseItem) => {
    setCurrentPurchaseItem(item);
    setImei1(item.imei1 || '');
    setImei2(item.imei2 || '');
    setSerialNumber(item.serialNumber || '');
    setBarcode(item.barcode || '');
    setLocation(item.location || '');
    setCondition(item.condition || 'novo');
    setWarranty(item.warranty || '3 meses');
    setFinalPrice(item.finalPrice || item.costPrice * 1.3);
    setIsItemDetailsModalOpen(true);
  };

  const handleSaveItemDetails = () => {
    if (!currentPurchaseItem) return;

    // Validação de campos obrigatórios para itens com IMEI/Serial
    if (currentPurchaseItem.hasImeiSerial) {
      if (!imei1.trim() && !imei2.trim() && !serialNumber.trim()) {
        showError('Erro', 'Para produtos com IMEI/Serial, pelo menos um campo de identificação deve ser preenchido.');
        return;
      }

      // Verificar duplicidade com itens já existentes no estoque
      const duplicateCheck = checkDuplicateImeiSerial(imei1.trim(), imei2.trim(), serialNumber.trim());
      if (duplicateCheck.isDuplicate) {
        showError(
          'Erro de Duplicidade',
          `O ${duplicateCheck.type} "${duplicateCheck.value}" já está cadastrado no sistema.`
        );
        return; // Impedir salvamento dos detalhes do item
      }

      // Verificar duplicidade com outros itens já finalizados nesta mesma compra
      for (const existingFinalizedItem of finalizedItems) {
        if (existingFinalizedItem.id !== currentPurchaseItem.id && existingFinalizedItem.hasImeiSerial) {
          if (imei1.trim() && existingFinalizedItem.imei1 === imei1.trim()) {
            showError('Erro de Duplicidade Interna', `O IMEI 1 "${imei1.trim()}" já foi atribuído a outro item nesta compra.`);
            return;
          }
          if (imei2.trim() && existingFinalizedItem.imei2 === imei2.trim()) {
            showError('Erro de Duplicidade Interna', `O IMEI 2 "${imei2.trim()}" já foi atribuído a outro item nesta compra.`);
            return;
          }
          if (serialNumber.trim() && existingFinalizedItem.serialNumber === serialNumber.trim()) {
            showError('Erro de Duplicidade Interna', `O Número de Série "${serialNumber.trim()}" já foi atribuído a outro item nesta compra.`);
            return;
          }
        }
      }
    }

    const updatedItem = {
      ...currentPurchaseItem,
      imei1: currentPurchaseItem.hasImeiSerial ? imei1.trim() : undefined,
      imei2: currentPurchaseItem.hasImeiSerial ? imei2.trim() : undefined,
      serialNumber: currentPurchaseItem.hasImeiSerial ? serialNumber.trim() : undefined,
      barcode: barcode.trim() || undefined,
      location,
      condition,
      warranty,
      finalPrice,
    };

    setFinalizedItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === updatedItem.id);
      if (existingIndex > -1) {
        return prev.map((item, index) => index === existingIndex ? updatedItem : item);
      }
      return [...prev, updatedItem];
    });

    showSuccess('Item Atualizado', `Detalhes do item "${currentPurchaseItem.description}" salvos.`);
    setIsItemDetailsModalOpen(false);
    setCurrentPurchaseItem(null);
    resetItemDetailsForm();
  };

  const handleFinalize = () => {
    if (!purchase) return;

    // Contar itens que precisam de identificação única
    const itemsNeedingIdentification = finalizedItems.filter(item => item.hasImeiSerial);
    const identifiedItemsCount = itemsNeedingIdentification.filter(item => item.imei1 || item.imei2 || item.serialNumber).length;

    if (identifiedItemsCount < itemsNeedingIdentification.length) {
      showError('Erro', 'Nem todos os itens que exigem IMEI/Serial foram identificados. Por favor, preencha os detalhes de todos os itens.');
      return;
    }

    // Verificação final de duplicidade para IMEI/Serial dentro da lista de itens finalizados
    const allImeiSerialsInThisPurchase = new Set<string>();
    for (const item of finalizedItems) {
      if (item.hasImeiSerial) {
        if (item.imei1) {
          if (allImeiSerialsInThisPurchase.has(item.imei1)) {
            showError(
              'Erro de Duplicidade',
              `O IMEI 1 "${item.imei1}" está duplicado dentro desta mesma compra. Por favor, corrija.`
            );
            return;
          }
          allImeiSerialsInThisPurchase.add(item.imei1);
        }
        if (item.imei2) {
          if (allImeiSerialsInThisPurchase.has(item.imei2)) {
            showError(
              'Erro de Duplicidade',
              `O IMEI 2 "${item.imei2}" está duplicado dentro desta mesma compra. Por favor, corrija.`
            );
            return;
          }
          allImeiSerialsInThisPurchase.add(item.imei2);
        }
        if (item.serialNumber) {
          if (allImeiSerialsInThisPurchase.has(item.serialNumber)) {
            showError(
              'Erro de Duplicidade',
              `O Número de Série "${item.serialNumber}" está duplicado dentro desta mesma compra. Por favor, corrija.`
            );
            return;
          }
          allImeiSerialsInThisPurchase.add(item.serialNumber);
        }
      }
    }

    onFinalized(finalizedItems);
    onClose();
  };

  const getStatusBadge = (item: PurchaseItem) => {
    if (item.hasImeiSerial && (!item.imei1 && !item.imei2 && !item.serialNumber)) {
      return { label: 'Pendente ID', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: 'Completo', color: 'bg-green-100 text-green-800' };
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
              <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" className="text-2xl font-bold leading-6 text-slate-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="mr-3 text-blue-600" size={28} />
                    Finalizar Entrada de Compra: {purchase?.locatorCode}
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
                  <p className="text-slate-600">
                    Preencha os detalhes de cada item para finalizar a entrada no estoque.
                    Itens com "Identificação Única" (IMEI/Serial) precisam ter seus dados preenchidos individualmente.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Produto</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Identificação</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {finalizedItems.map((item) => {
                          const statusBadge = getStatusBadge(item);
                          return (
                            <tr key={item.id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-900">
                                {item.description} ({item.quantity} un.)
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">
                                {item.hasImeiSerial ? (
                                  <div className="flex flex-col">
                                    {item.imei1 && <span className="text-xs text-slate-600">IMEI1: {item.imei1}</span>}
                                    {item.imei2 && <span className="text-xs text-slate-600">IMEI2: {item.imei2}</span>}
                                    {item.serialNumber && <span className="text-xs text-slate-600">SN: {item.serialNumber}</span>}
                                    {!item.imei1 && !item.imei2 && !item.serialNumber && <span className="text-xs text-red-500 flex items-center"><AlertTriangle size={12} className="mr-1"/>Faltando ID</span>}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400">N/A (Não requer ID única)</span>
                                )}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                  {statusBadge.label}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                {item.hasImeiSerial && (
                                  <button
                                    onClick={() => handleEditItemDetails(item)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Preencher Detalhes
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
                    className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                    onClick={handleFinalize}
                  >
                    <CheckCircle className="mr-2" size={18} /> Finalizar Entrada
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>

        {/* Item Details Modal */}
        <Transition appear show={isItemDetailsModalOpen} as="div">
          <Dialog as="div" className="relative z-50" onClose={() => setIsItemDetailsModalOpen(false)}>
            <TransitionChild
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                  <DialogPanel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <DialogTitle as="h3" className="text-lg font-bold leading-6 text-slate-900 flex items-center justify-between">
                      <div className="flex items-center">
                        <Package className="mr-2 text-blue-600" size={24} />
                        Detalhes do Item: {currentPurchaseItem?.description}
                      </div>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-slate-100 px-2 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={() => setIsItemDetailsModalOpen(false)}
                      >
                        <X size={18} />
                      </button>
                    </DialogTitle>

                    <div className="mt-4 space-y-4">
                      {currentPurchaseItem?.hasImeiSerial && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            Preencha pelo menos um dos campos (IMEI 1, IMEI 2 ou Número de Série).
                          </p>
                        </div>
                      )}

                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Localização</label>
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
                        <label htmlFor="warranty" className="block text-sm font-medium text-slate-700 mb-1">Garantia</label>
                        <input
                          type="text"
                          id="warranty"
                          value={warranty}
                          onChange={(e) => setWarranty(e.target.value)}
                          className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ex: 3 meses"
                        />
                      </div>
                      <div>
                        <label htmlFor="finalPrice" className="block text-sm font-medium text-slate-700 mb-1">Preço de Venda</label>
                        <input
                          type="number"
                          id="finalPrice"
                          value={finalPrice}
                          onChange={(e) => setFinalPrice(parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={() => setIsItemDetailsModalOpen(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={handleSaveItemDetails}
                      >
                        <CheckCircle className="mr-2" size={18} /> Salvar Detalhes
                      </button>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>
      </Dialog>
    </Transition>
  );
}