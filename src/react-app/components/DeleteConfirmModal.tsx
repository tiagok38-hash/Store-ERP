import { useState } from 'react';
import { AlertTriangle, X, Trash2, Shield } from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  type?: 'warning' | 'danger';
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  type = 'danger'
}: DeleteConfirmModalProps) {
  const { theme } = useTheme();
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular operação
    onConfirm();
    setIsConfirming(false);
    onClose();
  };

  const getColors = () => {
    if (type === 'warning') {
      return {
        gradient: 'from-yellow-500 to-orange-500',
        bg: theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50',
        border: theme === 'dark' ? 'border-yellow-700' : 'border-yellow-200',
        text: theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800',
        button: 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
      };
    }
    return {
      gradient: 'from-red-500 to-red-600',
      bg: theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50',
      border: theme === 'dark' ? 'border-red-700' : 'border-red-200',
      text: theme === 'dark' ? 'text-red-300' : 'text-red-800',
      button: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
    };
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div 
        className={`rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}
        style={{ animation: 'modalSlideIn 0.3s ease-out forwards' }}
      >
        {/* Header com gradiente */}
        <div className={`bg-gradient-to-r ${colors.gradient} text-white p-6 rounded-t-2xl relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-full mr-4 backdrop-blur-sm">
                {type === 'warning' ? (
                  <AlertTriangle size={24} className="animate-pulse" />
                ) : (
                  <Trash2 size={24} className="animate-pulse" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-white/80 text-sm">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              disabled={isConfirming}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`rounded-xl p-4 mb-6 border-2 ${colors.bg} ${colors.border}`}>
            <div className="flex items-start">
              <Shield className={`mr-3 mt-1 flex-shrink-0 ${colors.text}`} size={20} />
              <div>
                <p className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  {message}
                </p>
                {itemName && (
                  <p className={`text-sm ${colors.text} font-semibold`}>
                    Item: "{itemName}"
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isConfirming}
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
              disabled={isConfirming}
              className={`px-6 py-3 bg-gradient-to-r ${colors.button} text-white rounded-xl font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center min-w-[120px] justify-center`}
            >
              {isConfirming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2" size={16} />
                  Confirmar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${colors.gradient} rounded-2xl blur opacity-20 -z-10`}></div>
      </div>
    </div>
  );
}