import { useState } from 'react';
import { X, DollarSign, Calculator } from 'lucide-react';

interface CashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'open' | 'close';
  currentAmount?: number;
  onStatusChange?: (isOpen: boolean) => void;
}

export default function CashRegisterModal({ isOpen, onClose, type, currentAmount = 0, onStatusChange }: CashRegisterModalProps) {
  const [amount, setAmount] = useState(type === 'open' ? '' : currentAmount.toString());
  const [observations, setObservations] = useState('');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // Match animation duration
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) < 0) {
      alert('Valor inválido');
      return;
    }

    const value = parseFloat(amount);
    
    if (type === 'open') {
      // Simular abertura de caixa
      alert(`Caixa aberto com sucesso!\nValor inicial: R$ ${value.toFixed(2)}\nObservações: ${observations || 'Nenhuma'}`);
      onStatusChange?.(true);
    } else {
      // Simular fechamento de caixa
      const difference = value - currentAmount;
      const status = difference === 0 ? 'Fechamento correto' : 
                    difference > 0 ? `Sobra de R$ ${difference.toFixed(2)}` : 
                    `Falta de R$ ${Math.abs(difference).toFixed(2)}`;
      
      alert(`Caixa fechado com sucesso!\nValor esperado: R$ ${currentAmount.toFixed(2)}\nValor informado: R$ ${value.toFixed(2)}\nStatus: ${status}\nObservações: ${observations || 'Nenhuma'}`);
      onStatusChange?.(false);
    }

    setAmount('');
    setObservations('');
    handleClose(); // Use the animated close
  };

  if (!isOpen && !isAnimatingOut) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-xl shadow-2xl max-w-md w-full ${isAnimatingOut ? 'animate-modal-out' : 'animate-modal-in'}`}
      >
        {/* Header */}
        <div className={`${type === 'open' ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'} text-white p-4 flex justify-between items-center rounded-t-xl`}>
          <h2 className="text-xl font-bold flex items-center">
            {type === 'open' ? (
              <>
                <DollarSign className="mr-2" size={24} />
                Abertura de Caixa
              </>
            ) : (
              <>
                <Calculator className="mr-2" size={24} />
                Fechamento de Caixa
              </>
            )}
          </h2>
          <button
            onClick={handleClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {type === 'close' && (
            <div className="mb-4 p-4 bg-slate-100 rounded-lg">
              <h3 className="font-semibold text-slate-800 mb-2">Resumo do Caixa</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Valor inicial:</span>
                  <span className="font-medium">R$ 500,00</span>
                </div>
                <div className="flex justify-between">
                  <span>Total vendas:</span>
                  <span className="font-medium text-green-600">+ R$ 8.450,50</span>
                </div>
                <div className="flex justify-between">
                  <span>Suprimentos:</span>
                  <span className="font-medium text-blue-600">+ R$ 200,00</span>
                </div>
                <div className="flex justify-between">
                  <span>Retiradas:</span>
                  <span className="font-medium text-red-600">- R$ 300,00</span>
                </div>
                <div className="border-t pt-1 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Valor esperado:</span>
                    <span>R$ {currentAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {type === 'open' ? 'Valor de Abertura' : 'Valor Real do Caixa'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onFocus={(e) => {
                  if (e.target.value === '' || e.target.value === '0') {
                    setAmount('0');
                    e.target.setSelectionRange(0, 0);
                  } else {
                    e.target.select();
                  }
                }}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Adicione observações sobre a operação..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium ${
                type === 'open' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
            >
              {type === 'open' ? 'Abrir Caixa' : 'Fechar Caixa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}