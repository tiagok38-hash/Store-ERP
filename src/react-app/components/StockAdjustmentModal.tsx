import { useState, useEffect } from 'react';
import { X, Package, Plus, Minus, Save, AlertTriangle, Info } from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { formatCurrencyBR } from '@/react-app/utils/currency';

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

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productUnit: InventoryUnit | null;
  currentStock: number; // Quantidade atual em estoque para este SKU
  onConfirmAdjustment: (
    productSku: string,
    change: number,
    reason: string,
    newStock: number,
    adjustmentType: 'add' | 'remove',
    oldStock: number // Adicionado: estoque antes do ajuste
  ) => void;
}

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  productUnit,
  currentStock,
  onConfirmAdjustment,
}: StockAdjustmentModalProps) {
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const [quantityChange, setQuantityChange] = useState(1);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [reason, setReason] = useState('');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setQuantityChange(1);
      setAdjustmentType('add');
      setReason('');
      setErrors({});
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
  if (!productUnit) return null; // Should not happen if opened correctly

  const handleConfirm = () => {
    const newErrors: Record<string, string> = {};

    if (quantityChange <= 0) {
      newErrors.quantityChange = 'A quantidade deve ser maior que zero.';
    }
    if (!reason.trim()) {
      newErrors.reason = 'O motivo do ajuste é obrigatório.';
    }
    if (adjustmentType === 'remove' && quantityChange > currentStock) {
      newErrors.quantityChange = `Não é possível remover ${quantityChange} unidades. Estoque atual: ${currentStock}.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalChange = adjustmentType === 'add' ? quantityChange : -quantityChange;
    const newStock = currentStock + finalChange;

    onConfirmAdjustment(
      productUnit.productSku,
      finalChange,
      reason,
      newStock,
      adjustmentType,
      currentStock // Passando o estoque atual (oldStock)
    );
    showSuccess('Estoque Ajustado', `O estoque de "${productUnit.productDescription}" foi ajustado com sucesso.`);
    handleClose();
  };

  const currentCalculatedStock = currentStock + (adjustmentType === 'add' ? quantityChange : -quantityChange);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
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
                <h2 className="text-xl font-bold">Ajustar Estoque</h2>
                <p className="text-white/80 text-sm">
                  {productUnit.productDescription} ({productUnit.productSku})
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
        <div className="p-6">
          <div className={`p-4 rounded-lg border-2 mb-6 ${
            theme === 'dark'
              ? 'bg-slate-700/50 border-slate-600'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                Estoque Atual:
              </span>
              <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                {currentStock} unidades
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                Estoque Após Ajuste:
              </span>
              <span className={`font-bold text-lg ${
                currentCalculatedStock < (productUnit.minStock || 0) ? 'text-red-600' : 'text-green-600'
              } ${theme === 'dark' ? (currentCalculatedStock < (productUnit.minStock || 0) ? 'text-red-400' : 'text-green-400') : ''}`}>
                {currentCalculatedStock} unidades
              </span>
            </div>
            {productUnit.minStock !== undefined && productUnit.minStock > 0 && (
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Estoque Mínimo:
                </span>
                <span className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  {productUnit.minStock} unidades
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-6">
            {/* Tipo de Ajuste */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                Tipo de Ajuste *
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('add')}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center transition-colors ${
                    adjustmentType === 'add'
                      ? 'bg-green-500 text-white shadow-soft-sm'
                      : theme === 'dark'
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Plus size={18} className="mr-2" />
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('remove')}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center transition-colors ${
                    adjustmentType === 'remove'
                      ? 'bg-red-500 text-white shadow-soft-sm'
                      : theme === 'dark'
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Minus size={18} className="mr-2" />
                  Remover
                </button>
              </div>
            </div>

            {/* Quantidade */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                Quantidade *
              </label>
              <input
                type="number"
                min="1"
                value={quantityChange}
                onChange={(e) => setQuantityChange(parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.quantityChange
                    ? 'border-red-300'
                    : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900')
                }`}
                placeholder="1"
                required
              />
              {errors.quantityChange && <p className="text-red-600 text-sm mt-1">{errors.quantityChange}</p>}
            </div>

            {/* Motivo */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                Motivo do Ajuste *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.reason
                    ? 'border-red-300'
                    : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900')
                }`}
                rows={3}
                placeholder="Ex: Erro de contagem, devolução, perda, etc."
                required
              />
              {errors.reason && <p className="text-red-600 text-sm mt-1">{errors.reason}</p>}
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
              type="button"
              onClick={handleConfirm}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="mr-2" size={16} />
              Salvar Ajuste
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}