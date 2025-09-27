import { useState, useEffect } from 'react';
import { X, Save, Package, Smartphone, Hash, Barcode, Clock, MapPin, DollarSign, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { formatCurrencyInput, parseCurrencyBR, formatCurrencyBR } from '@/react-app/utils/currency';

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
  warrantyTerm: string;
}

interface EditInventoryUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: InventoryUnit | null;
  onUnitUpdated: (updatedUnit: InventoryUnit) => void;
}

// Mock data for dropdowns (should come from Supabase in a real app)
const mockStockLocations = [
  'Vitrine Principal',
  'Vitrine iS',
  'Estoque A1-B2',
  'Estoque B1-A3',
  'Estoque C1-D2',
  'Depósito',
  'Loja',
  'Balcão',
  'Sala Técnica'
];

const mockWarrantyTerms = [
  '1 ano (defeito de fábrica)',
  '6 meses (limitada)',
  '3 meses (seminovos)',
  'Sem garantia'
];

export default function EditInventoryUnitModal({
  isOpen,
  onClose,
  unit,
  onUnitUpdated,
}: EditInventoryUnitModalProps) {
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState<InventoryUnit | null>(null);
  const [displayCostPrice, setDisplayCostPrice] = useState('');
  const [displaySalePrice, setDisplaySalePrice] = useState('');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && unit) {
      setFormData({ ...unit });
      setDisplayCostPrice(formatCurrencyBR(unit.costPrice));
      setDisplaySalePrice(formatCurrencyBR(unit.salePrice));
      setErrors({});
    }
  }, [isOpen, unit]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300);
  };

  if (!isOpen && !isAnimatingOut) return null;
  if (!formData) return null; // Should not happen if opened correctly

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => (prev ? { ...prev, [name]: value } : null));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'costPrice' | 'salePrice') => {
    const formatted = formatCurrencyInput(e.target.value);
    if (field === 'costPrice') {
      setDisplayCostPrice(formatted);
    } else {
      setDisplaySalePrice(formatted);
    }
    setFormData(prev => (prev ? { ...prev, [field]: parseCurrencyBR(formatted) } : null));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const calculateMarkup = () => {
    if (!formData) return '0.00';
    const cost = formData.costPrice;
    const sale = formData.salePrice;
    if (cost > 0 && sale > 0) {
      return (((sale - cost) / cost) * 100).toFixed(2);
    }
    return '0.00';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (formData.costPrice <= 0) {
      newErrors.costPrice = 'Preço de custo deve ser maior que zero.';
    }
    if (formData.salePrice <= 0) {
      newErrors.salePrice = 'Preço de venda deve ser maior que zero.';
    }
    if (!formData.location) {
      newErrors.location = 'Localização é obrigatória.';
    }
    if (!formData.warrantyTerm) {
      newErrors.warrantyTerm = 'Termo de garantia é obrigatório.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUnitUpdated({ ...formData, updatedAt: new Date().toISOString() });
    showSuccess('Item Atualizado', `A unidade de "${formData.productDescription}" foi atualizada com sucesso.`);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        } ${isAnimatingOut ? 'animate-modal-out' : 'animate-modal-in'}`}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-full mr-4 backdrop-blur-sm">
                <Package size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Editar Unidade de Estoque</h2>
                <p className="text-white/80 text-sm">
                  {formData.productDescription} ({formData.productSku})
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Informações de Identificação */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                <Smartphone className="mr-2 text-blue-600" size={20} />
                Identificação Única
              </h3>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  IMEI 1
                </label>
                <input
                  type="text"
                  name="imei1"
                  value={formData.imei1 || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="IMEI 1 (se aplicável)"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  IMEI 2
                </label>
                <input
                  type="text"
                  name="imei2"
                  value={formData.imei2 || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="IMEI 2 (se aplicável)"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Número de Série
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="Número de Série (se aplicável)"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Código de Barras
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="Código de Barras"
                />
              </div>
            </div>

            {/* Informações de Estoque e Preços */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                <Package className="mr-2 text-purple-600" size={20} />
                Detalhes do Estoque
              </h3>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Condição *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  required
                >
                  <option value="novo">Novo</option>
                  <option value="seminovo">Seminovo</option>
                  <option value="usado">Usado</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Localização *
                </label>
                <select
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.location ? 'border-red-300' : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900')
                  }`}
                  required
                >
                  <option value="">Selecione um local</option>
                  {mockStockLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Termo de Garantia *
                </label>
                <select
                  name="warrantyTerm"
                  value={formData.warrantyTerm}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.warrantyTerm ? 'border-red-300' : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900')
                  }`}
                  required
                >
                  <option value="">Selecione um termo</option>
                  {mockWarrantyTerms.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
                {errors.warrantyTerm && <p className="text-red-600 text-sm mt-1">{errors.warrantyTerm}</p>}
              </div>

              <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                <DollarSign className="mr-2 text-green-600" size={20} />
                Preços
              </h3>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Preço de Custo *
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>R$</span>
                  <input
                    type="text"
                    name="costPrice"
                    value={displayCostPrice}
                    onChange={(e) => handleCurrencyChange(e, 'costPrice')}
                    onFocus={(e) => e.target.select()}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.costPrice ? 'border-red-300' : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900')
                    }`}
                    placeholder="0,00"
                    required
                  />
                </div>
                {errors.costPrice && <p className="text-red-600 text-sm mt-1">{errors.costPrice}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Preço de Venda *
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>R$</span>
                  <input
                    type="text"
                    name="salePrice"
                    value={displaySalePrice}
                    onChange={(e) => handleCurrencyChange(e, 'salePrice')}
                    onFocus={(e) => e.target.select()}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.salePrice ? 'border-red-300' : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900')
                    }`}
                    placeholder="0,00"
                    required
                  />
                </div>
                {errors.salePrice && <p className="text-red-600 text-sm mt-1">{errors.salePrice}</p>}
              </div>
              <div className={`p-3 rounded-lg flex items-center justify-between ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
              }`}>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Markup:</span>
                <span className={`font-bold text-lg ${parseFloat(calculateMarkup()) > 0 ? 'text-green-600' : 'text-slate-600'} ${theme === 'dark' ? (parseFloat(calculateMarkup()) > 0 ? 'text-green-400' : 'text-slate-400') : ''}`}>
                  {calculateMarkup()}%
                </span>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end">
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
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="mr-2" size={16} />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}