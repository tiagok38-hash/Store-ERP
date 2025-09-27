import { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  RotateCcw 
} from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';

interface PurchaseActionsDropdownProps {
  purchaseId: string;
  purchaseStatus: string;
  onView: (purchaseId: string) => void;
  onEdit: (purchaseId: string) => void;
  onFinalize: (purchaseId: string) => void;
  onRevert: (purchaseId: string) => void;
  onDelete: (purchaseId: string) => void;
}

export default function PurchaseActionsDropdown({ 
  purchaseId, 
  purchaseStatus,
  onView, 
  onEdit, 
  onFinalize,
  onRevert,
  onDelete 
}: PurchaseActionsDropdownProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const spaceBelow = window.innerHeight - buttonRect.bottom;

      // If space below is less than dropdown height, open upwards
      if (spaceBelow < dropdownHeight + 20 && buttonRect.top > dropdownHeight + 20) { // +20 for some padding
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'dark' 
            ? 'hover:bg-slate-600' 
            : 'hover:bg-slate-100'
        }`}
      >
        <MoreVertical size={16} className={
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        } />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div 
            ref={dropdownRef}
            className={`absolute right-0 border rounded-lg shadow-lg z-20 min-w-[180px] ${
              openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
            } ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}
            style={{ animation: 'dropdownSlideIn 0.2s ease-out forwards' }}
          >
            <div className="py-1">
              <button
                onClick={() => handleAction(() => onView(purchaseId))}
                className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                  theme === 'dark'
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Eye size={16} className="mr-2 text-blue-600" />
                Visualizar
              </button>
              
              {purchaseStatus !== 'completed' && (
                <button
                  onClick={() => handleAction(() => onEdit(purchaseId))}
                  className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                    theme === 'dark'
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Edit size={16} className="mr-2 text-blue-600" />
                  Editar
                </button>
              )}

              {purchaseStatus === 'pending' && (
                <button
                  onClick={() => handleAction(() => onFinalize(purchaseId))}
                  className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                    theme === 'dark'
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle size={16} className="mr-2 text-green-600" />
                  Finalizar Entrada
                </button>
              )}

              {purchaseStatus === 'completed' && (
                <button
                  onClick={() => handleAction(() => onRevert(purchaseId))}
                  className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                    theme === 'dark'
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <RotateCcw size={16} className="mr-2 text-orange-600" />
                  Reverter Compra
                </button>
              )}
              
              <div className={`border-t my-1 ${
                theme === 'dark' ? 'border-slate-600' : 'border-slate-100'
              }`} />
              
              <button
                onClick={() => handleAction(() => onDelete(purchaseId))}
                className={`w-full flex items-center px-4 py-2 text-sm text-red-600 transition-colors ${
                  theme === 'dark' ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                }`}
              >
                <Trash2 size={16} className="mr-2" />
                Excluir
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}