// Utilidades para formatação de moeda brasileira

// Formatar número para formato brasileiro (1.234,56)
export const formatCurrencyBR = (value: number): string => {
  return value.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

// Formatar valor para exibição com R$
export const formatCurrencyDisplay = (value: number): string => {
  return `R$ ${formatCurrencyBR(value)}`;
};

// Formatar entrada de campo de texto para padrão brasileiro
export const formatCurrencyInput = (value: string): string => {
  // Remove tudo que não for dígito
  const digits = value.replace(/\D/g, '');
  
  // Se não há dígitos, retorna vazio
  if (!digits || digits === '0') return '';
  
  // Remove zeros à esquerda desnecessários
  const cleanDigits = digits.replace(/^0+/, '') || '0';
  
  // Se tiver apenas 1 dígito
  if (cleanDigits.length === 1) {
    return `0,0${cleanDigits}`;
  }
  
  // Se tiver apenas 2 dígitos
  if (cleanDigits.length === 2) {
    return `0,${cleanDigits}`;
  }
  
  // Separa centavos dos reais
  const reais = cleanDigits.slice(0, -2);
  const centavos = cleanDigits.slice(-2);
  
  // Adiciona pontos para milhares nos reais
  const formattedReais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedReais},${centavos}`;
};

// Converter entrada brasileira (1.234,56) para número
export const parseCurrencyBR = (value: string): number => {
  if (!value) return 0;
  // Remove pontos (separadores de milhares) e converte vírgula em ponto
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

// Validar se o valor é um valor monetário válido
export const isValidCurrency = (value: string): boolean => {
  const parsed = parseCurrencyBR(value);
  return !isNaN(parsed) && parsed >= 0;
};

// Hook para campos de entrada de moeda
export const useCurrencyInput = (initialValue: number = 0) => {
  const formatValue = (num: number): string => {
    return formatCurrencyBR(num);
  };

  const handleChange = (inputValue: string): { formatted: string; numeric: number } => {
    const formatted = formatCurrencyInput(inputValue);
    const numeric = parseCurrencyBR(formatted);
    
    return { formatted, numeric };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setValue: (value: string) => void) => {
    const { formatted } = handleChange(e.target.value);
    setValue(formatted);
  };

  return {
    formatValue,
    handleChange,
    handleInputChange,
    parseCurrencyBR,
    formatCurrencyInput
  };
};
