import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle, Zap } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    // Adicionar animação de saída
    const notificationElement = document.querySelector(`[data-notification-id="${id}"]`);
    if (notificationElement) {
      notificationElement.classList.add('animate-out', 'slide-out-to-right-full', 'fade-out');
      setTimeout(() => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }, 200);
    } else {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification after duration
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
  }, [removeNotification]);

  const showSuccess = useCallback((title: string, message?: string) => {
    showNotification({ type: 'success', title, message });
  }, [showNotification]);

  const showError = useCallback((title: string, message?: string) => {
    showNotification({ type: 'error', title, message });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message?: string) => {
    showNotification({ type: 'warning', title, message });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message?: string) => {
    showNotification({ type: 'info', title, message });
  }, [showNotification]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={22} className="text-secondary animate-pulse" />;
      case 'error':
        return <AlertCircle size={22} className="text-red-600 animate-bounce" />;
      case 'warning':
        return <AlertTriangle size={22} className="text-accent animate-pulse" />;
      case 'info':
        return <Info size={22} className="text-primary animate-pulse" />;
    }
  };

  const getNotificationStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-secondary-light/20 to-secondary/20 border-secondary text-text-light shadow-soft-md';
      case 'error':
        return 'bg-gradient-to-r from-red-100 to-red-50 border-red-300 text-red-900 shadow-soft-md';
      case 'warning':
        return 'bg-gradient-to-r from-accent-light/20 to-accent/20 border-accent text-text-light shadow-soft-md';
      case 'info':
        return 'bg-gradient-to-r from-primary-light/20 to-primary/20 border-primary text-text-light shadow-soft-md';
    }
  };

  const getProgressBarColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-secondary-light to-secondary';
      case 'error':
        return 'bg-gradient-to-r from-red-400 to-rose-500';
      case 'warning':
        return 'bg-gradient-to-r from-accent-light to-accent';
      case 'info':
        return 'bg-gradient-to-r from-primary-light to-primary';
    }
  };

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo,
    }}>
      {children}

      {/* Notification Container */}
      <div className="fixed top-6 right-6 z-[60] space-y-3 max-w-md">
        {notifications.map(notification => (
          <div
            key={notification.id}
            data-notification-id={notification.id}
            className={`
              relative overflow-hidden border-2 rounded-xl p-5 shadow-soft-lg backdrop-blur-sm
              transform transition-all duration-500 ease-out
              animate-in slide-in-from-right-full fade-in zoom-in-95
              hover:scale-105 hover:shadow-soft-xl
              ${getNotificationStyles(notification.type)}
            `}
            style={{
              animation: `slideInBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)`
            }}
          >
            {/* Background Glow Effect */}
            <div className="absolute inset-0 opacity-20">
              <div className={`w-full h-full ${getProgressBarColor(notification.type)} blur-xl`}></div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
              <div 
                className={`h-full ${getProgressBarColor(notification.type)} transition-all duration-200`}
                style={{
                  animation: `progressShrink ${notification.duration}ms linear forwards`
                }}
              ></div>
            </div>

            <div className="relative flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-bold text-base leading-tight">
                      {notification.title}
                    </p>
                    <Zap size={14} className="text-current opacity-60 animate-pulse" />
                  </div>
                  {notification.message && (
                    <p className="text-sm leading-relaxed opacity-90 mt-1">
                      {notification.message}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-3 flex-shrink-0 opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-110 hover:rotate-90 p-1 rounded-full hover:bg-black/10"
                title="Fechar notificação"
              >
                <X size={18} />
              </button>
            </div>

            {/* Floating particles effect for success */}
            {notification.type === 'success' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-4 w-1 h-1 bg-secondary-light rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-6 right-8 w-1 h-1 bg-secondary rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-4 left-8 w-0.5 h-0.5 bg-secondary-light/50 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes slideInBounce {
          0% {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateX(-5%) scale(1.02);
            opacity: 0.8;
          }
          100% {
            transform: translateX(0%) scale(1);
            opacity: 1;
          }
        }

        @keyframes progressShrink {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }

        .animate-in {
          animation-fill-mode: forwards;
        }

        .animate-out {
          animation-fill-mode: forwards;
        }

        .slide-in-from-right-full {
          animation: slideInBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .slide-out-to-right-full {
          animation: slideOutRight 0.3s ease-in-out forwards;
        }

        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }

        .fade-out {
          animation: fadeOut 0.2s ease-in-out forwards;
        }

        .zoom-in-95 {
          animation: zoomIn 0.3s ease-out;
        }

        @keyframes slideOutRight {
          0% {
            transform: translateX(0%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(120%) scale(0.9);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes zoomIn {
          0% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}