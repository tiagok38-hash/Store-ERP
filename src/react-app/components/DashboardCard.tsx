import { ReactNode, useState } from 'react';
import { TrendingUp, TrendingDown, Settings, EyeOff, X } from 'lucide-react';
import { useTheme } from '@/react-app/hooks/useTheme';

interface ColorOption {
  name: string;
  value: string; // Gradient classes
  bg: string;    // Solid background for preview
  textColor: string; // Text color for the card
}

interface DashboardCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: number;
  subtitle?: string;
  id: string;
  isVisible?: boolean;
  customColor?: ColorOption; // Now expects a ColorOption object
  onVisibilityChange?: (id: string, visible: boolean) => void;
  onColorChange?: (id: string, color: ColorOption) => void; // Passes the full ColorOption
  onClick?: () => void;
}

const colorOptions: ColorOption[] = [
  { name: 'Azul Escuro', value: 'from-blue-700 to-blue-800', bg: 'bg-blue-700', textColor: 'text-white' },
  { name: 'Verde Escuro', value: 'from-green-700 to-green-800', bg: 'bg-green-700', textColor: 'text-white' },
  { name: 'Roxo Escuro', value: 'from-purple-700 to-purple-800', bg: 'bg-purple-700', textColor: 'text-white' },
  { name: 'Laranja Escuro', value: 'from-orange-700 to-orange-800', bg: 'bg-orange-700', textColor: 'text-white' },
  { name: 'Rosa Escuro', value: 'from-pink-700 to-pink-800', bg: 'bg-pink-700', textColor: 'text-white' },
  { name: 'Vermelho Escuro', value: 'from-red-700 to-red-800', bg: 'bg-red-700', textColor: 'text-white' },
  { name: 'Índigo Escuro', value: 'from-indigo-700 to-indigo-800', bg: 'bg-indigo-700', textColor: 'text-white' },
  { name: 'Amarelo Escuro', value: 'from-yellow-700 to-yellow-800', bg: 'bg-yellow-700', textColor: 'text-white' },
  { name: 'Ciano Escuro', value: 'from-cyan-700 to-cyan-800', bg: 'bg-cyan-700', textColor: 'text-white' },
  { name: 'Esmeralda Escuro', value: 'from-emerald-700 to-emerald-800', bg: 'bg-emerald-700', textColor: 'text-white' },
  { name: 'Lima Escuro', value: 'from-lime-700 to-lime-800', bg: 'bg-lime-700', textColor: 'text-white' },
  { name: 'Fúcsia Escuro', value: 'from-fuchsia-700 to-fuchsia-800', bg: 'bg-fuchsia-700', textColor: 'text-white' },
  { name: 'Teal Escuro', value: 'from-teal-700 to-teal-800', bg: 'bg-teal-700', textColor: 'text-white' },
  { name: 'Sky Escuro', value: 'from-sky-700 to-sky-800', bg: 'bg-sky-700', textColor: 'text-white' },
  { name: 'Cinza Escuro', value: 'from-gray-700 to-gray-800', bg: 'bg-gray-700', textColor: 'text-white' },
  // Novas opções de cores claras
  { name: 'Azul Claro', value: 'from-blue-50 to-blue-100', bg: 'bg-blue-50', textColor: 'text-blue-800' },
  { name: 'Verde Claro', value: 'from-green-50 to-green-100', bg: 'bg-green-50', textColor: 'text-green-800' },
  { name: 'Roxo Claro', value: 'from-purple-50 to-purple-100', bg: 'bg-purple-50', textColor: 'text-purple-800' },
  { name: 'Laranja Claro', value: 'from-orange-50 to-orange-100', bg: 'bg-orange-50', textColor: 'text-orange-800' },
  { name: 'Rosa Claro', value: 'from-pink-50 to-pink-100', bg: 'bg-pink-50', textColor: 'text-pink-800' },
  { name: 'Vermelho Claro', value: 'from-red-50 to-red-100', bg: 'bg-red-50', textColor: 'text-red-800' },
  { name: 'Índigo Claro', value: 'from-indigo-50 to-indigo-100', bg: 'bg-indigo-50', textColor: 'text-indigo-800' },
  { name: 'Amarelo Claro', value: 'from-yellow-50 to-yellow-100', bg: 'bg-yellow-50', textColor: 'text-yellow-800' },
  { name: 'Ciano Claro', value: 'from-cyan-50 to-cyan-100', bg: 'bg-cyan-50', textColor: 'text-cyan-800' },
  { name: 'Esmeralda Claro', value: 'from-emerald-50 to-emerald-100', bg: 'bg-emerald-50', textColor: 'text-emerald-800' },
  { name: 'Lima Claro', value: 'from-lime-50 to-lime-100', bg: 'bg-lime-50', textColor: 'text-lime-800' },
  { name: 'Fúcsia Claro', value: 'from-fuchsia-50 to-fuchsia-100', bg: 'bg-fuchsia-50', textColor: 'text-fuchsia-800' },
  { name: 'Teal Claro', value: 'from-teal-50 to-teal-100', bg: 'bg-teal-50', textColor: 'text-teal-800' },
  { name: 'Sky Claro', value: 'from-sky-50 to-sky-100', bg: 'bg-sky-50', textColor: 'text-sky-800' },
  { name: 'Cinza Claro', value: 'from-gray-50 to-gray-100', bg: 'bg-gray-50', textColor: 'text-gray-800' },
];

// Default color option
const defaultColorOption: ColorOption = colorOptions[0]; // Azul Escuro

export default function DashboardCard({ 
  title, 
  value, 
  icon, 
  trend, 
  subtitle, 
  id,
  isVisible = true,
  customColor = defaultColorOption, // Use the default color option
  onVisibilityChange,
  onColorChange,
  onClick 
}: DashboardCardProps) {
  const { theme } = useTheme();
  const [showCustomization, setShowCustomization] = useState(false);
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  if (!isVisible) return null;

  return (
    <div 
      className={`rounded-xl shadow-soft-lg p-6 hover:shadow-soft-xl transition-all duration-200 relative group 
        bg-gradient-to-br ${customColor.value} ${customColor.textColor}
        ${onClick ? 'cursor-pointer' : ''}`} 
      onClick={onClick} 
    >
      {/* Customization Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
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
                  key={color.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    onColorChange?.(id, color); // Pass the full color object
                    setShowCustomization(false);
                  }}
                  className={`w-6 h-6 rounded-lg ${color.bg} hover:scale-110 transition-transform ${
                    customColor.value === color.value ? 'ring-2 ring-white ring-offset-2' : ''
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
        <h3 className="text-3xl font-bold mb-1">{value}</h3>
        <p className="text-lg">{title}</p>
        {subtitle && (
          <p className="text-base text-white/80 mt-1">{subtitle}</p> 
        )}
      </div>
    </div>
  );
}