import { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Save, 
  Search, 
  Package, 
  DollarSign, 
  Percent, 
  ArrowUp, 
  ArrowDown,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';
import { formatCurrencyInput, parseCurrencyBR, formatCurrencyBR } from '@/react-app/utils/currency';
import { useNotification } from '@/react-app/components/NotificationSystem';

interface InventoryUnit {
  id: string;
  productSku: string;
  productDescription: string;
  brand: string;
  category: string;
  condition: 'novo' | 'seminovo' | 'usado';
  costPrice: number;
  salePrice: number;
  // Outras propriedades de InventoryUnit que não são alteradas aqui
  model?: string;
  color?: string;
  storage?: string;
  location?: string;
  imei1?: string;
  imei2?: string;
  serialNumber?: string;
  barcode?: string;
  status: 'available' | 'sold' | 'reserved' | 'defective';
  createdAt: string;
  updatedAt: string;
  purchaseId?: string;
  locatorCode?: string;
  minStock?: number;
}

interface BulkPriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryUnits: InventoryUnit[];
  onUpdateInventoryUnits: (updatedUnits: InventoryUnit[]) => void;
}

type PriceUpdateType = 'increase_percent' | 'decrease_percent' | 'increase_amount' | 'decrease_amount';
type ProductConditionFilter = 'all' | 'novo' | 'seminovo' | 'usado';

