import { ReactNode, useState } from 'react';
import { TrendingUp, TrendingDown, Settings, EyeOff, X } from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: number;
  subtitle?: string;
  id: string;
  isVisible?: boolean;
  customColor?: string;
  onVisibilityChange?: (id: string, visible: boolean) => void;
  onColorChange?: (id: string, color: string) => void;
  onClick?: () => void; // Nova propriedade onClick
}

const colorOptions = [
  { name: 'Azul', value: 'from-blue-500 to-blue-600', bg: 'bg-blue-500' },
  { name: 'Verde', value: 'from-green-500 to-green-600', bg: 'bg-green-500' },
  { name: 'Roxo', value: 'from-purple-500 to-purple-600', bg: 'bg-purple-500' },
  { name: 'Laranja', value: 'from-orange-500 to-orange-600', bg: 'bg-orange-500' },
  { name: 'Rosa', value: 'from-pink-500 to-pink-600', bg: 'bg-pink-500' },
  { name: 'Vermelho', value: 'from-red-500 to-red-600', bg: 'bg-red-500' },
  { name: 'Índigo', value: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-500' },
  { name: 'Amarelo', value: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-500' },
  { name: 'Ciano', value: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-500' },
  { name: 'Esmeralda', value: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500' },
  { name: 'Lima', value: 'from-lime-500 to-lime-600', bg: 'bg-lime-500' },
  { name: 'Fúcsia', value: 'from-fuchsia-500 to-fuchsia-600', bg: 'bg-fuchsia-500' },
  { name: 'Teal', value: 'from-teal-500 to-teal-600', bg: 'bg-teal-500' },
  { name: 'Sky', value: 'from-sky-500 to-sky-600', bg: 'bg-sky-500' },
  { name: 'Cinza', value: 'from-gray-500 to-gray-600', bg: 'bg-gray-500' },
];

export default function DashboardCard({ 
  title, 
  value, 
  icon, 
  trend, 
  subtitle, 
  id,
  isVisible = true,
  customColor = 'from-blue-500 to-blue-600', // Usar um azul como padrão
  onVisibilityChange,
  onColorChange,
  onClick // Receber a propriedade onClick
}: DashboardCardProps) {
  const { theme } = useTheme();
  const [showCustomization, setShowCustomization] = useState(false);
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  if (!isVisible) return null;

  return (
    <div 
      className={`rounded-xl shadow-soft-lg p-6 hover:shadow-soft-xl transition-all duration-200 relative group ${
        theme === 'dark' 
          ? `bg-gradient-to-br ${customColor} text-white` 
          : `bg-gradient-to-br ${customColor} text-white`
      } ${onClick ? 'cursor-pointer' : ''}`} 
      onClick={onClick} 
    >
      {/* Customization Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Impedir que o clique no botão acione o onClick do card
          setShowCustomization(!showCustomization);
        }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-white/20 rounded-lg"
        title="Personalizar card"
      >
        <Settings size={16} />
      </button>

      {/* Customization Panel */}
      {showCustomization && (
        <div className={`absolute top-12 right-3 p-4 rounded-lg shadow-soft-xl z-10 min-w-48 ${
          theme === 'dark' ? 'bg-card-dark border border-slate-700' : 'bg-card-light border border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`text-sm font-medium ${
              theme === 'dark' ? 'text-text-dark' : 'text-text-light'
            }`}>
              Personalizar
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCustomization(false);
              }}
              className={`p-1 hover:bg-slate-100 rounded ${
                theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'text-slate-600'
              }`}
            >
              <X size={14} />
            </button>
          </div>

          {/* Visibility Toggle */}
          <div className="mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVisibilityChange?.(id, false);
              }}
              className={`flex items-center w-full p-2 text-sm rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-slate-700 text-slate-300' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <EyeOff size={14} className="mr-2" />
              Ocultar card
            </button>
          </div>

          {/* Color Options */}
          <div>
            <p className={`text-xs font-medium mb-2 ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Cor do card:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onColorChange?.(id, color.value);
                    setShowCustomization(false);
                  }}
                  className={`w-6 h-6 rounded-lg ${color.bg} hover:scale-110 transition-transform ${
                    customColor === color.value ? 'ring-2 ring-white ring-offset-2' : ''
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-base ${isPositive ? 'text-green-100' : isNegative ? 'text-red-100' : 'text-white/80'}`}>
            {isPositive && <TrendingUp size={18} className="mr-1" />}
            {isNegative && <TrendingDown size={18} className="mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold mb-1">{value}</h3> {/* Aumentado de text-2xl para text-3xl */}
        <p className="text-white/90 text-lg">{title}</p> {/* Aumentado de text-sm para text-lg */}
        {subtitle && (
          // Aumentado de text-xs para text-base
          <p className="text-base text-white/80 mt-1">{subtitle}</p> 
        )}
      </div>
    </div>
  );
}