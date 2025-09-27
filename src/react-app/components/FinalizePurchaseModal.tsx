import { useState, useEffect } from 'react';
import { X, CheckCircle, Package } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyBR, formatCurrencyBR } from '@/react-app/utils/currency';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useNotification } from '@/react-app/components/NotificationSystem';

interface PurchaseItem {
  id: string; // purchase_item_id
  product_id: string;
  description: string;
  quantity: number;
  cost_price: number; // Renamed from costPrice to match DB
  final_price: number; // Renamed from finalPrice to match DB
  has_imei_serial: boolean; // Renamed from hasImeiSerial to match DB
}

interface ItemUnit {
  unitId: string; // Client-side unique ID
  imei1?: string;
  imei2?: string;
  serialNumber?: string;
  batteryHealth?: number; // Not directly stored in DB, but can be in metadata
  condition_id: string; // Changed to condition_id
  warranty_term_id: string; // Changed to warranty_term_id
  location_id: string; // Changed to location_id
  markup: number | null;
  salePrice?: number;
  displaySalePrice: string;
}

interface Purchase {
  id: string;
  locator_code: string;
  items: PurchaseItem[];
  user_id: string;
}

interface FinalizePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
  onFinalized?: (finalizedItems: any[]) => void;
}

interface StockCondition {
  id: string;
  name: string;
}

interface StockLocation {
  id: string;
  name: string;
}

interface WarrantyTerm {
  id: string;
  name: string;
  months: number;
}

