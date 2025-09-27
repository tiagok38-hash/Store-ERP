import { useState } from 'react';
import { User, Lock, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/react-app/hooks/useTheme';
import UserProfileForm from '@/react-app/components/UserProfileForm';
import ChangePasswordForm from '@/react-app/components/ChangePasswordForm';
import { useAuth } from '@/react-app/hooks/useAuth';

export default function UserProfileSettingsPage() {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const handleProfileUpdated = () => {
    // Optionally, refresh user data or show a global notification
    console.log('User profile updated!');
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      {/* Header */}
      <div className="mb-6">
        <Link 
          to="/administration" 
          className={`inline-flex items-center text-sm font-medium mb-4 transition-colors ${
            theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
          }`}
        >
          <ChevronLeft size={16} className="mr-1" />
          Voltar para Administração
        </Link>
        <h1 className={`text-3xl font-bold mb-2 flex items-center ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          <User className="mr-3 text-blue-600" size={32} />
          Usuário (Perfil)
        </h1>
        <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
          Gerencie suas informações de perfil e senha.
        </p>
      </div>

      {/* Tabs */}
      <div className={`rounded-xl shadow-soft-lg p-1 mb-6 flex ${
        theme === 'dark' ? 'bg-card-dark' : 'bg-white'
      }`}>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
            activeTab === 'profile'
              ? 'bg-primary text-white shadow-soft-sm'
              : `${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`
          }`}
        >
          <User className="mr-2" size={18} />
          Perfil
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
            activeTab === 'password'
              ? 'bg-primary text-white shadow-soft-sm'
              : `${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`
          }`}
        >
          <Lock className="mr-2" size={18} />
          Alterar Senha
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && (
          <UserProfileForm onProfileUpdated={handleProfileUpdated} />
        )}
        {activeTab === 'password' && (
          <ChangePasswordForm />
        )}
      </div>
    </div>
  );
}