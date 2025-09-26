import { useState, useEffect } from 'react';
import { X, CheckCircle, Package } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyBR, formatCurrencyBR } from '@/react-app/utils/currency';

interface PurchaseItem {
  id: string;
  description: string;
  quantity: number;
  costPrice: number;
  finalPrice: number;
}

interface ItemUnit {
  unitId: string;
  imei1?: string;
  imei2?: string;
  serialNumber?: string;
  batteryHealth?: number;
  condition: string;
  warranty: string;
  location: string;
  markup: number | null; // Pode ser null se não preenchido
  salePrice?: number; // Pode ser undefined para começar vazio
}

interface FinalizePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: any;
  onFinalized?: (finalizedItems: any[]) => void;
}

export default function FinalizePurchaseModal({ 
  isOpen, 
  onClose, 
  purchase, 
  onFinalized 
}: FinalizePurchaseModalProps) {
  const [itemUnits, setItemUnits] = useState<{[key: string]: ItemUnit[]}>({});

  useEffect(() => {
    if (purchase && purchase.items) {
      const unitsMap: {[key: string]: ItemUnit[]} = {};
      
      purchase.items.forEach((item: PurchaseItem) => {
        const units: ItemUnit[] = [];
        for (let i = 0; i < item.quantity; i++) {
          units.push({
            unitId: `${item.id}-${i}`,
            imei1: '',
            imei2: '',
            serialNumber: '',
            batteryHealth: 100,
            condition: 'Seminovo',
            warranty: '1 ano',
            location: 'Loja',
            markup: null, // Inicializa como null
            salePrice: undefined // Inicializa como undefined para começar vazio
          });
        }
        unitsMap[item.id] = units;
      });
      
      setItemUnits(unitsMap);
    }
  }, [purchase]);

  const updateItemUnit = (itemId: string, unitIndex: number, field: keyof ItemUnit, value: any) => {
    setItemUnits(prev => {
      const newUnits = { ...prev };
      if (!newUnits[itemId]) return prev;
      
      newUnits[itemId] = [...newUnits[itemId]];
      newUnits[itemId][unitIndex] = { ...newUnits[itemId][unitIndex], [field]: value };
      
      // Quando o markup muda, APENAS o markup é atualizado no estado.
      // O salePrice não é alterado por aqui.
      if (field === 'markup') {
        const markup = value === null ? null : (parseFloat(value) || 0);
        newUnits[itemId][unitIndex].markup = markup;
      }
      
      return newUnits;
    });
  };

  const handleFinalize = () => {
    // Validate required fields - salePrice is mandatory
    const allUnits = Object.values(itemUnits).flat();
    const hasErrors = allUnits.some(unit => unit.salePrice === undefined || unit.salePrice <= 0);

    if (hasErrors) {
      alert('Preço de venda é obrigatório para todas as unidades');
      return;
    }

    // Check for duplicate IMEI/Serial numbers
    const imeiSerialList: string[] = [];
    for (const units of Object.values(itemUnits)) {
      for (const unit of units) {
        if (unit.imei1 && imeiSerialList.includes(unit.imei1)) {
          alert(`IMEI 1 duplicado encontrado: ${unit.imei1}`);
          return;
        }
        if (unit.imei1) imeiSerialList.push(unit.imei1);
        
        if (unit.imei2 && imeiSerialList.includes(unit.imei2)) {
          alert(`IMEI 2 duplicado encontrado: ${unit.imei2}`);
          return;
        }
        if (unit.imei2) imeiSerialList.push(unit.imei2);
        
        if (unit.serialNumber && imeiSerialList.includes(unit.serialNumber)) {
          alert(`Número de série duplicado encontrado: ${unit.serialNumber}`);
          return;
        }
        if (unit.serialNumber) imeiSerialList.push(unit.serialNumber);
      }
    }

    if (onFinalized) {
      onFinalized({ itemUnits, purchase });
    }
    
    onClose();
  };

  if (!isOpen || !purchase) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center rounded-t-lg">
          <div className="text-center flex-1">
            <h2 className="text-lg font-semibold flex items-center justify-center">
              <Package className="mr-2" size={20} />
              Lançar o estoque da compra #{purchase.locatorCode}
            </h2>
          </div>
          <button
            onClick={onClose}
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
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-20">Condição</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-16">Saúde</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-20">Garantia</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-24">Local de Estoque</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-20">Preço de Custo</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-16">Markup</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-24">Preço sugerido com Markup</th>
                  <th className="border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 text-center w-20 bg-red-50">Preço de Venda</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((item: PurchaseItem) => 
                  itemUnits[item.id]?.map((unit, unitIndex) => (
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
                          value={unit.condition}
                          onChange={(e) => updateItemUnit(item.id, unitIndex, 'condition', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        >
                          <option value="Seminovo">Seminovo</option>
                          <option value="Novo">Novo</option>
                          <option value="Usado">Usado</option>
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
                          value={unit.warranty}
                          onChange={(e) => updateItemUnit(item.id, unitIndex, 'warranty', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        >
                          <option value="1 ano">1 ano</option>
                          <option value="6 meses">6 meses</option>
                          <option value="3 meses">3 meses</option>
                        </select>
                      </td>
                      <td className="border border-slate-300 px-1 py-2">
                        <select
                          value={unit.location}
                          onChange={(e) => updateItemUnit(item.id, unitIndex, 'location', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        >
                          <option value="Loja">Loja</option>
                          <option value="Vitrine iS">Vitrine iS</option>
                          <option value="Estoque A1-B2">Estoque A1-B2</option>
                          <option value="Estoque B1-A3">Estoque B1-A3</option>
                        </select>
                      </td>
                      <td className="border border-slate-300 px-1 py-2">
                        <div className="text-xs text-slate-700 bg-slate-100 px-1 py-1 rounded text-center">
                          R$ {formatCurrencyBR(item.costPrice)}
                        </div>
                      </td>
                      <td className="border border-slate-300 px-1 py-2">
                        <input
                          type="text"
                          value={unit.markup === null ? '' : unit.markup.toString()} // Exibe vazio se null
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
                          {unit.markup === null ? '-' : `R$ ${formatCurrencyBR(item.costPrice + (item.costPrice * (unit.markup || 0) / 100))}`}
                        </div>
                      </td>
                      <td className="border border-slate-300 px-1 py-2 bg-red-50">
                        <input
                          type="text"
                          value={unit.salePrice !== undefined ? formatCurrencyInput(unit.salePrice.toString()) : ''}
                          onChange={(e) => {
                            const formattedValue = formatCurrencyInput(e.target.value);
                            const numericValue = parseCurrencyBR(formattedValue);
                            updateItemUnit(item.id, unitIndex, 'salePrice', numericValue);
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
              Total de itens: {Object.values(itemUnits).reduce((acc, units) => acc + units.length, 0)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 mt-6">
            <button
              onClick={onClose}
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