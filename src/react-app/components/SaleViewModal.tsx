import { X, FileText, User, CreditCard, Calendar, Package } from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';

interface SaleViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
}

// Mock data para demonstração
const mockSaleData = {
  '001': {
    id: '001',
    customer: 'João Silva',
    customerPhone: '(11) 99999-9999',
    customerEmail: 'joao.silva@email.com',
    products: [
      { name: 'iPhone 13 Pro 128GB', imei: '123456789012345', quantity: 1, unitPrice: 3200.00, unitCost: 2399.40, total: 3200.00 },
      { name: 'Capinha iPhone 13 Pro', quantity: 1, unitPrice: 49.90, unitCost: 19.90, total: 49.90 }
    ],
    subtotal: 3249.90,
    discount: 0,
    total: 3249.90,
    totalCost: 2419.30,
    profit: 830.60,
    payment: 'Cartão de Crédito - 3x sem juros',
    datetime: '07/09/2025 14:35:22',
    status: 'Concluída',
    cashier: 'Usuário Admin',
    seller: 'João Vendedor',
    cashRegister: 'Caixa 01',
    receipt: 'REC001'
  },
  '002': {
    id: '002',
    customer: 'Maria Santos',
    customerPhone: '(11) 88888-8888',
    customerEmail: 'maria.santos@email.com',
    products: [
      { name: 'Samsung Galaxy S22 128GB', imei: '987654321098765', quantity: 1, unitPrice: 2899.00, unitCost: 2179.00, total: 2899.00 }
    ],
    subtotal: 2899.00,
    discount: 0,
    total: 2899.00,
    totalCost: 2179.00,
    profit: 720.00,
    payment: 'PIX',
    datetime: '07/09/2025 14:20:15',
    status: 'Concluída',
    cashier: 'Usuário Admin',
    seller: 'Maria Silva',
    cashRegister: 'Caixa 01',
    receipt: 'REC002'
  },
  '003': {
    id: '003',
    customer: 'Pedro Costa',
    customerPhone: '(11) 77777-7777',
    customerEmail: '',
    products: [
      { name: 'Fone Bluetooth JBL', quantity: 1, unitPrice: 89.90, unitCost: 60.00, total: 89.90 },
      { name: 'Carregador USB-C 20W', quantity: 1, unitPrice: 70.00, unitCost: 35.00, total: 70.00 }
    ],
    subtotal: 159.90,
    discount: 0,
    total: 159.90,
    totalCost: 95.00,
    profit: 64.90,
    payment: 'Dinheiro',
    datetime: '07/09/2025 13:45:10',
    status: 'Concluída',
    cashier: 'Usuário Admin',
    seller: 'Pedro Santos',
    cashRegister: 'Caixa 01',
    receipt: 'REC003'
  }
};

export default function SaleViewModal({ isOpen, onClose, saleId }: SaleViewModalProps) {
  const { theme } = useTheme();
  
  if (!isOpen) return null;

  const sale = mockSaleData[saleId as keyof typeof mockSaleData];

  if (!sale) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-xl shadow-2xl max-w-md w-full p-6 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}>
          <div className="text-center">
            <h2 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Venda não encontrada
            </h2>
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="mr-3" size={28} />
            <div>
              <h2 className="text-2xl font-bold">Detalhes da Venda</h2>
              <p className="text-blue-100">Venda #{sale.id} - {sale.receipt}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Customer Info */}
            <div className={`rounded-lg p-4 ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 flex items-center ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                <User className="mr-2 text-blue-600" size={20} />
                Informações do Cliente
              </h3>
              <div className={`space-y-2 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                <p><span className="font-medium">Nome:</span> {sale.customer}</p>
                <p><span className="font-medium">Telefone:</span> {sale.customerPhone}</p>
                {sale.customerEmail && (
                  <p><span className="font-medium">Email:</span> {sale.customerEmail}</p>
                )}
              </div>
            </div>

            {/* Sale Info */}
            <div className={`rounded-lg p-4 ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 flex items-center ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                <Calendar className="mr-2 text-green-600" size={20} />
                Informações da Venda
              </h3>
              <div className={`space-y-2 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                <p><span className="font-medium">Data/Hora:</span> {sale.datetime}</p>
                <p><span className="font-medium">Vendedor:</span> {sale.seller}</p>
                <p><span className="font-medium">Caixa:</span> {sale.cashRegister}</p>
                <p><span className="font-medium">Operador do Caixa:</span> {sale.cashier}</p>
                <p>
                  <span className="font-medium">Status:</span> 
                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {sale.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className={`rounded-lg p-4 mb-6 ${
            theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
          }`}>
            <h3 className={`text-lg font-semibold mb-3 flex items-center ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              <Package className="mr-2 text-purple-600" size={20} />
              Produtos
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${
                    theme === 'dark' ? 'border-slate-600' : 'border-slate-200'
                  }`}>
                    <th className={`text-left py-2 px-3 font-medium ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>Produto</th>
                    <th className={`text-left py-2 px-3 font-medium ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>IMEI/Serial</th>
                    <th className={`text-center py-2 px-3 font-medium ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>Qtd</th>
                    <th className={`text-right py-2 px-3 font-medium ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>Custo Unit.</th>
                    <th className={`text-right py-2 px-3 font-medium ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>Valor Unit.</th>
                    <th className={`text-right py-2 px-3 font-medium ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.products.map((product, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-2 px-3">{product.name}</td>
                      <td className="py-2 px-3 text-sm text-slate-600">
                        {'imei' in product ? product.imei || '-' : '-'}
                      </td>
                      <td className="py-2 px-3 text-center">{product.quantity}</td>
                      <td className="py-2 px-3 text-right text-red-600">R$ {product.unitCost.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right">R$ {product.unitPrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-medium">R$ {product.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Info */}
          <div className={`rounded-lg p-4 mb-6 ${
            theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
          }`}>
            <h3 className={`text-lg font-semibold mb-3 flex items-center ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              <CreditCard className="mr-2 text-orange-600" size={20} />
              Pagamento
            </h3>
            <div className={`space-y-2 ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-800'
            }`}>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {sale.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Desconto:</span>
                <span>R$ {sale.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Custo Total:</span>
                <span className="text-red-600">R$ {sale.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Lucro:</span>
                <span className="text-blue-600 font-semibold">R$ {sale.profit.toFixed(2)}</span>
              </div>
              <div className={`border-t pt-2 ${
                theme === 'dark' ? 'border-slate-600' : 'border-slate-300'
              }`}>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {sale.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="font-medium">Forma de Pagamento:</span>
                <span className="ml-2">{sale.payment}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className={`px-6 py-2 border rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'border-slate-600 hover:bg-slate-700 text-slate-300'
                  : 'border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
            >
              Fechar
            </button>
            <button
              onClick={() => {
                // Implementar impressão
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
