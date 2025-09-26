import { useState } from 'react';
import { X, Calculator, CreditCard } from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';
import { formatCurrencyInput, parseCurrencyBR } from '@/react-app/utils/currency';

interface CardSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Taxas de juros por parcela (configurável no admin)
const interestRates = {
  1: 0,
  2: 0,
  3: 0,
  4: 2.5,
  5: 3.0,
  6: 3.5,
  7: 4.0,
  8: 4.5,
  9: 5.0,
  10: 5.5,
  11: 6.0,
  12: 6.5,
  13: 7.0,
  14: 7.5,
  15: 8.0,
  16: 8.5,
  17: 9.0,
  18: 9.5
};

export default function CardSimulatorModal({ isOpen, onClose }: CardSimulatorModalProps) {
  const { theme } = useTheme();
  const [productValue, setProductValue] = useState('');
  const [paymentType, setPaymentType] = useState<'debit' | 'credit'>('credit');
  const [installments, setInstallments] = useState(1);
  const [calculated, setCalculated] = useState(false);
  const [calculationResult, setCalculationResult] = useState({
    originalValue: 0,
    interestRate: 0,
    totalWithInterest: 0,
    installmentValue: 0
  });
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // Match animation duration
  };

  const handleCalculate = () => {
    const value = parseCurrencyBR(productValue);
    
    if (value <= 0) {
      return;
    }

    let interestRate = 0;
    let totalWithInterest = value;
    
    if (paymentType === 'credit' && installments > 3) {
      interestRate = interestRates[installments as keyof typeof interestRates] || 0;
      totalWithInterest = value * (1 + interestRate / 100);
    }

    const installmentValue = totalWithInterest / installments;

    setCalculationResult({
      originalValue: value,
      interestRate,
      totalWithInterest,
      installmentValue
    });
    
    setCalculated(true);
  };

  const handleProductValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setProductValue(formatted);
    setCalculated(false);
  };

  const resetCalculation = () => {
    setProductValue('');
    setPaymentType('credit');
    setInstallments(1);
    setCalculated(false);
    setCalculationResult({
      originalValue: 0,
      interestRate: 0,
      totalWithInterest: 0,
      installmentValue: 0
    });
  };

  if (!isOpen && !isAnimatingOut) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className={`rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        } ${isAnimatingOut ? 'animate-modal-out' : 'animate-modal-in'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-full mr-4 backdrop-blur-sm">
                <Calculator size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Simulador de Cartão</h2>
                <p className="text-white/80 text-sm">Calcule taxas e parcelas</p>
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
          <div className="space-y-4 mb-6">
            {/* Valor do Produto */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Valor do Produto *
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>R$</span>
                <input
                  type="text"
                  value={productValue}
                  onChange={handleProductValueChange}
                  placeholder="0,00"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Forma de Pagamento */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Forma de Pagamento *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentType('debit')}
                  className={`p-3 border rounded-lg flex items-center justify-center transition-all ${
                    paymentType === 'debit'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : theme === 'dark'
                        ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="mr-2" size={16} />
                  Débito
                </button>
                <button
                  onClick={() => setPaymentType('credit')}
                  className={`p-3 border rounded-lg flex items-center justify-center transition-all ${
                    paymentType === 'credit'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : theme === 'dark'
                        ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="mr-2" size={16} />
                  Crédito
                </button>
              </div>
            </div>

            {/* Número de Parcelas */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Número de Parcelas *
              </label>
              <select
                value={installments}
                onChange={(e) => setInstallments(parseInt(e.target.value))}
                disabled={paymentType === 'debit'}
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  paymentType === 'debit' ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {Array.from({ length: 18 }, (_, i) => i + 1).map(i => (
                  <option key={i} value={i}>
                    {i === 1 ? '1x (À vista)' : `${i}x`}
                    {paymentType === 'credit' && i > 3 && ` - ${interestRates[i as keyof typeof interestRates] || 0}% juros`}
                  </option>
                ))}
              </select>
              {paymentType === 'debit' && (
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Cartão de débito: apenas à vista
                </p>
              )}
            </div>
          </div>

          {/* Resultado da Simulação */}
          {calculated && (
            <div className={`p-4 rounded-lg border-2 mb-6 ${
              theme === 'dark' 
                ? 'bg-slate-700/50 border-slate-600' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h3 className={`font-bold text-lg mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Resultado da Simulação
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    Valor Original:
                  </span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    R$ {calculationResult.originalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                {calculationResult.interestRate > 0 && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      Taxa de Juros:
                    </span>
                    <span className={`font-semibold text-orange-600 ${theme === 'dark' ? 'text-orange-400' : ''}`}>
                      {calculationResult.interestRate}%
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between border-t pt-2">
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    Total a Pagar:
                  </span>
                  <span className={`font-bold text-lg ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    R$ {calculationResult.totalWithInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    Valor da Parcela:
                  </span>
                  <span className={`font-bold text-lg ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    {installments}x de R$ {calculationResult.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={resetCalculation}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              Limpar
            </button>
            <button
              onClick={handleCalculate}
              disabled={!productValue || parseCurrencyBR(productValue) <= 0}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Calculator className="mr-2" size={16} />
              Calcular
            </button>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 -z-10"></div>
      </div>
    </div>
  );
}