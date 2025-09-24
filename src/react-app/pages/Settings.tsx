import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Upload, 
  Printer, 
  Save,
  FileText,
  Receipt,
  Camera,
  X
} from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';

interface CompanyInfo {
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
}

interface ReceiptSettings {
  type: 'a4' | '80mm';
  includeCompanyLogo: boolean;
  includeQRCode: boolean;
  includeFooterMessage: boolean;
  footerMessage: string;
}

export default function Settings() {
  const { theme } = useTheme();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'StoreFlow Ltda',
    cnpj: '12.345.678/0001-90',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    phone: '(11) 1234-5678',
    email: 'contato@storeflow.com.br',
    website: 'www.storeflow.com.br'
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    type: 'a4',
    includeCompanyLogo: true,
    includeQRCode: true,
    includeFooterMessage: true,
    footerMessage: 'Obrigado pela preferência! Volte sempre!'
  });

  const handleCompanyInfoChange = (field: keyof CompanyInfo, value: string) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReceiptSettingChange = (field: keyof ReceiptSettings, value: any) => {
    setReceiptSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Implementar salvamento das configurações
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 flex items-center ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          <SettingsIcon className="mr-3 text-blue-600" size={32} />
          Configurações
        </h1>
        <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
          Configure as informações da empresa e preferências do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company Information */}
        <div className={`rounded-xl shadow-lg p-6 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-xl font-bold mb-6 flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            <Building2 className="mr-2 text-blue-600" size={24} />
            Informações da Empresa
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>
                Nome da Empresa
              </label>
              <input
                type="text"
                value={companyInfo.name}
                onChange={(e) => handleCompanyInfoChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="Nome da empresa"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>
                CNPJ
              </label>
              <input
                type="text"
                value={companyInfo.cnpj}
                onChange={(e) => handleCompanyInfoChange('cnpj', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>
                Endereço
              </label>
              <input
                type="text"
                value={companyInfo.address}
                onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="Rua, número, complemento"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  Cidade
                </label>
                <input
                  type="text"
                  value={companyInfo.city}
                  onChange={(e) => handleCompanyInfoChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  Estado
                </label>
                <input
                  type="text"
                  value={companyInfo.state}
                  onChange={(e) => handleCompanyInfoChange('state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>
                CEP
              </label>
              <input
                type="text"
                value={companyInfo.zipCode}
                onChange={(e) => handleCompanyInfoChange('zipCode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="00000-000"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>
                Telefone
              </label>
              <input
                type="text"
                value={companyInfo.phone}
                onChange={(e) => handleCompanyInfoChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>
                E-mail
              </label>
              <input
                type="email"
                value={companyInfo.email}
                onChange={(e) => handleCompanyInfoChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="contato@empresa.com.br"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
              }`}>
                Website
              </label>
              <input
                type="text"
                value={companyInfo.website}
                onChange={(e) => handleCompanyInfoChange('website', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="www.empresa.com.br"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                CNPJ
              </label>
              <input
                type="text"
                value={companyInfo.cnpj}
                onChange={(e) => handleCompanyInfoChange('cnpj', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Endereço
              </label>
              <input
                type="text"
                value={companyInfo.address}
                onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Rua, número, complemento"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  value={companyInfo.city}
                  onChange={(e) => handleCompanyInfoChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cidade"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estado
                </label>
                <input
                  type="text"
                  value={companyInfo.state}
                  onChange={(e) => handleCompanyInfoChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                CEP
              </label>
              <input
                type="text"
                value={companyInfo.zipCode}
                onChange={(e) => handleCompanyInfoChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="00000-000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Telefone
              </label>
              <input
                type="text"
                value={companyInfo.phone}
                onChange={(e) => handleCompanyInfoChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(00) 0000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={companyInfo.email}
                onChange={(e) => handleCompanyInfoChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contato@empresa.com.br"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Website
              </label>
              <input
                type="text"
                value={companyInfo.website}
                onChange={(e) => handleCompanyInfoChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="www.empresa.com.br"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Logo Upload */}
          <div className={`rounded-xl shadow-lg p-6 ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-bold mb-6 flex items-center ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              <Camera className="mr-2 text-purple-600" size={24} />
              Logo da Empresa
            </h2>
            
            <div className="space-y-4">
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                theme === 'dark' ? 'border-slate-600' : 'border-slate-300'
              }`}>
                {logoPreview ? (
                  <div className="relative">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="max-w-full max-h-32 mx-auto object-contain"
                    />
                    <button
                      onClick={() => setLogoPreview(null)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className={`mx-auto mb-4 ${
                      theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    }`} size={48} />
                    <p className={`mb-2 ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}>Clique para fazer upload da logo</p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>PNG, JPG até 2MB</p>
                  </div>
                )}
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center font-medium"
              >
                <Upload className="mr-2" size={18} />
                {logoPreview ? 'Alterar Logo' : 'Fazer Upload'}
              </label>
            </div>
          </div>

          {/* Receipt Settings */}
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
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium text-lg"
        >
          <Save className="mr-2" size={20} />
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}
