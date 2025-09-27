import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, Upload, Camera, X, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { supabase } from '@/integrations/supabase/client';
import { formatDocument, formatPhone, formatZipCode, fetchAddressByCep } from '@/react-app/utils/form-helpers';

interface UserProfileFormProps {
  onProfileUpdated: () => void;
}

export default function UserProfileForm({ onProfileUpdated }: UserProfileFormProps) {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    document: '', // CPF
    address: '',
    houseNumber: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    avatarUrl: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authUser?.id) {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone, document, address, house_number, neighborhood, city, state, zip_code, avatar_url')
          .eq('id', authUser.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          showError('Erro ao carregar perfil', error.message);
        } else if (data) {
          setFormData({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: authUser.email || '', // Email from auth.users
            phone: data.phone || '',
            document: data.document || '',
            address: data.address || '',
            houseNumber: data.house_number || '',
            neighborhood: data.neighborhood || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zip_code || '',
            avatarUrl: data.avatar_url || '',
          });
          setAvatarPreview(data.avatar_url || null);
        }
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser, showError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear error on input change
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value);
    setFormData(prev => ({ ...prev, document: formatted }));
    setErrors(prev => ({ ...prev, document: '' }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    setErrors(prev => ({ ...prev, phone: '' }));
  };

  const handleZipCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatZipCode(e.target.value);
    setFormData(prev => ({ ...prev, zipCode: formatted }));
    setErrors(prev => ({ ...prev, zipCode: '' }));

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authUser?.id) return;

    setIsLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${authUser.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${authUser.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars') // Certifique-se de que este bucket existe no Supabase
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      showError('Erro ao fazer upload da imagem', uploadError.message);
      setIsLoading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    if (publicUrlData?.publicUrl) {
      setFormData(prev => ({ ...prev, avatarUrl: publicUrlData.publicUrl }));
      setAvatarPreview(publicUrlData.publicUrl);
      showSuccess('Avatar atualizado', 'Sua imagem de perfil foi atualizada com sucesso!');
    }
    setIsLoading(false);
  };

  const handleRemoveAvatar = async () => {
    if (!authUser?.id || !formData.avatarUrl) return;

    setIsLoading(true);
    const urlParts = formData.avatarUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `${authUser.id}/${fileName}`;

    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (deleteError) {
      showError('Erro ao remover imagem', deleteError.message);
      setIsLoading(false);
      return;
    }

    setFormData(prev => ({ ...prev, avatarUrl: '' }));
    setAvatarPreview(null);
    showSuccess('Avatar removido', 'Sua imagem de perfil foi removida com sucesso!');
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Nome é obrigatório';
    if (!formData.lastName.trim()) newErrors.lastName = 'Sobrenome é obrigatório';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    // Basic document validation (CPF/CNPJ length)
    const cleanDocument = formData.document.replace(/\D/g, '');
    if (cleanDocument && cleanDocument.length !== 11 && cleanDocument.length !== 14) {
      newErrors.document = 'CPF/CNPJ inválido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    if (!authUser?.id) {
      showError('Erro', 'Usuário não autenticado.');
      setIsLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim() || null,
        document: formData.document.trim() || null,
        address: formData.address.trim() || null,
        house_number: formData.houseNumber.trim() || null,
        neighborhood: formData.neighborhood.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        zip_code: formData.zipCode.trim() || null,
        avatar_url: formData.avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id);

    if (profileError) {
      showError('Erro ao atualizar perfil', profileError.message);
      console.error('Error updating profile:', profileError);
    } else {
      showSuccess('Perfil atualizado', 'Suas informações foram salvas com sucesso!');
      onProfileUpdated(); // Notify parent component
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Informações Pessoais */}
        <div className={`rounded-xl shadow-soft-md p-6 ${theme === 'dark' ? 'bg-card-dark' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            <User className="mr-2 text-blue-600" size={20} />
            Dados Pessoais
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Nome *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.firstName 
                    ? 'border-red-300' 
                    : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 text-slate-900')
                }`}
                placeholder="Seu nome"
                required
              />
              {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Sobrenome *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.lastName 
                    ? 'border-red-300' 
                    : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 text-slate-900')
                }`}
                placeholder="Seu sobrenome"
                required
              />
              {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email 
                      ? 'border-red-300' 
                      : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 text-slate-900')
                  }`}
                  placeholder="seu@email.com"
                  disabled // Email is usually not editable directly here
                />
              </div>
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Telefone
              </label>
              <div className="relative">
                <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                CPF
              </label>
              <input
                type="text"
                name="document"
                value={formData.document}
                onChange={handleDocumentChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.document 
                    ? 'border-red-300' 
                    : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 text-slate-900')
                }`}
                placeholder="000.000.000-00"
              />
              {errors.document && <p className="text-red-600 text-sm mt-1">{errors.document}</p>}
            </div>
          </div>
        </div>

        {/* Coluna 2: Endereço */}
        <div className={`rounded-xl shadow-soft-md p-6 ${theme === 'dark' ? 'bg-card-dark' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            <MapPin className="mr-2 text-green-600" size={20} />
            Endereço
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                CEP
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleZipCodeChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.zipCode 
                    ? 'border-red-300' 
                    : (theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300 text-slate-900')
                }`}
                placeholder="00000-000"
              />
              {errors.zipCode && <p className="text-red-600 text-sm mt-1">{errors.zipCode}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Endereço
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="Rua, Avenida, etc."
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Número
              </label>
              <input
                type="text"
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="123"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                Bairro
              </label>
              <input
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
                placeholder="Seu bairro"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Cidade
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="Sua cidade"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Estado
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 3: Avatar */}
        <div className={`rounded-xl shadow-soft-md p-6 ${theme === 'dark' ? 'bg-card-dark' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            <Camera className="mr-2 text-purple-600" size={20} />
            Avatar
          </h3>
          <div className="space-y-4 text-center">
            <div className={`w-32 h-32 mx-auto rounded-full overflow-hidden border-2 ${
              theme === 'dark' ? 'border-slate-600' : 'border-slate-300'
            } flex items-center justify-center bg-slate-100 dark:bg-slate-700`}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={64} className={`text-slate-400 ${theme === 'dark' ? 'text-slate-500' : ''}`} />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
              disabled={isLoading}
            />
            <label
              htmlFor="avatar-upload"
              className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                theme === 'dark'
                  ? 'bg-blue-700 hover:bg-blue-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Upload className="mr-2" size={18} />
              {isLoading ? 'Carregando...' : 'Alterar Avatar'}
            </label>
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={isLoading}
                className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  theme === 'dark'
                    ? 'bg-red-700 hover:bg-red-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                <X className="mr-2" size={18} />
                Remover Avatar
              </button>
            )}
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              PNG, JPG até 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
          ) : (
            <Save className="mr-2" size={20} />
          )}
          Salvar Perfil
        </button>
      </div>
    </form>
  );
}