import { useState, useEffect } from 'react';
import { X, Save, Building2, Mail, Phone, MapPin, Info } from 'lucide-react';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { useTheme } from '@/react-app/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/react-app/hooks/useAuth'; // Import useAuth

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  document?: string;
  is_active: boolean;
  type: 'customer' | 'supplier';
}

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerSaved?: (customer: Customer) => void;
  editingCustomer?: Customer | null;
  type: 'customer' | 'supplier'; // 'customer' or 'supplier'
}

export default function CustomerModal({ 
  isOpen, 
  onClose, 
  onCustomerSaved, 
  editingCustomer, 
  type 
}: CustomerModalProps) {
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth(); // Use the useAuth hook

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    document: '',
    is_active: true,
  });
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingCustomer) {
        setFormData({
          name: editingCustomer.name || '',
          email: editingCustomer.email || '',
          phone: editingCustomer.phone || '',
          address: editingCustomer.address || '',
          document: editingCustomer.document || '',
          is_active: editingCustomer.is_active,
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          document: '',
          is_active: true,
        });
      }
    }
  }, [isOpen, editingCustomer]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // Match animation duration
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showError('Nome obrigatório', `O nome do ${type === 'customer' ? 'cliente' : 'fornecedor'} é obrigatório.`);
      return;
    }

    // --- TEMPORARY BYPASS FOR USER_ID WHEN LOGIN IS DISABLED ---
    // In a production environment, user.id should always be present.
    // For development/testing with login bypassed, we use a placeholder.
    const userIdToUse = user?.id || '00000000-0000-0000-0000-000000000000'; 
    // If 'user_id' column in your DB is nullable, you could use:
    // const userIdToUse = user?.id || null;
    // But typically it's not nullable for ownership tracking.
    // --- END TEMPORARY BYPASS ---

    const dataToSave = {
      user_id: userIdToUse, // Use the determined user ID
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      address: formData.address.trim() || null,
      document: formData.document.trim() || null,
      is_active: formData.is_active,
    };

    let tableName = type === 'customer' ? 'customers' : 'suppliers';
    let savedCustomer: Customer | null = null;
    let error: any = null;

    if (editingCustomer) {
      const { data, error: updateError } = await supabase
        .from(tableName)
        .update(dataToSave)
        .eq('id', editingCustomer.id)
        .select()
        .single();
      savedCustomer = data;
      error = updateError;
    } else {
      const { data, error: insertError } = await supabase
        .from(tableName)
        .insert(dataToSave)
        .select()
        .single();
      savedCustomer = data;
      error = insertError;
    }

    if (error) {
      showError('Erro ao salvar', error.message);
      console.error(`Error saving ${type}:`, error);
      return;
    }

    if (savedCustomer) {
      showSuccess(
        `${type === 'customer' ? 'Cliente' : 'Fornecedor'} ${editingCustomer ? 'atualizado' : 'cadastrado'}!`,
        `${formData.name} foi ${editingCustomer ? 'atualizado' : 'adicionado'} com sucesso.`
      );
      if (onCustomerSaved) {
        onCustomerSaved({ ...savedCustomer, type }); // Pass the type back
      }
      handleClose();
    }
  };

  if (!isOpen && !isAnimatingOut) return null;

  const modalTitle = editingCustomer 
    ? `Editar ${type === 'customer' ? 'Cliente' : 'Fornecedor'}` 
    : `Novo ${type === 'customer' ? 'Cliente' : 'Fornecedor'}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`rounded-xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        } ${isAnimatingOut ? 'animate-modal-out' : 'animate-modal-in'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 flex justify-between items-center rounded-t-xl">
          <h2 className="text-lg font-bold flex items-center">
            {type === 'customer' ? <Info className="mr-2" size={20} /> : <Building2 className="mr-2" size={20} />}
            {modalTitle}
          </h2>
          <button
            onClick={handleClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className={`p-4 ${theme === 'dark' ? 'text-white' : ''}`}>
          <div className="space-y-3 mb-4">
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Nome *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder={`Nome do ${type === 'customer' ? 'cliente' : 'fornecedor'}`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Telefone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="(XX) XXXXX-XXXX"
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Endereço
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="Rua, Número, Bairro, Cidade"
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                CPF/CNPJ
              </label>
              <input
                type="text"
                name="document"
                value={formData.document}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="CPF ou CNPJ"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className={`mr-2 ${
                  theme === 'dark' ? 'form-checkbox text-blue-500 bg-slate-700 border-slate-600' : 'form-checkbox text-blue-600'
                }`}
              />
              <label className={`text-sm ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {type === 'customer' ? 'Cliente Ativo' : 'Fornecedor Ativo'}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2 border rounded hover:bg-slate-50 transition-colors text-sm ${
                theme === 'dark'
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 text-slate-700'
              }`}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:shadow-lg transition-all duration-200 flex items-center text-sm"
            >
              <Save className="mr-2" size={14} />
              {editingCustomer ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}