export default function FinalizePurchaseModal({ 
  isOpen, 
  onClose, 
  purchase, 
  onFinalized 
}: FinalizePurchaseModalProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [itemUnits, setItemUnits] = useState<{[key: string]: ItemUnit[]}>({});
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [stockConditions, setStockConditions] = useState<StockCondition[]>([]);
  const [stockLocations, setStockLocations] = useState<StockLocation[]>([]);
  const [warrantyTerms, setWarrantyTerms] = useState<WarrantyTerm[]>([]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300);
  };

  // Fetch admin data (conditions, locations, warranties)
  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchAdminData = async () => {
      const { data: conditionsData, error: conditionsError } = await supabase
        .from('stock_conditions')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (conditionsError) console.error('Error fetching stock conditions:', conditionsError);
      else setStockConditions(conditionsData || []);

      const { data: locationsData, error: locationsError } = await supabase
        .from('stock_locations')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (locationsError) console.error('Error fetching stock locations:', locationsError);
      else setStockLocations(locationsData || []);

      const { data: warrantyData, error: warrantyError } = await supabase
        .from('warranty_terms')
        .select('id, name, months')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (warrantyError) console.error('Error fetching warranty terms:', warrantyError);
      else setWarrantyTerms(warrantyData || []);
    };

    fetchAdminData();
  }, [isOpen, user]);

  useEffect(() => {
    if (purchase && purchase.items && stockConditions.length > 0 && stockLocations.length > 0 && warrantyTerms.length > 0) {
      const unitsMap: {[key: string]: ItemUnit[]} = {};
      
      purchase.items.forEach((item: PurchaseItem) => {
        if (item.has_imei_serial) { // Only process items requiring IMEI/Serial
          const units: ItemUnit[] = [];
          for (let i = 0; i < item.quantity; i++) {
            units.push({
              unitId: `${item.id}-${i}`,
              imei1: '',
              imei2: '',
              serialNumber: '',
              batteryHealth: 100, // Default, not saved to DB directly
              condition_id: stockConditions[0]?.id || '',
              warranty_term_id: warrantyTerms[0]?.id || '',
              location_id: stockLocations[0]?.id || '',
              markup: null,
              salePrice: undefined,
              displaySalePrice: formatCurrencyBR(item.final_price) // Pre-fill with item's final_price
            });
          }
          unitsMap[item.id] = units;
        }
      });
      
      setItemUnits(unitsMap);
    }
  }, [purchase, stockConditions, stockLocations, warrantyTerms]);

  const updateItemUnit = (itemId: string, unitIndex: number, field: keyof ItemUnit, value: any) => {
    setItemUnits(prev => {
      const newUnits = { ...prev };
      if (!newUnits[itemId]) return prev;
      
      newUnits[itemId] = [...newUnits[itemId]];
      const updatedUnit = { ...newUnits[itemId][unitIndex], [field]: value };

      if (field === 'displaySalePrice') {
        updatedUnit.salePrice = parseCurrencyBR(value);
      }
      
      if (field === 'markup') {
        const markup = value === null ? null : (parseFloat(value) || 0);
        updatedUnit.markup = markup;
      }
      
      newUnits[itemId][unitIndex] = updatedUnit;
      return newUnits;
    });
  };

  const handleFinalize = async () => {
    if (!purchase || !user) {
      showError('Erro', 'Dados da compra ou usuário não disponíveis.');
      return;
    }

    const allUnits = Object.values(itemUnits).flat();
    const hasErrors = allUnits.some(unit => unit.salePrice === undefined || unit.salePrice <= 0 || !unit.condition_id || !unit.location_id || !unit.warranty_term_id);

    if (hasErrors) {
      showError('Campos obrigatórios', 'Preço de venda, condição, localização e garantia são obrigatórios para todas as unidades.');
      return;
    }

    const imeiSerialList: string[] = [];
    for (const units of Object.values(itemUnits)) {
      for (const unit of units) {
        if (unit.imei1 && imeiSerialList.includes(unit.imei1)) {
          showError('IMEI 1 duplicado', `IMEI 1 duplicado encontrado: ${unit.imei1}`);
          return;
        }
        if (unit.imei1) imeiSerialList.push(unit.imei1);
        
        if (unit.imei2 && imeiSerialList.includes(unit.imei2)) {
          showError('IMEI 2 duplicado', `IMEI 2 duplicado encontrado: ${unit.imei2}`);
          return;
        }
        if (unit.imei2) imeiSerialList.push(unit.imei2);
        
        if (unit.serialNumber && imeiSerialList.includes(unit.serialNumber)) {
          showError('Número de série duplicado', `Número de série duplicado encontrado: ${unit.serialNumber}`);
          return;
        }
        if (unit.serialNumber) imeiSerialList.push(unit.serialNumber);
      }
    }

    const inventoryUnitsToInsert = [];
    for (const purchaseItemId in itemUnits) {
      const originalPurchaseItem = purchase.items.find(item => item.id === purchaseItemId);
      if (!originalPurchaseItem) continue;

      for (const unit of itemUnits[purchaseItemId]) {
        inventoryUnitsToInsert.push({
          user_id: user.id,
          product_id: originalPurchaseItem.product_id,
          imei1: unit.imei1 || null,
          imei2: unit.imei2 || null,
          serial_number: unit.serialNumber || null,
          condition_id: unit.condition_id,
          location_id: unit.location_id,
          warranty_term_id: unit.warranty_term_id,
          cost_price: originalPurchaseItem.cost_price,
          sale_price: unit.salePrice,
          status: 'available',
          purchase_id: purchase.id,
          locator_code: purchase.locator_code,
        });
      }
    }

    const { error: insertUnitsError } = await supabase
      .from('inventory_units')
      .insert(inventoryUnitsToInsert);

    if (insertUnitsError) {
      showError('Erro ao criar unidades de estoque', insertUnitsError.message);
      console.error('Error inserting inventory units:', insertUnitsError);
      return;
    }

    // Update purchase status to 'completed'
    const { error: updatePurchaseError } = await supabase
      .from('purchases')
      .update({ status: 'completed' })
      .eq('id', purchase.id);

    if (updatePurchaseError) {
      showError('Erro ao atualizar status da compra', updatePurchaseError.message);
      console.error('Error updating purchase status:', updatePurchaseError);
      return;
    }

    if (onFinalized) {
      onFinalized(inventoryUnitsToInsert);
    }
    
    handleClose();
  };

  if (!isOpen || !purchase && !isAnimatingOut) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden ${isAnimatingOut ? 'animate-modal-out' : 'animate-modal-in'}`}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center rounded-t-lg">
          <div className="text-center flex-1">
            <h2 className="text-lg font-semibold flex items-center justify-center">
              <Package className="mr-2" size={20} />
              Lançar o estoque da compra #{purchase?.locator_code}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="hover:bg-white/20 p-1 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Instructions */}
          <div className="text-center mb-4">
            <p className="text-slate-600 text-sm">
              Complete os campos dos itens abaixo para que sejam lançados no Estoque com as informações corretas.
            </p>
            <p className="text-slate-600 text-sm">
              Ignorar os campos podem ocasionar falhas como por exemplo na Garantia, se não for preenchida, ao vender o item, não será calculado a data de expiração da garantia do item.
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-left min-w-[120px]">Descrição</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-12">Qtd</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center min-w-[140px]">IMEI1</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center min-w-[140px]">IMEI2</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center min-w-[120px]">Serial Number</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-20">Condição *</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-16">Saúde</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-20">Garantia *</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-24">Local de Estoque *</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-20">Preço de Custo</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-16">Markup</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-24">Preço sugerido com Markup</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-20 bg-red-50">Preço de Venda *</th>
                </tr>
              </thead>
              <tbody>
                {purchase?.items.map((item: PurchaseItem) => 
                  item.has_imei_serial && itemUnits[item.id]?.map((unit, unitIndex) => (
                    <tr key={unit.unitId} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-2 py-2">
                        <div className="text-xs font-medium text-slate-800">{item.description}</div>
                      </td>
                      <td className="border border-slate-300 px-2 py-2 text-center">
                        <div className="text-xs">{unitIndex + 1}</div>
                      </td>
                      <td className="border border-slate-300 px-1 py-2">
                        <input
                          type="text"
                          value={unit.imei1 || ''}
                          onChange={(e) => updateItemUnit(item.id, unitIndex, 'imei1', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono"
                          placeholder=""
                        />
                      </td>
                      <td className="border border-slate-300 px-1 py-2">
                        <input
                          type="text"
                          value={unit.imei2 || ''}
                          onChange={(e) => updateItemUnit(item.id, unitIndex, 'imei2', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono"
                          placeholder=""
                        />
                      </td>
                      <td className="border border-slate-300 px-1 py-2">
                        <input
                          type="text"
                          value={unit.serialNumber || ''}
                          onChange={(e) => updateItemUnit(item.id, unitIndex, 'serialNumber', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-mono"
                          placeholder=""
                        />
                      </td>
                      <td className="border border-slate-300 px-1 py-2">
                        <select
                          value={unit.condition_id}
                          onChange={(e) => updateItemUnit(item.id, unitIndex, 'condition_id', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        >
                          <option value="">Selecione</option>
                          {stockConditions.map(condition => (
                            <option key={condition.id} value={condition.id}>{condition.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-slate-300 px-1 py-2">
                        <input
                          type="text"
                          value={unit.batteryHealth ? `${unit.batteryHealth}%` : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace('%', '');
                            updateItemUnit(item.id, unitIndex, 'batteryHealth', parseInt(value) || 0);
                          }}
                          className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-center"
                          placeholder="0%"
                        />
                      </td>
                      <td className="border border-slate-300 px-1 py-2">
                        <select
                          value={unit.warranty_term_id}
                          onChange={(e) => updateItemUnit(item.id, unitIndex, 'warranty_term_id', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        >
                          <option value="">Selecione</option>
                          {warrantyTerms.map(term => (
                            <option key={term.id} value={term.id}>{term.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-slate-300 px-1 py-2">
                        <select
                          value={unit.location_id}
                          onChange={(e) => updateItemUnit(item.id, unitIndex, 'location_id', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        >
                          <option value="">Selecione</option>
                          {stockLocations.map(location => (
                            <option key={location.id} value={location.id}>{location.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-slate-300 px-1 py-2">
                        <div className="text-xs text-slate-700 bg-slate-100 px-1 py-1 rounded text-center">
                          R$ {formatCurrencyBR(item.cost_price)}
                        </div>
                      </td>
                      <td className="border border-slate-300 px-1 py-2">
                        <input
                          type="text"
                          value={unit.markup === null ? '' : unit.markup.toString()}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d,]/g, '');
                            updateItemUnit(item.id, unitIndex, 'markup', value === '' ? null : parseFloat(value.replace(',', '.')));
                          }}
                          className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-center"
                          placeholder="%"
                        />
                      </td>
                      <td className="border border-slate-300 px-1 py-2">
                        <div className="text-xs text-green-600 bg-green-50 px-1 py-1 rounded text-center">
                          {unit.markup === null ? '-' : `R$ ${formatCurrencyBR(item.cost_price + (item.cost_price * (unit.markup || 0) / 100))}`}
                        </div>
                      </td>
                      <td className="border border-slate-300 px-1 py-2 bg-red-50">
                        <input
                          type="text"
                          value={unit.displaySalePrice}
                          onChange={(e) => {
                            const formattedValue = formatCurrencyInput(e.target.value);
                            updateItemUnit(item.id, unitIndex, 'displaySalePrice', formattedValue);
                          }}
                          className="w-full px-1 py-1 text-xs border border-red-300 rounded focus:ring-1 focus:ring-red-400 focus:border-red-400 bg-white"
                          placeholder="R$"
                          required
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-4 text-right">
            <span className="text-sm text-slate-600">
              Total de itens a finalizar: {Object.values(itemUnits).reduce((acc, units) => acc + units.length, 0)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 mt-6">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleFinalize}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center font-medium"
            >
              <CheckCircle className="mr-2" size={16} />
              SIM, LANÇAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}