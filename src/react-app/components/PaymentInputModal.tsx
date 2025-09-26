import { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Smartphone, FileText, RefreshCw, Building2, Calculator, Percent, Check } from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';
import { formatCurrencyInput, parseCurrencyBR, formatCurrencyBR } from '@/react-app/utils/currency';

interface PaymentMethodData {
  type: 'money' | 'pix' | 'debit' | 'credit' | 'promissory' | 'crediario';
  amount: number;
  installments?: number;
  withInterest?: boolean;
  interestRate?: number;
  installmentValue?: number;
  taxesAmount?: number;
}

interface PaymentInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: PaymentMethodData) => void;
  initialData: PaymentMethodData;
  totalSaleAmount: number; // Total da venda para referência
  remainingAmount: number; // Valor restante para preenchimento automático
}

// Taxas de juros simuladas (configuradas pelo admin)
const interestRates = {
  3: 0, // Até 3x sem juros
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

// Taxas de cartão de débito e crédito (simuladas)
const debitCardFee = 2.5; // 2.5%
const creditCardFee = 3.5; // 3.5%

export default function PaymentInputModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  totalSaleAmount,
  remainingAmount,
}: PaymentInputModalProps) {
  const { theme } = useTheme();
  const [amount, setAmount] = useState(formatCurrencyBR(initialData.amount));
  const [installments, setInstallments] = useState(initialData.installments || 1);
  const [withInterest, setWithInterest] = useState(initialData.withInterest || false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // When modal opens, set amount to remainingAmount if it's a new payment or initialData.amount is 0
      const parsedInitialAmount = parseCurrencyBR(formatCurrencyInput(initialData.amount.toString()));
      const amountToSet = parsedInitialAmount === 0 ? remainingAmount : parsedInitialAmount;
      setAmount(formatCurrencyBR(amountToSet));
      setInstallments(initialData.installments || 1);
      setWithInterest(initialData.withInterest || false);
    }
  }, [isOpen, initialData, remainingAmount]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300);
  };

  const getPaymentMethodIcon = (type: PaymentMethodData['type']) => {
    switch (type) {
      case 'money': return <DollarSign size={20} />;
      case 'pix': return <Smartphone size={20} />;
      case 'debit': return <CreditCard size={20} />;
      case 'credit': return <CreditCard size={20} />;
      case 'promissory': return <FileText size={20} />;
      case 'crediario': return <Building2 size={20} />;
      default: return <DollarSign size={20} />;
    }
  };

  const getPaymentMethodLabel = (type: PaymentMethodData['type']) => {
    const labels = {
      money: 'Dinheiro',
      pix: 'PIX',
      debit: 'Cartão Débito',
      credit: 'Cartão Crédito',
      promissory: 'Promissória',
      crediario: 'Crediário'
    };
    return labels[type] || type;
  };

  const calculateCurrentPaymentDetails = () => {
    const parsedAmount = parseCurrencyBR(amount);
    let currentInterestRate = 0;
    let totalAmountWithInterest = parsedAmount;
    let taxesAmount = 0;
    let currentInstallmentValue = parsedAmount;

    if (initialData.type === 'debit') {
      taxesAmount = parsedAmount * (debitCardFee / 100);
    } else if (initialData.type === 'credit') {
      taxesAmount = parsedAmount * (creditCardFee / 100); // Base tax
      if (withInterest && installments > 3) {
        currentInterestRate = (interestRates[installments as keyof typeof interestRates] || 0);
        totalAmountWithInterest = parsedAmount * (1 + currentInterestRate / 100);
      }
    }

    if (installments > 0) {
      currentInstallmentValue = totalAmountWithInterest / installments;
    }

    return {
      parsedAmount,
      currentInterestRate,
      totalAmountWithInterest,
      taxesAmount,
      currentInstallmentValue
    };
  };

  const {
    parsedAmount,
    currentInterestRate,
    totalAmountWithInterest,
    taxesAmount,
    currentInstallmentValue
  } = calculateCurrentPaymentDetails();

  const handleConfirm = () => {
    if (parsedAmount <= 0) {
      alert('O valor deve ser maior que zero.');
      return;
    }

    onConfirm({
      type: initialData.type,
      amount: parsedAmount,
      installments: initialData.type === 'credit' || initialData.type === 'crediario' ? installments : undefined,
      withInterest: initialData.type === 'credit' ? withInterest : undefined,
      interestRate: initialData.type === 'credit' ? currentInterestRate : undefined,
      installmentValue: initialData.type === 'credit' || initialData.type === 'crediario' ? currentInstallmentValue : undefined,
      taxesAmount: taxesAmount
    });
    handleClose();
  };

  if (!isOpen && !isAnimatingOut) return null;

  const isCreditOrCrediario = initialData.type === 'credit' || initialData.type === 'crediario';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
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
                {getPaymentMethodIcon(initialData.type)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{getPaymentMethodLabel(initialData.type)}</h2>
                <p className="text-white/80 text-sm">Defina o valor e condições</p>
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
            {/* Valor */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Valor para {getPaymentMethodLabel(initialData.type)} *
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>R$</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            {/* Parcelas e Juros (apenas para crédito/crediário) */}
            {isCreditOrCrediario && (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    Número de Parcelas *
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(parseInt(e.target.value))}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {Array.from({ length: 18 }, (_, i) => i + 1).map(i => (
                      <option key={i} value={i}>
                        {i === 1 ? '1x (À vista)' : `${i}x`}
                      </option>
                    ))}
                  </select>
                </div>

                {initialData.type === 'credit' && (
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={withInterest}
                        onChange={(e) => setWithInterest(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Aplicar juros</span>
                    </label>
                  </div>
                )}
              </>
            )}

            {/* Resumo do Pagamento */}
            <div className={`p-4 rounded-lg border-2 ${
              theme === 'dark'
                ? 'bg-slate-700/50 border-slate-600'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h3 className={`font-bold text-lg mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Detalhes do Pagamento
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    Valor Base:
                  </span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    R$ {formatCurrencyBR(parsedAmount)}
                  </span>
                </div>

                {taxesAmount > 0 && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      Taxas ({((taxesAmount / parsedAmount) * 100).toFixed(2)}%):
                    </span>
                    <span className={`font-semibold text-red-600 ${theme === 'dark' ? 'text-red-400' : ''}`}>
                      R$ {formatCurrencyBR(taxesAmount)}
                    </span>
                  </div>
                )}

                {currentInterestRate > 0 && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      Juros ({currentInterestRate}%):
                    </span>
                    <span className={`font-semibold text-orange-600 ${theme === 'dark' ? 'text-orange-400' : ''}`}>
                      R$ {formatCurrencyBR(totalAmountWithInterest - parsedAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t pt-2">
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    Total desta forma:
                  </span>
                  <span className={`font-bold text-lg ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    R$ {formatCurrencyBR(totalAmountWithInterest + taxesAmount)}
                  </span>
                </div>

                {isCreditOrCrediario && installments > 1 && (
                  <div className="flex justify-between">
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                      Valor da Parcela:
                    </span>
                    <span className={`font-bold text-lg ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      {installments}x de R$ {formatCurrencyBR(currentInstallmentValue + (taxesAmount / installments))}
                    </span>
                  </div>
                )}
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
              type="button"
              onClick={handleConfirm}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Check className="mr-2" size={16} />
              Confirmar
            </button>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 -z-10"></div>
      </div>
    </div>
  );
}