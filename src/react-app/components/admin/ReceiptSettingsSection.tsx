import { useState } from 'react';
import { Printer, FileText, Receipt, Save } from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';

interface ReceiptSettings {
  type: 'a4' | '80mm';
  includeCompanyLogo: boolean;
  includeQRCode: boolean;
  includeFooterMessage: boolean;
  footerMessage: string;
}

export default function ReceiptSettingsSection() {
  const { theme } = useTheme();
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    type: 'a4',
    includeCompanyLogo: true,
    includeQRCode: true,
    includeFooterMessage: true,
    footerMessage: 'Obrigado pela preferência! Volte sempre!'
  });

  const handleReceiptSettingChange = (field: keyof ReceiptSettings, value: any) => {
    setReceiptSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Implementar salvamento das configurações
    alert('Configurações de comprovante salvas com sucesso!');
  };

  return (
    <div className={`rounded-xl shadow-lg p-6 ${
      theme === 'dark' ? 'bg-slate-800' : 'bg-white'
    }`}>
      <h2 className={`text-xl font-bold mb-6 flex items-center ${
        theme === 'dark' ? 'text-white' : 'text-slate-800'
      }`}>
        <Printer className="mr-2 text-green-600" size={24} />
        Configurações de Comprovante
      </h2>
      
      <div className="space-y-6">
        {/* Receipt Type */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${
            theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
          }`}>
            Tipo de Comprovante
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                receiptSettings.type === 'a4' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : theme === 'dark'
                    ? 'border-slate-600 hover:border-slate-500'
                    : 'border-slate-300 hover:border-slate-400'
              }`}
              onClick={() => handleReceiptSettingChange('type', 'a4')}
            >
              <div className="flex items-center justify-center mb-2">
                <FileText size={32} className={receiptSettings.type === 'a4' ? 'text-blue-600' : 
                  theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
              </div>
              <h3 className={`text-center font-medium ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>Folha A4</h3>
              <p className={`text-sm text-center mt-1 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>210 x 297mm</p>
            </div>
            
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                receiptSettings.type === '80mm' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : theme === 'dark'
                    ? 'border-slate-600 hover:border-slate-500'
                    : 'border-slate-300 hover:border-slate-400'
              }`}
              onClick={() => handleReceiptSettingChange('type', '80mm')}
            >
              <div className="flex items-center justify-center mb-2">
                <Receipt size={32} className={receiptSettings.type === '80mm' ? 'text-blue-600' : 
                  theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
              </div>
              <h3 className={`text-center font-medium ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>Cupom 80mm</h3>
              <p className={`text-sm text-center mt-1 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>Impressora térmica</p>
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
            }`}>Incluir logo da empresa</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={receiptSettings.includeCompanyLogo}
                onChange={(e) => handleReceiptSettingChange('includeCompanyLogo', e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                theme === 'dark' 
                  ? 'bg-slate-600 after:border-slate-500' 
                  : 'bg-gray-200 after:border-gray-300'
              }`}></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
            }`}>Incluir QR Code PIX</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={receiptSettings.includeQRCode}
                onChange={(e) => handleReceiptSettingChange('includeQRCode', e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                theme === 'dark' 
                  ? 'bg-slate-600 after:border-slate-500' 
                  : 'bg-gray-200 after:border-gray-300'
              }`}></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
            }`}>Incluir mensagem de rodapé</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={receiptSettings.includeFooterMessage}
                onChange={(e) => handleReceiptSettingChange('includeFooterMessage', e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                theme === 'dark' 
                  ? 'bg-slate-600 after:border-slate-500' 
                  : 'bg-gray-200 after:border-gray-300'
              }`}></div>
            </label>
          </div>

          {receiptSettings.includeFooterMessage && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>
                Mensagem de Rodapé
              </label>
              <textarea
                value={receiptSettings.footerMessage}
                onChange={(e) => handleReceiptSettingChange('footerMessage', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                rows={3}
                placeholder="Digite a mensagem que aparecerá no rodapé do comprovante"
              />
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium text-lg"
        >
          <Save className="mr-2" size={20} />
          Salvar Configurações de Comprovante
        </button>
      </div>
    </div>
  );
}