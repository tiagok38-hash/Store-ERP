import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User,
  Users,
  MapPin,
  Building,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { formatDocument, formatPhone, formatZipCode, fetchAddressByCep } from '@/react-app/utils/form-helpers'; // Importar utilitários

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'customer' | 'supplier';
  data?: any;
  onCustomerSaved?: (customerData: any) => void;
}

export default function CustomerModal({ isOpen, onClose, type, data, onCustomerSaved }: CustomerModalProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    name: data?.name || '',
    email: data?.email || '',
    phone: data?.phone || '',
    document: data?.document || '',
    dateOfBirth: data?.date_of_birth || '', // Usar date_of_birth do Supabase
    address: data?.address || '',
    houseNumber: data?.house_number || '', // Usar house_number do Supabase
    neighborhood: data?.neighborhood || '',
    city: data?.city || '',
    state: data?.state || '',
    zipCode: data?.zip_code || '', // Usar zip_code do Supabase
    observations: data?.observations || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Reset form data when modal opens for a new item or when data changes for editing
    if (isOpen) {
      setFormData({
        name: data?.name || '',
        email: data?.email || '',
        phone: data?.phone || '',
        document: data?.document || '',
        dateOfBirth: data?.date_of_birth || '',
        address: data?.address || '',
        houseNumber: data?.house_number || '',
        neighborhood: data?.neighborhood || '',
        city: data?.localidade || data?.city || '', // Ajuste para ViaCEP
        state: data?.uf || data?.state || '',       // Ajuste para ViaCEP
        zipCode: data?.zip_code || '',
        observations: data?.observations || ''
      });
      setErrors({}); // Clear errors on open
    }
  }, [isOpen, data]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // Match animation duration
  };

  const isCustomer = type === 'customer';
  const title = isCustomer ? 'Cliente' : 'Fornecedor';
  const tableName = isCustomer ? 'customers' : 'suppliers';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!user) {
      showError('Erro', 'Usuário não autenticado.');
      return;
    }

    const itemData = {
      user_id: user.id,
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      document: formData.document.trim() || null,
      date_of_birth: isCustomer ? (formData.dateOfBirth || null) : null, // Apenas para clientes
      address: formData.address.trim() || null,
      house_number: formData.houseNumber.trim() || null,
      neighborhood: formData.neighborhood.trim() || null,
      city: formData.city.trim() || null,
      state: formData.state.trim() || null,
      zip_code: formData.zipCode.trim() || null,
      observations: formData.observations.trim() || null,
      is_active: true,
    };

    if (data) {
      // Update existing item
      const { data: updatedData, error } = await supabase
        .from(tableName)
        .update(itemData)
        .eq('id', data.id)
        .select();

      if (error) {
        showError(`Erro ao atualizar ${title}`, error.message);
        console.error(`Error updating ${tableName}:`, error);
      } else {
        showSuccess(`${title} Atualizado`, `O ${title} "${formData.name}" foi atualizado com sucesso.`);
        onCustomerSaved?.(updatedData[0]); // Passar os dados atualizados
        handleClose();
      }
    } else {
      // Insert new item
      const { data: newData, error } = await supabase
        .from(tableName)
        .insert(itemData)
        .select();

      if (error) {
        showError(`Erro ao criar ${title}`, error.message);
        console.error(`Error creating ${tableName}:`, error);
      } else {
        showSuccess(`${title} Criado`, `O ${title} "${formData.name}" foi criado com sucesso.`);
        onCustomerSaved?.(newData[0]); // Passar os dados criados
        handleClose();
      }
    }
  };

  const handleZipCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatZipCode(e.target.value);
    setFormData(prev => ({ ...prev, zipCode: formatted }));
    
    if (formatted.replace(/\D/g, '').length === 8) {
      const addressData = await fetchAddressByCep(formatted);
      if (addressData) {
        setFormData(prev => ({
          ...prev,
          address: addressData.address,
          neighborhood: addressData.neighborhood,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode
        }));
      }
    }
  };

  if (!isOpen && !isAnimatingOut) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${isAnimatingOut ? 'animate-modal-out' : 'animate-modal-in'}`}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${
          isCustomer 
            ? 'from-indigo-500 to-indigo-600' 
            : 'from-purple-500 to-purple-600'
        } text-white p-4 flex justify-between items-center rounded-t-xl`}>
          <h2 className="text-xl font-bold flex items-center">
            {isCustomer ? <User className="mr-2" size={24} /> : <Building className="mr-2" size={24} />}
            {data ? `Editar ${title}` : `Novo ${title}`}
          </h2>
          <button
            onClick={handleClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <Users className="mr-2 text-indigo-500" size={18} />
                Informações Básicas
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome {isCustomer ? 'do Cliente' : 'da Empresa'} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder={isCustomer ? "João Silva" : "Empresa ABC Ltda"}
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {isCustomer ? 'CPF/CNPJ' : 'CNPJ/CPF'}
                </label>
                <input
                  type="text"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: formatDocument(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={isCustomer ? "000.000.000-00" : "00.000.000/0000-00"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="email@exemplo.com"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {isCustomer && ( // Apenas para clientes
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data de Nascimento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <MapPin className="mr-2 text-green-500" size={18} />
                Endereço
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={handleZipCodeChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="00000-000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Número
                  </label>
                  <input
                    type="text"
                    value={formData.houseNumber}
                    onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Centro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>
              </div>

              {/* Informações Adicionais para Clientes */}
              {isCustomer && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <h4 className="text-sm font-medium text-indigo-800 mb-2">
                    Informações de Cliente
                  </h4>
                  <p className="text-sm text-indigo-600">
                    Histórico de compras e preferências do cliente serão 
                    exibidos automaticamente após o primeiro cadastro.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-6 py-2 bg-gradient-to-r ${
                isCustomer 
                  ? 'from-indigo-500 to-indigo-600' 
                  : 'from-purple-500 to-purple-600'
              } text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center`}
            >
              <Save className="mr-2" size={16} />
              {data ? `Salvar ${title}` : `Criar ${title}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}