import { useState } from 'react';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  PackagePlus 
} from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';

interface ProductActionsDropdownProps {
  unitId: string;
  onViewHistory: (unitId: string) => void;
  onEdit: (unitId: string) => void;
  onDelete: (unitId: string) => void;
  onAdjustStock: (unitId: string) => void;
}

export default function ProductActionsDropdown({ 
  unitId, 
  onViewHistory, 
  onEdit, 
  onDelete, 
  onAdjustStock 
}: ProductActionsDropdownProps) {
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
            className={`absolute right-0 top-full mt-1 border rounded-lg shadow-lg z-20 min-w-[180px] ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}
            style={{ animation: 'dropdownSlideIn 0.2s ease-out forwards' }}
          >
            <div className="py-1">
              <button
                onClick={() => handleAction(() => onViewHistory(unitId))}
                className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                  theme === 'dark'
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Clock size={16} className="mr-2 text-purple-600" />
                Ver Histórico
              </button>
              
              <button
                onClick={() => handleAction(() => onEdit(unitId))}
                className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                  theme === 'dark'
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Edit size={16} className="mr-2 text-blue-600" />
                Editar Item
              </button>

              <button
                onClick={() => handleAction(() => onAdjustStock(unitId))}
                className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                  theme === 'dark'
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <PackagePlus size={16} className="mr-2 text-green-600" />
                Ajustar Estoque
              </button>
              
              <div className={`border-t my-1 ${
                theme === 'dark' ? 'border-slate-600' : 'border-slate-100'
              }`} />
              
              <button
                onClick={() => handleAction(() => onDelete(unitId))}
                className={`w-full flex items-center px-4 py-2 text-sm text-red-600 transition-colors ${
                  theme === 'dark' ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                }`}
              >
                <Trash2 size={16} className="mr-2" />
                Excluir Item
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}