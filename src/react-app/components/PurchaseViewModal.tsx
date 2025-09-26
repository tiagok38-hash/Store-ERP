import { X, FileText, User, Calendar, Package, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface PurchaseViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: any;
}

// Mock user data for demonstration
const mockUserData = {
  '1': { name: 'Admin Sistema', email: 'admin@sistema.com' },
  '2': { name: 'João Silva', email: 'joao@sistema.com' },
  '3': { name: 'Maria Santos', email: 'maria@sistema.com' }
};

export default function PurchaseViewModal({ isOpen, onClose, purchase }: PurchaseViewModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // Match animation duration
  };

  if (!isOpen || !purchase && !isAnimatingOut) return null;

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { label: 'Concluída', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      partial: { label: 'Parcial', color: 'bg-blue-100 text-blue-800' }
    };
    return badges[status as keyof typeof badges] || badges.completed;
  };

  const statusBadge = getStatusBadge(purchase.status);
  const createdByUser = mockUserData['1']; // Assuming created by admin

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        style={{ animation: 'modalSlideIn 0.3s ease-out forwards' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="mr-3" size={28} />
            <div>
              <h2 className="text-2xl font-bold">Detalhes da Compra</h2>
              <p className="text-blue-100">Compra {purchase.locatorCode}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Purchase Info */}
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Calendar className="mr-2 text-blue-600" size={20} />
                Informações da Compra
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">Localizador:</span>
                  <span className="font-mono font-bold text-blue-600">{purchase.locatorCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">Data da Compra:</span>
                  <span>{formatDate(purchase.purchaseDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">Nota Fiscal:</span>
                  <span>{purchase.invoiceNumber || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">Criado em:</span>
                  <span>{formatDateTime(purchase.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Supplier Info */}
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <User className="mr-2 text-green-600" size={20} />
                Informações do Fornecedor
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">Nome:</span>
                  <span className="font-semibold">{purchase.supplierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">ID:</span>
                  <span>{purchase.supplierId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">Cadastrado por:</span>
                  <span>{createdByUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">Email do usuário:</span>
                  <span className="text-sm text-slate-500">{createdByUser.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Observations */}
          {purchase.observations && (
            <div className="bg-slate-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                <FileText className="mr-2 text-orange-600" size={20} />
                Observações
              </h3>
              <p className="text-slate-700">{purchase.observations}</p>
            </div>
          )}

          {/* Products */}
          <div className="bg-slate-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Package className="mr-2 text-purple-600" size={20} />
              Produtos ({purchase.items.length} itens)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-3 font-medium text-slate-700">#</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-700">Descrição</th>
                    <th className="text-center py-3 px-3 font-medium text-slate-700">Qtd</th>
                    <th className="text-right py-3 px-3 font-medium text-slate-700">Preço Custo (un)</th>
                    <th className="text-right py-3 px-3 font-medium text-slate-700">Preço Venda (un)</th>
                    <th className="text-right py-3 px-3 font-medium text-slate-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {purchase.items.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-3 px-3 text-sm font-medium">{index + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{item.description}</div>
                      </td>
                      <td className="py-3 px-3 text-center">{item.quantity}</td>
                      <td className="py-3 px-3 text-right text-red-600 font-medium">
                        {formatCurrency(item.costPrice)}
                      </td>
                      <td className="py-3 px-3 text-right text-green-600 font-medium">
                        {formatCurrency(item.finalPrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold">
                        {formatCurrency(item.finalPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-slate-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <DollarSign className="mr-2 text-green-600" size={20} />
              Resumo Financeiro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">Subtotal dos Itens</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(purchase.subtotal)}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">Custo Adicional</div>
                <div className="text-xl font-bold text-orange-600">
                  {formatCurrency(purchase.additionalCost || 0)}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">Total da Compra</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(purchase.total)}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                // Implement print functionality
                alert('Funcionalidade de impressão será implementada');
              }}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}