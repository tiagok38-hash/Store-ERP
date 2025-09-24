import { useState } from 'react';
import { Building2, Upload, Camera, X, Save } from 'lucide-react';
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

export default function CompanyInfoSection() {
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

  const handleSave = () => {
    // Implementar salvamento das configurações
    alert('Informações da empresa salvas com sucesso!');
  };

  return (
    <div className="space-y-8">
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
        </div>
      </div>

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

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium text-lg"
        >
          <Save className="mr-2" size={20} />
          Salvar Informações da Empresa
        </button>
      </div>
    </div>
  );
}