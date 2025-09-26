import { useState } from 'react';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Printer
} from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';

interface SaleActionsDropdownProps {
  saleId: string;
  onView: (saleId: string) => void;
  onEdit: (saleId: string) => void;
  onDelete: (saleId: string) => void;
  onReprint: (saleId: string) => void;
}

export default function SaleActionsDropdown({ 
  saleId, 
  onView, 
  onEdit, 
  onDelete, 
  onReprint 
}: SaleActionsDropdownProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
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
            className={`absolute right-0 top-full mt-1 border rounded-lg shadow-lg z-20 min-w-[160px] ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}
            style={{ animation: 'dropdownSlideIn 0.2s ease-out forwards' }}
          >
            <div className="py-1">
              <button
                onClick={() => handleAction(() => onView(saleId))}
                className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                  theme === 'dark'
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Eye size={16} className="mr-2 text-blue-600" />
                Visualizar
              </button>
              
              <button
                onClick={() => handleAction(() => onEdit(saleId))}
                className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                  theme === 'dark'
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Edit size={16} className="mr-2 text-green-600" />
                Editar
              </button>
              
              <button
                onClick={() => handleAction(() => onReprint(saleId))}
                className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                  theme === 'dark'
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Printer size={16} className="mr-2 text-purple-600" />
                Reimprimir
              </button>
              
              <div className={`border-t my-1 ${
                theme === 'dark' ? 'border-slate-600' : 'border-slate-100'
              }`} />
              
              <button
                onClick={() => handleAction(() => onDelete(saleId))}
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