export default function BulkPriceUpdateModal({
  isOpen,
  onClose,
  inventoryUnits,
  onUpdateInventoryUnits,
}: BulkPriceUpdateModalProps) {
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState<ProductConditionFilter>('all');

  const [costPriceUpdateType, setCostPriceUpdateType] = useState<PriceUpdateType>('increase_percent');
  const [costPriceUpdateValue, setCostPriceUpdateValue] = useState('');

  const [salePriceUpdateType, setSalePriceUpdateType] = useState<PriceUpdateType>('increase_percent');
  const [salePriceUpdateValue, setSalePriceUpdateValue] = useState('');

  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
      // Reset form states on close
      setSearchTerm('');
      setFilterCondition('all');
      setCostPriceUpdateType('increase_percent');
      setCostPriceUpdateValue('');
      setSalePriceUpdateType('increase_percent');
      setSalePriceUpdateValue('');
    }, 300); // Match animation duration
  };

  if (!isOpen && !isAnimatingOut) return null;

  const filteredProducts = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return inventoryUnits.filter(unit => {
      const matchesSearch = 
        unit.productDescription.toLowerCase().includes(searchLower) ||
        unit.productSku.toLowerCase().includes(searchLower) ||
        unit.brand.toLowerCase().includes(searchLower) ||
        (unit.model && unit.model.toLowerCase().includes(searchLower));
      
      const matchesCondition = filterCondition === 'all' || unit.condition === filterCondition;

      return matchesSearch && matchesCondition;
    });
  }, [inventoryUnits, searchTerm, filterCondition]);

  const calculateNewPrice = (currentPrice: number, updateType: PriceUpdateType, updateValue: string): number => {
    const value = parseCurrencyBR(updateValue);
    if (isNaN(value) || value === 0) return currentPrice;

    let newPrice = currentPrice;

    switch (updateType) {
      case 'increase_percent':
        newPrice = currentPrice * (1 + value / 100);
        break;
      case 'decrease_percent':
        newPrice = currentPrice * (1 - value / 100);
        break;
      case 'increase_amount':
        newPrice = currentPrice + value;
        break;
      case 'decrease_amount':
        newPrice = currentPrice - value;
        break;
    }
    return Math.max(0, newPrice); // Ensure price doesn't go below zero
  };

  const handleApplyChanges = () => {
    if (filteredProducts.length === 0) {
      showError('Nenhum produto selecionado', 'Não há produtos para aplicar as alterações.');
      return;
    }

    const updatedUnits = inventoryUnits.map(unit => {
      if (filteredProducts.some(p => p.id === unit.id)) {
        let newCostPrice = unit.costPrice;
        let newSalePrice = unit.salePrice;

        // Apply cost price changes
        if (costPriceUpdateValue) {
          newCostPrice = calculateNewPrice(unit.costPrice, costPriceUpdateType, costPriceUpdateValue);
        }

        // Apply sale price changes
        if (salePriceUpdateValue) {
          newSalePrice = calculateNewPrice(unit.salePrice, salePriceUpdateType, salePriceUpdateValue);
        }

        return {
          ...unit,
          costPrice: parseFloat(newCostPrice.toFixed(2)),
          salePrice: parseFloat(newSalePrice.toFixed(2)),
          updatedAt: new Date().toISOString(), // Update timestamp
        };
      }
      return unit;
    });

    onUpdateInventoryUnits(updatedUnits);
    showSuccess('Preços Atualizados', `${filteredProducts.length} produtos tiveram seus preços atualizados com sucesso!`);
    handleClose();
  };

  const renderPriceUpdateControls = (
    priceType: 'costPrice' | 'salePrice',
    updateType: PriceUpdateType,
    setUpdateType: (type: PriceUpdateType) => void,
    updateValue: string,
    setUpdateValue: (value: string) => void
  ) => (
    <div className="space-y-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
      <h4 className={`font-semibold text-sm mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
        {priceType === 'costPrice' ? 'Preço de Custo' : 'Preço de Venda'}
      </h4>
      <div className="flex flex-wrap gap-2 mb-3">
        <label className="flex items-center text-xs">
          <input type="radio" name={`${priceType}-type`} value="increase_percent" checked={updateType === 'increase_percent'} onChange={() => setUpdateType('increase_percent')} className="mr-1" />
          <ArrowUp size={12} className="text-green-500 mr-0.5" /> %
        </label>
        <label className="flex items-center text-xs">
          <input type="radio" name={`${priceType}-type`} value="decrease_percent" checked={updateType === 'decrease_percent'} onChange={() => setUpdateType('decrease_percent')} className="mr-1" />
          <ArrowDown size={12} className="text-red-500 mr-0.5" /> %
        </label>
        <label className="flex items-center text-xs">
          <input type="radio" name={`${priceType}-type`} value="increase_amount" checked={updateType === 'increase_amount'} onChange={() => setUpdateType('increase_amount')} className="mr-1" />
          <ArrowUp size={12} className="text-green-500 mr-0.5" /> R$
        </label>
        <label className="flex items-center text-xs">
          <input type="radio" name={`${priceType}-type`} value="decrease_amount" checked={updateType === 'decrease_amount'} onChange={() => setUpdateType('decrease_amount')} className="mr-1" />
          <ArrowDown size={12} className="text-red-500 mr-0.5" /> R$
        </label>
      </div>
      <div className="relative">
        <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          {updateType.includes('percent') ? '%' : 'R$'}
        </span>
        <input
          type="text"
          value={updateValue}
          onChange={(e) => setUpdateValue(formatCurrencyInput(e.target.value))}
          onFocus={(e) => e.target.select()}
          className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}
          placeholder="0,00"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        } ${isAnimatingOut ? 'animate-modal-out' : 'animate-modal-in'}`}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 flex justify-between items-center rounded-t-xl`}>
          <h2 className="text-xl font-bold flex items-center">
            <DollarSign className="mr-2" size={24} />
            Atualização de Preços em Massa
          </h2>
          <button
            onClick={handleClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Condição do Produto
              </label>
              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value as ProductConditionFilter)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="all">Todas as Condições</option>
                <option value="novo">Novo</option>
                <option value="seminovo">Seminovo</option>
                <option value="usado">Usado</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Buscar Produto
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="Nome, SKU, marca..."
                />
              </div>
            </div>
          </div>

          {/* Price Update Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {renderPriceUpdateControls(
              'costPrice',
              costPriceUpdateType,
              setCostPriceUpdateType,
              costPriceUpdateValue,
              setCostPriceUpdateValue
            )}
            {renderPriceUpdateControls(
              'salePrice',
              salePriceUpdateType,
              setSalePriceUpdateType,
              salePriceUpdateValue,
              setSalePriceUpdateValue
            )}
          </div>

          {/* Affected Products Preview */}
          <div className={`rounded-lg p-4 mb-6 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <h3 className={`text-lg font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              <Package className="mr-2 text-purple-600" size={20} />
              Produtos Afetados ({filteredProducts.length})
            </h3>
            {filteredProducts.length === 0 ? (
              <div className={`text-center py-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Nenhum produto corresponde aos filtros.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'border-slate-600' : 'border-slate-200'}`}>
                      <th className={`text-left py-2 px-3 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Produto</th>
                      <th className={`text-right py-2 px-3 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Custo Atual</th>
                      <th className={`text-right py-2 px-3 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Novo Custo</th>
                      <th className={`text-right py-2 px-3 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Venda Atual</th>
                      <th className={`text-right py-2 px-3 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Nova Venda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(unit => (
                      <tr key={unit.id} className={`border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                        <td className="py-2 px-3">
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{unit.productDescription}</div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{unit.productSku}</div>
                        </td>
                        <td className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                          R$ {formatCurrencyBR(unit.costPrice)}
                        </td>
                        <td className={`py-2 px-3 text-right font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                          R$ {formatCurrencyBR(calculateNewPrice(unit.costPrice, costPriceUpdateType, costPriceUpdateValue))}
                        </td>
                        <td className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                          R$ {formatCurrencyBR(unit.salePrice)}
                        </td>
                        <td className={`py-2 px-3 text-right font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                          R$ {formatCurrencyBR(calculateNewPrice(unit.salePrice, salePriceUpdateType, salePriceUpdateValue))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApplyChanges}
              disabled={filteredProducts.length === 0 || (!costPriceUpdateValue && !salePriceUpdateValue)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <CheckCircle className="mr-2" size={16} />
              Aplicar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}