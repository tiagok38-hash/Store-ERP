import { X, Package, Barcode, Smartphone, Tag, DollarSign } from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  sku?: string;
  brand?: string;
  category?: string;
  barcode?: string;
  requiresImei: boolean;
  requiresSerial?: boolean;
  stock?: number;
}

interface ProductConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
}

export default function ProductConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  product
}: ProductConfirmModalProps) {
  const { theme } = useTheme();

  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div 
        className={`rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}
        style={{ animation: 'modalSlideIn 0.3s ease-out forwards' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-full mr-4 backdrop-blur-sm">
                <Package size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Confirmar Produto</h2>
                <p className="text-white/80 text-sm">Verifique as informações do produto</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`rounded-xl p-4 mb-6 border-2 ${
            theme === 'dark' 
              ? 'bg-slate-700/50 border-slate-600' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className={`font-bold text-lg mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              {product.name}
            </h3>
            
            <div className="space-y-3">
              {product.sku && (
                <div className="flex items-center">
                  <Tag className={`mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} size={16} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    SKU: {product.sku}
                  </span>
                </div>
              )}
              
              {product.brand && (
                <div className="flex items-center">
                  <Package className={`mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} size={16} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    Marca: {product.brand}
                  </span>
                </div>
              )}

              {product.barcode && (
                <div className="flex items-center">
                  <Barcode className={`mr-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} size={16} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    Código de Barras: {product.barcode}
                  </span>
                </div>
              )}

              <div className="flex items-center">
                <DollarSign className={`mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} size={16} />
                <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  Preço: 
                  <span className={`font-bold ml-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    R$ {product.price.toFixed(2)}
                  </span>
                </span>
              </div>

              {product.stock !== undefined && (
                <div className="flex items-center">
                  <Package className={`mr-2 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} size={16} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    Estoque: {product.stock} unidades
                  </span>
                </div>
              )}

              {product.requiresImei && (
                <div className="flex items-center">
                  <Smartphone className={`mr-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} size={16} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-600'} font-medium`}>
                    ⚠️ Produto requer IMEI
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center"
            >
              <Package className="mr-2" size={16} />
              Confirmar Produto
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}