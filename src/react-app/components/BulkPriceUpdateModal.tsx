import { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Save, 
  Search, 
  Package, 
  DollarSign, 
  Lightbulb, // Usar Lightbulb para a dica de busca
  Youtube, // Usar Youtube para o tutorial
  CheckCircle
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
  availableStock?: number; // Adicionado para exibição no modal
}

interface BulkPriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryUnits: InventoryUnit[];
  onUpdateInventoryUnits: (updatedUnits: InventoryUnit[]) => void;
}

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
  
  const [newCostPriceInput, setNewCostPriceInput] = useState('');
  const [newSalePriceInput, setNewSalePriceInput] = useState('');

  // CORREÇÃO: Adicionando de volta a declaração de displayedProducts
  const [displayedProducts, setDisplayedProducts] = useState<InventoryUnit[]>([]);

  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Memoiza a lista de produtos filtrados para a busca (não para exibição imediata)
  const filteredProductsForSearch = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return inventoryUnits.filter(unit => {
      const matchesSearch = 
        unit.productDescription.toLowerCase().includes(searchLower) ||
        unit.productSku.toLowerCase().includes(searchLower) ||
        unit.brand.toLowerCase().includes(searchLower) ||
        (unit.model && unit.model.toLowerCase().includes(searchLower));
      
      const matchesCondition = filterCondition === 'all' || unit.condition === filterCondition;

      return matchesSearch && unit.status === 'available' && matchesCondition; // Apenas produtos disponíveis
    });
  }, [inventoryUnits, searchTerm, filterCondition]);

  useEffect(() => {
    if (isOpen) {
      // Reset form states on open
      setSearchTerm('');
      setFilterCondition('all');
      setNewCostPriceInput('');
      setNewSalePriceInput('');
      setDisplayedProducts([]); // Inicia com a tabela vazia, aguardando a busca
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // Match animation duration
  };

  if (!isOpen && !isAnimatingOut) return null;

  const calculateMarkup = (cost: number, sale: number): string => {
    if (cost <= 0) return '0.00%';
    const markup = ((sale - cost) / cost) * 100;
    return `${markup.toFixed(2)}%`;
  };

  const handleSearch = () => {
    const productsWithStock = filteredProductsForSearch.map(unit => {
      // Contar o estoque disponível para o SKU do produto
      const stockCount = inventoryUnits.filter(iu => iu.productSku === unit.productSku && iu.status === 'available').length;
      return { ...unit, availableStock: stockCount };
    });
    setDisplayedProducts(productsWithStock);
  };

  const handleApplyChanges = () => {
    if (displayedProducts.length === 0) {
      showError('Nenhum produto selecionado', 'Não há produtos para aplicar as alterações. Realize uma busca primeiro.');
      return;
    }

    if (!newCostPriceInput && !newSalePriceInput) {
      showError('Nenhuma alteração de preço', 'Por favor, insira um valor para alterar o preço de custo ou de venda.');
      return;
    }

    const updatedUnits = inventoryUnits.map(unit => {
      // Apenas atualiza os produtos que estão na lista de `displayedProducts`
      if (displayedProducts.some(p => p.id === unit.id)) {
        let newCostPrice = unit.costPrice;
        let newSalePrice = unit.salePrice;

        // Apply cost price changes if input is not empty
        if (newCostPriceInput) {
          newCostPrice = parseCurrencyBR(newCostPriceInput);
        }

        // Apply sale price changes if input is not empty
        if (newSalePriceInput) {
          newSalePrice = parseCurrencyBR(newSalePriceInput);
        }

        return {
          ...unit,
          costPrice: newCostPrice,
          salePrice: newSalePrice,
          updatedAt: new Date().toISOString(), // Update timestamp
        };
      }
      return unit;
    });

    onUpdateInventoryUnits(updatedUnits);
    showSuccess('Preços Atualizados', `${displayedProducts.length} produtos tiveram seus preços atualizados com sucesso!`);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        } ${isAnimatingOut ? 'animate-modal-out' : 'animate-modal-in'}`}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 flex justify-between items-center rounded-t-xl`}>
          <h2 className="text-xl font-bold flex items-center">
            <DollarSign className="mr-2" size={24} />
            Atualização de Preço em massa
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Funcionalidade de tutorial será implementada.')}
              className="flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Youtube className="mr-2" size={18} />
              Assistir Tutorial
            </button>
            <button
              onClick={handleClose}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Condição Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Condição
              </label>
              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value as ProductConditionFilter)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="all">Todas</option>
                <option value="novo">Novo</option>
                <option value="seminovo">Seminovo</option>
                <option value="usado">Usado</option>
              </select>
            </div>

            {/* Search Input and Button */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Buscar Produto
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
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
                <button
                  type="button"
                  onClick={handleSearch}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center"
                >
                  <Search className="mr-2" size={18} />
                  BUSCAR
                </button>
              </div>
            </div>
          </div>

          {/* Search Tip */}
          <div className={`rounded-lg p-3 mb-6 flex items-start ${
            theme === 'dark' ? 'bg-blue-900/50 border border-blue-700' : 'bg-blue-50 border border-blue-200'
          }`}>
            <Lightbulb className={`mr-3 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
            <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
              <span className="font-semibold">Dica de busca eficiente:</span> Utilize a mesma nomenclatura dos itens disponíveis em seu estoque, como por exemplo: "iPhone 16 Pro Max 256GB", dessa forma exibirá somente os produtos que correspondem com a informação digitada.
            </p>
          </div>

          {/* Affected Products Table */}
          <div className={`rounded-lg p-4 mb-6 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <h3 className={`text-lg font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              <Package className="mr-2 text-purple-600" size={20} />
              Produtos Afetados ({displayedProducts.length})
            </h3>
            {displayedProducts.length === 0 ? (
              <div className={`text-center py-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Nenhum produto corresponde aos filtros. Realize uma busca.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'border-slate-600' : 'border-slate-200'}`}>
                      <th className={`text-left py-2 px-3 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Descrição</th>
                      <th className={`text-right py-2 px-3 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Estoque atual</th>
                      <th className={`text-right py-2 px-3 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Custo atual</th>
                      <th className={`text-right py-2 px-3 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Venda atual</th>
                      <th className={`text-right py-2 px-3 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Markup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedProducts.map(unit => (
                      <tr key={unit.id} className={`border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                        <td className="py-2 px-3">
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{unit.productDescription}</div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{unit.productSku}</div>
                        </td>
                        <td className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                          {unit.availableStock}
                        </td>
                        <td className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                          R$ {formatCurrencyBR(unit.costPrice)}
                        </td>
                        <td className={`py-2 px-3 text-right ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                          R$ {formatCurrencyBR(unit.salePrice)}
                        </td>
                        <td className={`py-2 px-3 text-right font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                          {calculateMarkup(unit.costPrice, unit.salePrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Price Update Inputs */}
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            Para atualizar os preços dos itens listados, preencha apenas os campos que deseja modificar. Deixe vazio os que não deseja alterar.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Novo preço de Custo
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  R$
                </span>
                <input
                  type="text"
                  value={newCostPriceInput}
                  onChange={(e) => setNewCostPriceInput(formatCurrencyInput(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="0,00"
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Novo preço de Venda
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  R$
                </span>
                <input
                  type="text"
                  value={newSalePriceInput}
                  onChange={(e) => setNewSalePriceInput(formatCurrencyInput(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    theme === 'dark' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="0,00"
                />
              </div>
            </div>
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
              disabled={displayedProducts.length === 0 || (!newCostPriceInput && !newSalePriceInput)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <CheckCircle className="mr-2" size={16} />
              ATUALIZAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}