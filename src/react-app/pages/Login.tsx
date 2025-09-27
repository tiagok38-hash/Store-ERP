import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn, UserPlus, User } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { supabase } from '@/integrations/supabase/client'; // Importar supabase para signUp

export default function Login() {
  const { login } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Register form state
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);

    try {
      const result = await login({ email: loginEmail, password: loginPassword });
      
      if (!result.success) {
        showError('Erro de Login', result.message || 'Credenciais inválidas. Tente novamente.');
      } else {
        showSuccess('Login Realizado', 'Bem-vindo de volta!');
      }
    } catch (error) {
      showError('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua internet.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegisterLoading(true);
    setRegisterErrors({});

    const newErrors: Record<string, string> = {};
    if (!registerFirstName.trim()) newErrors.firstName = 'Nome é obrigatório';
    if (!registerLastName.trim()) newErrors.lastName = 'Sobrenome é obrigatório';
    if (!registerEmail.trim()) newErrors.email = 'Email é obrigatório';
    if (!/\S+@\S+\.\S+/.test(registerEmail)) newErrors.email = 'Email inválido';
    if (!registerPassword) newErrors.password = 'Senha é obrigatória';
    if (registerPassword.length < 6) newErrors.password = 'A senha deve ter no mínimo 6 caracteres';
    if (registerPassword !== registerConfirmPassword) newErrors.confirmPassword = 'As senhas não conferem';

    if (Object.keys(newErrors).length > 0) {
      setRegisterErrors(newErrors);
      setIsRegisterLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            first_name: registerFirstName.trim(),
            last_name: registerLastName.trim(),
          },
        },
      });

      if (error) {
        showError('Erro de Cadastro', error.message);
      } else if (data.user) {
        showSuccess('Cadastro Realizado', 'Verifique seu e-mail para confirmar sua conta.');
        // Optionally, switch to login tab or clear form
        setActiveTab('login');
        setRegisterFirstName('');
        setRegisterLastName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
      } else {
        showError('Erro de Cadastro', 'Ocorreu um erro inesperado. Tente novamente.');
      }
    } catch (error) {
      showError('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua internet.');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-card-light rounded-2xl shadow-soft-2xl p-8 w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-xl mb-4 shadow-soft-md">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-bold text-text-light">StoreFlow Pro</h1>
          <p className="text-slate-600 mt-2">Sistema de Gestão Empresarial</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-background-light rounded-lg p-1 shadow-soft-sm">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'login'
                ? 'bg-card-light shadow-soft-sm text-text-light'
                : 'text-slate-600 hover:text-text-light'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'register'
                ? 'bg-card-light shadow-soft-sm text-text-light'
                : 'text-slate-600 hover:text-text-light'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {activeTab === 'login' ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-primary shadow-sm focus:border-primary-light focus:ring focus:ring-primary-light/50"
                />
                <span className="ml-2 text-sm text-slate-600">Lembrar-me</span>
              </label>
              <button
                type="button"
                className="text-sm text-primary hover:text-primary-dark"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoginLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg hover:shadow-soft-md transition-all duration-200 flex items-center justify-center font-medium disabled:opacity-50"
            >
              {isLoginLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <LogIn className="mr-2" size={20} />
                  Entrar
                </>
              )}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={registerFirstName}
                    onChange={(e) => setRegisterFirstName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      registerErrors.firstName ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Seu nome"
                    required
                  />
                </div>
                {registerErrors.firstName && <p className="text-red-500 text-xs mt-1">{registerErrors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sobrenome *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={registerLastName}
                    onChange={(e) => setRegisterLastName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      registerErrors.lastName ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Seu sobrenome"
                    required
                  />
                </div>
                {registerErrors.lastName && <p className="text-red-500 text-xs mt-1">{registerErrors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    registerErrors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              {registerErrors.email && <p className="text-red-500 text-xs mt-1">{registerErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    registerErrors.password ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {registerErrors.password && <p className="text-red-500 text-xs mt-1">{registerErrors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirmar Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    registerErrors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {registerErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{registerErrors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isRegisterLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg hover:shadow-soft-md transition-all duration-200 flex items-center justify-center font-medium disabled:opacity-50"
            >
              {isRegisterLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <UserPlus className="mr-2" size={20} />
                  Cadastrar
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-slate-600">
          Ao continuar, você concorda com os{' '}
          <a href="#" className="text-primary hover:text-primary-dark">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href="#" className="text-primary hover:text-primary-dark">
            Política de Privacidade
          </a>
        </div>
      </div>
    </div>
  );
}